// DataLens — Toast Notifications

import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useAppStore } from '../../store/app-store';
import './Toast.css';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div key={toast.id} className={`toast toast--${toast.type}`} role="alert">
            <Icon size={18} className="toast-icon" />
            <div className="toast-content">
              <p className="toast-title">{toast.title}</p>
              {toast.description && <p className="toast-desc">{toast.description}</p>}
            </div>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
