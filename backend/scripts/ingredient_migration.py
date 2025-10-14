import sys
import os

# Add the parent directory of scripts/ (i.e., backend/) to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.ingredients import extract_normalized_ingredients
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin with service account
cred_path = "../credentials/firebase_key.json"  # adjust to where your JSON is
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()
RECIPE_COLLECTION = db.collection("recipes")

BATCH_SIZE = 400

def migrate():
    docs_iter = RECIPE_COLLECTION.stream()
    batch = db.batch()
    count = 0
    updated = 0

    for doc in docs_iter:
        count += 1
        data = doc.to_dict() or {}
        # Skip if already has normalized fields
        if data.get("ingredients_lowercase") and data.get("main_ingredients_lowercase"):
            continue

        ingredients_raw = data.get("ingredients", [])
        normalized = extract_normalized_ingredients(ingredients_raw)

        update_payload = {
            "ingredients_lowercase": normalized["ingredients_lowercase"],
            "main_ingredients_lowercase": normalized["main_ingredients_lowercase"],
            "ingredients_normalized_map": normalized["ingredients_map"],
        }

        batch.update(RECIPE_COLLECTION.document(doc.id), update_payload)
        updated += 1

        if updated % BATCH_SIZE == 0:
            batch.commit()
            print(f"Committed {updated} updates...")
            batch = db.batch()

    # Commit remaining updates
    if updated % BATCH_SIZE != 0:
        batch.commit()

    print(f"Migration finished. Processed {count} docs. Updated: {updated} docs.")

if __name__ == "__main__":
    migrate()
