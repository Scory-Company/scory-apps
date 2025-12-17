import React from 'react';
import { useToastContext } from '../context/ToastContext';

export function useToast() {
  const context = useToastContext();

  // Backward compatibility: ToastContainer is now handled by ToastProvider globally
  // We return a dummy component that does nothing to avoid breaking changes
  const ToastContainer = () => <></>;

  return {
    ...context,
    ToastContainer,
    // Backward compatible
    ToastComponent: ToastContainer,
  };
}
