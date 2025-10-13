import json
import math
from collections import Counter
from database import recipe_collection 



def generate_ingredient_weights():
   
    print("Starting ingredient scan")
    ingredient_counts = Counter()
    total_recipes = 0

   
    for doc in recipe_collection.stream():
        total_recipes += 1
        data = doc.to_dict()
        ingredients = data.get("ingredients", [])
        for ingredient in set(ing.lower() for ing in ingredients):
            ingredient_counts[ingredient] += 1
    
    print(f"Scanned {total_recipes} recipes and found {len(ingredient_counts)} unique ingredients.")

    ingredient_weights = {}
    for ingredient, count in ingredient_counts.items():
        idf_score = math.log(total_recipes / count)
        ingredient_weights[ingredient] = idf_score

   
    with open("ingredient_weights.json", "w") as f:
        json.dump(ingredient_weights, f, indent=2)

    print("Successfully saved weights to ingredient_weights.json")

if __name__ == "__main__":
    generate_ingredient_weights()