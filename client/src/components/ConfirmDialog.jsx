import { useId } from "react";
import Modal from "./Modal";

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  busyLabel = "Aguarde…",
  busy = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();

  return (
    <Modal
      labelledBy={titleId}
      onClose={onCancel}
      panelClassName="sm:max-w-sm p-5 sm:p-6"
    >
      <h2 id={titleId} className="font-display text-lg font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-sm text-ink-700">{description}</p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-4 py-2.5 text-sm font-semibold text-ink-700 transition duration-150 ease-out hover:bg-mist-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-full bg-berry-500 px-4 py-2.5 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-berry-600 active:scale-97 disabled:opacity-60"
        >
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
