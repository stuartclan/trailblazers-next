'use client';

import {
  AlertTriangle,
  Award,
  Calendar,
  LogOut,
  MapPin,
  Settings,
  TrendingUp,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { useEffect, useState } from 'react';

import { Alert } from '@/components/atoms/alert/alert';
import { Badge } from '@/components/atoms/badge/badge';
import { Button } from '@/components/atoms/button/button';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { HostAdminLoading } from '@/components/molecules/loading-states/loading-states';
import Link from 'next/link';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { formatRelativeTime } from '@/lib/utils/dates';
import { useAuth } from '@/hooks/useAuth';
import { useHost } from '@/hooks/useHost';
import { useHostCheckIns } from '@/hooks/useCheckIn';
import { useLocation } from '@/hooks/useLocation';
import { useRouter } from 'next/navigation';

export default function HostAdmin() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // Get current host and location from localStorage
  const [hostId, setHostId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Data fetching with error handling
  const { 
    data: host, 
    isLoading: isLoadingHost, 
    error: hostError,
    refetch: refetchHost 
  } = useHost(hostId || '');
  
  const { 
    data: location, 
    isLoading: isLoadingLocation, 
    error: locationError,
    refetch: refetchLocation 
  } = useLocation(locationId || '');
  
  const { 
    data: recentCheckIns, 
    isLoading: isLoadingCheckIns,
    error: checkInsError,
    refetch: refetchCheckIns 
  } = useHostCheckIns(hostId || '', 10);
  
  // Initialize host/location from localStorage
  useEffect(() => {
    const savedHostId = localStorage.getItem('currentHostId');
    const savedLocationId = localStorage.getItem('currentLocationId');
    
    if (savedHostId && savedLocationId) {
      setHostId(savedHostId);
      setLocationId(savedLocationId);
    } else {
      router.push('/host/select-location');
    }
  }, [router]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/host/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);
  
  // Check admin password authentication
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
  
  // Handle admin password authentication
  const handleAdminAuth = () => {
    if (!host) return;
    
    if (adminPassword === host.p) {
      setIsPasswordAuthenticated(true);
      setShowPasswordForm(false);
      setPasswordError(null);
      sessionStorage.setItem(`host_admin_auth_${hostId}`, 'true');
    } else {
      setPasswordError('Incorrect password');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    if (hostId) {
      sessionStorage.removeItem(`host_admin_auth_${hostId}`);
    }
    router.push('/checkin');
  };
  
  // Handle retry for failed requests
  const handleRetry = () => {
    refetchHost();
    refetchLocation();
    refetchCheckIns();
  };
  
  // Loading state - use skeleton instead of spinner
  if (isAuthLoading || isLoadingHost || isLoadingLocation) {
    return <HostAdminLoading />;
  }
  
  // Error state
  if (hostError || locationError) {
    return (
      <ErrorDisplay
        title="Failed to Load Dashboard"
        message="Unable to load the admin dashboard. Please try again."
        error={hostError || locationError}
        onRetry={handleRetry}
        onGoHome={() => router.push('/checkin')}
      />
    );
  }
  
  // Missing data state
  if (!host || !location) {
    return (
      <ErrorDisplay
        title="Configuration Error"
        message="Host or location information is missing."
        onGoHome={() => router.push('/host/select-location')}
        showRetry={false}
      />
    );
  }
  
  // Password authentication form
  if (showPasswordForm || !isPasswordAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Host Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {passwordError && (
              <Alert variant="error">
                {passwordError}
              </Alert>
            )}
            
            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Admin Password
              </label>
              <input
                type="password"
                id="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
                autoFocus
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/checkin')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdminAuth}
                disabled={!adminPassword}
                className="flex-1"
              >
                Enter Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Get today's check-ins count
  const todayCheckIns = recentCheckIns?.filter(checkIn => {
    const checkInDate = new Date(checkIn.c * 1000);
    const today = new Date();
    return checkInDate.toDateString() === today.toDateString();
  }) || [];
  
  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <PageHeader
          title="Host Admin Dashboard"
          description={`Managing ${host.n}`}
          breadcrumbs={[
            { label: 'Check-in', href: '/checkin' },
            { label: 'Admin', current: true }
          ]}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          }
        />
        
        {/* Current Location Info */}
        <Alert variant="info" className="mb-6">
          <MapPin className="h-4 w-4" />
          <div className="ml-2">
            <p className="font-medium">Current Location: {location.n}</p>
            <p className="text-sm text-gray-600">{location.a}</p>
          </div>
        </Alert>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Today&apos;s Check-ins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoadingCheckIns ? '...' : todayCheckIns.length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoadingCheckIns ? '...' : (recentCheckIns?.length || 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Custom Rewards</p>
                <p className="text-2xl font-bold text-gray-900">
                  {host.cr?.length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-orange-100 rounded-lg mr-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Athletes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(recentCheckIns?.map(ci => ci.aid)).size || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Manage Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                View eligible athletes and manage custom rewards
              </p>
              <Link href="/host/admin/rewards">
                <Button className="w-full">
                  View Rewards
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Access emergency contacts for recent check-ins
              </p>
              <Link href="/host/admin/emergency">
                <Button variant="outline" className="w-full">
                  View Contacts
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Manage host settings and location activities
              </p>
              <Link href="/host/admin/settings">
                <Button variant="outline" className="w-full">
                  Manage Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Check-ins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Check-ins</CardTitle>
            <Badge variant="secondary">
              Last 10
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoadingCheckIns ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="h-8 w-8 bg-gray-300 rounded-full mr-3"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : checkInsError ? (
              <Alert variant="error">
                Failed to load recent check-ins. 
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refetchCheckIns}
                  className="ml-2"
                >
                  Retry
                </Button>
              </Alert>
            ) : recentCheckIns && recentCheckIns.length > 0 ? (
              <div className="space-y-3">
                {recentCheckIns.map((checkIn) => (
                  <div 
                    key={checkIn.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary-light rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Athlete ID: {checkIn.aid}
                        </p>
                        <p className="text-sm text-gray-600">
                          Activity: {checkIn.actid} • Location: {checkIn.lid}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatRelativeTime(checkIn.c * 1000)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(checkIn.c * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <Link href="/host/admin/check-ins">
                    <Button variant="outline" className="w-full">
                      View All Check-ins
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No recent check-ins</p>
                <p className="text-gray-500 text-sm mt-1">
                  Check-ins will appear here as athletes visit your location
                </p>
                <Link href="/checkin">
                  <Button className="mt-4">
                    Go to Check-in
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white rounded-lg border">
          <div className="text-sm text-gray-600">
            <p>Need help? Contact your system administrator.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/checkin">
              <Button variant="outline" size="sm">
                Back to Check-in
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              Logout Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}