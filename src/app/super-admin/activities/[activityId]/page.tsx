'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { LuMapPin as MapPin, LuPenLine as PenLine, LuSettings as Settings, LuTarget as TargetIcon, LuTrash2 as Trash2, LuTrendingUp as TrendingUp } from 'react-icons/lu';
import { useActivity, useDeleteActivity, useUpdateActivity } from '@/hooks/useActivity';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ActivityForm } from '@/components/organisms/activity-form/activity-form';
import { ActivityIconCircle } from '@/components/molecules/activity-icon-circle/activity-icon-circle';
import { Badge } from '@/components/atoms/badge/badge';
import { Button } from '@/components/atoms/button/button';
import { EmptyState } from '@/components/molecules/empty-state/empty-state';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { Icon } from '@/components/atoms/icon/icon';
import { Skeleton } from '@/components/atoms/skeleton/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useLocations } from '@/hooks/useLocation';
import { useToastNotifications } from '@/hooks/useToast';

export default function SuperAdminActivityDetail() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
    const { success, error, info } = useToastNotifications();

    const activityId = params.activityId as string;
    const [isEditing, setIsEditing] = useState(false);

    // Data fetching
    const {
        data: activity,
        isLoading: isLoadingActivity,
        error: activityError,
        refetch: refetchActivity
    } = useActivity(activityId);

    const {
        data: locations,
        isLoading: isLoadingLocations,
    } = useLocations();

    // Mutations
    const updateActivity = useUpdateActivity();
    const deleteActivity = useDeleteActivity();

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

    // Calculate usage statistics
    const getActivityUsage = () => {
        if (!locations || !activity) return { count: 0, locationNames: [] };

        const usingLocations = locations.filter(location =>
            location.acts && location.acts.includes(activity.id)
        );

        return {
            count: usingLocations.length,
            locationNames: usingLocations.map(loc => loc.n)
        };
    };

    const usage = getActivityUsage();

    // Handle activity update
    const handleUpdateActivity = async (data: {
        name: string;
        icon: string;
        enabled?: boolean;
    }) => {
        info('Updating activity...', 'Activity Update');

        try {
            await updateActivity.mutateAsync({
                id: activityId,
                data: {
                    n: data.name,
                    i: data.icon,
                    en: data.enabled,
                }
            });

            success(
                `Activity "${data.name}" updated successfully!`,
                'Activity Updated'
            );

            setIsEditing(false);

        } catch (err) {
            console.error('Activity update error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to update activity';
            error(errorMessage, 'Update Failed');
            throw err; // Let the form handle the error state
        }
    };

    // Handle activity deletion
    const handleDeleteActivity = async () => {
        if (!activity) return;

        // Prevent deletion if activity is in use
        if (usage.count > 0) {
            error(
                `Cannot delete "${activity.n}" because it's currently used by ${usage.count} location(s): ${usage.locationNames.slice(0, 3).join(', ')}${usage.count > 3 ? ` and ${usage.count - 3} more` : ''}. Please remove it from all locations first.`,
                'Cannot Delete Activity'
            );
            return;
        }

        if (!confirm(`Are you sure you want to delete "${activity.n}"? This action cannot be undone.`)) {
            return;
        }

        info(`Deleting activity "${activity.n}"...`, 'Activity Deletion');

        try {
            await deleteActivity.mutateAsync(activityId);

            success(
                `Activity "${activity.n}" has been deleted successfully.`,
                'Activity Deleted'
            );

            // Redirect to activities list
            router.push('/super-admin/activities');

        } catch (err) {
            console.error('Activity deletion error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete activity';
            error(errorMessage, 'Deletion Failed');
        }
    };

    // Loading state
    if (isAuthLoading || isLoadingActivity || isLoadingLocations) {
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
    if (activityError) {
        return (
            <ErrorDisplay
                title="Failed to Load Activity"
                message="Unable to load the activity information. Please try again."
                error={activityError}
                onRetry={refetchActivity}
                onGoHome={() => router.push('/super-admin/activities')}
            />
        );
    }

    // Activity not found
    if (!activity) {
        return (
            <ErrorDisplay
                title="Activity Not Found"
                message="The requested activity could not be found."
                onGoHome={() => router.push('/super-admin/activities')}
                showRetry={false}
            />
        );
    }

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            {/* <PageHeader
                    title={activity.n}
                    description="Manage activity settings and view usage statistics"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/super-admin' },
                        { label: 'Activities', href: '/super-admin/activities' },
                        { label: activity.n, current: true }
                    ]}
                    actions={
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <PenLine className="h-4 w-4" />
                                {isEditing ? 'Cancel Edit' : 'Edit Activity'}
                            </Button>
                            <Button
                                onClick={handleDeleteActivity}
                                variant="outline"
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                disabled={usage.count > 0}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    }
                /> */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Information */}
                <Card>
                    <CardHeader row>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Activity Information
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <PenLine className="h-4 w-4" />
                                {isEditing ? 'Cancel Edit' : 'Edit Activity'}
                            </Button>
                            <Button
                                onClick={handleDeleteActivity}
                                variant="outline"
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                disabled={usage.count > 0}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <ActivityForm
                                defaultValues={{
                                    name: activity.n,
                                    icon: activity.i,
                                    enabled: activity.en,
                                }}
                                isEdit={true}
                                onSubmit={handleUpdateActivity}
                                onCancel={() => setIsEditing(false)}
                            />
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 mb-6">
                                    <ActivityIconCircle activity={activity} />
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 !mb-0">
                                            {activity.n}
                                        </h3>
                                        <Badge
                                            variant={activity.en ? "success" : "outline"}
                                            size="lg"
                                            className="mt-1"
                                        >
                                            {activity.en ? "Enabled" : "Disabled"}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Activity Name</label>
                                    <p className="text-gray-900">{activity.n}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Icon</label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Icon name={activity.i} size="md" />
                                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                            {activity.i}
                                        </code>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <p className="text-gray-900">
                                        {activity.en ? 'Enabled - Available for location assignment' : 'Disabled - Not available for location assignment'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Created</label>
                                    <p className="text-gray-600">
                                        {new Date(activity.c * 1000).toLocaleDateString()}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                    <p className="text-gray-600">
                                        {new Date(activity.u * 1000).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Usage Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Usage Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="text-center p-6 bg-gray-50 rounded-lg">
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {usage.count}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Location{usage.count !== 1 ? 's' : ''} using this activity
                                </div>
                            </div>

                            {usage.count > 0 ? (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Assigned to Locations:
                                    </label>
                                    <div className="space-y-2">
                                        {usage.locationNames.map((locationName, index) => (
                                            <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                                                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                                                <span className="text-sm text-gray-700">{locationName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<MapPin className="h-8 w-8" />}
                                    title="Not assigned to any locations"
                                    description="This activity is not currently assigned to any locations. Assign it to locations to start tracking check-ins."
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Management Guidelines */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TargetIcon className="h-5 w-5" />
                        Activity Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Activity Status:</span>
                                    <Badge variant={activity.en ? "success" : "outline"}>
                                        {activity.en ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Locations Using:</span>
                                    <span className="font-medium">{usage.count}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Can Be Deleted:</span>
                                    <Badge variant={usage.count === 0 ? "success" : "destructive"}>
                                        {usage.count === 0 ? "Yes" : "No"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Management Actions</h4>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                    className="w-full justify-start"
                                    disabled={isEditing}
                                >
                                    <PenLine className="h-4 w-4 mr-2" />
                                    Edit Activity Details
                                </Button>

                                {/* {usage.count > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push('/super-admin/locations')}
                                            className="w-full justify-start"
                                        >
                                            <MapPin className="h-4 w-4 mr-2" />
                                            View Using Locations
                                        </Button>
                                    )} */}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDeleteActivity}
                                    disabled={usage.count > 0}
                                    className="w-full justify-start text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Activity
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Important Information */}
            <div className="mt-6 space-y-4">
                {usage.count > 0 && (
                    <div className="bg-yellow-50 border-1 border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Activity In Use
                                </h3>
                                <p className="mt-1 text-sm text-yellow-700">
                                    This activity is currently assigned to {usage.count} location(s).
                                    {activity.en ? ' Disabling it will prevent new check-ins for this activity at these locations.' : ' To make it available again, enable it above.'}
                                    {usage.count > 0 && ' To delete this activity, you must first remove it from all locations.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-blue-50 border-1 border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Activity Management Tips
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Disabled activities cannot be assigned to new locations</li>
                                    <li>Existing location assignments remain when an activity is disabled</li>
                                    <li>Activities cannot be deleted while assigned to locations</li>
                                    <li>Choose descriptive names and appropriate icons for better user experience</li>
                                    <li>Consider the impact on athletes before disabling popular activities</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
