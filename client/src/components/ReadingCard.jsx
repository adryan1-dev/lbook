import { averageOf, statusShowsProgress } from "../lib/readings";
import BookCover from "./BookCover";
import StarIcon from "./StarIcon";

function ReadingCard({ reading, eager = false, featured = false, onOpen }) {
  const average = averageOf(reading.ratings);
  const showProgress = statusShowsProgress(reading.status);

  return (
    <article className="group relative flex flex-col">
      <div className="relative z-[1] mb-[-10px] origin-bottom transition-transform duration-200 ease-out-quart motion-safe:group-hover:-translate-y-2 motion-safe:group-focus-within:-translate-y-2">
        <BookCover
          title={reading.title}
          coverUrl={reading.coverUrl}
          edition={reading.ratings?.edition}
          currentPage={reading.currentPage}
          totalPages={reading.totalPages}
          showProgress={showProgress}
          eager={eager}
        />
      </div>

      <div
        className={`relative z-[1] flex h-[4.75rem] flex-col pt-3 ${
          featured ? "" : "px-0.5"
        }`}
      >
        <h3
          className={`line-clamp-2 font-display font-semibold text-ink-900 ${
            featured ? "text-[0.95rem]/snug" : "text-sm/snug"
          }`}
        >
          {reading.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
          {reading.author}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-ink-700">
          <StarIcon className="size-3.5 text-sun-400" />
          <span className="tabular-nums">{average ?? "—"}</span>
          <span className="sr-only">
            {average ? "de média" : "sem média: faltam notas"}
          </span>
          {showProgress && reading.totalPages > 0 ? (
            <span className="ml-1 font-medium tabular-nums text-ink-500">
              {reading.currentPage}/{reading.totalPages}
            </span>
          ) : null}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onOpen(reading)}
        className="absolute inset-0 z-10 rounded-sm"
      >
        <span className="sr-only">Abrir {reading.title}</span>
      </button>
    </article>
  );
}

export default ReadingCard;
