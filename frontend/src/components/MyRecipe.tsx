'use client';

import { useState, FormEvent } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface CreateRecipeProps {
  token: string;
  onRecipeCreated: (newRecipe: any) => void;
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
        "http://127.0.0.1:8000/recipes",
        { name, difficulty, cooking_time_minutes: Number(time) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onRecipeCreated(res.data);
      setName("");
      setDifficulty("");
      setTime("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create recipe");
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
