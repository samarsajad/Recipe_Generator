from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from .py_objectid import PyObjectId

class IngredientsInput(BaseModel):
    available_ingredients: List[str]

class IngredientCategory(BaseModel):
    id: Optional[PyObjectId] = Field(alias="id", default=None)
    category: str
    items: List[str]
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
