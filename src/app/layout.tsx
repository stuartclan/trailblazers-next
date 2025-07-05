import '@/styles/global.scss';

import { AuthProvider } from '@/hooks/useAuth';
import { Footer } from '@/components/molecules/footer/footer';
import { Header } from '@/components/molecules/header/header';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { ToastProvider } from '@/hooks/useToast';
import { Toaster } from '@/components/molecules/toaster/toaster';
import { TooltipProvider } from '@/components/atoms/tooltip/tooltip';

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
      <body className='bg-primary'>
        <Providers>
          <AuthProvider>
            <TooltipProvider delayDuration={100}>
              <ToastProvider>
                <Header />
                <main>
                  {children}
                </main>
                <Footer />
                <Toaster />
                {/* <Analytics /> */}
              </ToastProvider>
            </TooltipProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
