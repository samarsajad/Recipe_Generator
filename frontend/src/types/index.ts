// src/types/index.ts

export interface Recipe {
  id: string; 
  name: string; 
  image_url?: string; 
  ingredients: string[];
  instructions?: string | string[]; 
  steps?: string | string[];
  description?: string[];
  nutritional_info: Record<string, string>;
  cooking_time_minutes?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  dietary_restrictions?: string[];
  average_rating: number;
  rating_count: number;
  cuisine?: string;
  
}

export interface FilterState {
  dietary: string[];
  maxTime: number | null;
  difficulty: string;
  minRating: number | null;
  cuisine: string[];
}