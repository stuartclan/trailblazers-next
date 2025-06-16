'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { Edit3, MapPin, Plus, Trash2, Users } from 'lucide-react';
import { useCreateHost, useDeleteHost, useHosts } from '@/hooks/useHost';
import { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/button/button';
import { EmptyState } from '@/components/molecules/empty-state/empty-state';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { HostForm } from '@/components/molecules/host-form/host-form';
import Link from 'next/link';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { Skeleton } from '@/components/atoms/skeleton/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useLocationsByHost } from '@/hooks/useLocation';
import { useRouter } from 'next/navigation';
import { useToastNotifications } from '@/hooks/useToast';

interface HostWithLocations {
  id: string;
  name: string;
  locationCount: number;
  createdAt: number;
}

export default function SuperAdminHosts() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, getUserGroup } = useAuth();
  const { success, error, info } = useToastNotifications();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hostsWithLocationCounts, setHostsWithLocationCounts] = useState<HostWithLocations[]>([]);
  
  // Data fetching
  const { 
    data: hosts, 
    isLoading: isLoadingHosts, 
    error: hostsError,
    refetch: refetchHosts 
  } = useHosts();
  
  // Mutations
  const createHost = useCreateHost();
  const deleteHost = useDeleteHost();
  
  // Check authentication and admin status
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push('/super-admin/login');
        return;
      }
      
      const userGroup = getUserGroup();
      if (userGroup !== 'super-admins') {
        router.push('/super-admin/login');
      }
    }
  }, [isAuthenticated, isAuthLoading, router, getUserGroup]);
  
  // Fetch location counts for each host
  useEffect(() => {
    if (hosts) {
      const fetchLocationCounts = async () => {
        const hostsWithCounts = await Promise.all(
          hosts.map(async (host) => {
            try {
              const response = await fetch(`/api/hosts/${host.id}/locations`);
              const locations = response.ok ? await response.json() : [];
              
              return {
                id: host.id,
                name: host.n,
                locationCount: locations.length,
                createdAt: host.c,
              };
            } catch (err) {
              console.error(`Error fetching locations for host ${host.id}:`, err);
              return {
                id: host.id,
                name: host.n,
                locationCount: 0,
                createdAt: host.c,
              };
            }
          })
        );
        
        setHostsWithLocationCounts(hostsWithCounts);
      };
      
      fetchLocationCounts();
    }
  }, [hosts]);

  if (hostsError?.message === 'Login required') {
    router.push('/super-admin/login');
  }
  
  // Handle host creation
  const handleCreateHost = async (data: {
    name: string;
    email: string;
    password: string;
    disclaimer?: string;
  }) => {
    info('Creating host account...', 'Host Creation');
    
    try {
      await createHost.mutateAsync(data);
      
      success(
        `Host "${data.name}" created successfully! They can now log in with their email and password.`,
        'Host Created'
      );
      
      setShowCreateForm(false);
      
    } catch (err) {
      console.error('Host creation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create host';
      error(errorMessage, 'Creation Failed');
      throw err; // Let the form handle the error state
    }
  };
  
  // Handle host deletion
  const handleDeleteHost = async (hostId: string, hostName: string) => {
    if (!confirm(`Are you sure you want to delete "${hostName}"? This action cannot be undone.`)) {
      return;
    }
    
    info(`Deleting host "${hostName}"...`, 'Host Deletion');
    
    try {
      await deleteHost.mutateAsync(hostId);
      
      success(
        `Host "${hostName}" has been deleted successfully.`,
        'Host Deleted'
      );
      
    } catch (err) {
      console.error('Host deletion error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete host';
      error(errorMessage, 'Deletion Failed');
    }
  };
  
  // Loading state
  if (isAuthLoading || isLoadingHosts) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton variant="text" width="200px" height={32} />
            <Skeleton width={120} height={40} variant="rounded" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton variant="text" width="120px" height={20} />
                    <Skeleton circle width={32} height={32} />
                  </div>
                  <Skeleton variant="text" width="80px" height={16} />
                  <Skeleton variant="text" width="100px" height={16} />
                  <div className="flex space-x-2">
                    <Skeleton width={80} height={32} variant="rounded" />
                    <Skeleton width={80} height={32} variant="rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (hostsError) {
    return (
      <ErrorDisplay
        title="Failed to Load Hosts"
        message="Unable to load the hosts. Please try again."
        error={hostsError}
        onRetry={refetchHosts}
        onGoHome={() => router.push('/super-admin')}
      />
    );
  }
  
  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <PageHeader
          title="Manage Hosts"
          description="Create and manage host organizations"
          breadcrumbs={[
            { label: 'Dashboard', href: '/super-admin' },
            { label: 'Hosts', current: true }
          ]}
          actions={
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Host
            </Button>
          }
        />
        
        {/* Create Host Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Host</CardTitle>
            </CardHeader>
            <CardContent>
              <HostForm
                onSubmit={handleCreateHost}
                onCancel={() => setShowCreateForm(false)}
              />
            </CardContent>
          </Card>
        )}
        
        {/* Hosts Grid */}
        {hostsWithLocationCounts.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No hosts found"
            description="Get started by creating your first host organization."
            actionLabel="Create Host"
            onAction={() => setShowCreateForm(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostsWithLocationCounts.map((host) => (
              <Card key={host.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {host.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {host.locationCount} location{host.locationCount !== 1 ? 's' : ''}
                      </div>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(host.createdAt * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link href={`/super-admin/hosts/${host.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHost(host.id, host.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/super-admin/hosts/${host.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Manage
                      </Button>
                    </Link>
                    <Link href={`/super-admin/hosts/${host.id}/locations`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Locations
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Summary Stats */}
        {hostsWithLocationCounts.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {hostsWithLocationCounts.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Hosts</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {hostsWithLocationCounts.reduce((sum, host) => sum + host.locationCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Locations</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(hostsWithLocationCounts.reduce((sum, host) => sum + host.locationCount, 0) / hostsWithLocationCounts.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Locations per Host</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}