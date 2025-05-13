'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, getUserGroup } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        const userGroup = getUserGroup();

        if (userGroup === 'super-admins') {
          router.push('/super-admin');
        } else if (userGroup === 'hosts') {
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
  }, [isAuthenticated, isLoading, router, getUserGroup]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-md">Trailblazers Check-In System</h1>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}