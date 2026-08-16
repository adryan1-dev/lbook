import { useId, useState } from "react";
import {
  RATING_CATEGORIES,
  READING_STATUSES,
  averageOf,
  statusAllowsRatings,
  statusShowsProgress,
} from "../lib/readings";
import BookCover from "./BookCover";
import Modal from "./Modal";
import ReadingProgress from "./ReadingProgress";
import StarIcon from "./StarIcon";

const fieldClassName =
  "w-full rounded-xl border border-mist-200 bg-mist-50 px-3 py-2.5 text-ink-900 transition duration-150 ease-out focus:border-mist-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-mist-400/35";

function RatingRow({ label, value, emphasis = false }) {
  return (
    <li
      className={`flex items-center justify-between gap-3 border-b border-mist-100 py-2 last:border-b-0 ${
        emphasis ? "bg-leaf-50/80 px-2" : ""
      }`}
    >
      <span
        className={`text-sm ${emphasis ? "font-semibold text-ink-900" : "text-ink-700"}`}
      >
        {label}
      </span>
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

function ReadingDetailModal({
  reading,
  onEdit,
  onDelete,
  onStatusChange,
  onClose,
}) {
  const titleId = useId();
  const average = averageOf(reading.ratings);
  const showRatings = statusAllowsRatings(reading.status);
  const showProgress = statusShowsProgress(reading.status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  const handleStatusChange = async (event) => {
    const nextStatus = event.target.value;
    if (nextStatus === reading.status) {
      return;
    }

    setSavingStatus(true);
    setStatusError("");
    try {
      await onStatusChange(reading, nextStatus);
    } catch (error) {
      setStatusError(error.message);
    } finally {
      setSavingStatus(false);
    }
  };

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

      <label className="mt-4 flex max-w-xs flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-700">Status</span>
        <select
          value={reading.status}
          onChange={handleStatusChange}
          disabled={savingStatus}
          className={fieldClassName}
        >
          {READING_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {savingStatus ? (
          <span className="text-xs text-ink-500">Salvando status…</span>
        ) : null}
        {statusError ? (
          <span role="alert" className="text-xs text-berry-600">
            {statusError}
          </span>
        ) : null}
      </label>

      {showProgress ? (
        <div className="mt-4 max-w-md">
          <h3 className="font-display text-sm font-semibold tracking-wide text-ink-500 uppercase">
            Progresso
          </h3>
          {reading.totalPages > 0 ? (
            <ReadingProgress
              currentPage={reading.currentPage}
              totalPages={reading.totalPages}
            />
          ) : (
            <p className="mt-2 text-sm text-ink-500">
              Edite a leitura para informar página atual e total.
            </p>
          )}
        </div>
      ) : null}

      <div className="mt-5 gap-6 sm:flex">
        <div className="mx-auto w-40 shrink-0 sm:mx-0">
          <BookCover
            title={reading.title}
            coverUrl={reading.coverUrl}
            edition={reading.ratings?.edition}
            currentPage={reading.currentPage}
            totalPages={reading.totalPages}
            showProgress={showProgress}
            eager
            size="detail"
          />

          {showRatings ? (
            <p className="mt-3 flex items-baseline justify-center gap-1.5 sm:justify-start">
              <span className="font-display text-2xl font-semibold tabular-nums">
                {average ?? "—"}
              </span>
              <span className="text-xs text-ink-500">
                {average ? "de média" : "faltam notas"}
              </span>
            </p>
          ) : null}
        </div>

        <div className="mt-6 min-w-0 flex-1 sm:mt-0">
          {showRatings ? (
            <>
              <h3 className="font-display text-sm font-semibold tracking-wide text-ink-500 uppercase">
                Notas
              </h3>
              <ul className="mt-1">
                {RATING_CATEGORIES.map((category) => (
                  <RatingRow
                    key={category.key}
                    label={category.label}
                    value={reading.ratings[category.key]}
                    emphasis={category.key === "edition"}
                  />
                ))}
              </ul>
            </>
          ) : (
            <p className="rounded-2xl bg-mist-100 px-4 py-3 text-sm text-ink-500">
              Notas aparecem quando o status for Lendo ou Lido.
            </p>
          )}

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
