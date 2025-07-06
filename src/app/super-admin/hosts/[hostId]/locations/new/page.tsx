'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { useParams, useRouter } from 'next/navigation';

import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { LocationForm } from '@/components/organisms/location-form/location-form';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { Skeleton } from '@/components/atoms/skeleton/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useCreateLocation } from '@/hooks/useLocation';
import { useEffect } from 'react';
import { useHosts } from '@/hooks/useHost';
import { useToastNotifications } from '@/hooks/useToast';

export default function SuperAdminNewLocation() {
    const { hostId } = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
    const { success, error, info } = useToastNotifications();

    const baseUrl = `/super-admin/hosts/${hostId}/locations`;

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

            if (!user?.isSuperAdmin) {
                router.push('/super-admin/login');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, isAuthLoading, user]);

    // Handle location creation
    const handleCreateLocation = async (data: {
        name: string;
        address: string;
    }) => {
        info('Creating location...', 'Location Creation');

        try {
            const newLocation = await createLocation.mutateAsync({
                name: data.name,
                address: data.address,
                hostId: hostId as string,
                activityIds: [], // Start with no activities
            });

            success(
                `Location "${data.name}" created successfully! You can now assign activities to this location.`,
                'Location Created'
            );

            // Redirect to the new location's edit page
            router.push(`/super-admin/hosts/${hostId}/locations/${newLocation.id}`);

        } catch (err) {
            console.error('Location creation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create location';
            error(errorMessage, 'Creation Failed');
            throw err; // Let the form handle the error state
        }
    };

    // Handle cancel
    const handleCancel = () => {
        router.push(baseUrl);
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
                onGoHome={() => router.push(baseUrl)}
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
                {/* <PageHeader
                    title="Create New Location"
                    description="Add a new location for a host"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/super-admin' },
                        { label: 'Locations', href: baseUrl },
                        { label: 'New Location', current: true }
                    ]}
                /> */}

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
