'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (user?.isSuperAdmin) {
          router.push('/super-admin');
        } else if (user?.isHost) {
          // Check if a location is already selected in localStorage
          const savedLocationId = localStorage.getItem('currentLocationId');
          if (savedLocationId) {
            router.push('/checkin');
          } else {
            router.push('/host/select-location');
          }
        } else {
          // User is authenticated but doesn't have a recognized role
          router.push('/host/login');
        }
      } else {
        // Not authenticated, redirect to host login
        router.push('/host/login');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, user]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Trailblazers Check-In System</h1>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}
