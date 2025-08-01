'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { LuMapPin as MapPin, LuPenLine as PenLine, LuPlus as Plus, LuTrash2 as Trash2, LuUsers as Users } from 'react-icons/lu';
import { useCreateHost, useDeleteHost, useHosts } from '@/hooks/useHost';
import { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/button/button';
import { EmptyState } from '@/components/molecules/empty-state/empty-state';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { HostForm } from '@/components/organisms/host-form/host-form';
import Link from 'next/link';
import { SkeletonCard } from '@/components/atoms/skeleton/skeleton';
import { fetchLocationsByHost } from '@/hooks/useLocation';
import { useAsync } from 'react-use';
import { useAuth } from '@/hooks/useAuth';
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
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { success, error, info } = useToastNotifications();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoadingHostLocations, setIsLoadingHostLocations] = useState(true);
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

      if (!user?.isSuperAdmin) {
        router.push('/super-admin/login');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading, user]);

  // Fetch location counts for each host
  useAsync(async () => {
    if (hosts) {
      const fetchLocationCounts = async () => {
        const hostsWithCounts = await Promise.all(
          hosts.map(async (host) => {
            try {
              const locations = await fetchLocationsByHost(host.id);

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

      await fetchLocationCounts();
      setIsLoadingHostLocations(false);

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
    adminPassword: string;
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
  if (isAuthLoading || isLoadingHosts || isLoadingHostLocations) {
    return (
      <div className="flex items-center justify-start gap-4">
        <SkeletonCard className='w-[50%]' lines={5} showAvatar={false} />
        <SkeletonCard className='w-[50%]' lines={5} showAvatar={false} />
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
        {/* <PageHeader
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
        /> */}

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
            description="Get started by creating your first host."
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
                          <PenLine className="h-4 w-4" />
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
            <Button
              size='lg'
              variant='secondary'
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Host
            </Button>
          </div>
        )}

        {/* Summary Stats */}
        {/* {hostsWithLocationCounts.length > 0 && (
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
        )} */}
      </div>
    </div>
  );
}
