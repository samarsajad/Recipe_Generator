import base64
import requests
from fastapi import UploadFile, HTTPException
import cloudinary
import cloudinary.uploader
import os


IMAGGA_API_KEY = os.getenv("IMAGGA_API_KEY")
IMAGGA_API_SECRET = os.getenv("IMAGGA_API_SECRET")

#CLOUDINARY CONFIG

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

async def upload_image_to_cloudinary(file: UploadFile, folder: str = "recipes") -> str:
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image file")
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder= folder,  
            resource_type="image",
            overwrite=True
        )
        return result.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
#IMAGGA UPLOAD and RECOGNITION

CONFIDENCE_THRESHOLD = 30  
GENERIC_TAGS_BLACKLIST = {"food", "dish", "ingredient", "produce", "meal", "cuisine"}

async def recognize_ingredients(image: UploadFile, confidence_threshold: int = CONFIDENCE_THRESHOLD, max_tags: int = 5):
    if not IMAGGA_API_KEY or not IMAGGA_API_SECRET:
        raise HTTPException(status_code=500, detail="Image recognition service is not configured.")
    try:
        image_content = await image.read()
        response = requests.post(
            'https://api.imagga.com/v2/tags',
            auth=(IMAGGA_API_KEY, IMAGGA_API_SECRET),
            files={'image': image_content},
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        tags = data.get('result', {}).get('tags', [])

        filtered_tags = [
            tag['tag']['en'].lower() for tag in tags
            if tag['confidence'] >= confidence_threshold and tag['tag']['en'].lower() not in GENERIC_TAGS_BLACKLIST
        ]

        detected_ingredients = filtered_tags[:max_tags]
        return detected_ingredients

    except requests.exceptions.RequestException as e:
        print("Imagga request error:", e)
        raise HTTPException(status_code=500, detail="Failed to communicate with image recognition service.")
    except Exception as e:
        print("Error analyzing image:", e)
        raise HTTPException(status_code=500, detail=f"Failed to analyze image: {str(e)}")

