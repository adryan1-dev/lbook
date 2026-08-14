import { labelOfStatus } from "../lib/readings";
import ReadingCard from "./ReadingCard";

function emptyCopy(statusFilter, hasSearch) {
  if (hasSearch) {
    return {
      title: "Nenhum resultado",
      body: "Tente outro título ou autor, ou limpe a busca.",
      cta: null,
    };
  }

  if (statusFilter === "all") {
    return {
      title: "Sua biblioteca ainda está vazia",
      body: "Cadastre o primeiro livro para organizar o catálogo e responder “você tem esse?”.",
      cta: "Adicionar à estante",
    };
  }

  return {
    title: `Nada em “${labelOfStatus(statusFilter)}”`,
    body: "Mude o status de uma leitura ou adicione um novo item à estante.",
    cta: "Adicionar à estante",
  };
}

function Shelf({
  readings,
  statusFilter,
  hasSearch = false,
  showStatusBadge,
  onOpenReading,
  onNewReading,
}) {
  if (readings.length === 0) {
    const copy = emptyCopy(statusFilter, hasSearch);

    return (
      <div className="rounded-3xl border border-dashed border-mist-300 bg-white/60 px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold text-ink-900">
          {copy.title}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">{copy.body}</p>
        {copy.cta ? (
          <button
            type="button"
            onClick={onNewReading}
            className="mt-6 rounded-full bg-mist-700 px-5 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-mist-600 active:scale-97"
          >
            {copy.cta}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
      {readings.map((reading, index) => (
        <li key={reading.id} className="lb-shelf-item">
          <ReadingCard
            reading={reading}
            showStatusBadge={showStatusBadge}
            eager={index < 5}
            onOpen={onOpenReading}
          />
        </li>
      ))}
    </ul>
  );
}

export default Shelf;
