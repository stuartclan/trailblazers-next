import '@/styles/globals.css';

import { AuthProvider } from '@/hooks/useAuth';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { ToastProvider } from '@/hooks/useToast';
import { Toaster } from '@/components/molecules/toaster/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trailblazers Check-In System',
  description: 'Track your check-ins and earn rewards with Trailblazers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <ToastProvider>
              {children}
              <Toaster />
            </ToastProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}