'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Recipe } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/StarRating';
import { Loader2, Clock, ChefHat } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { motion } from 'framer-motion';
import Header from "@/components/Header"; 
import { useRouter } from "next/navigation";

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [token, setToken] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  const [feedbacks, setFeedbacks] = useState<{ user: string; text: string }[]>([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ uid: string; displayName: string } | null>(null);

  const router = useRouter();

  // --- Firebase Auth ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const t = await user.getIdToken();
        setToken(t);
        setCurrentUser({ uid: user.uid, displayName: user.displayName || 'You' });
      } else {
        setToken(null);
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Fetch recipe ---
  useEffect(() => {
    if (!id) return;
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const res = await axios.get<Recipe>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/recipes/${id}`);
        const r = res.data;
        setRecipe(r);
        setCurrentRating(r.average_rating || 0);
        setRatingCount(r.rating_count || 0);
      } catch (err) {
        console.error(err);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleSearch = (query: string) => {
    router.push(`/?search=${encodeURIComponent(query)}`);
  };

  // Fetch feedbacks
  useEffect(() => {
    if (!id) return;
    axios
      .get<{ user: string; text: string }[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/recipes/${id}/feedbacks`)
      .then((res) => setFeedbacks(res.data))
      .catch(() => setFeedbacks([]));
  }, [id]);

  //Rating submit
  const handleRatingSubmit = async (rating: number) => {
    if (!token || isSubmittingRating || !recipe?.id) return;

    setIsSubmittingRating(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/recipes/${recipe.id}/rate`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentRating(response.data.new_average);
      setRatingCount(response.data.rating_count);
      setUserRating(rating);
    } catch (err) {
      console.error(err);
      alert('Failed to submit rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Feedback submit
  const handleFeedbackSubmit = async () => {
    if (!token || isSubmittingFeedback || !recipe?.id || !newFeedback.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/recipes/${recipe.id}/feedbacks`,
        { text: newFeedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFeedbacks(prev => [
        ...prev,
        { user: currentUser?.displayName || 'You', text: newFeedback }
      ]);
      setNewFeedback('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-amber-500" />
      </div>
    );
  }

  if (!recipe) {
    return <p className="text-center text-red-600 mt-8">Recipe not found</p>;
  }

  const ingredients = recipe.ingredients || [];
  const dietaryTags = recipe.dietary_restrictions || [];
  const nutritional = recipe.nutritional_info || {};
  const instructionsData = recipe.instructions || recipe.steps || [];
  const instructions = Array.isArray(instructionsData) ? instructionsData : [instructionsData];

  return (
    <div className="flex flex-col min-h-screen">
          {/* Header */}
          <Header onSearch={handleSearch} />
          
    <div className="max-w-[1400px] mx-auto py-12 px-4 space-y-8">
      {/* Main Panels */}
      <div className="flex gap-8">
        {/* Left Panel */}
      
        <motion.div
          className="w-2/5"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full h-full shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-lg overflow-hidden flex flex-col">
            {recipe.image_url && (
              <motion.img
                src={recipe.image_url}
                alt={recipe.name}
                className="w-full h-72 object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            )}
            <CardContent className="flex flex-col gap-4 py-6 flex-1">
              <h1 className="text-3xl font-bold text-green-600">{recipe.name}</h1>
              {recipe.description && (
                <p className="text-gray-700 text-sm line-clamp-5">{recipe.description}</p>
              )}

              <div className="flex justify-between items-start mt-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <StarRating rating={currentRating} readonly size={20} />
                    <span className="text-sm text-amber-700">
                      {currentRating > 0 ? `${currentRating.toFixed(1)} (${ratingCount})` : 'No ratings'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dietaryTags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-amber-200 text-amber-800">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-sm text-amber-900 font-medium">
                  <div className="flex items-center gap-1"><ChefHat className="h-5 w-5" />{recipe.difficulty || 'Unknown'}</div>
                  <div className="flex items-center gap-1"><Clock className="h-5 w-5" />{recipe.cooking_time_minutes} min</div>
                </div>
              </div>

              {token ? (
                <div className="flex flex-col items-start mt-auto pt-4">
                  <span className="text-sm font-medium mb-1">Your Rating:</span>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={userRating} onRatingChange={handleRatingSubmit} size={22} />
                    {isSubmittingRating && <Loader2 className="h-5 w-5 animate-spin text-amber-500" />}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-700 mt-auto pt-4">Sign in to rate</p>
              )}

              <div className="w-full mt-4">
                <span className="text-sm font-medium">Leave Feedback:</span>
                <Textarea
                  className="w-full my-2 border-amber-200 focus:border-green-400 focus:ring-green-200"
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Write your thoughts..."
                  rows={2}
                />
                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={isSubmittingFeedback || !newFeedback.trim()}
                  className="w-full bg-green-600 hover:bg-green-500 text-white transition-colors"
                >
                  {isSubmittingFeedback && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Panel */}
       
        <motion.div
          className="w-3/5 flex flex-col"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-lg overflow-hidden flex-1 flex flex-col">
            <CardContent className="py-6 flex-1 flex flex-col">
              <section className="pb-6">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 border-b-2 border-green-200 pb-1 text-green-600">
                  Ingredients
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="bg-yellow-100 text-amber-900 px-3 py-1 rounded-full text-sm shadow-sm hover:bg-green-200 transition-colors"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </section>

              

              <section className="pb-6">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 border-b-2 border-green-200 pb-1 text-green-600">Cooking Instructions</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-amber-900">
                  {instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </section>

              {Object.keys(nutritional).length > 0 && (
                <>
                  <section>
                    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 border-b-2 border-green-200 pb-1 text-green-600">Nutritional Info</h2>
                    <ul className="text-sm text-amber-900">
                      {Object.entries(nutritional).map(([key, val]) => (
                        <li key={key} className="mb-1">
                          <strong>{key}:</strong> {val}
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Feedback Section */}
      <motion.div
        className="w-full p-6 bg-amber-50 rounded-lg shadow-inner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-green-600 mb-4">User Feedback</h2>
        {feedbacks.length === 0 ? (
          <p className="text-amber-900">No feedback yet. Be the first to leave your thoughts!</p>
        ) : (
          <ul className="space-y-3 max-h-72 overflow-y-auto">
            {feedbacks.map((fb, idx) => (
              <motion.li
                key={idx}
                className="border-l-4 border-green-400 bg-amber-100 p-3 rounded shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <strong className="text-green-700">{fb.user}:</strong> {fb.text}
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
    </div>
    
  );
}