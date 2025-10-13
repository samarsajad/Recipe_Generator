'use client';

import { useState, useEffect, useMemo } from "react";
import axios, { AxiosError } from "axios";
import { signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import UserProfile from "@/components/UserProfile";
import { RecipeCard } from "@/components/RecipeCard";
import { Recipe } from '@/types';
import Header from "@/components/Header"; 
import { useRouter } from "next/navigation";
import { Loader2, BookmarkX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyBookmarks() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [bookmarks, setBookmarks] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  const axiosInstance = useMemo(() => {
    const instance = axios.create({ baseURL: 'http://127.0.0.1:8000' });
    instance.interceptors.request.use(async (config) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        } catch (e) {
          console.error("Error getting auth token", e);
        }
      }
      return config;
    });
    return instance;
  }, [user]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(token => setUserToken(token));
    } else {
      setUserToken(null);
    }
  }, [user]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user || !userToken) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get<Recipe[]>('/users/me/bookmarks');
        setBookmarks(response.data);
      } catch (err) {
        const errorDetail = (err as AxiosError<{ detail: string }>)?.response?.data?.detail;
        setError(errorDetail || "Failed to load bookmarks.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) fetchBookmarks();
  }, [axiosInstance, user, userToken, authLoading]);

  const handleBookmarkChange = (recipeId: string) => {
    setBookmarks(prev => prev.filter(recipe => recipe.id !== recipeId));
  };

  const handleSearch = (query: string) => {
    router.push(`/?search=${encodeURIComponent(query)}`);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFD8F]">
        <Loader2 className="h-12 w-12 animate-spin text-[#043915]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFD8F]">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#4C763B]">Please sign in</h2>
          <p className="text-[#043915] mb-6">You need to be signed in to view your bookmarks.</p>
          
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header onSearch={handleSearch} />

      <main className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-[#043915]" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-700 text-center text-lg">{error}</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-96">
            <div className="bg-[#B0CE88] rounded-xl shadow-lg p-10 flex flex-col items-center">
              <BookmarkX className="h-16 w-16 text-[#043915] mb-4" />
              <h3 className="text-2xl font-bold text-[#4C763B] mb-2">No bookmarks yet</h3>
              <p className="text-[#043915] text-center mb-4">Start bookmarking recipes you like to see them here!</p>
              <Button
                style={{ backgroundColor: '#4C763B', color: '#FFFD8F' }}
                onClick={() => router.push('/')}
              >
                Browse Recipes
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {bookmarks.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                token={userToken}
                showRatingInput={true}
                showBookmark={true}
                onBookmarkChange={() => handleBookmarkChange(recipe.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
