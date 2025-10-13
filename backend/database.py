# database.py
import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

firebase_key_path = os.getenv("FIREBASE_KEY_PATH")

if not firebase_key_path or not os.path.exists(firebase_key_path):
    raise ValueError("FIREBASE_KEY_PATH not set or file missing")

if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_key_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# collections  
recipe_collection = db.collection("recipes")
ingredient_collection = db.collection("ingredient_categories")
saved_recipes_collection = db.collection("saved_recipes")

