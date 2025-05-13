'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useHost } from '@/hooks/useHost';
import { useHostCheckIns } from '@/hooks/useCheckIn';
import { useLocation } from '@/hooks/useLocation';
import { useRouter } from 'next/navigation';

export default function HostAdmin() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Get current host and location from localStorage
  const [hostId, setHostId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  
  // Get host data
  const { data: host } = useHost(hostId || '');
  
  // Get location data
  const { data: location } = useLocation(locationId || '');
  
  // Get recent check-ins
  const { data: recentCheckIns } = useHostCheckIns(hostId || '', 10);
  
  // Admin password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Load host/location from localStorage on component mount
  useEffect(() => {
    const savedHostId = localStorage.getItem('currentHostId');
    const savedLocationId = localStorage.getItem('currentLocationId');
    
    if (savedHostId && savedLocationId) {
      setHostId(savedHostId);
      setLocationId(savedLocationId);
    } else {
      // If no location is selected, redirect to location selection
      router.push('/host/select-location');
    }
  }, [router]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/host/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Handle admin password authentication
  const handleAdminAuth = () => {
    if (!host) return;
    
    if (adminPassword === host.p) {
      setIsPasswordAuthenticated(true);
      setShowPasswordForm(false);
      setPasswordError(null);
      
      // Save in session storage so it persists until browser is closed
      sessionStorage.setItem(`host_admin_auth_${hostId}`, 'true');
    } else {
      setPasswordError('Incorrect password');
    }
  };
  
  // Check if admin password is already authenticated
  useEffect(() => {
    if (hostId) {
      const isAuth = sessionStorage.getItem(`host_admin_auth_${hostId}`);
      if (isAuth === 'true') {
        setIsPasswordAuthenticated(true);
      } else {
        setShowPasswordForm(true);
      }
    }
  }, [hostId]);
  
  // Handle logout
  const handleLogout = () => {
    // Clear host admin auth from session storage
    if (hostId) {
      sessionStorage.removeItem(`host_admin_auth_${hostId}`);
    }
    
    // Redirect to check-in page
    router.push('/checkin');
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-md">Loading...</h1>
        </div>
      </div>
    );
  }
  
  // Show password form if not authenticated
  if (showPasswordForm || !isPasswordAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="card max-w-md w-full">
          <h1 className="text-2xl font-bold mb-md">Host Admin Access</h1>
          
          {passwordError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-lg" role="alert">
              <p>{passwordError}</p>
            </div>
          )}
          
          <div className="mb-lg">
            <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-sm">
              Enter Admin Password
            </label>
            <input
              type="password"
              id="adminPassword"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => router.push('/checkin')}
              className="text-primary hover:underline"
            >
              Back to Check-In
            </button>
            
            <button
              onClick={handleAdminAuth}
              className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
            >
              Enter Admin
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Main admin dashboard
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container max-w-4xl">
        <div className="flex justify-between items-center mb-lg">
          <h1 className="text-2xl font-bold">Host Admin Dashboard</h1>
          
          <div className="flex gap-md">
            <button
              onClick={() => router.push('/checkin')}
              className="text-primary hover:underline"
            >
              Back to Check-In
            </button>
            
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Host Info Card */}
        <div className="card mb-lg">
          <div className="flex flex-col md:flex-row justify-between gap-md">
            <div>
              <h2 className="text-xl font-bold mb-sm">{host?.n || 'Host'}</h2>
              <p className="text-gray-600">Location: {location?.n || 'Unknown'}</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-md">
              <Link
                href="/host/admin/rewards"
                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors text-center"
              >
                Manage Rewards
              </Link>
              
              <Link
                href="/host/admin/emergency"
                className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors text-center"
              >
                Emergency Contacts
              </Link>
              
              <Link
                href="/host/admin/settings"
                className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-center"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
          <div className="card">
            <h3 className="text-lg font-medium mb-sm">Today&apos;s Check-ins</h3>
            <p className="text-3xl font-bold">{recentCheckIns?.length || 0}</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium mb-sm">One-Aways</h3>
            <Link
              href="/host/admin/rewards"
              className="text-3xl font-bold text-primary hover:underline"
            >
              View
            </Link>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium mb-sm">Custom Rewards</h3>
            <p className="text-3xl font-bold">{host?.cr?.length || 0}</p>
          </div>
        </div>
        
        {/* Recent Check-ins */}
        <div className="card">
          <h2 className="text-xl font-bold mb-md">Recent Check-ins</h2>
          
          {recentCheckIns && recentCheckIns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Time</th>
                    <th className="text-left py-2 px-3">Athlete</th>
                    <th className="text-left py-2 px-3">Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCheckIns.map((checkIn) => (
                    <tr key={checkIn.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        {new Date(checkIn.c * 1000).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3">
                        {/* In a real app, this would use a query to fetch the athlete name */}
                        <Link
                          href={`/host/admin/athletes/${checkIn.aid}`}
                          className="text-primary hover:underline"
                        >
                          {checkIn.aid}
                        </Link>
                      </td>
                      <td className="py-2 px-3">
                        {/* In a real app, this would use a query to fetch the activity name */}
                        {checkIn.actid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 italic">No recent check-ins</p>
          )}
          
          {recentCheckIns && recentCheckIns.length > 0 && (
            <div className="mt-md text-right">
              <Link
                href="/host/admin/check-ins"
                className="text-primary hover:underline"
              >
                View all check-ins
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}