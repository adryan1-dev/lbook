import { progressPercent } from "../lib/readings";

function ReadingProgress({ currentPage, totalPages, compact = false }) {
  const percent = progressPercent(currentPage, totalPages);

  if (percent === null) {
    return null;
  }

  return (
    <div className={compact ? "mt-1.5" : "mt-3"}>
      <div className="flex items-center justify-between gap-2 text-xs text-ink-500">
        <span className="tabular-nums">
          {currentPage}/{totalPages}
        </span>
        <span className="font-semibold tabular-nums text-ink-700">
          {percent}%
        </span>
      </div>
      <div
        className={`mt-1 overflow-hidden rounded-full bg-mist-200 ${compact ? "h-1.5" : "h-2"}`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso da leitura: ${percent}%`}
      >
        <div
          className="h-full rounded-full bg-mist-700 transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default ReadingProgress;
