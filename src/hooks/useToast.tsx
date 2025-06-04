'use client';

import * as React from 'react';

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

type ToastVariant = 'default' | 'destructive' | 'success';

type ToasterToast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactElement;
  variant?: ToastVariant;
  duration?: number;
};

interface ToastContextType {
  toasts: ToasterToast[];
  toast: (props: Omit<ToasterToast, 'id'>) => void;
  dismiss: (toastId?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  const toast = React.useCallback((props: Omit<ToasterToast, 'id'>) => {
    const id = genId();
    const newToast: ToasterToast = {
      ...props,
      id,
      duration: props.duration ?? TOAST_REMOVE_DELAY,
    };

    setToasts((currentToasts) => {
      const updatedToasts = [...currentToasts, newToast];
      if (updatedToasts.length > TOAST_LIMIT) {
        return updatedToasts.slice(-TOAST_LIMIT);
      }
      return updatedToasts;
    });

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts((currentToasts) => 
        currentToasts.filter((toast) => toast.id !== id)
      );
    }, newToast.duration);
  }, []);

  const dismiss = React.useCallback((toastId?: string) => {
    setToasts((currentToasts) => {
      if (toastId) {
        return currentToasts.filter((toast) => toast.id !== toastId);
      }
      return [];
    });
  }, []);

  const value = React.useMemo(() => ({
    toasts,
    toast,
    dismiss,
  }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience hook for toast notifications
export const useToastNotifications = () => {
  const { toast } = useToast();

  return React.useMemo(() => ({
    success: (message: string, title?: string) => {
      toast({
        title,
        description: message,
        variant: 'success',
      });
    },
    error: (message: string, title?: string) => {
      toast({
        title: title || 'Error',
        description: message,
        variant: 'destructive',
      });
    },
    info: (message: string, title?: string) => {
      toast({
        title,
        description: message,
        variant: 'default',
      });
    },
  }), [toast]);
};
