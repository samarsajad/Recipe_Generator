import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, ChefHat, Trash2, Loader2, ChevronDown, ChevronUp, Users, Info, Bookmark, BookmarkCheck, LeafIcon } from "lucide-react";
import { Recipe } from '@/types';
import { StarRating } from '@/components/StarRating';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaCarrot, FaUtensils } from "react-icons/fa";



interface RecipeCardProps {
  recipe: Recipe;
  token: string | null;
  onDelete?: () => void;
  isDeleting?: boolean;
  matching_ingredients?: string[];
  missing_ingredients?: string[];
  showRatingInput?: boolean;
  showBookmark?: boolean; // New prop
  onBookmarkChange?: () => void;
}

export function RecipeCard({
  recipe,
  token,
  onDelete,
  isDeleting = false,
  matching_ingredients,
  missing_ingredients,
  showRatingInput = true,
  showBookmark = true, // Default to true
  onBookmarkChange,
  
}: RecipeCardProps) {
  const ingredientsList = recipe.ingredients || [];
  const dietaryList = recipe.dietary_restrictions || [];
  const router = useRouter();
  
  // Handle instructions properly
  const instructionsData = recipe.instructions || (recipe as any).steps || [];
  const finalInstructions = Array.isArray(instructionsData) 
    ? instructionsData 
    : instructionsData 
      ? [instructionsData] 
      : [];
      
  const nutritionalInfo = recipe.nutritional_info || {};
  
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(recipe.average_rating || 0);
  const [ratingCount, setRatingCount] = useState(recipe.rating_count || 0);
  
  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  
  // Collapsible states
  const [isStepsOpen, setIsStepsOpen] = useState(false);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  

  // Check bookmark status on component mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!token || !recipe.id) return;
      
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/users/me/bookmarks/check/${recipe.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsBookmarked(response.data.is_bookmarked);
      } catch (error) {
        console.error('Failed to check bookmark status:', error);
      }
    };

    checkBookmarkStatus();
  }, [token, recipe.id]);

  const handleBookmarkToggle = async () => {
    if (!token || !recipe.id || isBookmarkLoading) return;

    setIsBookmarkLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        await axios.delete(
          `http://127.0.0.1:8000/users/me/bookmarks/${recipe.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsBookmarked(false);
        alert('Bookmark removed!');
      } else {
        // Add bookmark
        await axios.post(
          `http://127.0.0.1:8000/users/me/bookmarks/${recipe.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsBookmarked(true);
        alert('Recipe bookmarked!');
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recipe.id) {
      console.error("Recipe ID is missing, cannot delete.");
      alert("Recipe ID is missing. Cannot delete.");
      return;
    }

    if (isDeleting) return;

    if (!confirm("Are you sure you want to delete this recipe?")) return;

    onDelete?.();
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!token || isSubmittingRating) return;

    setIsSubmittingRating(true);
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/recipes/${recipe.id}/rate`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentRating(response.data.new_average);
      setRatingCount(response.data.rating_count);
      setUserRating(rating);
      
      alert('Rating submitted successfully!');
    } catch (err) {
      console.error('Failed to submit rating:', err);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border hover:border-primary/30 flex flex-col">
      {/* Image */}
      {recipe.image_url && (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      {/* Header Section */}
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold line-clamp-2 mb-2 cursor-pointer text-primary text-green-700 hover:text-yellow-600"
            onClick={() => router.push(`/${recipe.id}`)}
            >
            {recipe.name || "Untitled Recipe"}
            </CardTitle>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {recipe.cooking_time_minutes || "?"} min
              </span>
              <span className="flex items-center gap-1">
                <ChefHat className="h-4 w-4" />
                {recipe.difficulty || "Unknown"}
              </span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-1">
            {/* Bookmark button */}
            {showBookmark && token && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmarkToggle}
                disabled={isBookmarkLoading}
                className={cn(
                  "flex-shrink-0",
                  isBookmarked 
                    ? "text-yellow-600 hover:text-yellow-700" 
                    : "text-muted-foreground hover:text-yellow-600"
                )}
              >
                {isBookmarkLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {/* Delete button */}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-muted-foreground hover:text-destructive flex-shrink-0"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Rating Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarRating rating={currentRating} readonly size={14} />
            <span className="text-xs text-muted-foreground">
              {currentRating > 0 ? `${currentRating.toFixed(1)} (${ratingCount})` : 'No ratings'}
            </span>
          </div>
          
          {/* dietary badges */}
          <div className="flex gap-1">
            {dietaryList.slice(0, 2).map((tag: string, idx: number) => (
              <Badge key={`${tag}-${idx}`} variant="secondary" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        {/* Ingredient matching info  */}
        {matching_ingredients && (
          <div className="rounded bg-green-50 border border-green-200 p-2 mb-3">
            <p className="text-sm font-medium text-green-700">✅ {matching_ingredients.length}/{ingredientsList.length} ingredients
            </p>
            {matching_ingredients && matching_ingredients.length > 0 && (
              <p className="text-xs text-green-600 mt-1">Available: {matching_ingredients.join(", ")}</p>
            )}
            {missing_ingredients && missing_ingredients.length > 0 && (
              <p className="text-xs text-red-600 mt-1">Missing: {missing_ingredients.join(", ")}</p>
            )}
          </div>
        )}

        {/* Quick Preview - 2 column layout */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Left: Ingredients preview */}
          <div className="bg-muted/30 rounded p-3">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Ingredients
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {ingredientsList.slice(0, 5).join(", ")}
              {ingredientsList.length > 5 && ` +${ingredientsList.length - 5} more`}
            </p>
          </div>
          
          {/* Right: Steps preview */}
          <div className="bg-muted/30 rounded p-3">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <ChefHat className="h-3 w-3" />
              First Step
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {finalInstructions.length > 0 
                ? finalInstructions[0] 
                : "No cooking instructions available"
              }
            </p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClickCapture={()=> setIsIngredientsOpen(!isIngredientsOpen)}
            className="w-full justify-between text-xs"
          >
            <span className="flex items-center gap-1">
              <LeafIcon className="h-3 w-3" />
              All ({ingredientsList.length})
            </span>
            {isIngredientsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStepsOpen(!isStepsOpen)}
            className="w-full justify-between text-xs"
          >
            <span className="flex items-center gap-1">
              <ChefHat className="h-3 w-3" />
              Steps ({finalInstructions.length})
              
            </span>
            {isStepsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>

        {/* Expanded Content */}
        {(isStepsOpen || isIngredientsOpen) && (
          <div className="border-t pt-3 mt-3">
            {/* Steps Content */}
            {isStepsOpen && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  Cooking Steps:
                </h3>
                <div className="space-y-2">
                  {finalInstructions.map((instruction: string, idx: number) => (
                    <div key={idx} className="flex gap-2 p-2 rounded bg-muted/20 border text-sm">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-xs leading-relaxed">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients Content */}
            {isIngredientsOpen && (
              <div className="mb-2">
                <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All Ingredients:
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {ingredientsList.map((ingredient: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded bg-muted/20 text-sm">
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                      <span className={cn(
                        matching_ingredients?.includes(ingredient.toLowerCase()) 
                          ? "text-green-700 font-medium" 
                          : missing_ingredients?.includes(ingredient.toLowerCase())
                          ? "text-red-600"
                          : ""
                      )}>
                        {ingredient}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rating Input */}
        {showRatingInput && (
          <div className="flex items-center justify-between pt-2 border-t mt-auto">
            <span className="text-xs font-medium">Rate</span>
            <div className="flex items-center gap-2">
              <StarRating 
                rating={userRating} 
                onRatingChange={handleRatingSubmit}
                size={14}
              />
              {isSubmittingRating}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
