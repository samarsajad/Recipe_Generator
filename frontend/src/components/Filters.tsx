'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SlidersHorizontal } from "lucide-react";

// Define the shape of the filters object
interface FilterState {
  dietary: string[];
  maxTime: number | null;
  difficulty: string;
  minRating: number | null;
  cuisine: string[];
}

interface RecipeFiltersProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onClear: () => void;
}

const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'];
const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];
const CUISINE_OPTIONS = ['Italian', 'Chinese', 'Indian', 'Mexican', 'French', 'Thai', 'American'];

export function RecipeFilters({ filters, onChange, onClear }: RecipeFiltersProps) {
  const handleDietaryChange = (option: string) => {
    const newDietary = filters.dietary.includes(option)
      ? filters.dietary.filter((item) => item !== option)
      : [...filters.dietary, option];
    onChange({ dietary: newDietary });
  };
  const handleCuisineChange = (option: string) => {
    const newCuisines = filters.cuisine.includes(option)
      ? filters.cuisine.filter((item) => item !== option)
      : [...filters.cuisine, option];
    onChange({ cuisine: newCuisines });
  };
  
  const handleClear = () => {
    onClear();
    
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Recipes</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Dietary Section */}
          <div>
            <h4 className="font-semibold mb-3">Dietary Restrictions</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {DIETARY_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={filters.dietary.includes(option)}
                    onCheckedChange={() => handleDietaryChange(option)}
                  />
                  <Label htmlFor={option} className="capitalize font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Time Section */}
          <div>
            <h4 className="font-semibold mb-2">Max Cooking Time</h4>
            <div className="flex items-center gap-4">
               <Slider
                 defaultValue={[120]}
                 value={[filters.maxTime ?? 120]}
                 max={180}
                 step={15}
                 onValueChange={(value) => onChange({ maxTime: value[0] })}
               />
               <span className="text-sm text-muted-foreground w-24 text-right">
                 {filters.maxTime ? `${filters.maxTime} min` : 'Any'}
               </span>
            </div>
          </div>

          {/* Difficulty Section */}
          <div>
            <h4 className="font-semibold mb-3">Difficulty</h4>
            <RadioGroup
              value={filters.difficulty}
              onValueChange={(value) => onChange({ difficulty: value })}
              className="flex gap-4"
            >
              {DIFFICULTY_OPTIONS.map(opt => (
                 <div key={opt} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.toLowerCase()} id={opt} />
                    <Label htmlFor={opt} className="font-normal cursor-pointer">{opt}</Label>
                 </div>
              ))}
            </RadioGroup>
          </div>
          {/* Cuisine Section */}
<div>
  <h4 className="font-semibold mb-3">Cuisine</h4>
  <div className="flex flex-wrap gap-x-4 gap-y-2">
    {CUISINE_OPTIONS.map((option) => (
      <div key={option} className="flex items-center space-x-2">
        <Checkbox
          id={option}
          checked={filters.cuisine.includes(option)}
          onCheckedChange={() => handleCuisineChange(option)}
        />
        <Label htmlFor={option} className="capitalize font-normal cursor-pointer">
          {option}
        </Label>
      </div>
    ))}
  </div>
</div>

          
          {/* Rating Section */}
          <div>
            <h4 className="font-semibold mb-2">Minimum Rating</h4>
            <div className="flex items-center gap-4">
               <Slider
                 defaultValue={[0]}
                 value={[filters.minRating ?? 0]}
                 max={5}
                 step={0.5}
                 onValueChange={(value) => onChange({ minRating: value[0] })}
               />
               <span className="text-sm text-muted-foreground w-24 text-right">
                 {filters.minRating ? `★ ${filters.minRating} & up` : 'Any'}
               </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClear}>Clear All</Button>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}