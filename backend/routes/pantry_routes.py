from fastapi import APIRouter, Depends
from utils.auth import get_current_user
from database import ingredient_collection

router = APIRouter()

@router.get("/pantry")
async def get_user_pantry(user: dict = Depends(get_current_user)):
    doc = await ingredient_collection.find_one({"user_id": user["uid"]})
    return {"ingredients": doc.get("ingredients", []) if doc else []}

@router.post("/pantry")
async def save_user_pantry(data: dict, user: dict = Depends(get_current_user)):
    ingredients = data.get("ingredients", [])
    await ingredient_collection.update_one({"user_id": user["uid"]}, {"$set": {"ingredients": ingredients}}, upsert=True)
    return {"message": "Pantry saved"}
