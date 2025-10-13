import spacy
from difflib import SequenceMatcher

# Load spaCy English model once
nlp = spacy.load("en_core_web_sm")

def lemmatize_ingredient(ingredient: str) -> str:
    
    doc = nlp(ingredient.lower())
    return " ".join(token.lemma_ for token in doc)

def ingredients_match(input_ing: str, recipe_ing: str) -> bool:
   
    input_lem = lemmatize_ingredient(input_ing)
    recipe_lem = lemmatize_ingredient(recipe_ing)

    # Check substring match for partial matching
    if input_lem in recipe_lem or recipe_lem in input_lem:
        return True

    # Calculate fuzzy similarity ratio
    similarity = SequenceMatcher(None, input_lem, recipe_lem).ratio()
    return similarity > 0.75
