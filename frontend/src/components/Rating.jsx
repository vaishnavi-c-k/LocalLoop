
import { Star } from "lucide-react";

function Rating({
  value = 0,
  onChange,
  readOnly = false,
  size = 20,
  showValue = false
}) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <div className="rating-container">
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`rating-star ${
              star <= rating ? "active" : ""
            }`}
            onClick={() => {
              if (!readOnly && onChange) {
                onChange(star);
              }
            }}
            disabled={readOnly}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            style={{ cursor: readOnly ? "default" : "pointer" }}
          >
            <Star
              size={size}
              fill={star <= rating ? "#FFC928" : "none"}
              color={star <= rating ? "#FFC928" : "#777777"}
              strokeWidth={1.8}
            />
          </button>
        ))}
      </div>

      {showValue && (
        <span className="rating-value">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default Rating;
