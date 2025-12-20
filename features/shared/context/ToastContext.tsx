import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast } from '../components/Toast';
import { Modal, StyleSheet } from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'progress';
type ToastPosition = 'top' | 'bottom';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastConfig {
  id: string;
  type?: ToastType;
  message: string;
  description?: string;
  position?: ToastPosition;
  duration?: number;
  progress?: number;
  action?: ToastAction;
}

interface ShowToastOptions {
  type?: ToastType;
  message: string;
  description?: string;
  position?: ToastPosition;
  duration?: number;
  progress?: number;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (options: ShowToastOptions) => string;
  hideToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<ShowToastOptions>) => void;
  hideAllToasts: () => void;
  success: (message: string, duration?: number, position?: ToastPosition) => string;
  error: (message: string, duration?: number, position?: ToastPosition) => string;
  warning: (message: string, duration?: number, position?: ToastPosition) => string;
  info: (message: string, duration?: number, position?: ToastPosition) => string;
  loading: (message: string, description?: string, position?: ToastPosition) => string;
  progress: (message: string, progressValue: number, description?: string, position?: ToastPosition) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const showToast = useCallback((options: ShowToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastConfig = {
      id,
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<ShowToastOptions>) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, ...updates } : toast))
    );
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Shorthand methods
  const success = useCallback(
    (message: string, duration?: number, position?: ToastPosition) => {
      const displayMessage = message && message.trim() !== '' ? message : 'Success!';
      return showToast({ type: 'success', message: displayMessage, duration, position });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number, position?: ToastPosition) => {
      const displayMessage = message && message.trim() !== '' ? message : 'Error occurred';
      return showToast({ type: 'error', message: displayMessage, duration, position });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number, position?: ToastPosition) => {
      const displayMessage = message && message.trim() !== '' ? message : 'Warning';
      return showToast({ type: 'warning', message: displayMessage, duration, position });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number, position?: ToastPosition) => {
      const displayMessage = message && message.trim() !== '' ? message : 'Info';
      return showToast({ type: 'info', message: displayMessage, duration, position });
    },
    [showToast]
  );

  const loading = useCallback(
    (message: string, description?: string, position?: ToastPosition) => {
      const displayMessage = message && message.trim() !== '' ? message : 'Loading...';
      return showToast({
        type: 'loading',
        message: displayMessage,
        description,
        duration: Infinity,
        position,
      });
    },
    [showToast]
  );

  const progress = useCallback(
    (
      message: string,
      progressValue: number,
      description?: string,
      position?: ToastPosition
    ) => {
      const displayMessage = message && message.trim() !== '' ? message : 'Processing...';
      return showToast({
        type: 'progress',
        message: displayMessage,
        description,
        progress: progressValue,
        duration: Infinity,
        position,
      });
    },
    [showToast]
  );

  const value = {
    showToast,
    hideToast,
    updateToast,
    hideAllToasts,
    success,
    error,
    warning,
    info,
    loading,
    progress,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Render toasts in a Modal to ensure they appear above all other modals */}
      {toasts.length > 0 && (
        <Modal
          visible={true}
          transparent={true}
          animationType="none"
          statusBarTranslucent={true}
          pointerEvents="box-none"
        >
          {toasts.map((toast, index) => (
            <Toast
              key={toast.id}
              id={toast.id}
              visible={true}
              type={toast.type}
              message={toast.message}
              description={toast.description}
              position={toast.position}
              duration={toast.duration}
              progress={toast.progress}
              action={toast.action}
              onHide={() => hideToast(toast.id)}
              index={index}
            />
          ))}
        </Modal>
      )}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
