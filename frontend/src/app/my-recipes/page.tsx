'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { BookXIcon, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateRecipe } from "@/components/CreateRecipe";
import { RecipeCard } from "@/components/RecipeCard";
import type { User } from "firebase/auth"; 
import { Recipe } from '@/types';
import Header from "@/components/Header"; 
import { useRouter } from "next/navigation";

export default function MyRecipesPage() {
  const { user }: { user: User | null } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchTokenAndRecipes = async () => {
      try {
        const fetchedToken = await user.getIdToken();
        setToken(fetchedToken);

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me/recipes`, {
          headers: { Authorization: `Bearer ${fetchedToken}` },
        });

        setRecipes(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch recipes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenAndRecipes();
  }, [user]);

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!token || deletingIds.has(recipeId)) return;

    setDeletingIds(prev => new Set(prev).add(recipeId));
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    } catch (err) {
      console.error("Failed to delete recipe:", err);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
    }
  };

  const handleRecipeCreated = (newRecipe: Recipe) => {
  setRecipes((prev) => [newRecipe, ...prev]);
  setIsCreateModalOpen(false); 
};

  const handleSearch = (query: string) => {
    router.push(`/?search=${encodeURIComponent(query)}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FFFD8F]/0">
        <Loader2 className="animate-spin h-12 w-12 text-[#043915]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FFFD8F]/0">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#4C763B]">Please sign in</h2>
          <p className="text-[#043915] mb-6">You must be logged in to view your recipes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header onSearch={handleSearch} />

      <main className="flex-1 p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#4C763B]">My Recipes</h2>
          <Button
            style={{ backgroundColor: '#4C763B', color: '#FFFD8F' }}
            className="flex items-center hover:bg-[#043915] transition-colors"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircle className="mr-2" />
            Create Recipe
          </Button>
        </div>

        {error ? (
          <p className="text-red-700 text-center">{error}</p>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-96">
            <div className="bg-[#B0CE88] rounded-xl shadow-lg p-10 flex flex-col items-center transform transition hover:scale-105">
              <BookXIcon className="h-16 w-16 text-[#043915] mb-4" />
              <h3 className="text-2xl font-bold text-[#4C763B] mb-2">No recipes yet</h3>
              <p className="text-[#043915] text-center mb-4">Click "Create Recipe" to add your first recipe!</p>
              <Button
                style={{ backgroundColor: '#4C763B', color: '#FFFD8F' }}
                className="flex items-center hover:bg-[#043915] transition-colors"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <PlusCircle className="mr-2" />
                Create Recipe
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                token={token}
                isDeleting={deletingIds.has(recipe.id)}
                onDelete={() => handleDeleteRecipe(recipe.id)}
                showRatingInput={false}
              />
            ))}
          </div>
        )}

        {isCreateModalOpen && token && (
          <CreateRecipe
            token={token}
            onClose={() => setIsCreateModalOpen(false)}
            onRecipeCreated={handleRecipeCreated}
          />
        )}
      </main>
    </div>
  );
}
