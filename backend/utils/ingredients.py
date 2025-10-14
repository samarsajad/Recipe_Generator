# app/utils/ingredients.py
from typing import List, Dict, Any

def normalize_ingredient_name(name: str) -> str:
    if not name:
        return ""
    # Basic normalization: strip, lowercase. Add more rules if needed.
    return name.strip().lower()

def extract_normalized_ingredients(ingredients_raw: List[Any]) -> Dict[str, Any]:
   
    ingredients_map = {}
    for i in ingredients_raw:
        if isinstance(i, dict):
            name = normalize_ingredient_name(i.get("name", ""))
            is_main = bool(i.get("is_main", False))
        elif isinstance(i, str):
            name = normalize_ingredient_name(i)
            # assume string means main if you previously used that convention; otherwise False
            is_main = True
        else:
            continue

        if not name:
            continue

        entry = ingredients_map.get(name)
        if entry is None:
            entry = {"is_main": is_main, "original_names": set()}
            ingredients_map[name] = entry
        else:
            entry["is_main"] = entry["is_main"] or is_main

        # store original casing names
        if isinstance(i, dict):
            orig = i.get("name")
            if orig:
                entry["original_names"].add(orig)
        else:
            entry["original_names"].add(i)

    # convert sets to lists and prepare arrays
    ingredients_lowercase = list(ingredients_map.keys())
    main_ingredients_lowercase = [k for k, v in ingredients_map.items() if v["is_main"]]

    # optional map cleanup
    cleaned_map = {
        k: {
            "is_main": v["is_main"],
            "original_names": list(v["original_names"])
        }
        for k, v in ingredients_map.items()
    }

    return {
        "ingredients_lowercase": ingredients_lowercase,
        "main_ingredients_lowercase": main_ingredients_lowercase,
        "ingredients_map": cleaned_map
    }
