from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from datetime import datetime
from typing import List
from models.feedback_model import Feedback, FeedbackCreate

from routes.auth_routes import get_current_user  

router = APIRouter()
db = firestore.client()  


@router.post("/recipes/{recipe_id}/feedbacks", response_model=Feedback)
def submit_feedback(recipe_id: str, feedback: FeedbackCreate, user: dict = Depends(get_current_user)):
    recipe_ref = db.collection("recipes").document(recipe_id)
    recipe = recipe_ref.get()
    if not recipe.exists:
        raise HTTPException(status_code=404, detail="Recipe not found")

    feedback_data = {
        "user_id": user["uid"],
        "username": user.get("username", "Anonymous"),
        "text": feedback.text,
        "created_at": datetime.utcnow()
    }

    recipe_ref.collection("feedbacks").add(feedback_data)
    return feedback_data


@router.get("/recipes/{recipe_id}/feedbacks", response_model=List[Feedback])
def get_feedbacks(recipe_id: str):
    recipe_ref = db.collection("recipes").document(recipe_id)
    recipe = recipe_ref.get()
    if not recipe.exists:
        raise HTTPException(status_code=404, detail="Recipe not found")

    feedbacks_ref = recipe_ref.collection("feedbacks").order_by("created_at")
    feedbacks = [doc.to_dict() for doc in feedbacks_ref.stream()]
    return feedbacks
