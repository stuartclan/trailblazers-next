'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { Edit3, MapPin, Settings, Trash2 } from 'lucide-react';
import { useDeleteLocation, useLocation, useUpdateLocation } from '@/hooks/useLocation';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Badge } from '@/components/atoms/badge/badge';
import { Button } from '@/components/atoms/button/button';
import { EmptyState } from '@/components/molecules/empty-state/empty-state';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { LocationForm } from '@/components/molecules/location-form/location-form';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { Skeleton } from '@/components/atoms/skeleton/skeleton';
import { useActivities } from '@/hooks/useActivity';
import { useAuth } from '@/hooks/useAuth';
import { useHosts } from '@/hooks/useHost';
import { useToastNotifications } from '@/hooks/useToast';

export default function SuperAdminLocationEdit() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading, getUserGroup } = useAuth();
    const { success, error, info } = useToastNotifications();

    const locationId = params.locationId as string;
    const [isEditing, setIsEditing] = useState(false);

    // Data fetching
    const {
        data: location,
        isLoading: isLoadingLocation,
        error: locationError,
        refetch: refetchLocation
    } = useLocation(locationId);

    const {
        data: hosts,
        isLoading: isLoadingHosts,
        error: hostsError,
    } = useHosts();

    const {
        data: activities,
        isLoading: isLoadingActivities,
    } = useActivities(false);

    // Mutations
    const updateLocation = useUpdateLocation();
    const deleteLocation = useDeleteLocation();

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

    // Handle location update
    const handleUpdateLocation = async (data: {
        name: string;
        address: string;
        hostId: string;
    }) => {
        info('Updating location...', 'Location Update');

        try {
            await updateLocation.mutateAsync({
                id: locationId,
                data: {
                    n: data.name,
                    a: data.address,
                    // Note: hostId changes are handled in the API if different
                    hid: data.hostId,
                }
            });

            success(
                `Location "${data.name}" updated successfully!`,
                'Location Updated'
            );

            setIsEditing(false);

        } catch (err) {
            console.error('Location update error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to update location';
            error(errorMessage, 'Update Failed');
            throw err; // Let the form handle the error state
        }
    };

    // Handle location deletion
    const handleDeleteLocation = async () => {
        if (!location) return;

        if (!confirm(`Are you sure you want to delete "${location.n}"? This action cannot be undone and will affect all check-ins associated with this location.`)) {
            return;
        }

        info(`Deleting location "${location.n}"...`, 'Location Deletion');

        try {
            await deleteLocation.mutateAsync(locationId);

            success(
                `Location "${location.n}" has been deleted successfully.`,
                'Location Deleted'
            );

            // Redirect to locations list
            router.push('/super-admin/locations');

        } catch (err) {
            console.error('Location deletion error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete location';
            error(errorMessage, 'Deletion Failed');
        }
    };

    // Loading state
    if (isAuthLoading || isLoadingLocation || isLoadingHosts || isLoadingActivities) {
        return (
            <div className="min-h-screen">
                <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <Skeleton variant="text" width="200px" height={32} />
                            <Skeleton variant="text" width="300px" height={20} />
                        </div>
                        <div className="flex space-x-2">
                            <Skeleton width={100} height={40} variant="rounded" />
                            <Skeleton width={100} height={40} variant="rounded" />
                        </div>
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
                                <div className="grid grid-cols-2 gap-3">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="flex items-center p-3 border-1 rounded">
                                            <Skeleton circle width={24} height={24} className="mr-2" />
                                            <Skeleton variant="text" width="60px" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (locationError || hostsError) {
        return (
            <ErrorDisplay
                title="Failed to Load Location"
                message="Unable to load the location information. Please try again."
                error={locationError || hostsError}
                onRetry={refetchLocation}
                onGoHome={() => router.push('/super-admin/locations')}
            />
        );
    }

    // Location not found
    if (!location) {
        return (
            <ErrorDisplay
                title="Location Not Found"
                message="The requested location could not be found."
                onGoHome={() => router.push('/super-admin/locations')}
                showRetry={false}
            />
        );
    }

    // Get host name
    const host = hosts?.find(h => h.id === location.hid);
    const hostName = host?.n || 'Unknown Host';

    // Get assigned activities
    const assignedActivities = location.acts
        ? activities?.filter(activity => location.acts.includes(activity.id)) || []
        : [];

    // Transform hosts for select options
    const hostOptions = (hosts || []).map(host => ({
        value: host.id,
        label: host.n
    }));

    return (
        <div className="min-h-screen">
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <PageHeader
                    title={location.n}
                    description="Manage location settings and activities"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/super-admin' },
                        { label: 'Locations', href: '/super-admin/locations' },
                        { label: location.n, current: true }
                    ]}
                    actions={
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Edit3 className="h-4 w-4" />
                                {isEditing ? 'Cancel Edit' : 'Edit Location'}
                            </Button>
                            <Button
                                onClick={handleDeleteLocation}
                                variant="outline"
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Location Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Location Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <LocationForm
                                    defaultValues={{
                                        name: location.n,
                                        address: location.a,
                                        hostId: location.hid,
                                    }}
                                    hosts={hostOptions}
                                    isEdit={true}
                                    onSubmit={handleUpdateLocation}
                                    onCancel={() => setIsEditing(false)}
                                />
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Location Name</label>
                                        <p className="text-gray-900">{location.n}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Host</label>
                                        <p className="text-gray-900">{hostName}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Address</label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                            <p className="text-gray-700 text-sm">{location.a || 'No address specified'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Created</label>
                                        <p className="text-gray-600">
                                            {new Date(location.c * 1000).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                        <p className="text-gray-600">
                                            {new Date(location.u * 1000).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assigned Activities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Assigned Activities ({assignedActivities.length})
                                </div>
                                <Button
                                    onClick={() => router.push(`/super-admin/locations/${locationId}/activities`)}
                                    size="sm"
                                    variant="outline"
                                >
                                    Manage Activities
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignedActivities.length === 0 ? (
                                <EmptyState
                                    icon={<MapPin className="h-8 w-8" />}
                                    title="No activities assigned"
                                    description="This location doesn't have any activities assigned yet."
                                    actionLabel="Assign Activities"
                                    onAction={() => router.push(`/super-admin/locations/${locationId}/activities`)}
                                />
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {assignedActivities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-center p-3 border-1 rounded-md hover:bg-gray-50"
                                        >
                                            <span className="material-icons text-primary mr-2">
                                                {activity.i}
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{activity.n}</p>
                                                <Badge
                                                    variant={activity.en ? "success" : "outline"}
                                                    size="sm"
                                                >
                                                    {activity.en ? "Enabled" : "Disabled"}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Location Statistics */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Location Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                    {assignedActivities.length}
                                </div>
                                <div className="text-sm text-gray-600">Assigned Activities</div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                    {assignedActivities.filter(a => a.en).length}
                                </div>
                                <div className="text-sm text-gray-600">Enabled Activities</div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                    {host?.lids?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Host Total Locations</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Warning for Deletion */}
                {isEditing && (
                    <Card className="mt-6 border-yellow-200 bg-yellow-50">
                        <CardContent className="p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Important Information
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Changing the host will move this location to a different organization</li>
                                            <li>Deleting this location will remove all associated check-in history</li>
                                            <li>Activities will need to be reassigned after changing hosts</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
