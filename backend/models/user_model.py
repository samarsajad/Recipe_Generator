from pydantic import BaseModel
from typing import Optional

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    photo_url: Optional[str] = None

class UserProfileResponse(BaseModel):
    uid: str
    display_name: Optional[str] = None
    email: Optional[str] = None
    photo_url: Optional[str] = None
