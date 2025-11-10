import React, { useState } from 'react';
import { Toast } from '../components/Toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top' | 'bottom';

interface ToastConfig {
  type?: ToastType;
  message: string;
  position?: ToastPosition;
  duration?: number;
}

export function useToast() {
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = (config: ToastConfig) => {
    // Hide existing toast first
    setVisible(false);

    // Show new toast after a small delay
    setTimeout(() => {
      setToastConfig(config);
      setVisible(true);
    }, 100);
  };

  const hideToast = () => {
    setVisible(false);
    setTimeout(() => setToastConfig(null), 300);
  };

  const ToastComponent = () => {
    if (!toastConfig) return null;

    return (
      <Toast
        visible={visible}
        type={toastConfig.type}
        message={toastConfig.message}
        position={toastConfig.position}
        duration={toastConfig.duration}
        onHide={hideToast}
      />
    );
  };

  // Shorthand methods
  const success = (message: string, duration?: number, position?: ToastPosition) => {
    showToast({ type: 'success', message, duration, position });
  };

  const error = (message: string, duration?: number, position?: ToastPosition) => {
    showToast({ type: 'error', message, duration, position });
  };

  const warning = (message: string, duration?: number, position?: ToastPosition) => {
    showToast({ type: 'warning', message, duration, position });
  };

  const info = (message: string, duration?: number, position?: ToastPosition) => {
    showToast({ type: 'info', message, duration, position });
  };

  return {
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
    ToastComponent,
  };
}
