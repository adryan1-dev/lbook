import ReadingCard from "./ReadingCard";

function Shelf({ readings, onOpenReading, onNewReading }) {
  if (readings.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-mist-300 bg-white/60 px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold text-ink-900">
          Sua estante ainda está vazia
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
          Registre a primeira leitura para começar a guardar notas e resenhas.
        </p>
        <button
          type="button"
          onClick={onNewReading}
          className="mt-6 rounded-full bg-mist-700 px-5 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-mist-600 active:scale-97"
        >
          Registrar leitura
        </button>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
      {readings.map((reading, index) => (
        <li key={reading.id} className="lb-shelf-item">
          <ReadingCard
            reading={reading}
            eager={index < 5}
            onOpen={onOpenReading}
          />
        </li>
      ))}
    </ul>
  );
}

export default Shelf;
