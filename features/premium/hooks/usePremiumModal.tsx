import React, { useState, useCallback } from 'react';
import { PremiumUpgradeModal } from '../components/PremiumUpgradeModal';

interface UsePremiumModalResult {
  showPremiumModal: (feature?: string) => void;
  hidePremiumModal: () => void;
  PremiumModal: () => JSX.Element | null;
}

export function usePremiumModal(): UsePremiumModalResult {
  const [visible, setVisible] = useState(false);
  const [triggerFeature, setTriggerFeature] = useState<string | undefined>();

  const showPremiumModal = useCallback((feature?: string) => {
    setTriggerFeature(feature);
    setVisible(true);
  }, []);

  const hidePremiumModal = useCallback(() => {
    setVisible(false);
    // Clear trigger feature after animation completes
    setTimeout(() => setTriggerFeature(undefined), 300);
  }, []);

  const handleUpgrade = useCallback(() => {
    // TODO: Navigate to payment/subscription page when ready

    // For now, just close the modal
    // In production, this should navigate to payment flow
    hidePremiumModal();

    // TODO: Implement navigation
    // router.push('/premium/checkout');
  }, [triggerFeature, hidePremiumModal]);

  const PremiumModal = useCallback(() => {
    return (
      <PremiumUpgradeModal
        visible={visible}
        onClose={hidePremiumModal}
        onUpgrade={handleUpgrade}
        triggerFeature={triggerFeature}
      />
    );
  }, [visible, hidePremiumModal, handleUpgrade, triggerFeature]);

  return {
    showPremiumModal,
    hidePremiumModal,
    PremiumModal,
  };
}
