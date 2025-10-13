from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional


class RecipeBase(BaseModel):
    name: str
    ingredients: List[str]
    steps: List[str]
    nutritional_info: Dict[str, str]
    cooking_time_minutes: int
    difficulty: str
    dietary_restrictions: List[str]
    image_url: Optional[str] = None
    average_rating: float = 0.0
    rating_count: int = 0
    featured: Optional[bool] = False


class RecipeCreate(RecipeBase):
    pass


class Recipe(RecipeBase):
    id: str      
    user_id: str

    model_config = ConfigDict(from_attributes=True) 

class RecipeFilters(BaseModel):
    dietary: Optional[List[str]] = []
    max_time: Optional[int] = None
    difficulty: Optional[str] = None
    min_rating: Optional[float] = None


class PantryRequest(BaseModel):
    available_ingredients: List[str]
    filters: Optional[RecipeFilters] = None