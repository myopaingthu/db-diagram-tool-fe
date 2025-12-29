import { createContext, useContext } from "react";
import { toast } from "sonner";

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (message: string, type: "success" | "error" | "warning" | "info" = "error") => {
        if (type === "success") {
          toast.success(message);
        } else if (type === "error") {
          toast.error(message);
        } else if (type === "warning") {
          toast.warning(message);
        } else {
          toast.info(message);
        }
      },
    };
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "error") => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "error") {
      toast.error(message);
    } else if (type === "warning") {
      toast.warning(message);
    } else {
      toast.info(message);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

