'use client';

import { useState, useRef, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { LoginDialog } from "@/components/LoginDialog";
import { signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import UserProfile from "@/components/UserProfile";
import { RecipeCard } from "@/components/RecipeCard";
import { CreateRecipe } from "@/components/CreateRecipe";
import { Recipe } from '@/types';

import { RecipeFilters } from "@/components/Filters";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Menu, Upload, X, Search, PlusCircle, Loader2, UserCircle, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface RecipeResponse {
  recipe: Recipe;
  matching_ingredients: string[];
  missing_ingredients: string[];
}

interface IngredientCategory {
  category: string;
  items: string[];
}

export default function Home() {
  // User/Auth State
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) user.getIdToken().then(token => setUserToken(token));
    else setUserToken(null);
  }, [user]);

  // States
  const [allIngredients, setAllIngredients] = useState<IngredientCategory[]>([]);
  const [pantryIngredients, setPantryIngredients] = useState<string[]>([]);
  const [sidebarSearch, setSidebarSearch] = useState<string>("");
  const [mainSearch, setMainSearch] = useState<string>("");

  const [recipes, setRecipes] = useState<(Recipe | RecipeResponse)[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [pendingFetches, setPendingFetches] = useState(0);

  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<'pantry' | 'search'>('pantry');
  const [viewTitle, setViewTitle] = useState<string>("");
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);


  const fileInputRef = useRef<HTMLInputElement>(null);

  interface FilterState {
    dietary: string[];
    maxTime: number | null;
    difficulty: string;
    minRating: number | null;
    cuisine: string[];
  }

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    dietary: [] as string[],
    maxTime: null as number | null,
    difficulty: "",
    minRating: null as number | null,
    cuisine: [],
  });

  const handleFilterChange = (updated: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...updated }));
  };

  const clearFilters = () => {
    setFilters({ dietary: [], maxTime: null, difficulty: "", minRating: null, cuisine: [] });
  };

  // Axios Instance with Auth
  const axiosInstance = useMemo(() => {
    const instance = axios.create({ baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`});
    instance.interceptors.request.use(async config => {
      if (user) {
        try { 
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        } catch {}
      }
      return config;
    });
    return instance;
  }, [user]);

  // API Calls
  useEffect(() => {
    const fetchIngredients = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get<IngredientCategory[]>('/ingredients');
        setAllIngredients(res.data);
      } catch {
        setError("Could not load ingredient library.");
      } finally { setIsLoading(false); }
    };
    fetchIngredients();
  }, [axiosInstance]);

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get<Recipe[]>('/chefs-choice');
        setFeaturedRecipes(res.data);
      } finally { setIsLoading(false); }
    };
    fetchFeatured();
  }, [axiosInstance]);

  // Recipe Fetching
  const fetchRecipesFromPantry = async (ingredients: string[] = pantryIngredients) => {
    if (!ingredients.length) {
      setRecipes([]);
      setViewTitle("");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipes([]);
    setPendingFetches(prev => prev + 1);
    
    try {
      const payload = {
        available_ingredients: ingredients.map(i => i.trim().toLowerCase()),
        filters: Object.values(filters).some(v => v) ? filters : undefined
      };
      const res = await axiosInstance.post<RecipeResponse[]>('/generate-recipes', payload);
      setRecipes(res.data);
      setViewTitle(`Suggested Recipes For You`);
      setView('pantry');
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
      setPendingFetches(prev => Math.max(prev - 1, 0));
    }
  };

  const fetchRecipesFromSearch = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!mainSearch.trim()) return;
    setIsLoading(true); setError(null); setRecipes([]);
    try {
      const res = await axiosInstance.get<Recipe[]>(`/search?query=${mainSearch}`);
      setRecipes(res.data);
      setViewTitle(`Found ${res.data.length} recipes for "${mainSearch}"`);
      setView('search');
    } catch (err) { handleApiError(err); }
    finally { setIsLoading(false); }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true); setError(null);
    const formData = new FormData(); formData.append('image', file);
    try {
      const res = await axiosInstance.post<{ ingredients: string[] }>('/recognize-ingredients', formData);
      const newPantry = [...new Set([...pantryIngredients, ...res.data.ingredients])];
      setPantryIngredients(newPantry);
      fetchRecipesFromPantry(newPantry);
    } catch (err) { handleApiError(err, "Failed to analyze image."); }
    finally { setIsUploading(false); }
  };

  const togglePantryIngredient = (ing: string) => {
    const formatted = ing.trim().toLowerCase();
    const updated = pantryIngredients.includes(formatted)
      ? pantryIngredients.filter(i => i !== formatted)
      : [...pantryIngredients, formatted];
    setPantryIngredients(updated);

    // Immediate reset if all removed
    if (updated.length === 0) {
      setRecipes([]);
      setViewTitle("");
      setView('pantry');
    }
    // setPantryIngredients(prev => prev.includes(formatted) ? prev.filter(i => i !== formatted) : [...prev, formatted]);
  };

  const handleApiError = (err: unknown, customMessage?: string) => {
    let message = customMessage || "An unexpected error occurred.";
    if (axios.isAxiosError(err) && err.response?.data?.detail) {
      message = err.response.data.detail;
    }
    setError(message);
    setRecipes([]);
  };

  // Filtered Recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      const recipeData = 'recipe' in r ? r.recipe : r;

      if (filters.dietary.length) {
        const tags = (recipeData.dietary_restrictions || []).map(t => t.toLowerCase());
        if (!filters.dietary.every(f => tags.includes(f))) return false;
      }
      if (filters.maxTime && recipeData.cooking_time_minutes && recipeData.cooking_time_minutes > filters.maxTime) return false;
      if (filters.difficulty && recipeData.difficulty?.toLowerCase() !== filters.difficulty.toLowerCase()) return false;
      if (filters.minRating && recipeData.average_rating && recipeData.average_rating < filters.minRating) return false;
      let recipeCuisines: string[] = [];

      if (Array.isArray(recipeData.cuisine)) {
        recipeCuisines = recipeData.cuisine;
      } else if (typeof recipeData.cuisine === 'string') {
        recipeCuisines = [recipeData.cuisine]; 
      } else {
        recipeCuisines = [];
      }

      if (filters.cuisine.length > 0) {
        if (!filters.cuisine.some(cuisine => recipeCuisines.includes(cuisine))) return false;
      }

      return true;
    });
  }, [recipes, filters]);

  // Debounced pantry fetch
  useEffect(() => {
    if (view === 'pantry' && pantryIngredients.length) {
      const timer = setTimeout(() => fetchRecipesFromPantry(), 500);
      return () => clearTimeout(timer);
    }
  }, [pantryIngredients, view]);

  // Filtered Ingredients for Sidebar
  const filteredIngredients = useMemo(() => {
    if (!sidebarSearch) return allIngredients;
    const searchLower = sidebarSearch.toLowerCase();
    return allIngredients
      .map(cat => ({ ...cat, items: cat.items.filter(i => i.toLowerCase().includes(searchLower)) }))
      .filter(cat => cat.items.length > 0);
  }, [sidebarSearch, allIngredients]);

  const handleSignOut = () => { signOut(auth); setIsProfileOpen(false); };

  const handleRecipeCreated = (newRecipe: Recipe) => setRecipes(prev => [newRecipe, ...prev]);

  const pantrySidebarContent = (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b">
        <Input placeholder="Search ingredients..." value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)} />
      </div>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-green-700">My Basket ({pantryIngredients.length})</h3>
          <RecipeFilters filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
        </div>
        <div className="flex flex-wrap gap-2 min-h-[40px] max-h-32 overflow-y-auto rounded-md p-2 bg-muted">
          {pantryIngredients.map(ing => (
            <Badge key={ing} variant="default" className="text-sm">
              {ing}
              <button onClick={() => togglePantryIngredient(ing)} className="ml-1.5 p-0.5 rounded-full hover:bg-white/20">
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto px-4">
        <Accordion type="multiple" defaultValue={[]} className="w-full">
          {filteredIngredients.map(cat => (
            <AccordionItem value={cat.category} key={cat.category}>
              <AccordionTrigger className="text-green-600 font-medium">{cat.category}</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1">
                  {cat.items.map(item => {
                    const isInPantry = pantryIngredients.includes(item);
                    return (
                      <li key={item} className="flex justify-between items-center text-sm pl-2 rounded-md hover:bg-muted">
                        <span>{item}</span>
                        <Button variant="ghost" size="icon" onClick={() => togglePantryIngredient(item)}>
                          {isInPantry ? <MinusCircle size={16} className="text-red-500" /> : <PlusCircle size={16} className="text-muted-foreground hover:text-primary" />}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );

  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-muted/40 overflow-x-hidden"> 
      <aside className="hidden md:block md:w-[300px] lg:w-[350px] border-r bg-background">{pantrySidebarContent}</aside>
      <main className="flex-1 flex flex-col max-h-screen">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between p-4 border-b bg-background gap-4"> 

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[350px] p-0">{pantrySidebarContent}</SheetContent>
          </Sheet>

          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                {user?.photoURL ? <img src={user.photoURL} alt="User" className="h-6 w-6 rounded-full" /> : <UserCircle size={20} />}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{user ? "Your Profile" : "Sign In"}</DialogTitle></DialogHeader>
              {user ? <UserProfile /> : <LoginDialog setOpen={setIsProfileOpen} />}
            </DialogContent>
          </Dialog>

          <div className="flex flex-grow justify-center gap-2 sm:gap-4 px-2 sm:px-4 min-w-0">
            <form onSubmit={fetchRecipesFromSearch} className={`relative w-full max-w-md min-w-0 transition-all duration-300 ${isSearchFocused ? 'max-w-full' : ''}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search recipes by name" className="pl-10" value={mainSearch} onChange={e => setMainSearch(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} />
            </form>

            <div className="flex flex-col items-start w-full max-w-md">
              <Button variant="outline" className={`w-full flex items-center justify-center transition-all duration-300${isSearchFocused ? 'sm:block hidden !w-10 !px-2' : 'sm:block'}`} onClick={() => fileInputRef.current?.click()} disabled={isUploading || isLoading}>
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span className={`ml-2 sm:inline ${isSearchFocused ? 'hidden' : 'inline'}`}>{isUploading ? 'Scanning...' : 'Upload Image to Scan Ingredients'}</span>
              </Button>
              {(isUploading || isLoading) && <p className="text-xs text-muted-foreground mt-1">Consider removing irrelevant tags for faster responses</p>}
              <Input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/jpeg, image/png" />
            </div>
          </div>
        </header>

        {/* Main Content */}
       <section className="flex-1 p-4 overflow-y-auto">
  {/* Incremental loader */}
  {pendingFetches > 0 && (
    <div className="flex flex-col items-center mb-4">
      <Loader2 className="h-8 w-8 animate-spin text-green-700 mb-2" />
      <p className="text-center text-green-700 font-medium">
        Please wait while we optimize your search...
      </p>
    </div>
  )}

  {/* Error */}
  {error && <p className="text-red-500 text-center">{error}</p>}

  {/* Recipes */}
  {filteredRecipes.length > 0 ? (
    <>
      <h2 className="text-xl font-semibold mb-4">{viewTitle}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {filteredRecipes.map((r, idx) => {
          const recipeData = 'recipe' in r ? r.recipe : r;
          const matching = 'matching_ingredients' in r ? r.matching_ingredients : [];
          const missing = 'missing_ingredients' in r ? r.missing_ingredients : [];
          return (
            <RecipeCard
              key={recipeData.id || idx}
              recipe={recipeData}
              matching_ingredients={matching}
              missing_ingredients={missing}
              token={userToken}
            />
          );
        })}
      </div>
    </>
  ) : (
    pantryIngredients.length === 0 && view === 'pantry' && featuredRecipes.length > 0 ? (
      <>
        {/* Featured Recipes */}
        <div className="relative bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl p-8 mb-8 overflow-hidden">
          <svg className="absolute -bottom-1 left-0 w-full h-32 text-white opacity-20" viewBox="0 0 1440 320" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M0,160 C360,320 1080,0 1440,160 L1440,320 L0,320 Z"></path>
          </svg>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to Smart Recipes!</h1>
            <p className="text-lg md:text-xl mb-4">Add your ingredients to browse and filter delicious recipes.</p>
            <p className="italic">Discover chef&apos;s choice recipes below</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {featuredRecipes.map((recipe, idx) => (
            <RecipeCard
              key={recipe.id || idx}
              recipe={recipe}
              matching_ingredients={[]}
              missing_ingredients={[]}
              token={userToken}
            />
          ))}
        </div>
      </>
    ) : (
      <p className="text-muted-foreground text-center">{viewTitle }</p>
    )
  )}
</section>


        {isCreateModalOpen && userToken && <CreateRecipe token={userToken} onClose={() => setIsCreateModalOpen(false)} onRecipeCreated={handleRecipeCreated} />}
      </main>
    </div>
  );
}
