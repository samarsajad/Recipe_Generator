import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  className?: string;
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 16,
  className 
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoveredRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div 
      className={cn("flex items-center gap-0.5", className)}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            "transition-all duration-150",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
            star <= displayRating 
              ? "fill-yellow-400 text-yellow-400" 
              : "fill-muted text-muted-foreground/30",
            !readonly && "hover:text-yellow-400"
          )}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover(star)}
        />
      ))}
    </div>
  );
}
