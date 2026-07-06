import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "../lib/cn";
import { Button, Modal } from "./ui";

export type AlertType = "success" | "warning" | "error" | "info";

interface AlertMessage {
  id: string;
  type: AlertType;
  message: string;
  duration?: number;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: "danger" | "info" | "warning";
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, duration?: number) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const styleMap = {
  success: "bg-success-soft border-success/30",
  warning: "bg-warn-soft border-warn/30",
  error: "bg-danger-soft border-danger/30",
  info: "bg-info-soft border-info/30",
};

const iconStyleMap = {
  success: "text-success",
  warning: "text-warn",
  error: "text-danger",
  info: "text-info",
};

/**
 * AlertProvider component that provides alert and confirm dialog functionality to its children.
 */
export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmOptions | null>(
    null
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback(
    (message: string, type: AlertType = "info", duration = 3000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setAlerts((prev) => [...prev, { id, type, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeAlert(id);
        }, duration);
      }
    },
    [removeAlert]
  );

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setConfirmDialog(options);
  }, []);

  const handleConfirm = () => {
    if (confirmDialog) {
      confirmDialog.onConfirm();
      setConfirmDialog(null);
    }
  };

  const handleCancel = () => {
    if (confirmDialog) {
      if (confirmDialog.onCancel) {
        confirmDialog.onCancel();
      }
      setConfirmDialog(null);
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <div className="fixed top-4 right-4 z-100 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {alerts.map((alert) => {
          const Icon = iconMap[alert.type];
          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start p-4 rounded-xl border shadow-lg animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-auto",
                styleMap[alert.type]
              )}
            >
              <div className="shrink-0 mr-3">
                <Icon className={cn("w-5 h-5", iconStyleMap[alert.type])} />
              </div>
              <div className="flex-1 text-sm font-medium text-ink mr-2 wrap-break-word">
                {alert.message}
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="shrink-0 text-ink-subtle hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {confirmDialog && (
        <Modal onClose={handleCancel} zIndex={110}>
          <h3 className="text-xl font-bold mb-2 text-ink">
            {confirmDialog.title || "確認"}
          </h3>
          <p className="text-ink-muted mb-6">{confirmDialog.message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={handleCancel}>
              {confirmDialog.cancelLabel || "取消"}
            </Button>
            <Button
              variant={
                confirmDialog.type === "danger"
                  ? "danger"
                  : confirmDialog.type === "warning"
                  ? "warn"
                  : "primary"
              }
              onClick={handleConfirm}
            >
              {confirmDialog.confirmLabel || "確認"}
            </Button>
          </div>
        </Modal>
      )}
    </AlertContext.Provider>
  );
};

/* eslint-disable react-refresh/only-export-components */
export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
/* eslint-enable react-refresh/only-export-components */
