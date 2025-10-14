from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict
from models.recipe_model import Recipe, RecipeCreate, PantryRequest, RecipeBase, RecipeFilters
from ingredients_weights import INGREDIENT_WEIGHTS
from ingredient_matching import ingredients_match
from rapidfuzz import fuzz
from firebase_admin import firestore, credentials, auth
from functools import lru_cache
import json
import firebase_admin




#Firebase Initialization

if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()
RECIPE_COLLECTION = db.collection("recipes")

try:
    with open("ingredient_weights.json", "r") as f:
        INGREDIENT_WEIGHTS = json.load(f)
except FileNotFoundError:
    print("Iingredient_weights.json not found. All ingredients will have a weight of 1.")
    INGREDIENT_WEIGHTS = {}

# Auth setup

bearer_scheme = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# API Router
router = APIRouter()

# Classes
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
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Recipe not found"
            )
        
        recipe_data = doc.to_dict()
        
        current_total = recipe_data.get('average_rating', 0) * recipe_data.get('rating_count', 0)
        new_count = recipe_data.get('rating_count', 0) + 1
        new_average = (current_total + rating) / new_count
        
        doc_ref.update({
            'average_rating': round(new_average, 1),
            'rating_count': new_count
        })
        
        return {
            "message": "Rating submitted successfully",
            "new_average": round(new_average, 1),
            "rating_count": new_count
        }


rating_service = RatingService(db)

# --- Public Endpoints ---

#Generate Recipes based on Pantry Ingredients


@router.post("/generate-recipes")
async def generate_recipes(payload: PantryRequest):
    
    if not payload.available_ingredients:
        raise HTTPException(status_code=400, detail="No ingredients provided.")

    # Normalize search ingredients
    search_ingredients = [i.strip().lower() for i in payload.available_ingredients if i.strip()]
    recipes = []

    for doc in RECIPE_COLLECTION.stream():
        data = doc.to_dict()
        data["id"] = doc.id

        recipe_ingredients = data.get("ingredients", [])
        if not recipe_ingredients:
            continue

        recipe_main_ings = []
        recipe_all_ings = []

        # Normalize ingredient formats 
        for i in recipe_ingredients:
            if isinstance(i, dict):
                name = i.get("name", "").strip().lower()
                if not name:
                    continue
                recipe_all_ings.append(name)
                if i.get("is_main", False):
                    recipe_main_ings.append(name)
            elif isinstance(i, str):
                name = i.strip().lower()
                recipe_all_ings.append(name)
                recipe_main_ings.append(name)

        
        if not any(ingredients_match(ing, r_ing) for ing in search_ingredients for r_ing in recipe_main_ings):
            continue

        total_weight = sum(INGREDIENT_WEIGHTS.get(ri, 1) for ri in recipe_all_ings)
        match_score = 0
        matched_ingredients = []

        for ri in recipe_all_ings:
            best_match_score = 0
            best_match_ing = None

            for si in search_ingredients:
                # Use NLP matcher
                if ingredients_match(si, ri):
                   
                    best_match_score = 1.0
                    best_match_ing = si
                    break  

            if best_match_score > 0 and best_match_ing:
                matched_ingredients.append(ri)
                weight = INGREDIENT_WEIGHTS.get(ri, 1)
                match_score += weight * best_match_score

        # Normalize score
        if total_weight > 0:
            match_score /= total_weight

        missing_ingredients = [ri for ri in recipe_all_ings if ri not in matched_ingredients]

        # Apply filters if provided
        f = payload.filters
        if f:
            if f.dietary and not all(tag.lower() in [d.lower() for d in data.get("dietary_restrictions", [])] for tag in f.dietary):
                continue
            if f.max_time and data.get("cooking_time_minutes") and data["cooking_time_minutes"] > f.max_time:
                continue
            if f.difficulty and data.get("difficulty", "").lower() != f.difficulty.lower():
                continue
            if f.min_rating and data.get("average_rating") and data["average_rating"] < f.min_rating:
                continue


        recipes.append({
            "recipe": data,
            "match_score": round(match_score, 2),
            "matching_ingredients": matched_ingredients,
            "missing_ingredients": missing_ingredients,
        })

    # Sort recipes by highest weighted score
    recipes.sort(key=lambda x: x["match_score"], reverse=True)

    if not recipes:
        raise HTTPException(status_code=404, detail="No matching recipes found.")

    return recipes

# Search Recipes by Name 

@router.get("/search")
async def search_recipes(query: str = Query(..., min_length=2), filters: Optional[str] = None):
    results = []
    search_query = query.lower()

    try:
        parsed_filters = RecipeFilters(**json.loads(filters)) if filters else None
    except Exception:
        parsed_filters = None

    for doc in RECIPE_COLLECTION.stream():
        data = doc.to_dict()
        if search_query not in data.get("name", "").lower():
            continue

        # Apply filters
        f = parsed_filters
        if f:
            if f.dietary and not all(tag.lower() in [d.lower() for d in data.get("dietary_restrictions", [])] for tag in f.dietary):
                continue
            if f.max_time and data.get("cooking_time_minutes") and data["cooking_time_minutes"] > f.max_time:
                continue
            if f.difficulty and data.get("difficulty", "").lower() != f.difficulty.lower():
                continue
            if f.min_rating and data.get("average_rating") and data["average_rating"] < f.min_rating:
                continue

        data["id"] = doc.id
        results.append(data)

    if not results:
         raise HTTPException(status_code=404, detail=f"No recipes found for '{query}'")

    return results


# Secure User-Specific Endpoints

#My Recipes Endpoints

@router.get("/users/me/recipes", response_model=List[Recipe])
async def get_my_recipes(user: dict = Depends(get_current_user)):
    
    user_recipes = []
    docs = RECIPE_COLLECTION.where("user_id", "==", user["uid"]).stream()
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        user_recipes.append(data)
    return user_recipes

@router.post("/users/me/recipes", response_model=Recipe, status_code=status.HTTP_201_CREATED)
async def create_my_recipe(recipe: RecipeCreate, user: dict = Depends(get_current_user)):
    
    doc_ref = RECIPE_COLLECTION.document()
    data = recipe.dict()
    data["user_id"] = user["uid"]
    doc_ref.set(data)
    
    response_data = data
    response_data["id"] = doc_ref.id
    return response_data

@router.delete("/users/me/recipes/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_recipe(recipe_id: str, user: dict = Depends(get_current_user)):
    
    print(f"DELETE REQUEST START ")
    print(f"Attempting to delete recipe with ID: {recipe_id}")
    print(f"Current user ID: {user['uid']}")
    
    doc_ref = RECIPE_COLLECTION.document(recipe_id)
    doc = doc_ref.get()

    print(f"Document exists: {doc.exists}")
    
    if not doc.exists:
        print(" Document not found in Firestore")
        print("Let's check all documents in the collection...")
        
        # Debug:Please Work
        all_docs = RECIPE_COLLECTION.where("user_id", "==", user["uid"]).stream()
        print("All recipes for this user:")
        for d in all_docs:
            print(f"  - ID: {d.id}, Data: {d.to_dict()}")
        
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")

    doc_data = doc.to_dict()
    print(f"Document found! Data: {doc_data}")
    print(f"Document user_id: {doc_data.get('user_id')}")
    
    if doc_data.get("user_id") != user["uid"]:
        print(f" User not authorized. Document user_id: {doc_data.get('user_id')}, Current user: {user['uid']}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this recipe")
    
    print(" Deleting document")
    doc_ref.delete()
    print("Recipe deleted successfully")
    print(f"DELETE REQUEST END ")

# Rating Endpoints


@router.post("/recipes/{recipe_id}/rate")
async def rate_recipe(
    recipe_id: str, 
    rating_data: RatingSubmission, 
    user: dict = Depends(get_current_user)
):
    
    return rating_service.submit_rating(recipe_id, rating_data.rating)

@router.get("/recipes/{recipe_id}/rating")
async def get_recipe_rating(recipe_id: str):
    
    return rating_service.get_recipe_rating(recipe_id)

#Bookmarking Endpoints


@router.post("/users/me/bookmarks/{recipe_id}")
async def bookmark_recipe(recipe_id: str, user: dict = Depends(get_current_user)):
    
    try:
       
        recipe_ref = RECIPE_COLLECTION.document(recipe_id)
        recipe_doc = recipe_ref.get()
        
        if not recipe_doc.exists:
            raise HTTPException(status_code=404, detail="Recipe not found")
        
       
        bookmarks_ref = db.collection("users").document(user["uid"]).collection("bookmarks").document(recipe_id)
        
       
        recipe_data = recipe_doc.to_dict()
        bookmark_data = {
            "recipe_id": recipe_id,
            "recipe_name": recipe_data.get("name", "Unknown Recipe"),
            "recipe_image": recipe_data.get("image_url"),
            "bookmarked_at": firestore.SERVER_TIMESTAMP,
            "recipe_data": recipe_data  
        }
        
        bookmarks_ref.set(bookmark_data)
        
        return {"message": "Recipe bookmarked successfully", "recipe_id": recipe_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to bookmark recipe: {str(e)}")

@router.delete("/users/me/bookmarks/{recipe_id}")
async def remove_bookmark(recipe_id: str, user: dict = Depends(get_current_user)):
    
    try:
        bookmarks_ref = db.collection("users").document(user["uid"]).collection("bookmarks").document(recipe_id)
        bookmark_doc = bookmarks_ref.get()
        
        if not bookmark_doc.exists:
            raise HTTPException(status_code=404, detail="Bookmark not found")
        
        bookmarks_ref.delete()
        
        return {"message": "Bookmark removed successfully", "recipe_id": recipe_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove bookmark: {str(e)}")

@router.get("/users/me/bookmarks")
async def get_my_bookmarks(user: dict = Depends(get_current_user)):
    
    try:
        bookmarks = []
        bookmarks_ref = db.collection("users").document(user["uid"]).collection("bookmarks")
        
        
        docs = bookmarks_ref.order_by("bookmarked_at", direction=firestore.Query.DESCENDING).stream()
        
        for doc in docs:
            data = doc.to_dict()
            
            if "recipe_data" in data:
                recipe = data["recipe_data"]
                recipe["id"] = data["recipe_id"]
                bookmarks.append(recipe)
        
        return bookmarks
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bookmarks: {str(e)}")

@router.get("/users/me/bookmarks/check/{recipe_id}")
async def check_bookmark_status(recipe_id: str, user: dict = Depends(get_current_user)):
   
    try:
        bookmarks_ref = db.collection("users").document(user["uid"]).collection("bookmarks").document(recipe_id)
        bookmark_doc = bookmarks_ref.get()
        
        return {"is_bookmarked": bookmark_doc.exists, "recipe_id": recipe_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check bookmark status: {str(e)}")
RECIPE_COLLECTION = db.collection("recipes")





@router.post("/recipes/", response_model=Recipe)
async def create_recipe(recipe: Recipe):

    data = recipe.dict(exclude={"id"})
    doc_ref = RECIPE_COLLECTION.document()
    doc_ref.set(data)
    stored = doc_ref.get().to_dict()
    stored["id"] = doc_ref.id
    return stored

@router.patch("/recipes/{recipe_id}", response_model=Recipe)
async def update_recipe(recipe_id: str, recipe: Recipe):
    """Update an existing recipe. You can toggle featured here."""
    doc_ref = RECIPE_COLLECTION.document(recipe_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Recipe not found")
    update_data = recipe.dict(exclude_unset=True, exclude={"id"})
    doc_ref.update(update_data)
    updated = doc_ref.get().to_dict()
    updated["id"] = recipe_id
    return updated

@router.get("/chefs-choice")
async def get_chefs_choice():
    query = RECIPE_COLLECTION.where("featured", "==", True)
    docs = query.stream()
    result = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        result.append(data)
    return result

@router.get("/recipes/{recipe_id}")
async def get_recipe_by_id(recipe_id: str):
    doc = RECIPE_COLLECTION.document(recipe_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Recipe not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return data

