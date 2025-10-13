from pydantic import BaseModel
from datetime import datetime

class FeedbackCreate(BaseModel):
    text: str

class Feedback(BaseModel):
    user_id: str
    username: str
    text: str
    created_at: datetime
