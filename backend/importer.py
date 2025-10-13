import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables
load_dotenv()

FIREBASE_KEY_PATH = os.getenv("FIREBASE_KEY_PATH")

if not FIREBASE_KEY_PATH or not os.path.exists(FIREBASE_KEY_PATH):
    raise ValueError("FIREBASE_KEY_PATH not set or the file is missing. Please fix your .env file.")

# Initialize Firebase 
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()
recipe_collection = db.collection("recipes")

# Recipes to import 
recipes_to_import = [
    {
        "name": "Greek Salad",
        "featured": True,
        "cuisine": "Greek",
        "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760206697/greek-salad-9484971_dbuwkp.webp",
        "ingredients": [
        "Cucumber",
        "Tomatoes",
        "Red onion",
        "Olives",
        "Feta cheese",
        "Olive oil",
        "Oregano"
        ],
        "steps": [
        "Chop vegetables and combine in a bowl.",
        "Add feta, olives, and drizzle olive oil and oregano.",
        "Toss gently and serve chilled."
        ],
        "nutritional_info": {
        "calories": "230 kcal",
        "protein": "6 g",
        "fat": "18 g",
        "carbohydrates": "10 g"
        },
        "cooking_time_minutes": 10,
        "difficulty": "Easy",
        "dietary_restrictions": ["Vegetarian", "Gluten-Free"]
    },
  {
    "name": "Amala with Ewedu and Gbegiri Soup",
    "featured": True,
    "cuisine": "Nigerian",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760206772/Amala.jpg_arrnkz.webp",
    "ingredients": [
      "Yam flour (elubo)",
      "Water",
      "Ewedu leaves (jute leaves)",
      "Gbegiri (bean soup)",
      "Palm oil",
      "Ground crayfish",
      "Locust beans (iru)",
      "Ground pepper",
      "Salt",
      "Seasoning cubes",
      "Beef",
      "Goat meat",
      "Assorted meat (optional)",
      "Stockfish"
    ],
    "steps": [
      "Boil water and gradually add yam flour, stirring continuously to avoid lumps.",
      "Keep stirring until smooth and stretchy. Allow to steam briefly.",
      "For ewedu soup, blend leaves and cook with locust beans, crayfish, and seasoning.",
      "Prepare gbegiri soup with peeled beans, palm oil, crayfish, and pepper until thick.",
      "Serve amala with ewedu, gbegiri, and assorted meats."
    ],
    "nutritional_info": {
      "calories": "520 kcal",
      "protein": "22 g",
      "fat": "18 g",
      "carbohydrates": "65 g",
      "fiber": "5 g"
    },
    "cooking_time_minutes": 60,
    "difficulty": "Medium",
    "dietary_restrictions": ["Gluten-Free", "High-Protein"]
  },
  {
    "name": "Murgh Makhani",
    "featured": True,
    "cuisine": "Indian",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760206917/Butter-Chicken.-SS.-Low-Res-476x476_t5axeo.jpg",
    "ingredients": [
      "Chicken thighs",
      "Butter",
      "Tomato puree",
      "Cream",
      "Ginger-garlic paste",
      "Garam masala",
      "Chili powder",
      "Coriander powder",
      "Cumin",
      "Salt"
    ],
    "steps": [
      "Marinate chicken with yogurt and spices for 2 hours.",
      "Cook chicken in butter until browned.",
      "Add tomato puree and cream; simmer until thickened.",
      "Serve hot with naan or basmati rice."
    ],
    "nutritional_info": {
      "calories": "610 kcal",
      "protein": "35 g",
      "fat": "42 g",
      "carbohydrates": "18 g"
    },
    "cooking_time_minutes": 45,
    "difficulty": "Medium",
    "dietary_restrictions": ["Gluten-Free"]
  },
  {
    "name": "Spaghetti Carbonara",
    "featured": False,
    "cuisine": "Italian",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760206796/11973-spaghetti-carbonara-ii-DDMFS-4x3-6edea51e421e4457ac0c3269f3be5157_gmcnzs.jpg",
    "ingredients": [
      "Spaghetti",
      "Egg yolks",
      "Pancetta",
      "Parmesan cheese",
      "Black pepper",
      "Olive oil",
      "Salt"
    ],
    "steps": [
      "Cook pasta al dente and reserve some pasta water.",
      "Fry pancetta until crispy.",
      "Mix eggs, cheese, and pepper; toss with pasta and pancetta off heat.",
      "Add reserved water for creamy texture."
    ],
    "nutritional_info": {
      "calories": "550 kcal",
      "protein": "25 g",
      "fat": "30 g",
      "carbohydrates": "45 g"
    },
    "cooking_time_minutes": 25,
    "difficulty": "Easy",
    "dietary_restrictions": ["Nut-Free"]
  },
  {
    "name": "Chicken Biryani",
    "featured": False,
    "cuisine": "Indian",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760206815/Chicken-Biryani-Recipe_njubwr.jpg",
    "ingredients": [
      "Basmati rice",
      "Chicken",
      "Yogurt",
      "Onions",
      "Tomatoes",
      "Ginger-garlic paste",
      "Biryani masala",
      "Saffron",
      "Ghee"
    ],
    "steps": [
      "Marinate chicken with yogurt and spices.",
      "Fry onions golden brown; add tomatoes and chicken.",
      "Layer rice and chicken, drizzle saffron milk, cook on low heat.",
      "Serve hot with raita."
    ],
    "nutritional_info": {
      "calories": "720 kcal",
      "protein": "40 g",
      "fat": "32 g",
      "carbohydrates": "68 g"
    },
    "cooking_time_minutes": 75,
    "difficulty": "Hard",
    "dietary_restrictions": ["Halal"]
  },
  {
    "name": "Tacos al Pastor",
    "featured": True,
    "cuisine": "Mexican",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760206844/20210712-tacos-al-pastor-melissa-hom-seriouseats-37-f72cdd02c9574bceb1eef1c8a23b76ed_jmbxs7.jpg",
    "ingredients": [
      "Pork shoulder",
      "Pineapple",
      "Chili peppers",
      "Garlic",
      "Cumin",
      "Coriander",
      "Corn tortillas",
      "Onion",
      "Cilantro"
    ],
    "steps": [
      "Marinate pork in chili, pineapple, and spices overnight.",
      "Grill until charred and juicy.",
      "Serve in tortillas with chopped onion, cilantro, and lime."
    ],
    "nutritional_info": {
      "calories": "430 kcal",
      "protein": "25 g",
      "fat": "22 g",
      "carbohydrates": "35 g"
    },
    "cooking_time_minutes": 50,
    "difficulty": "Medium",
    "dietary_restrictions": ["Dairy-Free"]
  },
  {
    "name": "Pounded Yam with Egusi Soup",
    "featured": False,
    "ingredients": [
      "Yam",
      "Egusi (melon seeds)",
      "Palm oil",
      "Spinach or bitter leaf",
      "Ground crayfish",
      "Locust beans (iru)",
      "Ground pepper",
      "Salt",
      "Seasoning cubes",
      "Beef",
      "Assorted meat",
      "Stockfish"
    ],
    "steps": [
      "Boil yam until soft and pound until smooth and stretchy.",
      "Blend egusi seeds and fry in palm oil with onions.",
      "Add meat stock, crayfish, pepper, and locust beans.",
      "Simmer until thick, add vegetables, and cook for 5 minutes.",
      "Serve hot with pounded yam."
    ],
    "nutritional_info": {
      "calories": "640 kcal per serving",
      "protein": "25 g",
      "fat": "22 g",
      "carbohydrates": "75 g"
    },
    "cooking_time_minutes": 75,
    "difficulty": "Hard",
    "dietary_restrictions": ["High-Protein", "Gluten-Free"],
    "cuisine": "Nigerian",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760206864/AL18g_R2HqBRag55XjX78iBvs4Lv0Oe_GxN-vBuRW_7BQ1wdq-WOaEqxJH_hqQx6HLxkk8OqmsAphg_s1200_pwsi1o.jpg"
  },
  {
    "name": "Vegetable Fried Rice",
    "featured": True,
    "ingredients": [
      "Cooked rice",
      "Carrots",
      "Green beans",
      "Peas",
      "Sweet corn",
      "Onion",
      "Soy sauce",
      "Vegetable oil",
      "Salt",
      "Eggs",
      "Spring onions"
    ],
    "steps": [
      "Heat oil in a wok and fry beaten eggs, then set aside.",
      "Add onions and vegetables, sauté for 3–5 minutes.",
      "Add cooked rice, soy sauce, and salt.",
      "Stir-fry for 5–7 minutes, add the scrambled eggs, and mix well.",
      "Garnish with spring onions and serve hot."
    ],
    "nutritional_info": {
      "calories": "420 kcal per serving",
      "protein": "10 g",
      "fat": "9 g",
      "carbohydrates": "70 g"
    },
    "cooking_time_minutes": 30,
    "difficulty": "Easy",
    "dietary_restrictions": ["Vegetarian"],
    "cuisine": "Asian",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760206891/vegetable-egg-fried-rice-photo-1_npcpol.jpg"
  },
  {
    "name": "Butter Chicken",
    "featured": False,
    "ingredients": [
      "Chicken",
      "Tomatoes",
      "Onion",
      "Garlic",
      "Ginger",
      "Butter",
      "Cream",
      "Cumin",
      "Coriander powder",
      "Garam masala",
      "Chili powder",
      "Salt"
    ],
    "steps": [
      "Marinate chicken in yogurt and spices for 30 minutes.",
      "Cook chicken until browned and set aside.",
      "In another pan, cook onions, garlic, ginger, and tomatoes into a thick sauce.",
      "Blend sauce, return to pan, and add butter and cream.",
      "Add chicken and simmer for 10 minutes. Serve with naan or rice."
    ],
    "nutritional_info": {
      "calories": "510 kcal per serving",
      "protein": "32 g",
      "fat": "30 g",
      "carbohydrates": "22 g"
    },
    "cooking_time_minutes": 60,
    "difficulty": "Medium",
    "dietary_restrictions": ["High-Protein"],
    "cuisine": "Indian",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760206760/butter-chicken-recipe_sa1wwn.jpg"
  },
  {
    "name": "Jollof Spaghetti",
    "featured": True,
    "ingredients": [
      "Spaghetti",
      "Tomatoes",
      "Red bell pepper",
      "Onion",
      "Garlic",
      "Vegetable oil",
      "Salt",
      "Seasoning cubes",
      "Curry powder",
      "Thyme"
    ],
    "steps": [
      "Blend tomatoes, peppers, and onions into a smooth paste.",
      "Fry the mixture in oil with curry and thyme until thick.",
      "Add water and seasoning cubes, then add spaghetti.",
      "Cook until pasta is done and coated in sauce.",
      "Serve hot with fried plantain or chicken."
    ],
    "nutritional_info": {
      "calories": "460 kcal per serving",
      "protein": "12 g",
      "fat": "14 g",
      "carbohydrates": "65 g"
    },
    "cooking_time_minutes": 35,
    "difficulty": "Easy",
    "dietary_restrictions": ["Vegan"],
    "cuisine": "Nigerian",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760206944/img_0719_sg4oib.jpg"
  },
  {
    "name": "Grilled Suya Chicken Skewers",
    "featured": True,
    "ingredients": [
      "Chicken breast",
      "Ground peanuts",
      "Suya spice mix",
      "Vegetable oil",
      "Salt",
      "Paprika",
      "Cayenne pepper",
      "Onions",
      "Bell peppers"
    ],
    "steps": [
      "Mix ground peanuts, paprika, cayenne, and salt for the suya spice mix.",
      "Marinate chicken pieces in oil and spice mixture for 1 hour.",
      "Thread onto skewers with onions and peppers.",
      "Grill for 10–15 minutes until cooked through.",
      "Serve with sliced onions and tomatoes."
    ],
    "nutritional_info": {
      "calories": "380 kcal per serving",
      "protein": "36 g",
      "fat": "22 g",
      "carbohydrates": "8 g"
    },
    "cooking_time_minutes": 40,
    "difficulty": "Medium",
    "dietary_restrictions": ["Gluten-Free", "High-Protein"],
    "cuisine": "Nigerian",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760207523/grilled-chicken-skewers-with-toum_vjhg29.jpg"
  },
  {
    "name": "Miso Ramen",
     "featured": False,
    "ingredients": [
      "Ramen noodles",
      "Miso paste",
      "Soy sauce",
      "Garlic",
      "Ginger",
      "Chicken stock",
      "Eggs",
      "Green onions",
      "Sesame oil",
      "Corn"
    ],
    "steps": [
      "Heat sesame oil, add garlic and ginger, sauté for 1 minute.",
      "Add miso paste, soy sauce, and chicken broth, simmer for 10 minutes.",
      "Cook ramen noodles separately and add to broth.",
      "Top with boiled eggs, green onions, and corn.",
      "Serve hot."
    ],
    "nutritional_info": {
      "calories": "480 kcal per serving",
      "protein": "20 g",
      "fat": "15 g",
      "carbohydrates": "60 g"
    },
    "cooking_time_minutes": 25,
    "difficulty": "Easy",
    "dietary_restrictions": ["Vegetarian"],
    "cuisine": "Japanese",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760207001/SpicyMisoRamen_Square_tq2tph.jpg"
  },
  {
    "name": "Tandoori Paneer Skewers",
    "featured": True,
    "ingredients": [
      "Paneer cubes",
      "Yogurt",
      "Lemon juice",
      "Ginger-garlic paste",
      "Chili powder",
      "Cumin",
      "Coriander powder",
      "Turmeric",
      "Salt",
      "Bell peppers",
      "Onion"
    ],
    "steps": [
      "Mix yogurt with spices and lemon juice to make marinade.",
      "Add paneer and vegetables, marinate for 1 hour.",
      "Thread on skewers and grill for 10–12 minutes.",
      "Serve with mint chutney."
    ],
    "nutritional_info": {
      "calories": "360 kcal per serving",
      "protein": "22 g",
      "fat": "20 g",
      "carbohydrates": "18 g"
    },
    "cooking_time_minutes": 40,
    "difficulty": "Medium",
    "dietary_restrictions": ["Vegetarian", "High-Protein"],
    "cuisine": "Indian",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760207030/tandoori-paneer-skewers-with-mango-salsa-e55c11c_oduzui.jpg"
  },
  {
    "name": "Spicy Thai Basil Fried Rice",
    "featured": False,
    "ingredients": [
      "Cooked jasmine rice",
      "Soy sauce",
      "Fish sauce",
      "Garlic",
      "Bird’s eye chili",
      "Basil leaves",
      "Eggs",
      "Vegetable oil",
      "Bell peppers",
      "Chicken or tofu"
    ],
    "steps": [
      "Sauté garlic and chili in oil for 30 seconds.",
      "Add chicken or tofu and cook until golden.",
      "Add rice, soy sauce, and fish sauce. Stir well.",
      "Toss in basil leaves and eggs, cook for 2 more minutes.",
      "Serve hot with lime wedges."
    ],
    "nutritional_info": {
      "calories": "450 kcal per serving",
      "protein": "18 g",
      "fat": "12 g",
      "carbohydrates": "65 g"
    },
    "cooking_time_minutes": 25,
    "difficulty": "Easy",
    "dietary_restrictions": ["High-Protein"],
    "cuisine": "Thai",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760207053/Thai-Fried-Rice-1x1-1_fqkswg.jpg"
  },
  {
    "name": "Sushi Rolls",
    "featured": False,
    "cuisine": "Japanese",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760207077/Tuna-Sushi-Rolls-800x550-1_h9bevj.jpg",
    "ingredients": [
      "Sushi rice",
      "Nori sheets",
      "Cucumber",
      "Avocado",
      "Crab sticks",
      "Soy sauce",
      "Rice vinegar"
    ],
    "steps": [
      "Cook sushi rice and season with rice vinegar.",
      "Place nori sheet, spread rice, and add fillings.",
      "Roll tightly and slice.",
      "Serve with soy sauce and wasabi."
    ],
    "nutritional_info": {
      "calories": "310 kcal",
      "protein": "8 g",
      "fat": "6 g",
      "carbohydrates": "55 g"
    },
    "cooking_time_minutes": 40,
    "difficulty": "Medium",
    "dietary_restrictions": ["Pescatarian"]
  },
  {
    "name": "Beef Stroganoff",
    "featured": False,
    "cuisine": "Russian",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760207091/easy-beef-stroganoff_cpegbp.jpg",
    "ingredients": [
      "Beef sirloin",
      "Mushrooms",
      "Onion",
      "Sour cream",
      "Butter",
      "Flour",
      "Beef broth",
      "Egg noodles"
    ],
    "steps": [
      "Sear beef strips and set aside.",
      "Cook onions and mushrooms in butter, sprinkle flour, add broth.",
      "Return beef, stir in sour cream, and serve over noodles."
    ],
    "nutritional_info": {
      "calories": "670 kcal",
      "protein": "38 g",
      "fat": "35 g",
      "carbohydrates": "55 g"
    },
    "cooking_time_minutes": 45,
    "difficulty": "Medium",
    "dietary_restrictions": ["Nut-Free"]
  },
  {
    "name": "Pad Thai",
    "featured": False,
    "cuisine": "Thai",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760207118/Chicken-Pad-Thai_9-SQ_s95mph.jpg",
    "ingredients": [
      "Rice noodles",
      "Shrimp",
      "Eggs",
      "Tofu",
      "Bean sprouts",
      "Peanuts",
      "Tamarind paste",
      "Fish sauce"
    ],
    "steps": [
      "Soak noodles and stir-fry shrimp, tofu, and eggs.",
      "Add noodles, tamarind sauce, and bean sprouts.",
      "Top with peanuts and lime wedges."
    ],
    "nutritional_info": {
      "calories": "480 kcal",
      "protein": "22 g",
      "fat": "14 g",
      "carbohydrates": "68 g"
    },
    "cooking_time_minutes": 30,
    "difficulty": "Medium",
    "dietary_restrictions": ["Pescatarian"]
  },
  {
    "name": "Falafel Wrap",
    "featured": True,
    "cuisine": "Middle Eastern",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760207157/Falafel-beet-salad-wrap-with-tahini-dressing_vnpdlh.jpg",
    "ingredients": [
      "Chickpeas",
      "Garlic",
      "Parsley",
      "Cumin",
      "Coriander",
      "Flour",
      "Pita bread",
      "Tahini sauce"
    ],
    "steps": [
      "Blend soaked chickpeas with herbs and spices.",
      "Shape into balls and deep fry until golden.",
      "Serve in pita with tahini and vegetables."
    ],
    "nutritional_info": {
      "calories": "410 kcal",
      "protein": "14 g",
      "fat": "18 g",
      "carbohydrates": "45 g"
    },
    "cooking_time_minutes": 40,
    "difficulty": "Medium",
    "dietary_restrictions": ["Vegan"]
  },
  {
    "name": "Greek Salad",
    "featured": False,
    "cuisine": "Greek",
    "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760206697/greek-salad-9484971_dbuwkp.webp",
    "ingredients": [
      "Cucumber",
      "Tomatoes",
      "Red onion",
      "Olives",
      "Feta cheese",
      "Olive oil",
      "Oregano"
    ],
    "steps": [
      "Chop vegetables and combine in a bowl.",
      "Add feta, olives, and drizzle olive oil and oregano.",
      "Toss gently and serve chilled."
    ],
    "nutritional_info": {
      "calories": "230 kcal",
      "protein": "6 g",
      "fat": "18 g",
      "carbohydrates": "10 g"
    },
    "cooking_time_minutes": 10,
    "difficulty": "Easy",
    "dietary_restrictions": ["Vegetarian", "Gluten-Free"]
  },

    {
        "name": "Amala with Ewedu and Gbegiri Soup",
        "featured": False,
        "cuisine": "Nigerian",
        "image_url": "https://res.cloudinary.com/dbnardo2n/image/upload/v1760206772/Amala.jpg_arrnkz.webp",
        "ingredients": [
            "Yam flour (elubo)",
            "Water",
            "Ewedu leaves (jute leaves)",
            "Gbegiri (bean soup)",
            "Palm oil",
            "Ground crayfish",
            "Locust beans (iru)",
            "Ground pepper",
            "Salt",
            "Seasoning cubes",
            "Beef",
            "Goat meat",
            "Assorted meat (optional)",
            "Stockfish"
        ],
        "steps": [
            "Boil water in a pot and gradually add yam flour (elubo) while stirring continuously to avoid lumps.",
            "Keep stirring until it becomes smooth, stretchy, and firm. Cover and allow it to steam for a few minutes, then turn again. Amala is ready.",
            "For ewedu soup, blend ewedu leaves and cook with little water. Add locust beans (iru), ground crayfish, salt, and seasoning cubes. Stir and cook for 5 minutes.",
            "For gbegiri soup, peel cooked beans, blend into a smooth paste, and cook with palm oil, crayfish, and pepper until thick.",
            "Serve amala hot with ewedu and gbegiri soup, along with assorted meat or beef."
        ],
        "nutritional_info": {
            "calories": "520 kcal per serving",
            "protein": "22 g",
            "fat": "18 g",
            "carbohydrates": "65 g",
            "fiber": "5 g"
        },
        "cooking_time_minutes": 60,
        "difficulty": "Medium",
        "dietary_restrictions": ["Gluten-Free", "High-Protein"]
    }
]

def main():
    if not recipes_to_import:
        print("No recipes to import. Add recipes to the 'recipes_to_import' list.")
        return

    print("--- Starting Recipe Import to Firestore ---")

    # Optional: clear existing recipes
    print("Clearing existing recipes (if any)...")
    existing_docs = recipe_collection.stream()
    for doc in existing_docs:
        doc.reference.delete()
    print("Existing recipes cleared.")

    print(f"Inserting {len(recipes_to_import)} recipes...")
    for recipe in recipes_to_import:
        recipe_collection.add(recipe)

    print(f"Successfully inserted {len(recipes_to_import)} recipes into Firestore.")
    print("--- Recipe Import Complete ---")

if __name__ == "__main__":
    main()



