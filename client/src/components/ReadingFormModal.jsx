import { useEffect, useId, useRef, useState } from "react";
import {
  DEFAULT_STATUS,
  RATING_CATEGORIES,
  READING_STATUSES,
  averageOf,
  emptyRatings,
  progressPercent,
  statusAllowsRatings,
  statusShowsProgress,
} from "../lib/readings";
import ConfirmDialog from "./ConfirmDialog";
import Modal from "./Modal";
import ReadingProgress from "./ReadingProgress";
import StarRating from "./StarRating";
import { Close } from "./icons";

const fieldClassName =
  "w-full rounded-xl border border-mist-200 bg-mist-50 px-3 py-2.5 text-ink-900 transition duration-150 ease-out placeholder:text-ink-400 focus:border-mist-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-mist-400/35";

/** O estado do formulário mora aqui para digitar não redesenhar a estante. */
function ReadingFormModal({ reading, onSubmit, onClose }) {
  const titleId = useId();
  const isEditing = Boolean(reading);

  const [title, setTitle] = useState(reading?.title ?? "");
  const [author, setAuthor] = useState(reading?.author ?? "");
  const [review, setReview] = useState(reading?.review ?? "");
  const [status, setStatus] = useState(reading?.status ?? DEFAULT_STATUS);
  const [currentPage, setCurrentPage] = useState(
    String(reading?.currentPage ?? 0),
  );
  const [totalPages, setTotalPages] = useState(
    String(reading?.totalPages ?? 0),
  );
  const [ratings, setRatings] = useState(reading?.ratings ?? emptyRatings);
  const [cover, setCover] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const errorRef = useRef(null);

  const allowsRatings = statusAllowsRatings(status);
  const showsProgress = statusShowsProgress(status);
  const average = averageOf(ratings);
  const previewPercent = progressPercent(
    Number(currentPage) || 0,
    Number(totalPages) || 0,
  );

  const isDirty =
    title !== (reading?.title ?? "") ||
    author !== (reading?.author ?? "") ||
    review !== (reading?.review ?? "") ||
    status !== (reading?.status ?? DEFAULT_STATUS) ||
    Number(currentPage) !== (reading?.currentPage ?? 0) ||
    Number(totalPages) !== (reading?.totalPages ?? 0) ||
    cover !== null ||
    RATING_CATEGORIES.some((category) => {
      return ratings[category.key] !== (reading?.ratings?.[category.key] ?? 0);
    });

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  const handleRatingChange = (key, value) => {
    setRatings((current) => ({ ...current, [key]: value }));
  };

  const requestClose = () => {
    if (isDirty && !saving) {
      setConfirmingDiscard(true);
      return;
    }
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const parsedCurrent = Math.max(0, Math.floor(Number(currentPage) || 0));
    const parsedTotal = Math.max(0, Math.floor(Number(totalPages) || 0));

    if (showsProgress && parsedTotal > 0 && parsedCurrent > parsedTotal) {
      setError("A página atual não pode passar do total de páginas.");
      setSaving(false);
      return;
    }

    const payload = new FormData();
    payload.append("title", title.trim());
    payload.append("author", author.trim());
    payload.append("review", review.trim());
    payload.append("status", status);
    payload.append("current_page", parsedCurrent);
    payload.append("total_pages", parsedTotal);
    for (const category of RATING_CATEGORIES) {
      payload.append(category.key, ratings[category.key]);
    }
    if (cover) {
      payload.append("image", cover);
    }

    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError.message);
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        labelledBy={titleId}
        onClose={requestClose}
        panelClassName="sm:max-w-lg p-5 sm:p-6"
      >
        <div className="flex items-start gap-4">
          <h2
            id={titleId}
            className="flex-1 font-display text-xl/tight font-semibold"
          >
            {isEditing ? "Editar leitura" : "Adicionar à estante"}
          </h2>

          <button
            type="button"
            onClick={requestClose}
            className="-m-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-500 transition duration-150 ease-out hover:bg-mist-100 hover:text-ink-900"
          >
            <Close className="size-5" />
            <span className="sr-only">Fechar</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink-700">Título</span>
            <input
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              autoComplete="off"
              className={fieldClassName}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink-700">Autor</span>
            <input
              name="author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              required
              autoComplete="off"
              className={fieldClassName}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink-700">Status</span>
            <select
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={fieldClassName}
            >
              {READING_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {showsProgress ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink-700">
                  Página atual
                </span>
                <input
                  type="number"
                  name="current_page"
                  min="0"
                  inputMode="numeric"
                  value={currentPage}
                  onChange={(event) => setCurrentPage(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink-700">
                  Total de páginas
                </span>
                <input
                  type="number"
                  name="total_pages"
                  min="0"
                  inputMode="numeric"
                  value={totalPages}
                  onChange={(event) => setTotalPages(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              {previewPercent !== null ? (
                <div className="col-span-2">
                  <ReadingProgress
                    currentPage={Number(currentPage) || 0}
                    totalPages={Number(totalPages) || 0}
                  />
                </div>
              ) : (
                <p className="col-span-2 text-xs text-ink-500">
                  Informe o total de páginas para ver o progresso.
                </p>
              )}
            </div>
          ) : null}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink-700">
              Foto da capa
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setCover(event.target.files[0] ?? null)}
              className="w-full text-sm text-ink-500 file:mr-3 file:rounded-full file:border-0 file:bg-mist-100 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-mist-700 hover:file:bg-mist-200"
            />
            {isEditing ? (
              <span className="text-xs text-ink-500">
                Deixe em branco para manter a capa atual.
              </span>
            ) : null}
          </label>

          {allowsRatings ? (
            <>
              <div className="flex flex-col gap-2">
                {RATING_CATEGORIES.map((category) => (
                  <StarRating
                    key={category.key}
                    label={category.label}
                    hint={category.hint}
                    value={ratings[category.key]}
                    onChange={(value) => handleRatingChange(category.key, value)}
                  />
                ))}
              </div>

              <p className="flex items-center justify-between rounded-2xl bg-blush-100 px-4 py-3">
                <span className="text-sm font-semibold text-ink-700">
                  Média da leitura
                </span>
                <span className="font-display text-lg font-semibold tabular-nums">
                  {average ?? "—"}
                </span>
              </p>
            </>
          ) : (
            <p className="rounded-2xl bg-mist-100 px-4 py-3 text-sm text-ink-500">
              Notas ficam disponíveis quando o status for Lendo ou Lido.
            </p>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink-700">Resenha</span>
            <textarea
              name="review"
              rows="5"
              value={review}
              onChange={(event) => setReview(event.target.value)}
              placeholder="Escreva o que marcou nessa leitura…"
              className={`${fieldClassName} resize-y`}
            />
          </label>

          {error ? (
            <p
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="rounded-xl bg-berry-500/10 px-4 py-3 text-sm text-berry-600"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={requestClose}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-ink-700 transition duration-150 ease-out hover:bg-mist-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-mist-700 px-5 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-mist-600 active:scale-97 disabled:opacity-60"
            >
              {saving
                ? "Salvando…"
                : isEditing
                  ? "Salvar alterações"
                  : "Salvar na estante"}
            </button>
          </div>
        </form>
      </Modal>

      {confirmingDiscard ? (
        <ConfirmDialog
          title="Descartar as alterações?"
          description="O que você escreveu neste formulário será perdido."
          confirmLabel="Descartar"
          onConfirm={onClose}
          onCancel={() => setConfirmingDiscard(false)}
        />
      ) : null}
    </>
  );
}

export default ReadingFormModal;
