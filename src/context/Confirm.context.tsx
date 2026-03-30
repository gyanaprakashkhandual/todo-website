/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import ConfirmModal from "../ui/Confirm.ui";

type ModalType = "default" | "success" | "danger" | "warning" | "info";

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ModalType;
}

interface ConfirmConfig extends ConfirmOptions {
  isOpen: boolean;
}

interface ConfirmContextType {
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  hideConfirm: () => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

interface ConfirmProviderProps {
  children: ReactNode;
}

export const ConfirmProvider = ({ children }: ConfirmProviderProps) => {
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(
    null,
  );
  const [resolveRef, setResolveRef] = useState<
    ((value: boolean) => void) | null
  >(null);

  // Open modal and return a Promise<boolean>
  const showConfirm = useCallback(
    ({
      title = "Confirm Action",
      message = "Are you sure you want to proceed?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      type = "default",
    }: ConfirmOptions): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        setResolveRef(() => resolve);
        setConfirmConfig({
          isOpen: true,
          title,
          message,
          confirmText,
          cancelText,
          type,
        });
      });
    },
    [],
  );

  // Close modal without confirming
  const hideConfirm = useCallback(() => {
    if (resolveRef) resolveRef(false);
    setResolveRef(null);
    setConfirmConfig(null);
  }, [resolveRef]);

  // Handle confirm button
  const handleConfirm = useCallback(() => {
    if (resolveRef) resolveRef(true);
    setResolveRef(null);
    setConfirmConfig(null);
  }, [resolveRef]);

  return (
    <ConfirmContext.Provider value={{ showConfirm, hideConfirm }}>
      {children}
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          type={confirmConfig.type}
          onClose={hideConfirm}
          onConfirm={handleConfirm}
        />
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmContextType => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};
