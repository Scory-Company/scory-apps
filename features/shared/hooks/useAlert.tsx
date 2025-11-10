import React, { useState } from 'react';
import { CustomAlert } from '../components/CustomAlert';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertConfig {
  type?: AlertType;
  title: string;
  message: string;
  primaryButton?: {
    text: string;
    onPress?: () => void;
  };
  secondaryButton?: {
    text: string;
    onPress?: () => void;
  };
}

export function useAlert() {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
    setTimeout(() => setAlertConfig(null), 300); // Delay to allow animation
  };

  const AlertComponent = () => {
    if (!alertConfig) return null;

    return (
      <CustomAlert
        visible={visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryButton={
          alertConfig.primaryButton
            ? {
                text: alertConfig.primaryButton.text,
                onPress: () => {
                  alertConfig.primaryButton?.onPress?.();
                  hideAlert();
                },
              }
            : undefined
        }
        secondaryButton={
          alertConfig.secondaryButton
            ? {
                text: alertConfig.secondaryButton.text,
                onPress: () => {
                  alertConfig.secondaryButton?.onPress?.();
                  hideAlert();
                },
              }
            : undefined
        }
        onClose={hideAlert}
      />
    );
  };

  // Shorthand methods
  const success = (title: string, message: string, onClose?: () => void) => {
    showAlert({
      type: 'success',
      title,
      message,
      primaryButton: { text: 'OK', onPress: onClose },
    });
  };

  const error = (title: string, message: string, onClose?: () => void) => {
    showAlert({
      type: 'error',
      title,
      message,
      primaryButton: { text: 'OK', onPress: onClose },
    });
  };

  const warning = (title: string, message: string, onClose?: () => void) => {
    showAlert({
      type: 'warning',
      title,
      message,
      primaryButton: { text: 'OK', onPress: onClose },
    });
  };

  const info = (title: string, message: string, onClose?: () => void) => {
    showAlert({
      type: 'info',
      title,
      message,
      primaryButton: { text: 'OK', onPress: onClose },
    });
  };

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showAlert({
      type: 'warning',
      title,
      message,
      primaryButton: { text: 'Confirm', onPress: onConfirm },
      secondaryButton: { text: 'Cancel', onPress: onCancel },
    });
  };

  return {
    showAlert,
    hideAlert,
    success,
    error,
    warning,
    info,
    confirm,
    AlertComponent,
  };
}
