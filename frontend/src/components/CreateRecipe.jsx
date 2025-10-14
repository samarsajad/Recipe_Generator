'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { X, PlusCircle, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const CreateRecipe = ({ token, onClose, onRecipeCreated }) => {
  const [recipeName, setRecipeName] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [dietary, setDietary] = useState([]);
  const [nutritionKey, setNutritionKey] = useState('');
  const [nutritionValue, setNutritionValue] = useState('');
  const [nutritionalInfo, setNutritionalInfo] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const dietaryOptions = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'];

  const handleDynamicListChange = (index, value, list, setList) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };

  const addDynamicListItem = (setList) => setList(prev => [...prev, '']);
  const removeDynamicListItem = (index, list, setList) => {
    if (list.length <= 1) return;
    setList(list.filter((_, i) => i !== index));
  };

  const addNutritionInfo = () => {
    if (!nutritionKey.trim() || !nutritionValue.trim()) return;
    setNutritionalInfo(prev => ({ ...prev, [nutritionKey.trim()]: nutritionValue.trim() }));
    setNutritionKey('');
    setNutritionValue('');
  };

  const removeNutritionInfo = (key) => {
    setNutritionalInfo(prev => {
      const newInfo = { ...prev };
      delete newInfo[key];
      return newInfo;
    });
  };

  const handleDietaryChange = (e) => {
    const { value, checked } = e.target;
    setDietary(prev => (checked ? [...prev, value] : prev.filter(item => item !== value)));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!recipeName || !cookingTime || ingredients.length === 0 || steps.length === 0) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    let imageUrl = '';
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);

      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-image`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        imageUrl = response.data.url;
      } catch (err) {
        console.error('Image upload failed', err);
        setError('Failed to upload image.');
        setIsSubmitting(false);
        return;
      }
    }

    const recipeData = {
      name: recipeName,
      cooking_time_minutes: parseInt(cookingTime, 10),
      difficulty,
      ingredients: ingredients.filter(i => i.trim() !== ''),
      steps: steps.filter(s => s.trim() !== ''),
      dietary_restrictions: dietary,
      nutritional_info: nutritionalInfo,
      image_url: imageUrl
    };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me/recipes`, recipeData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeout(() => {
        onRecipeCreated(response.data);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Failed to create recipe', err);
      setError(err.response?.data?.detail || 'Failed to submit recipe. Check FastAPI logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-2xl text-green-700 font-bold">Create a New Recipe</h2>
          <Button onClick={onClose} className="p-1 rounded-full bg-green-700 hover:bg-yellow-700"><X size={24} /></Button>
        </header>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Basic Info & Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-green-700 font-semibold">Recipe Name</label>
                <Input 
                  value={recipeName} 
                  onChange={e => setRecipeName(e.target.value)} 
                  placeholder="Recipe Name" 
                  required 
                  className="w-full mt-1 bg-input text-foreground border-border focus:ring-ring focus:ring-1" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-green-700">Cooking Time (min)</label>
                  <Input 
                    value={cookingTime} 
                    onChange={e => setCookingTime(e.target.value)} 
                    type="number" 
                    required 
                    className="w-full mt-1 bg-input text-foreground border-border focus:ring-ring focus:ring-1" 
                  />
                </div>
                <div>
                  <label className="font-semibold text-green-700">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full mt-1 bg-input text-foreground border-border rounded-md px-3 py-2 focus:ring-ring focus:ring-1"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-green-200">
              <input type="file" id="imageUpload" className="hidden" accept="image/*" onChange={handleImageChange} />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-md cursor-pointer" onClick={() => document.getElementById('imageUpload').click()} />
              ) : (
                <label htmlFor="imageUpload" className="text-center cursor-pointer ">
                  <UploadCloud className="mx-auto h-12 w-12 text-yellow-200" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload a picture</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </label>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-lg font-bold mb-2 text-accent text-green-700">Ingredients</h3>
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <Input 
                  value={ing} 
                  onChange={e => handleDynamicListChange(idx, e.target.value, ingredients, setIngredients)} 
                  className="flex-grow bg-input text-foreground border-border focus:ring-ring focus:ring-1" 
                />
                <Button type="button" onClick={() => removeDynamicListItem(idx, ingredients, setIngredients)} className=" bg-white p-2 text-destructive hover:bg-destructive/10 rounded-full"><Trash2 size={18} /></Button>
              </div>
            ))}
            <Button type="button" onClick={() => addDynamicListItem(setIngredients)} className=" bg-green-700 text-accent font-semibold mt-2 flex items-center gap-2 hover:bg-yellow-700"><PlusCircle size={18} /> Add Ingredient</Button>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-lg font-bold mb-2 text-accent text-green-700">Instructions</h3>
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 mb-2">
                <span className="font-bold text-lg text-muted-foreground mt-1">{idx + 1}.</span>
                <Textarea value={step} onChange={e => handleDynamicListChange(idx, e.target.value, steps, setSteps)} className="flex-grow w-full bg-input text-foreground border-border rounded-md p-2 focus:ring-ring focus:ring-1" rows={2} />
                <Button type="button" onClick={() => removeDynamicListItem(idx, steps, setSteps)} className=" bg-white p-2 text-destructive hover:bg-destructive/10 rounded-full mt-1"><Trash2 size={18} /></Button>
              </div>
            ))}
            <Button type="button" onClick={() => addDynamicListItem(setSteps)} className=" bg-green-700 text-accent font-semibold mt-2 flex items-center gap-2 hover:bg-yellow-700"><PlusCircle size={18} /> Add Step</Button>
          </div>

          {/* Dietary & Nutrition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-3 text-accent  text-green-700">Dietary Tags</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {dietaryOptions.map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer hover:text-accent-foreground">
                    <input type="checkbox" value={option} checked={dietary.includes(option)} onChange={handleDietaryChange} className="h-4 w-4 rounded accent-primary" />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2 text-accent text-green-700">Nutritional Information</h3>
              <div className="flex items-center gap-2 mb-3">
                <Input value={nutritionKey} onChange={e => setNutritionKey(e.target.value)} placeholder="Calories" className="bg-input text-foreground border-border focus:ring-ring focus:ring-1" />
                <Input value={nutritionValue} onChange={e => setNutritionValue(e.target.value)} placeholder="450" className="bg-input text-foreground border-border focus:ring-ring focus:ring-1" />
                <Button type="button" onClick={addNutritionInfo} className="p-2 bg-accent text-accent-foreground rounded-lg font-bold hover:bg-accent/80">+</Button>
              </div>
              <div className="space-y-1">
                {Object.entries(nutritionalInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-sm bg-muted p-1 rounded">
                    <span><strong>{key}:</strong> {value}</span>
                    <Button type="button" onClick={() => removeNutritionInfo(key)} className="text-destructive p-0.5 hover:bg-destructive/10 rounded-full"><X size={14} /></Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-destructive text-center font-semibold">{error}</p>}
        </form>

        <footer className="p-4 border-t border-border flex justify-end gap-4">
          <Button onClick={onClose} className="px-6 py-2 rounded-lg border border-border bg-green-700 hover:bg-yellow-700">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-green-700  text-primary-foreground font-semibold hover:bg-yellow-700 disabled:bg-primary/30 flex items-center gap-2">
            {isSubmitting && <Loader2 className="animate-spin" size={20} />}
            {isSubmitting ? 'Saving...' : 'Create Recipe'}
          </Button>
        </footer>
      </div>
    </div>
  );
};
