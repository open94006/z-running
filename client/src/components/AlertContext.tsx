import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  success: "bg-green-50 text-green-800 border-green-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  error: "bg-red-50 text-red-800 border-red-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
};

const iconStyleMap = {
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
  info: "text-blue-500",
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
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {alerts.map((alert) => {
          const Icon = iconMap[alert.type];
          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start p-4 rounded-lg border shadow-lg animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-auto",
                styleMap[alert.type]
              )}
            >
              <div className="shrink-0 mr-3">
                <Icon className={cn("w-5 h-5", iconStyleMap[alert.type])} />
              </div>
              <div className="flex-1 text-sm font-medium mr-2 break-words">
                {alert.message}
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {confirmDialog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleCancel}
          />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-2 dark:text-white">
              {confirmDialog.title || "確認"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                {confirmDialog.cancelLabel || "取消"}
              </button>
              <button
                onClick={handleConfirm}
                className={cn(
                  "px-4 py-2 rounded-lg text-white transition-colors font-medium shadow-sm",
                  confirmDialog.type === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : confirmDialog.type === "warning"
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {confirmDialog.confirmLabel || "確認"}
              </button>
            </div>
          </div>
        </div>
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
