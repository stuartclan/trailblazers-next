'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { Edit3, MapPin, Plus, Settings, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useHost, useUpdateHost } from '@/hooks/useHost';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/button/button';
import { EmptyState } from '@/components/molecules/empty-state/empty-state';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { HostEntity } from '@/lib/db/entities/types';
import { HostForm } from '@/components/organisms/host-form/host-form';
import Link from 'next/link';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { Skeleton } from '@/components/atoms/skeleton/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useLocationsByHost } from '@/hooks/useLocation';
import { useToastNotifications } from '@/hooks/useToast';

export default function SuperAdminHostDetail() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { success, error, info } = useToastNotifications();

  const hostId = params.hostId as string;
  const [isEditing, setIsEditing] = useState(false);

  // Data fetching
  const {
    data: host,
    isLoading: isLoadingHost,
    error: hostError,
    refetch: refetchHost
  } = useHost(hostId);

  const {
    data: locations,
    isLoading: isLoadingLocations,
    error: locationsError,
    refetch: refetchLocations
  } = useLocationsByHost(hostId);

  // const {
  //   data: activities,
  //   isLoading: isLoadingActivities,
  //   error: activitiesError,
  //   refetch: refetchActivities
  // } = useLocationActivities(locations);

  // Mutations
  const updateHost = useUpdateHost();

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

  // Handle host update
  const handleUpdateHost = async (data: {
    name: string;
    email: string;
    // password?: string;
    adminPassword?: string;
    disclaimer?: string;
  }) => {
    info('Updating host information...', 'Host Update');

    try {
      // Only include password if it's provided
      const updateData: Partial<HostEntity> = {
        n: data.name,
        disc: data.disclaimer,
      };

      if (data.email) {
        updateData.e = data.email;
      }
      if (data.adminPassword) {
        updateData.p = data.adminPassword;
      }

      await updateHost.mutateAsync({
        id: hostId,
        data: updateData
      });

      success(
        `Host "${data.name}" updated successfully!`,
        'Host Updated'
      );

      setIsEditing(false);

    } catch (err) {
      console.error('Host update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update host';
      error(errorMessage, 'Update Failed');
      throw err; // Let the form handle the error state
    }
  };

  // Loading state
  if (isAuthLoading || isLoadingHost) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton variant="text" width="200px" height={32} />
              <Skeleton variant="text" width="300px" height={20} />
            </div>
            <Skeleton width={100} height={40} variant="rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="space-y-4">
                <Skeleton variant="text" width="150px" height={24} />
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton variant="text" width="100px" height={16} />
                    <Skeleton variant="text" width="200px" height={16} />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <Skeleton variant="text" width="120px" height={24} />
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border-1 rounded">
                    <div className="space-y-1">
                      <Skeleton variant="text" width="120px" height={16} />
                      <Skeleton variant="text" width="180px" height={14} />
                    </div>
                    <Skeleton width={80} height={32} variant="rounded" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (hostError) {
    return (
      <ErrorDisplay
        title="Failed to Load Host"
        message="Unable to load the host information. Please try again."
        error={hostError}
        onRetry={refetchHost}
        onGoHome={() => router.push('/super-admin/hosts')}
      />
    );
  }

  // Host not found
  if (!host) {
    return (
      <ErrorDisplay
        title="Host Not Found"
        message="The requested host could not be found."
        onGoHome={() => router.push('/super-admin/hosts')}
        showRetry={false}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <PageHeader
          title={host.n}
          description="Manage host settings and locations"
          breadcrumbs={[
            { label: 'Dashboard', href: '/super-admin' },
            { label: 'Hosts', href: '/super-admin/hosts' },
            { label: host.n, current: true }
          ]}
          actions={
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              {isEditing ? 'Cancel Edit' : 'Edit Host'}
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Host Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Host Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <HostForm
                  defaultValues={{
                    name: host.n,
                    email: host.e, // Email can't be changed after creation
                    // password: host.p, // Password is optional for updates
                    adminPassword: host.p, // Password is optional for updates
                    disclaimer: host.disc || '',
                  }}
                  isEdit={true}
                  onSubmit={handleUpdateHost}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Host Name</label>
                    <p className="text-gray-900">{host.n}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Cognito ID</label>
                    <p className="text-gray-600 text-sm font-mono">{host.cid}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="text-gray-600">
                      {new Date(host.c * 1000).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="text-gray-600">
                      {new Date(host.u * 1000).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Disclaimer</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      {host.disc ? (
                        <p className="text-gray-700 text-sm">{host.disc}</p>
                      ) : (
                        <p className="text-gray-500 text-sm italic">No disclaimer set</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader row>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Locations ({locations?.length || 0})
                </div>
              </CardTitle>
              <Link href={`/super-admin/hosts/${hostId}/locations/new`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Location
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingLocations ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-1 rounded animate-pulse">
                      <div className="space-y-1 flex-1">
                        <Skeleton variant="text" width="120px" height={16} />
                        <Skeleton variant="text" width="180px" height={14} />
                      </div>
                      <Skeleton width={60} height={32} variant="rounded" />
                    </div>
                  ))}
                </div>
              ) : locationsError ? (
                <div className="text-center py-4">
                  <p className="text-red-600 mb-2">Failed to load locations</p>
                  <Button variant="outline" size="sm" onClick={refetchLocations}>
                    Retry
                  </Button>
                </div>
              ) : !locations || locations.length === 0 ? (
                <EmptyState
                  icon={<MapPin className="h-8 w-8" />}
                  title="No locations"
                  description="This host doesn't have any locations yet."
                />
              ) : (
                <div className="space-y-3">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center justify-between p-3 border-1 rounded hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{location.n}</h4>
                        <p className="text-sm text-gray-600">{location.a}</p>
                        <p className="text-xs text-gray-500">
                          {location.acts?.length || 0} activities
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link href={`/super-admin/hosts/${hostId}/locations/${location.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Host Statistics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Host Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {locations?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Locations</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {locations?.reduce((sum, loc) => sum + (loc.acts?.length || 0), 0) || 0}
                </div>
                <div className="text-sm text-gray-600">Total Activities</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {host.cr?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Custom Rewards</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {host.disc ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-gray-600">Has Disclaimer</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
