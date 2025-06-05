'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as React from 'react';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils/ui';

interface ActionSheetAction {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actions: ActionSheetAction[];
  showCancel?: boolean;
}

export const MobileActionSheet: React.FC<MobileActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  actions,
  showCancel = true,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto",
            "animate-in slide-in-from-bottom duration-200"
          )}
        >
          {/* Drag handle */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          {(title || description) && (
            <div className="text-center mb-6">
              {title && (
                <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="text-sm text-gray-600">
                  {description}
                </Dialog.Description>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.action();
                  onClose();
                }}
                disabled={action.disabled}
                className={cn(
                  'w-full flex items-center justify-center space-x-3 p-4 rounded-xl font-medium transition-colors',
                  'touch-manipulation min-h-[56px]', // Ensure touch target size
                  action.destructive
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100',
                  action.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {action.icon && action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          {/* Cancel button */}
          {showCancel && (
            <button
              onClick={onClose}
              className="w-full mt-4 p-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors touch-manipulation min-h-[56px]"
            >
              Cancel
            </button>
          )}

          {/* Close button */}
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
