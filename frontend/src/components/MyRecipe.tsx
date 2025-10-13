'use client';

import { useState, FormEvent } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Recipe } from '@/types';

interface CreateRecipeProps {
  token: string;
  onRecipeCreated: (newRecipe: Recipe) => void;
}

export function CreateRecipe({ token, onRecipeCreated }: CreateRecipeProps) {
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

  
try {
  const res = await axios.post(
    
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/recipes`,
    { name, difficulty, cooking_time_minutes: Number(time) },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  onRecipeCreated(res.data);
  setName("");
  setDifficulty("");
  setTime("");

} catch (err) { 
  console.error(err);
  let errorMessage = "Failed to create recipe";
  
  
  if (axios.isAxiosError(err) && err.response?.data?.detail) {
    errorMessage = err.response.data.detail;
  }
  
  setError(errorMessage);

} finally {
  setLoading(false);
}
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow space-y-4">
      <h3 className="text-xl font-bold">Create New Recipe</h3>
      {error && <p className="text-red-500">{error}</p>}

      <Input
        placeholder="Recipe Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        placeholder="Difficulty (easy, medium, hard)"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        required
      />
      <Input
        type="number"
        placeholder="Cooking Time (minutes)"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
      />

      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
        Create Recipe
      </Button>
    </form>
  );
}
