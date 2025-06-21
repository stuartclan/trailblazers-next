'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';

import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { LocationForm } from '@/components/molecules/location-form/location-form';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { Skeleton } from '@/components/atoms/skeleton/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useCreateLocation } from '@/hooks/useLocation';
import { useEffect } from 'react';
import { useHosts } from '@/hooks/useHost';
import { useRouter } from 'next/navigation';
import { useToastNotifications } from '@/hooks/useToast';

export default function SuperAdminNewLocation() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading, getUserGroup } = useAuth();
    const { success, error, info } = useToastNotifications();

    // Data fetching
    const {
        data: hosts,
        isLoading: isLoadingHosts,
        error: hostsError,
        refetch: refetchHosts
    } = useHosts();

    // Mutations
    const createLocation = useCreateLocation();

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

    // Handle location creation
    const handleCreateLocation = async (data: {
        name: string;
        address: string;
        hostId: string;
    }) => {
        info('Creating location...', 'Location Creation');

        try {
            const newLocation = await createLocation.mutateAsync({
                name: data.name,
                address: data.address,
                hostId: data.hostId,
                activityIds: [], // Start with no activities
            });

            success(
                `Location "${data.name}" created successfully! You can now assign activities to this location.`,
                'Location Created'
            );

            // Redirect to the new location's edit page
            router.push(`/super-admin/locations/${newLocation.id}`);

        } catch (err) {
            console.error('Location creation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create location';
            error(errorMessage, 'Creation Failed');
            throw err; // Let the form handle the error state
        }
    };

    // Handle cancel
    const handleCancel = () => {
        router.push('/super-admin/locations');
    };

    // Loading state
    if (isAuthLoading || isLoadingHosts) {
        return (
            <div className="min-h-screen">
                <div className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
                    <div className="space-y-2">
                        <Skeleton variant="text" width="200px" height={32} />
                        <Skeleton variant="text" width="300px" height={20} />
                    </div>

                    <Card className="p-6">
                        <div className="space-y-4">
                            <Skeleton variant="text" width="150px" height={24} />
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <Skeleton variant="text" width="100px" height={16} />
                                    <Skeleton variant="text" width="100%" height={40} />
                                </div>
                            ))}
                            <div className="flex space-x-3 pt-4">
                                <Skeleton width={100} height={40} variant="rounded" />
                                <Skeleton width={150} height={40} variant="rounded" />
                            </div>
                        </div>
                    </Card>
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
                onGoHome={() => router.push('/super-admin/locations')}
            />
        );
    }

    // Transform hosts for select options
    const hostOptions = (hosts || []).map(host => ({
        value: host.id,
        label: host.n
    }));

    return (
        <div className="min-h-screen">
            <div className="container max-w-2xl mx-auto px-4 py-8">
                <PageHeader
                    title="Create New Location"
                    description="Add a new location for a host"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/super-admin' },
                        { label: 'Locations', href: '/super-admin/locations' },
                        { label: 'New Location', current: true }
                    ]}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Location Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {hostOptions.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600 mb-4">
                                    No hosts available. You need to create at least one host before creating locations.
                                </p>
                                <button
                                    onClick={() => router.push('/super-admin/hosts')}
                                    className="text-primary hover:underline"
                                >
                                    Go to Hosts Management
                                </button>
                            </div>
                        ) : (
                            <LocationForm
                                onSubmit={handleCreateLocation}
                                hosts={hostOptions}
                                onCancel={handleCancel}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
