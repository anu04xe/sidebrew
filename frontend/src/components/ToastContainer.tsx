import { useEffect, useState } from "react";
import type { Toast } from "../types";

type Props = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2600);
    const removeTimer = setTimeout(() => onDismiss(), 2800);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [onDismiss]);

  const borderColor =
    toast.kind === "success" ? "border-sage/40" :
    toast.kind === "warning" ? "border-terra/40" :
    "border-latte";

  const dotColor =
    toast.kind === "success" ? "bg-sage" :
    toast.kind === "warning" ? "bg-terra" :
    "bg-caramel";

  return (
    <div
      className={`
        flex items-center gap-3 rounded-sm border ${borderColor}
        bg-paper px-4 py-3 shadow-sheet
        ${exiting ? "toast-exit" : "toast-enter"}
      `}
      role="status"
      aria-live="polite"
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} aria-hidden="true" />
      <p className="text-xs font-medium text-espresso">{toast.message}</p>
      <button
        onClick={() => { setExiting(true); setTimeout(onDismiss, 180); }}
        className="ml-2 text-espresso/30 hover:text-espresso/60"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function addToast(message: string, kind: Toast["kind"] = "default") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, kind }]);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, addToast, dismissToast };
}
