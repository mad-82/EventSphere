import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

/**
 * Modal — accessible dialog with backdrop + ESC + focus trap.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title?: string
 *  - subtitle?: string
 *  - size?: "sm" | "md" | "lg"  (default "md")
 *  - footer?: ReactNode
 *  - children: ReactNode
 *  - closeOnBackdrop?: boolean (default true)
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  footer,
  children,
  closeOnBackdrop = true,
}) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  /* Escape + body scroll lock */
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus inside modal
    setTimeout(() => {
      if (dialogRef.current) {
        const first = dialogRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (first || dialogRef.current).focus();
      }
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused.current?.focus) {
        previouslyFocused.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const onBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      className="ui-modal-backdrop"
      onMouseDown={onBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`ui-modal ui-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "ui-modal-title" : undefined}
        tabIndex={-1}
      >
        <header className="ui-modal__header">
          <div className="ui-modal__titles">
            {title && (
              <h2 id="ui-modal-title" className="ui-modal__title">
                {title}
              </h2>
            )}
            {subtitle && <p className="ui-modal__subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="ui-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </header>

        <div className="ui-modal__body">{children}</div>

        {footer && <footer className="ui-modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}

/**
 * ConfirmDialog — built on top of Modal.
 *
 * Props:
 *  - open, onClose, onConfirm
 *  - title, message
 *  - confirmLabel = "Confirm"
 *  - cancelLabel = "Cancel"
 *  - variant = "danger" | "primary"
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="ui-modal__actions">
          <button
            type="button"
            className="org-btn org-btn--ghost"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              variant === "danger"
                ? "org-btn org-btn--danger"
                : "org-btn org-btn--primary"
            }
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="ui-modal__message">{message}</p>
    </Modal>
  );
}