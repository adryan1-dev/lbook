import { useId } from "react";
import StarIcon from "./StarIcon";

const STARS = [1, 2, 3, 4, 5];

/** Rádios nativos: setas do teclado e leitores de tela funcionam sem JS extra. */
function StarRating({ label, hint, value, onChange }) {
  const name = useId();

  return (
    <fieldset className="rounded-2xl bg-mist-100 px-3 py-2.5">
      <legend className="font-display text-sm font-semibold text-ink-900">
        {label}
      </legend>

      <p className="text-xs text-ink-500">{hint}</p>

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex">
          {STARS.map((star) => (
            <label
              key={star}
              className="flex size-11 cursor-pointer items-center justify-center"
            >
              <input
                type="radio"
                name={name}
                value={star}
                checked={value === star}
                onChange={() => onChange(star)}
                className="peer sr-only"
              />
              <StarIcon
                className={`size-6 transition-colors duration-150 ease-out peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-mist-600 ${
                  star <= value ? "text-sun-400" : "text-mist-300"
                }`}
              />
              <span className="sr-only">
                {star === 1 ? "1 estrela" : `${star} estrelas`}
              </span>
            </label>
          ))}
        </div>

        <span className="text-sm font-semibold tabular-nums text-ink-500">
          {value}/5
        </span>
      </div>
    </fieldset>
  );
}

export default StarRating;
