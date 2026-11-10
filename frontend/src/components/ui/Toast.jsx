import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import "./Toast.css";

const ToastContext = createContext(null);

let counter = 0;

const ICONS = {
  success: "✓",
  error: "✕",
  warning: "!",
  info: "i",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      const id = `t-${++counter}`;
      const variant = options.variant || "info";
      const duration = options.duration ?? 4000;
      const title = options.title || "";

      setToasts((list) => [...list, { id, message, variant, title }]);

      if (duration > 0) {
        timers.current[id] = setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  const api = useRef({});

  useEffect(() => {
    api.current = {
      show: showToast,
      success: (msg, opts = {}) => showToast(msg, { ...opts, variant: "success" }),
      error: (msg, opts = {}) => showToast(msg, { ...opts, variant: "error" }),
      warning: (msg, opts = {}) => showToast(msg, { ...opts, variant: "warning" }),
      info: (msg, opts = {}) => showToast(msg, { ...opts, variant: "info" }),
      dismiss,
    };
  }, [showToast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="ui-toast-stack" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`ui-toast ui-toast--${t.variant}`}
            role="status"
          >
            <span className="ui-toast__icon" aria-hidden="true">
              {ICONS[t.variant]}
            </span>
            <div className="ui-toast__body">
              {t.title && <div className="ui-toast__title">{t.title}</div>}
              <div className="ui-toast__message">{t.message}</div>
            </div>
            <button
              type="button"
              className="ui-toast__close"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx.current;
}