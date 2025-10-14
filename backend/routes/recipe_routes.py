from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Tuple
from models.recipe_model import Recipe, RecipeCreate, PantryRequest, RecipeFilters
from firebase_admin import firestore, credentials, auth
import firebase_admin
from functools import lru_cache
import json

# --- Firebase Initialization ---
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()
RECIPE_COLLECTION = db.collection("recipes")

bearer_scheme = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    token = credentials.credentials
    try:
        return auth.verify_id_token(token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}"
        )

# --- Router ---
router = APIRouter()

# --- Classes ---
class RatingSubmission(BaseModel):
    rating: int

class RatingService:
    def __init__(self, db):
        self.db = db
        self.collection = db.collection("recipes")
    
    def validate_rating(self, rating: int) -> None:
        if not 1 <= rating <= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Rating must be between 1 and 5 stars"
            )
    
    def submit_rating(self, recipe_id: str, rating: int) -> dict:
        self.validate_rating(rating)
        doc_ref = self.collection.document(recipe_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Recipe not found")
        recipe_data = doc.to_dict()
        current_total = recipe_data.get('average_rating', 0) * recipe_data.get('rating_count', 0)
        new_count = recipe_data.get('rating_count', 0) + 1
        new_average = (current_total + rating) / new_count
        doc_ref.update({'average_rating': round(new_average, 1), 'rating_count': new_count})
        return {"message": "Rating submitted successfully", "new_average": round(new_average, 1), "rating_count": new_count}

rating_service = RatingService(db)

# --- Ingredient Weights ---
try:
    with open("ingredient_weights.json", "r") as f:
        INGREDIENT_WEIGHTS = json.load(f)
except FileNotFoundError:
    print("ingredient_weights.json not found. All ingredients will have a weight of 1.")
    INGREDIENT_WEIGHTS = {}

def compute_total_weight(ingredients: List[str]) -> float:
    return sum(INGREDIENT_WEIGHTS.get(i.lower(), 1) for i in ingredients)

# --- Helper Functions ---
def make_cache_key(ingredients: List[str], filters: Optional[RecipeFilters]) -> Tuple:
    filt_tuple = (
        tuple(sorted(filters.dietary)) if filters and filters.dietary else (),
        filters.max_time if filters and filters.max_time else 0,
        filters.difficulty.lower() if filters and filters.difficulty else "",
        filters.min_rating if filters and filters.min_rating else 0
    )
    return (tuple(sorted(ingredients)), filt_tuple)

@lru_cache(maxsize=256)
def cached_generate_recipes(ingredients_key: Tuple, limit: int):
    search_ingredients, filt_tuple = ingredients_key
    dietary, max_time, difficulty, min_rating = filt_tuple

    query = RECIPE_COLLECTION

    # Apply Firestore filters
    if dietary:
        for tag in dietary:
            query = query.where("dietary_restrictions", "array_contains", tag)
    if max_time:
        query = query.where("cooking_time_minutes", "<=", max_time)
    if difficulty:
        query = query.where("difficulty", "==", difficulty)
    if min_rating:
        query = query.where("average_rating", ">=", min_rating)

    if search_ingredients:
        query = query.where("main_ingredients_lowercase", "array_contains_any", list(search_ingredients)[:10])

    docs = query.limit(limit*2).stream()
    results = []

    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        recipe_ings = set(data.get("ingredients_lowercase", []))
        matched = list(recipe_ings.intersection(search_ingredients))
        total_weight = data.get("total_ingredient_weight", len(recipe_ings))
        match_score = sum(INGREDIENT_WEIGHTS.get(i,1) for i in matched) / total_weight if total_weight else 0
        missing = list(recipe_ings.difference(matched))
        results.append({
            "recipe": data,
            "match_score": round(match_score,2),
            "matching_ingredients": matched,
            "missing_ingredients": missing
        })
        if len(results) >= limit:
            break

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:limit]

# --- Generate Recipes Endpoint ---
@router.post("/generate-recipes")
async def generate_recipes(payload: PantryRequest, limit: Optional[int] = Query(20)):
    if not payload.available_ingredients:
        return []

    search_ingredients = [i.strip().lower() for i in payload.available_ingredients if i.strip()]
    if not search_ingredients:
        return []

    cache_key = make_cache_key(search_ingredients, payload.filters)
    recipes = cached_generate_recipes(cache_key, limit)
    return recipes

# --- Search Recipes ---
@router.get("/search")
async def search_recipes(query: str = Query(..., min_length=2), filters: Optional[str] = None, limit: int = 50):
    query_lower = query.lower()
    parsed_filters = None
    if filters:
        try:
            parsed_filters = RecipeFilters(**json.loads(filters))
        except Exception:
            parsed_filters = None

    firestore_query = RECIPE_COLLECTION
    if parsed_filters:
        if parsed_filters.dietary:
            for tag in parsed_filters.dietary:
                firestore_query = firestore_query.where("dietary_restrictions", "array_contains", tag.lower())
        if parsed_filters.max_time:
            firestore_query = firestore_query.where("cooking_time_minutes", "<=", parsed_filters.max_time)
        if parsed_filters.difficulty:
            firestore_query = firestore_query.where("difficulty", "==", parsed_filters.difficulty.lower())
        if parsed_filters.min_rating:
            firestore_query = firestore_query.where("average_rating", ">=", parsed_filters.min_rating)

    docs = firestore_query.limit(limit*2).stream()
    results = []

    for doc in docs:
        data = doc.to_dict()
        if query_lower in data.get("name_lowercase", data.get("name", "")).lower():
            data["id"] = doc.id
            results.append(data)
            if len(results) >= limit:
                break

    if not results:
        raise HTTPException(status_code=404, detail=f"No recipes found for '{query}'")
    return results

# --- Chefs Choice ---
@lru_cache(maxsize=128)
@router.get("/chefs-choice")
async def get_chefs_choice(limit: int = 20):
    query = RECIPE_COLLECTION.where("featured", "==", True).limit(limit)
    docs = query.stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)
    return results

# --- User Recipes ---
@router.get("/users/me/recipes", response_model=List[Recipe])
async def get_my_recipes(user: dict = Depends(get_current_user)):
    docs = RECIPE_COLLECTION.where("user_id", "==", user["uid"]).stream()
    return [{**doc.to_dict(), "id": doc.id} for doc in docs]

@router.post("/users/me/recipes", response_model=Recipe, status_code=status.HTTP_201_CREATED)
async def create_my_recipe(recipe: RecipeCreate, user: dict = Depends(get_current_user)):
    data = recipe.dict()
    data["user_id"] = user["uid"]
    data["ingredients_lowercase"] = [i.lower() for i in recipe.ingredients]
    data["total_ingredient_weight"] = compute_total_weight(recipe.ingredients)
    doc_ref = RECIPE_COLLECTION.document()
    doc_ref.set(data)
    data["id"] = doc_ref.id
    return data

@router.delete("/users/me/recipes/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_recipe(recipe_id: str, user: dict = Depends(get_current_user)):
    doc_ref = RECIPE_COLLECTION.document(recipe_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if doc.to_dict().get("user_id") != user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this recipe")
    doc_ref.delete()

# --- Ratings ---
@router.post("/recipes/{recipe_id}/rate")
async def rate_recipe(recipe_id: str, rating_data: RatingSubmission, user: dict = Depends(get_current_user)):
    return rating_service.submit_rating(recipe_id, rating_data.rating)

# --- Bookmarks ---
@router.post("/users/me/bookmarks/{recipe_id}")
async def bookmark_recipe(recipe_id: str, user: dict = Depends(get_current_user)):
    recipe_ref = RECIPE_COLLECTION.document(recipe_id)
    recipe_doc = recipe_ref.get()
    if not recipe_doc.exists:
        raise HTTPException(status_code=404, detail="Recipe not found")
    bookmarks_ref = db.collection("users").document(user["uid"]).collection("bookmarks").document(recipe_id)
    data = recipe_doc.to_dict()
    bookmark_data = {
        "recipe_id": recipe_id,
        "recipe_name": data.get("name", "Unknown Recipe"),
        "recipe_image": data.get("image_url"),
        "bookmarked_at": firestore.SERVER_TIMESTAMP,
        "recipe_data": data
    }
    bookmarks_ref.set(bookmark_data)
    return {"message": "Recipe bookmarked successfully", "recipe_id": recipe_id}

@router.delete("/users/me/bookmarks/{recipe_id}")
async def remove_bookmark(recipe_id: str, user: dict = Depends(get_current_user)):
    bookmarks_ref = db.collection("users").document(user["uid"]).collection("bookmarks").document(recipe_id)
    if not bookmarks_ref.get().exists:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    bookmarks_ref.delete()
    return {"message": "Bookmark removed successfully", "recipe_id": recipe_id}

@router.get("/users/me/bookmarks")
async def get_my_bookmarks(user: dict = Depends(get_current_user)):
    bookmarks_ref = db.collection("users").document(user["uid"]).collection("bookmarks")
    docs = bookmarks_ref.order_by("bookmarked_at", direction=firestore.Query.DESCENDING).stream()
    bookmarks = []
    for doc in docs:
        data = doc.to_dict()
        if "recipe_data" in data:
            recipe = data["recipe_data"]
            recipe["id"] = data["recipe_id"]
            bookmarks.append(recipe)
    return bookmarks

@router.get("/users/me/bookmarks/check/{recipe_id}")
async def check_bookmark_status(recipe_id: str, user: dict = Depends(get_current_user)):
    bookmarks_ref = db.collection("users").document(user["uid"]).collection("bookmarks").document(recipe_id)
    return {"is_bookmarked": bookmarks_ref.get().exists, "recipe_id": recipe_id}
