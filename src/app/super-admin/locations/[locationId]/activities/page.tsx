'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { Check, MapPin, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useUpdateLocationActivities } from '@/hooks/useLocation';
import { useParams, useRouter } from 'next/navigation';

import { Badge } from '@/components/atoms/badge/badge';
import { Button } from '@/components/atoms/button/button';
import { EmptyState } from '@/components/molecules/empty-state/empty-state';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { Icon } from '@/components/atoms/icon/icon';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { Skeleton } from '@/components/atoms/skeleton/skeleton';
import { useActivities } from '@/hooks/useActivity';
import { useAuth } from '@/hooks/useAuth';
import { useToastNotifications } from '@/hooks/useToast';

export default function SuperAdminLocationActivities() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading, getUserGroup } = useAuth();
    const { success, error, info } = useToastNotifications();

    const locationId = params.locationId as string;
    const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data fetching
    const {
        data: location,
        isLoading: isLoadingLocation,
        error: locationError,
        refetch: refetchLocation
    } = useLocation(locationId);

    const {
        data: activities,
        isLoading: isLoadingActivities,
        error: activitiesError,
    } = useActivities(false); // Only enabled activities

    // Mutations
    const updateLocationActivities = useUpdateLocationActivities();

    // Initialize selected activities when location loads
    useEffect(() => {
        if (location?.acts) {
            setSelectedActivityIds(location.acts);
        }
    }, [location]);

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

    // Toggle activity selection
    const toggleActivity = (activityId: string) => {
        setSelectedActivityIds(prev => {
            if (prev.includes(activityId)) {
                return prev.filter(id => id !== activityId);
            } else {
                // Limit to 3 activities max
                if (prev.length >= 3) {
                    error('Maximum 3 activities allowed per location', 'Activity Limit');
                    return prev;
                }
                return [...prev, activityId];
            }
        });
    };

    // Save activity assignments
    const handleSaveActivities = async () => {
        if (!location) return;

        setIsSubmitting(true);
        info('Updating location activities...', 'Activity Assignment');

        try {
            await updateLocationActivities.mutateAsync({
                locationId,
                activityIds: selectedActivityIds,
            });

            success(
                `Activities updated for "${location.n}". ${selectedActivityIds.length} activities assigned.`,
                'Activities Updated'
            );

            // Refetch location to get updated data
            refetchLocation();

        } catch (err) {
            console.error('Activity update error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to update activities';
            error(errorMessage, 'Update Failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset to original activities
    const handleReset = () => {
        if (location?.acts) {
            setSelectedActivityIds(location.acts);
            info('Activity selection reset to current assignments', 'Reset');
        }
    };

    // Check if there are unsaved changes
    const hasChanges = JSON.stringify(selectedActivityIds.sort()) !== JSON.stringify((location?.acts || []).sort());

    // Loading state
    if (isAuthLoading || isLoadingLocation || isLoadingActivities) {
        return (
            <div className="min-h-screen">
                <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
                    <div className="space-y-2">
                        <Skeleton variant="text" width="300px" height={32} />
                        <Skeleton variant="text" width="400px" height={20} />
                    </div>

                    <Card className="p-6">
                        <div className="space-y-4">
                            <Skeleton variant="text" width="200px" height={24} />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="p-4 border-1 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Skeleton circle width={40} height={40} />
                                            <div className="space-y-1">
                                                <Skeleton variant="text" width="80px" />
                                                <Skeleton variant="text" width="60px" height={20} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Error state
    if (locationError || activitiesError) {
        return (
            <ErrorDisplay
                title="Failed to Load Data"
                message="Unable to load location or activities. Please try again."
                error={locationError || activitiesError}
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

    return (
        <div className="min-h-screen">
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <PageHeader
                    title={`Manage Activities: ${location.n}`}
                    description="Assign up to 3 activities for this location"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/super-admin' },
                        { label: 'Locations', href: '/super-admin/locations' },
                        { label: location.n, href: `/super-admin/locations/${locationId}` },
                        { label: 'Activities', current: true }
                    ]}
                    actions={
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                disabled={!hasChanges || isSubmitting}
                            >
                                Reset
                            </Button>
                            <Button
                                onClick={handleSaveActivities}
                                disabled={!hasChanges || isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    }
                />

                {/* Current Selection Summary */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Check className="h-5 w-5" />
                            Selected Activities ({selectedActivityIds.length}/3)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedActivityIds.length === 0 ? (
                            <p className="text-gray-500 italic">No activities selected</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedActivityIds.map(activityId => {
                                    const activity = activities?.find(a => a.id === activityId);
                                    return activity ? (
                                        <Badge
                                            key={activityId}
                                            variant="default"
                                            className="flex items-center gap-1"
                                        >
                                            <Icon name={activity.i} size="xs" />
                                            {activity.n}
                                            <button
                                                onClick={() => toggleActivity(activityId)}
                                                className="ml-1 hover:text-red-200"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ) : null;
                                })}
                            </div>
                        )}

                        {selectedActivityIds.length >= 3 && (
                            <p className="text-amber-600 text-sm mt-2">
                                Maximum activities reached. Remove an activity to add a different one.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Available Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Available Activities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!activities || activities.length === 0 ? (
                            <EmptyState
                                icon={<MapPin className="h-8 w-8" />}
                                title="No activities available"
                                description="No enabled activities found. Contact an administrator to create activities."
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activities.map((activity) => {
                                    const isSelected = selectedActivityIds.includes(activity.id);
                                    const isDisabledDueToLimit = !isSelected && selectedActivityIds.length >= 3;

                                    return (
                                        <div
                                            key={activity.id}
                                            className={`
                                                p-4 border-1 rounded-lg cursor-pointer transition-all
                                                ${isSelected
                                                    ? 'border-primary bg-primary-light text-primary-dark'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }
                                                ${isDisabledDueToLimit ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                            onClick={() => !isDisabledDueToLimit && toggleActivity(activity.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`
                                                        w-10 h-10 rounded-full flex items-center justify-center
                                                        ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}
                                                    `}>
                                                        <Icon name={activity.i} size="md" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{activity.n}</h3>
                                                        <Badge
                                                            variant={activity.en ? "success" : "outline"}
                                                            size="sm"
                                                        >
                                                            {activity.en ? "Enabled" : "Disabled"}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className={`
                                                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                                                    ${isSelected
                                                        ? 'border-primary bg-primary text-white'
                                                        : 'border-gray-300'
                                                    }
                                                `}>
                                                    {isSelected && <Check className="h-3 w-3" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Help Text */}
                <div className="mt-6 bg-blue-50 border-1 border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Activity Assignment Guidelines
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Each location can have up to 3 activities assigned</li>
                                    <li>Only enabled activities are available for assignment</li>
                                    <li>Athletes will only be able to check in for assigned activities at this location</li>
                                    <li>Changes take effect immediately after saving</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Changes Warning */}
                {hasChanges && (
                    <div className="mt-4 bg-yellow-50 border-1 border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Unsaved Changes
                                </h3>
                                <p className="mt-1 text-sm text-yellow-700">
                                    You have unsaved changes to the activity assignments. Click "Save Changes" to apply them or "Reset" to revert.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
