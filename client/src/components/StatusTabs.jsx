import { READING_STATUSES } from "../lib/readings";

/** Minha biblioteca = catálogo completo; demais abas = status. */
const FILTERS = [
  { value: "all", label: "Minha biblioteca" },
  ...READING_STATUSES.filter((status) => status.value !== "biblioteca"),
];

function StatusTabs({ active, counts, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por status"
      className="flex gap-2 overflow-x-auto pb-1"
    >
      {FILTERS.map((filter) => {
        const selected = active === filter.value;
        const count = counts[filter.value] ?? 0;

        return (
          <button
            key={filter.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(filter.value)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition duration-150 ease-out ${
              selected
                ? "bg-mist-700 text-white"
                : "bg-white text-ink-700 ring-1 ring-mist-200 hover:bg-mist-100"
            }`}
          >
            {filter.label}
            <span
              className={`ml-1.5 tabular-nums ${
                selected ? "text-white/80" : "text-ink-500"
              }`}
            >
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default StatusTabs;
