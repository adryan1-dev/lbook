import { useEffect, useRef } from "react";

/**
 * Envolve o <dialog> nativo, que já entrega foco preso, Esc e camada superior.
 * Montado somente enquanto aberto: a animação de entrada roda, a de saída não.
 */
function Modal({ labelledBy, onClose, panelClassName = "", children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) {
      dialog.showModal();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleCancel = (event) => {
    event.preventDefault();
    onClose();
  };

  const handleClick = (event) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onCancel={handleCancel}
      onClick={handleClick}
      className="lb-dialog items-end justify-center pb-[env(safe-area-inset-bottom)] sm:items-center sm:p-6"
    >
      <div
        className={`lb-panel flex max-h-[92dvh] w-full flex-col overflow-y-auto overscroll-contain rounded-t-3xl bg-white text-ink-900 shadow-panel sm:rounded-3xl ${panelClassName}`}
      >
        {children}
      </div>
    </dialog>
  );
}

export default Modal;
