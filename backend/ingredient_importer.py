import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
cred_path = "firebase_key.json" 
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Ingredient categories data 
ingredient_data = [
    {
        "category": "Produce",
        "items": [
            "onion", "garlic", "ginger", "tomato", "bell pepper", "scotch bonnet pepper",
            "spinach", "okra", "bitter leaf", "pumpkin leaves (ugu)", "cabbage", "carrot",
            "green beans", "plantain", "yam", "potato", "lemon", "lime", "avocado", "parsley",
            "cilantro", "mint leaves", "spring onion", "chili pepper", "jute leaves (ewedu)"
        ]
    },
    {
        "category": "Meats & Poultry",
        "items": [
             "chicken", "chicken breast", "whole chicken", "beef", "goat meat", "lamb", "ground beef",
            "turkey", "fish (tilapia, catfish, mackerel)", "shrimp", "assorted meat",
            "stockfish", "smoked fish", "bacon"
        ]
    },
    {
        "category": "Pantry Staples",
        "items": [
            "rice", "basmati rice", "long grain rice", "pasta", "spaghetti", "noodles",
            "yam flour (elubo)", "cornmeal", "semovita", "beans (black-eyed peas, brown beans)",
            "lentils", "flour", "sugar", "olive oil", "vegetable oil", "palm oil", "groundnut oil",
            "coconut milk", "tomato paste", "canned tomatoes", "chicken stock", "beef stock",
            "breadcrumbs", "soy sauce", "honey", "vinegar"
        ]
    },
    {
        "category": "Dairy & Alternatives",
        "items": [
            "milk", "evaporated milk", "butter", "margarine", "cheese", "cheddar cheese",
            "mozzarella cheese", "yogurt", "eggs", "cream", "ghee"
        ]
    },
    {
        "category": "Spices & Seasonings",
        "items": [
            "salt", "black pepper", "white pepper", "curry powder", "thyme", "paprika",
            "cayenne pepper", "turmeric", "ginger powder", "garlic powder", "bay leaves",
            "bouillon cubes (Maggi/Knorr)", "oregano", "basil", "rosemary", "cumin",
            "ground crayfish", "locust beans (iru)", "chili flakes"
        ]
    },
    {
        "category": "Grains & Tubers",
        "items": [
            "cassava", "yam", "plantain flour", "fufu powder", "garri", "wheat flour",
            "rice flour", "semolina"
        ]
    },
    {
        "category": "Legumes & Nuts",
        "items": [
            "peanuts", "groundnuts", "black beans", "kidney beans", "chickpeas", "soybeans"
        ]
    },
    {
        "category": "Condiments & Sauces",
        "items": [
            "tomato sauce", "ketchup", "mayonnaise", "mustard", "hot sauce", "oyster sauce",
            "fish sauce", "barbecue sauce", "pesto", "peanut butter"
        ]
    },
    {
        "category": "Baked Goods & Bread",
        "items": [
            "bread", "yeast", "pita bread", "tortilla", "naan", "chapati", "buns"
        ]
    },
    {
        "category": "Others",
        "items": [
            "water", "ice cubes", "tea leaves", "coffee", "sugar syrup", "corn starch", "baking powder"
        ]
    }
]

def main():
    collection_ref = db.collection("ingredient_categories")

    print("Deleting existing ingredient categories...")
    docs = collection_ref.stream()
    for doc in docs:
        doc.reference.delete()

    print("Inserting new categories...")
    for category in ingredient_data:
        collection_ref.add(category)
        print(f"Added category: {category['category']}")

    print(" All ingredient categories inserted successfully!")

if __name__ == "__main__":
    main()
