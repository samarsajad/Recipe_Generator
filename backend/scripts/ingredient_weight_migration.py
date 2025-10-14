import sys, os, json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  

from utils.ingredients import extract_normalized_ingredients
import firebase_admin
from firebase_admin import credentials, firestore

# Firebase init
cred = credentials.Certificate("../credentials/firebase_key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

RECIPE_COLLECTION = db.collection("recipes")

# Load ingredient weights
try:
    with open("ingredient_weights.json") as f:
        INGREDIENT_WEIGHTS = json.load(f)
except FileNotFoundError:
    INGREDIENT_WEIGHTS = {}

BATCH_SIZE = 400

def migrate_weights():
    batch = db.batch()
    updated = 0
    for doc in RECIPE_COLLECTION.stream():
        data = doc.to_dict()
        if not data:
            continue

        ingredients_lower = data.get("ingredients_lowercase", [])
        ingredients_map = {i: INGREDIENT_WEIGHTS.get(i,1) for i in ingredients_lower}
        weight_sum = sum(ingredients_map.values())

        batch.update(RECIPE_COLLECTION.document(doc.id), {
            "ingredients_map": ingredients_map,
            "ingredients_weight_sum": weight_sum
        })
        updated += 1

        if updated % BATCH_SIZE == 0:
            batch.commit()
            batch = db.batch()
            print(f"Committed {updated} updates...")

    batch.commit()
    print(f"Finished updating weights for {updated} recipes.")

if __name__ == "__main__":
    migrate_weights()
