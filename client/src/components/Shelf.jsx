import { SHELF_BAYS, readingsInBay } from "../lib/readings";
import ReadingCard from "./ReadingCard";

function BayIndex({ bays, hasSearch }) {
  const links = hasSearch ? bays.filter((bay) => bay.items.length > 0) : bays;

  if (links.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Vãos da estante"
      className="flex gap-1 overflow-x-auto pb-1"
    >
      {links.map((bay) => (
        <a
          key={bay.value}
          href={`#vao-${bay.value}`}
          className={`shrink-0 px-2.5 py-1 text-sm transition duration-150 ease-out ${
            bay.featured
              ? "bg-blush-100 font-display font-semibold text-ink-900"
              : "font-semibold text-ink-500 hover:text-ink-900"
          }`}
        >
          {bay.label}
          <span className="ml-1.5 font-sans text-xs tabular-nums text-ink-500">
            {bay.items.length}
          </span>
        </a>
      ))}
    </nav>
  );
}

function EmptyBay({ bay }) {
  return (
    <p className="px-1 pb-3 text-sm text-ink-500">
      {bay.featured ? "Nada na mão neste vão." : "Nenhum volume neste vão."}
    </p>
  );
}

function EmptyCase({ onNewReading }) {
  return (
    <div className="lb-case">
      <div className="lb-case-crown" />
      <div className="lb-bay lb-bay-lendo px-3 sm:px-4">
        <p className="font-display text-2xl font-semibold text-ink-900">
          Sua estante ainda está vazia
        </p>
        <p className="mt-2 max-w-md text-sm text-ink-500">
          Cadastre a primeira leitura. Os vãos — quero comprar, em casa, na
          mão, lido, abandonei — aparecem sozinhos.
        </p>
        <button
          type="button"
          onClick={onNewReading}
          className="mt-5 rounded-full bg-mist-700 px-5 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-mist-600 active:scale-97"
        >
          Adicionar à estante
        </button>
      </div>
      <div className="lb-rail" />
    </div>
  );
}

function ShelfBay({ bay, onOpenReading }) {
  const featured = Boolean(bay.featured);
  const itemWidth = featured
    ? "w-[46%] sm:w-44 lg:w-52"
    : "w-[31%] sm:w-32 lg:w-36";

  return (
    <section
      id={`vao-${bay.value}`}
      className={`lb-bay ${featured ? "lb-bay-lendo" : ""}`}
      aria-labelledby={`vao-label-${bay.value}`}
    >
      <div className="flex items-baseline justify-between gap-3 px-3 sm:px-4">
        <div className="min-w-0">
          <h2
            id={`vao-label-${bay.value}`}
            className={`font-display font-semibold text-ink-900 ${
              featured ? "text-2xl sm:text-3xl" : "text-lg"
            }`}
          >
            {bay.label}
          </h2>
          <p className="mt-0.5 text-xs text-ink-500">{bay.hint}</p>
        </div>
        <p className="shrink-0 font-display text-sm tabular-nums text-ink-500">
          {bay.items.length}
        </p>
      </div>

      <div className="relative pt-5">
        {bay.items.length === 0 ? (
          <>
            <div className="px-3 sm:px-4">
              <EmptyBay bay={bay} />
            </div>
            <div className="lb-rail" />
          </>
        ) : (
          <>
            <ul className="relative z-[1] flex gap-x-4 overflow-x-auto px-3 pb-1 pt-1 sm:gap-x-5 sm:px-4">
              {bay.items.map((reading, index) => (
                <li
                  key={reading.id}
                  className={`lb-shelf-item shrink-0 pr-2 ${itemWidth}`}
                >
                  <ReadingCard
                    reading={reading}
                    featured={featured}
                    eager={featured && index < 4}
                    onOpen={onOpenReading}
                  />
                </li>
              ))}
            </ul>
            <div
              className="lb-plank pointer-events-none absolute inset-x-0 bottom-1 h-[4.75rem]"
              aria-hidden="true"
            />
          </>
        )}
      </div>
    </section>
  );
}

function Shelf({ readings, hasSearch = false, onOpenReading, onNewReading }) {
  if (readings.length === 0 && !hasSearch) {
    return <EmptyCase onNewReading={onNewReading} />;
  }

  if (readings.length === 0 && hasSearch) {
    return (
      <div className="px-1 py-12 text-center">
        <p className="font-display text-lg font-semibold text-ink-900">
          Nenhum resultado
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
          Tente outro título ou autor, ou limpe a busca.
        </p>
      </div>
    );
  }

  const bays = SHELF_BAYS.map((bay) => ({
    ...bay,
    items: readingsInBay(readings, bay.value),
  }));
  const visibleBays = hasSearch
    ? bays.filter((bay) => bay.items.length > 0)
    : bays;

  return (
    <div>
      <BayIndex bays={bays} hasSearch={hasSearch} />
      <div className="lb-case mt-4">
        <div className="lb-case-crown" />
        {visibleBays.map((bay) => (
          <ShelfBay
            key={bay.value}
            bay={bay}
            onOpenReading={onOpenReading}
          />
        ))}
        <div className="lb-case-plinth" />
      </div>
    </div>
  );
}

export default Shelf;
