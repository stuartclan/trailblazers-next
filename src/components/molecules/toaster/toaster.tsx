'use client';

import {
  ToastProvider as RadixToastProvider,
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
} from '@/components/atoms/toast/toast';

import { useToast } from '@/hooks/useToast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <RadixToastProvider>
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant}>
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && (
            <ToastDescription>{toast.description}</ToastDescription>
          )}
          {toast.action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </RadixToastProvider>
  );
}

// // Example usage in a component - update any form submission:
// // src/components/molecules/example-usage.tsx
// 'use client';

// import { useToastNotifications } from '@/hooks/useToast';
// import { Button } from '@/components/atoms/button/button';

// export function ExampleComponent() {
//   const { success, error, info } = useToastNotifications();

//   const handleCheckIn = async () => {
//     try {
//       // Your check-in logic here
//       await performCheckIn();
//       success('Check-in successful!', 'Welcome');
//     } catch (err) {
//       error('Failed to check in. Please try again.');
//     }
//   };

//   const handleSave = async () => {
//     try {
//       // Your save logic here
//       info('Saving changes...');
//       await saveData();
//       success('Changes saved successfully!');
//     } catch (err) {
//       error('Failed to save changes.');
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <Button onClick={handleCheckIn}>
//         Check In
//       </Button>
//       <Button onClick={handleSave}>
//         Save Changes
//       </Button>
//     </div>
//   );
// }