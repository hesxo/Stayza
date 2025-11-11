import { Star } from "lucide-react";

const MAX_RATING = 5;

const StarRating = ({
  value = 0,
  onChange,
  readOnly = false,
  size = "md",
  className = "",
}) => {
  const starSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  const handleSelect = (rating) => {
    if (readOnly || !onChange) {
      return;
    }
    onChange(rating);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: MAX_RATING }).map((_, index) => {
        const ratingValue = index + 1;
        const filled = ratingValue <= value;
        return (
          <button
            key={ratingValue}
            type="button"
            className="text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-full"
            onClick={() => handleSelect(ratingValue)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleSelect(ratingValue);
              }
            }}
            aria-label={`Rate ${ratingValue} star${ratingValue > 1 ? "s" : ""}`}
            aria-pressed={filled}
            disabled={readOnly}
          >
            <Star
              className={`${starSize} ${
                filled ? "fill-primary" : "fill-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
