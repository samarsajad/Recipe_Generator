from fastapi import APIRouter, HTTPException
from firebase_admin import firestore

router = APIRouter()
db = firestore.client()
INGREDIENT_COLLECTION = db.collection("ingredient_categories")

@router.get("/ingredients")
async def get_all_ingredients():
    
    try:
        docs = INGREDIENT_COLLECTION.stream() 
        ingredients = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id  
            ingredients.append(data)
        return ingredients
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch ingredients: {e}")
