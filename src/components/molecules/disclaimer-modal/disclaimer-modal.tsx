'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as React from 'react';

import { Button } from '@/components/atoms/button/button';
import { Checkbox } from '@/components/atoms/checkbox/checkbox';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/ui';
import { useSignDisclaimer } from '@/hooks/useAthlete';
import { useToastNotifications } from '@/hooks/useToast';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
  hostId: string;
  athleteName: string;
  disclaimerText?: string;
  onSuccess?: () => void;
}

/**
 * Modal component for displaying and accepting host disclaimers
 */
export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onClose,
  athleteId,
  hostId,
  athleteName,
  disclaimerText,
  onSuccess,
}) => {
  const [hasAccepted, setHasAccepted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const signDisclaimer = useSignDisclaimer();
  const { success, error: toastError, info } = useToastNotifications();

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setHasAccepted(false);
      setError(null);
    }
  }, [isOpen]);

  const handleAccept = async () => {
    if (!hasAccepted) return;

    setIsSubmitting(true);
    setError(null);

    // Show progress toast
    info('Processing disclaimer agreement...', 'Legal Agreement');

    try {
      await signDisclaimer.mutateAsync({
        athleteId,
        hostId,
      });

      // Show success toast
      success(
        `Disclaimer accepted successfully for ${athleteName}`,
        'Agreement Completed'
      );

      // Success - call callback and close modal
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      
    } catch (err) {
      console.error('Disclaimer signing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign disclaimer';
      
      // Show error in both local state and toast
      setError(errorMessage);
      toastError(errorMessage, 'Agreement Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultDisclaimerText = `By participating in activities at this location, you acknowledge that you are participating voluntarily and at your own risk. You understand that physical activities involve inherent risks of injury, and you assume all such risks. You agree to release, indemnify, and hold harmless the host organization, its employees, and volunteers from any and all claims, damages, or injuries that may arise from your participation.`;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
            "bg-white rounded-lg shadow-lg p-6 max-h-[85vh] overflow-y-auto"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Disclaimer Agreement
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>{athleteName}</strong>, please read and accept the following disclaimer to continue with check-in:
              </p>
            </div>

            <div className="border-1 rounded-md p-4 bg-gray-50 max-h-48 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed">
                {disclaimerText || defaultDisclaimerText}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-1 border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Checkbox
                checked={hasAccepted}
                onCheckedChange={(checked) => setHasAccepted(checked === true)}
                label="I have read, understood, and agree to the terms of this disclaimer"
                disabled={isSubmitting}
              />

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={!hasAccepted || isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Accept & Continue'}
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};