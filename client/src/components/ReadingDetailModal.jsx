import { useId } from "react";
import { RATING_CATEGORIES, averageOf } from "../lib/readings";
import Modal from "./Modal";
import StarIcon from "./StarIcon";

function RatingRow({ label, value }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-mist-100 py-2 last:border-b-0">
      <span className="text-sm text-ink-700">{label}</span>
      <span
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${value} de 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`size-4 ${star <= value ? "text-sun-400" : "text-mist-200"}`}
          />
        ))}
      </span>
    </li>
  );
}

function ReadingDetailModal({ reading, onEdit, onDelete, onClose }) {
  const titleId = useId();
  const average = averageOf(reading.ratings);

  return (
    <Modal
      labelledBy={titleId}
      onClose={onClose}
      panelClassName="sm:max-w-2xl p-5 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h2
            id={titleId}
            className="font-display text-xl/tight font-semibold text-balance"
          >
            {reading.title}
          </h2>
          <p className="mt-1 text-sm text-ink-500">{reading.author}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="-m-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-500 transition duration-150 ease-out hover:bg-mist-100 hover:text-ink-900"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            ×
          </span>
          <span className="sr-only">Fechar</span>
        </button>
      </div>

      <div className="mt-5 gap-6 sm:flex">
        <div className="mx-auto w-40 shrink-0 sm:mx-0">
          <div className="relative overflow-hidden rounded-l-[2px] rounded-r-md bg-mist-100 shadow-cover">
            <div className="aspect-2/3">
              {reading.coverUrl ? (
                <img
                  src={reading.coverUrl}
                  alt={`Capa de ${reading.title}`}
                  width={400}
                  height={600}
                  decoding="async"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-blush-100 px-2 text-center text-xs text-blush-600">
                  Sem foto da capa
                </div>
              )}
            </div>
            <div
              aria-hidden="true"
              className="lb-spine pointer-events-none absolute inset-y-0 left-0 w-1/5"
            />
          </div>

          <p className="mt-3 flex items-baseline justify-center gap-1.5 sm:justify-start">
            <span className="font-display text-2xl font-semibold tabular-nums">
              {average ?? "—"}
            </span>
            <span className="text-xs text-ink-500">
              {average ? "de média" : "faltam notas"}
            </span>
          </p>
        </div>

        <div className="mt-6 min-w-0 flex-1 sm:mt-0">
          <h3 className="font-display text-sm font-semibold tracking-wide text-ink-500 uppercase">
            Notas
          </h3>
          <ul className="mt-1">
            {RATING_CATEGORIES.map((category) => (
              <RatingRow
                key={category.key}
                label={category.label}
                value={reading.ratings[category.key]}
              />
            ))}
          </ul>

          <h3 className="mt-6 font-display text-sm font-semibold tracking-wide text-ink-500 uppercase">
            Resenha
          </h3>
          {reading.review ? (
            <p className="mt-2 text-sm/relaxed whitespace-pre-line text-ink-700">
              {reading.review}
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink-500 italic">
              Você ainda não escreveu sobre esta leitura.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => onDelete(reading)}
          className="rounded-full px-4 py-2.5 text-sm font-semibold text-berry-600 transition duration-150 ease-out hover:bg-berry-500/10"
        >
          Excluir
        </button>
        <button
          type="button"
          onClick={() => onEdit(reading)}
          className="rounded-full bg-mist-700 px-5 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-mist-600 active:scale-97"
        >
          Editar leitura
        </button>
      </div>
    </Modal>
  );
}

export default ReadingDetailModal;
