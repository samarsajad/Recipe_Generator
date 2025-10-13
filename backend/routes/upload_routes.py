from fastapi import APIRouter, UploadFile
from utils.image_utils import upload_image_to_cloudinary, recognize_ingredients

router = APIRouter()

@router.post("/upload-image")
async def upload_image(file: UploadFile):
    url = await upload_image_to_cloudinary(file)
    return {"url": url}

@router.post("/recognize-ingredients")
async def recognize_image_ingredients(image: UploadFile):
    detected = await recognize_ingredients(image)
    return {"ingredients": detected}
