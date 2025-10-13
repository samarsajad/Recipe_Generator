# utils/recipe_utils.py
from firebase_admin import firestore
from routes.recipe_routes import db  

RECIPE_COLLECTION = db.collection("recipes")

def get_recipe_ingredients() -> set:
    
    ingredients_set = set()
    for doc in RECIPE_COLLECTION.stream():
        data = doc.to_dict()
        ingredients = data.get("ingredients", [])
        ingredients_set.update([i.lower() if isinstance(i, str) else i.get("name","").lower() for i in ingredients])
    return ingredients_set
