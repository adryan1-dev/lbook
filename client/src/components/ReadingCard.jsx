import { averageOf } from "../lib/readings";
import StarIcon from "./StarIcon";

function initialsOf(title) {
  return title
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function ReadingCard({ reading, eager = false, onOpen }) {
  const average = averageOf(reading.ratings);

  return (
    <article className="group relative">
      <div className="relative overflow-hidden rounded-l-[2px] rounded-r-md bg-mist-200 shadow-cover transition-transform duration-200 ease-out-quart motion-safe:group-hover:-translate-y-1">
        <div className="aspect-2/3">
          {reading.coverUrl ? (
            <img
              src={reading.coverUrl}
              alt={`Capa de ${reading.title}`}
              width={400}
              height={600}
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              decoding="async"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-blush-100">
              <span className="font-display text-3xl font-semibold text-blush-400">
                {initialsOf(reading.title) || "?"}
              </span>
            </div>
          )}
        </div>

        <div
          aria-hidden="true"
          className="lb-spine pointer-events-none absolute inset-y-0 left-0 w-1/5"
        />
      </div>

      <div className="mt-3">
        <h3 className="line-clamp-2 font-display text-sm/snug font-semibold text-ink-900">
          {reading.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
          {reading.author}
        </p>
        <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-ink-700">
          <StarIcon className="size-3.5 text-sun-400" />
          <span className="tabular-nums">{average ?? "—"}</span>
          <span className="sr-only">
            {average ? "de média" : "sem média: faltam notas"}
          </span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => onOpen(reading)}
        className="absolute -inset-1 rounded-xl"
      >
        <span className="sr-only">Abrir {reading.title}</span>
      </button>
    </article>
  );
}

export default ReadingCard;
