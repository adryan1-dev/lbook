import { progressPercent } from "../lib/readings";

const CLOTH = [
  { board: "bg-mist-700", type: "text-mist-50" },
  { board: "bg-ink-900", type: "text-leaf-50" },
  { board: "bg-blush-600", type: "text-blush-50" },
  { board: "bg-mist-400", type: "text-ink-900" },
  { board: "bg-blush-200", type: "text-blush-600" },
];

function initialsOf(title) {
  return title
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function clothOf(title) {
  let hash = 0;
  for (const char of title) {
    hash = (hash + char.charCodeAt(0)) % CLOTH.length;
  }
  return CLOTH[hash];
}

function BookCover({
  title,
  coverUrl,
  edition = 0,
  currentPage = 0,
  totalPages = 0,
  showProgress = false,
  eager = false,
  size = "shelf",
}) {
  const cloth = clothOf(title);
  const percent = showProgress ? progressPercent(currentPage, totalPages) : null;
  const showEdition = Number(edition) > 0;
  const wide = size === "detail";

  return (
    <div className={`lb-book ${wide ? "w-40" : "w-full"}`}>
      <div className="lb-book-block">
        <div className="aspect-2/3">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`Capa de ${title}`}
              width={400}
              height={600}
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              decoding="async"
              className="size-full object-cover"
            />
          ) : (
            <div
              className={`flex size-full items-center justify-center px-2 ${cloth.board}`}
            >
              <span
                className={`font-display font-semibold ${cloth.type} ${
                  wide ? "text-4xl" : "text-2xl sm:text-3xl"
                }`}
              >
                {initialsOf(title) || "?"}
              </span>
            </div>
          )}
        </div>

        <div
          aria-hidden="true"
          className="lb-spine pointer-events-none absolute inset-y-0 left-0"
        />

        {percent !== null ? (
          <span
            aria-hidden="true"
            className="lb-bookmark"
            style={{ height: `${Math.max(12, percent)}%` }}
          />
        ) : null}

        {showEdition ? (
          <span className="lb-edition">
            Edição {edition}
            <span className="sr-only"> de 5</span>
          </span>
        ) : null}
      </div>
      <span aria-hidden="true" className="lb-book-pages" />
    </div>
  );
}

export default BookCover;
