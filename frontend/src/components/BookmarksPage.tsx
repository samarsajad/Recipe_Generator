'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { RecipeCard } from './RecipeCard';
import { Recipe } from '@/types';
import { Loader2, BookmarkX } from 'lucide-react';

interface BookmarksPageProps {
  token: string | null;
}

export function BookmarksPage({ token }: BookmarksPageProps) {
  const [bookmarks, setBookmarks] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/users/me/bookmarks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(response.data);
      } catch (err) {
        console.error('Failed to fetch bookmarks:', err);
        setError('Failed to load bookmarks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, [token]);

  const handleBookmarkRemoved = (recipeId: string) => {
    // Remove from local state when bookmark is removed
    setBookmarks(prev => prev.filter(recipe => recipe.id !== recipeId));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-center text-lg">{error}</p>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <BookmarkX className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
          <p className="text-muted-foreground">Start bookmarking recipes you like to see them here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">My Bookmarks</h2>
        <p className="text-muted-foreground">{bookmarks.length} saved recipe{bookmarks.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            token={token}
            showRatingInput={true}
            showBookmark={true}
            // Add a callback to handle when bookmark is removed
            onBookmarkChange={() => handleBookmarkRemoved(recipe.id)}
          />
        ))}
      </div>
    </div>
  );
}
