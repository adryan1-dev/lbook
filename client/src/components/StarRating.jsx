import { useState } from "react";

function StarRating({ label, value, onChange, hint }) {
  const [showHint, setShowHint] = useState(false);

  const handleSelect = (star, event) => {
    event.preventDefault();
    onChange(star);
  };

  return (
    <div className="rating-block">
      <div className="rating-label-row">
        <label>{label}</label>
        <span
          className="hint-trigger"
          onMouseEnter={() => setShowHint(true)}
          onMouseLeave={() => setShowHint(false)}
          onFocus={() => setShowHint(true)}
          onBlur={() => setShowHint(false)}
          tabIndex={0}
        >
          ?{showHint ? <span className="hint-card">{hint}</span> : null}
        </span>
      </div>
      <div className="stars-row">
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={star <= value ? "star active" : "star"}
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => handleSelect(star, event)}
              aria-label={`${label}: ${star} estrelas`}
            >
              ★
            </button>
          ))}
        </div>
        <span className="rating-value">{value}/5</span>
      </div>
    </div>
  );
}

export default StarRating;
