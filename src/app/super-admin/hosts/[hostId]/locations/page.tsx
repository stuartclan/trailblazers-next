'use client';

import { Card, CardContent } from '@/components/atoms/card/card';
import { LuMapPin as MapPin, LuPenLine as PenLine, LuPlus as Plus, LuTrash2 as Trash2, LuUsers as Users } from 'react-icons/lu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip/tooltip';
import { useDeleteLocation, useLocationsByHost } from '@/hooks/useLocation';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/button/button';
import { EmptyState } from '@/components/molecules/empty-state/empty-state';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import Link from 'next/link';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { Skeleton } from '@/components/atoms/skeleton/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useHosts } from '@/hooks/useHost';
import { useToastNotifications } from '@/hooks/useToast';

export default function SuperAdminLocations() {
    const { hostId: hostIdParam } = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
    const { success, error, info } = useToastNotifications();
    const [canDelete, setCanDelete] = useState(false);

    const hostId = Array.isArray(hostIdParam) ? hostIdParam[0] : hostIdParam || '';

    // Data fetching
    const {
        data: locations,
        isLoading: isLoadingLocations,
        error: locationsError,
        refetch: refetchLocations
    } = useLocationsByHost(hostId);

    const {
        data: hosts,
        isLoading: isLoadingHosts,
    } = useHosts();

    // Mutations
    const deleteLocation = useDeleteLocation();

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

    useEffect(() => {
        if (!isLoadingLocations) {
            setCanDelete((locations?.length ?? 0) > 1);
        }

    }, [isLoadingLocations, locations]);

    // Handle location deletion
    const handleDeleteLocation = async (locationId: string, locationName: string) => {
        if (!canDelete) {
            error('Unable to delete the last location. A location is required for a host.', 'Delete failure');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${locationName}"? This action cannot be undone.`)) {
            return;
        }

        info(`Deleting location "${locationName}"...`, 'Location Deletion');

        try {
            await deleteLocation.mutateAsync({ id: locationId, hostId });

            success(
                `Location "${locationName}" has been deleted successfully.`,
                'Location Deleted'
            );

        } catch (err) {
            console.error('Location deletion error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete location';
            error(errorMessage, 'Deletion Failed');
        }
    };

    // Get host name helper
    const getHostName = (hostId: string) => {
        const host = hosts?.find(h => h.id === hostId);
        return host?.n || 'Unknown Host';
    };

    // Loading state
    if (isAuthLoading || isLoadingLocations || isLoadingHosts) {
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
    if (locationsError) {
        return (
            <ErrorDisplay
                title="Failed to Load Locations"
                message="Unable to load the locations. Please try again."
                error={locationsError}
                onRetry={refetchLocations}
                onGoHome={() => router.push('/super-admin')}
            />
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <PageHeader
                    title="Manage Locations"
                    description="Create and manage host locations"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/super-admin' },
                        { label: 'Locations', current: true }
                    ]}
                    actions={
                        <Button
                            onClick={() => router.push(`/super-admin/hosts/${hostId}/locations/new`)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Location
                        </Button>
                    }
                />

                {/* Locations Grid */}
                {!locations || locations.length === 0 ? (
                    <EmptyState
                        icon={<MapPin className="h-12 w-12" />}
                        title="No locations found"
                        description="Get started by creating your first location."
                        actionLabel="Create Location"
                        onAction={() => router.push(`/super-admin/hosts/${hostId}/locations/new`)}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {locations.map((location) => (
                            <Card key={location.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {location.n}
                                            </h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Users className="h-4 w-4 mr-1" />
                                                    {getHostName(location.hid)}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {location.a || 'No address'}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {location.acts?.length || 0} activities
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Link href={`/super-admin/hosts/${hostId}/locations/${location.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <PenLine className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant='ghost'
                                                        size="sm"
                                                        onClick={() => handleDeleteLocation(location.id, location.n)}
                                                        className={canDelete ? 'text-red-600 hover:text-red-700' : 'text-gray-300 hover:text-gray-400'}
                                                    // disabled={!canDelete}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent align='end' hidden={canDelete}>Cannot delete last location</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Link href={`/super-admin/hosts/${hostId}/locations/${location.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                Edit
                                            </Button>
                                        </Link>
                                        <Link href={`/super-admin/hosts/${hostId}/locations/${location.id}/activities`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                Activities
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Summary Stats */}
                {/* {locations && locations.length > 0 && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {locations.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Locations</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {new Set(locations.map(loc => loc.hid)).size}
                                    </div>
                                    <div className="text-sm text-gray-600">Unique Hosts</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {(locations.reduce((sum, loc) => sum + (loc.acts?.length || 0), 0) / locations.length).toFixed(1)}
                                    </div>
                                    <div className="text-sm text-gray-600">Avg Activities per Location</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )} */}
            </div>
        </div>
    );
}
