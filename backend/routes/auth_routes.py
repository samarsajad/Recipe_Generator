from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import auth
from models.user_model import UserProfileUpdate, UserProfileResponse
from utils.auth import get_current_user

router = APIRouter()

@router.get("/users/me", response_model=UserProfileResponse)
async def get_user_profile(user: dict = Depends(get_current_user)):
    try:
        user_record = auth.get_user(user["uid"])
        return UserProfileResponse(
            uid=user_record.uid,
            display_name=user_record.display_name,
            email=user_record.email,
            photo_url=user_record.photo_url
        )
    except auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail="User not found")

@router.patch("/users/me", response_model=UserProfileResponse)
async def edit_profile(profile_data: UserProfileUpdate, user: dict = Depends(get_current_user)):
    update_payload = profile_data.model_dump(exclude_unset=True)
    if not update_payload:
        raise HTTPException(status_code=400, detail="No update information provided.")
    try:
        updated_user = auth.update_user(user["uid"], **update_payload)
        return UserProfileResponse(
            uid=updated_user.uid,
            display_name=updated_user.display_name,
            email=updated_user.email,
            photo_url=updated_user.photo_url
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user profile: {e}")
