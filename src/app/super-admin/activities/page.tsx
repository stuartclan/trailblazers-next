'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { Edit3, Activity as EmptyActivityIcon, Plus, Settings, Trash2, TrendingUp } from 'lucide-react';
import { useActivities, useCreateDefaultActivities, useDeleteActivity, useUpdateActivity } from '@/hooks/useActivity';
import { useEffect, useState } from 'react';

import { ActivityIconCircle } from '@/components/molecules/activity-icon-circle/activity-icon-circle';
import { Badge } from '@/components/atoms/badge/badge';
import { Button } from '@/components/atoms/button/button';
import { EmptyState } from '@/components/molecules/empty-state/empty-state';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { Icon } from '@/components/atoms/icon/icon';
import Link from 'next/link';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { Skeleton } from '@/components/atoms/skeleton/skeleton';
import { Switch } from '@/components/atoms/switch/switch';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { useAuth } from '@/hooks/useAuth';
import { useLocations } from '@/hooks/useLocation';
import { useRouter } from 'next/navigation';
import { useToastNotifications } from '@/hooks/useToast';

export default function SuperAdminActivities() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading, getUserGroup } = useAuth();
    const { success, error, info } = useToastNotifications();

    const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

    // Data fetching
    const {
        data: activities,
        isLoading: isLoadingActivities,
        error: activitiesError,
        refetch: refetchActivities
    } = useActivities(true); // Include disabled activities

    const {
        data: locations,
        isLoading: isLoadingLocations,
    } = useLocations();

    // Mutations
    const updateActivity = useUpdateActivity();
    const deleteActivity = useDeleteActivity();
    const createDefaultActivities = useCreateDefaultActivities();

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

    // Calculate usage statistics for each activity
    const getActivityUsage = (activityId: string) => {
        if (!locations) return { count: 0, locationNames: [] };

        const usingLocations = locations.filter(location =>
            location.acts && location.acts.includes(activityId)
        );

        return {
            count: usingLocations.length,
            locationNames: usingLocations.map(loc => loc.n)
        };
    };

    // Handle activity enable/disable
    const handleToggleActivity = async (activityId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'disable' : 'enable';
        const usage = getActivityUsage(activityId);

        // Show warning if disabling an activity that's in use
        if (currentStatus && usage.count > 0) {
            const confirmMessage = `This activity is currently used by ${usage.count} location(s): ${usage.locationNames.slice(0, 3).join(', ')}${usage.count > 3 ? ` and ${usage.count - 3} more` : ''}. Disabling it will prevent new check-ins for this activity at these locations. Continue?`;

            if (!confirm(confirmMessage)) {
                return;
            }
        }

        info(`${action === 'enable' ? 'Enabling' : 'Disabling'} activity...`, 'Activity Status');

        try {
            await updateActivity.mutateAsync({
                id: activityId,
                data: { en: !currentStatus }
            });

            success(
                `Activity ${action}d successfully!${usage.count > 0 ? ` This affects ${usage.count} location(s).` : ''}`,
                'Activity Updated'
            );

        } catch (err) {
            console.error('Activity toggle error:', err);
            const errorMessage = err instanceof Error ? err.message : `Failed to ${action} activity`;
            error(errorMessage, 'Update Failed');
        }
    };

    // Handle activity deletion
    const handleDeleteActivity = async (activityId: string, activityName: string) => {
        const usage = getActivityUsage(activityId);

        // Prevent deletion if activity is in use
        if (usage.count > 0) {
            error(
                `Cannot delete "${activityName}" because it's currently used by ${usage.count} location(s): ${usage.locationNames.slice(0, 3).join(', ')}${usage.count > 3 ? ` and ${usage.count - 3} more` : ''}. Please remove it from all locations first.`,
                'Cannot Delete Activity'
            );
            return;
        }

        if (!confirm(`Are you sure you want to delete "${activityName}"? This action cannot be undone.`)) {
            return;
        }

        info(`Deleting activity "${activityName}"...`, 'Activity Deletion');

        try {
            await deleteActivity.mutateAsync(activityId);

            success(
                `Activity "${activityName}" has been deleted successfully.`,
                'Activity Deleted'
            );

        } catch (err) {
            console.error('Activity deletion error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete activity';
            error(errorMessage, 'Deletion Failed');
        }
    };

    // Handle creating default activities
    const handleCreateDefaults = async () => {
        info('Creating default activities...', 'Activity Creation');

        try {
            await createDefaultActivities.mutateAsync();

            success(
                'Default activities created successfully!',
                'Activities Created'
            );

        } catch (err) {
            console.error('Create defaults error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create default activities';
            error(errorMessage, 'Creation Failed');
        }
    };

    // Filter activities based on current filter
    const filteredActivities = activities?.filter(activity => {
        if (filter === 'enabled') return activity.en;
        if (filter === 'disabled') return !activity.en;
        return true;
    }) || [];

    // Loading state
    if (isAuthLoading || isLoadingActivities || isLoadingLocations) {
        return (
            <div className="min-h-screen">
                <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton variant="text" width="200px" height={32} />
                        <div className="flex space-x-2">
                            <Skeleton width={120} height={40} variant="rounded" />
                            <Skeleton width={120} height={40} variant="rounded" />
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} width={80} height={32} variant="rounded" />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Card key={index} className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Skeleton circle width={48} height={48} />
                                            <div className="space-y-1">
                                                <Skeleton variant="text" width="100px" />
                                                <Skeleton variant="text" width="60px" height={20} />
                                            </div>
                                        </div>
                                        <Skeleton width={44} height={24} variant="rounded" />
                                    </div>
                                    <Skeleton variant="text" width="80px" height={16} />
                                    <div className="flex space-x-2">
                                        <Skeleton width={60} height={32} variant="rounded" />
                                        <Skeleton width={60} height={32} variant="rounded" />
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
    if (activitiesError) {
        return (
            <ErrorDisplay
                title="Failed to Load Activities"
                message="Unable to load the activities. Please try again."
                error={activitiesError}
                onRetry={refetchActivities}
                onGoHome={() => router.push('/super-admin')}
            />
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <PageHeader
                    title="Manage Activities"
                    description="Create and manage activities for location check-ins"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/super-admin' },
                        { label: 'Activities', current: true }
                    ]}
                    actions={
                        <div className="flex space-x-2">
                            {(!activities || activities.length === 0) && (
                                <Button
                                    variant="outline"
                                    onClick={handleCreateDefaults}
                                    className="flex items-center gap-2"
                                >
                                    <Settings className="h-4 w-4" />
                                    Create Defaults
                                </Button>
                            )}
                            <Button
                                onClick={() => router.push('/super-admin/activities/new')}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Activity
                            </Button>
                        </div>
                    }
                />

                {/* Filter Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                    {[
                        { key: 'all', label: 'All Activities' },
                        { key: 'enabled', label: 'Enabled' },
                        { key: 'disabled', label: 'Disabled' }
                    ].map((tab) => (
                        <TouchTarget
                            key={tab.key}
                            onClick={() => setFilter(tab.key as typeof filter)}
                            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: filter === tab.key ? 'white' : 'transparent',
                                color: filter === tab.key ? '#1f2937' : '#6b7280',
                                boxShadow: filter === tab.key ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
                            }}
                        >
                            {tab.label} ({activities?.filter(a =>
                                tab.key === 'all' ? true :
                                    tab.key === 'enabled' ? a.en : !a.en
                            ).length || 0})
                        </TouchTarget>
                    ))}
                </div>

                {/* Activities Grid */}
                {filteredActivities.length === 0 ? (
                    <EmptyState
                        icon={<EmptyActivityIcon className="h-12 w-12" />}
                        title={filter === 'all' ? "No activities found" : `No ${filter} activities`}
                        description={
                            filter === 'all'
                                ? "Get started by creating your first activity or use the default activities."
                                : `There are currently no ${filter} activities.`
                        }
                        actionLabel={filter === 'all' ? "Create Activity" : "View All Activities"}
                        onAction={() => {
                            if (filter === 'all') {
                                router.push('/super-admin/activities/new');
                            } else {
                                setFilter('all');
                            }
                        }}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredActivities.map((activity) => {
                            const usage = getActivityUsage(activity.id);

                            return (
                                <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <ActivityIconCircle activity={activity} />
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {activity.n}
                                                    </h3>
                                                    <Badge
                                                        variant={activity.en ? "success" : "outline"}
                                                        size="sm"
                                                    >
                                                        {activity.en ? "Enabled" : "Disabled"}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <Switch
                                                checked={activity.en}
                                                onCheckedChange={() => handleToggleActivity(activity.id, activity.en)}
                                                size="sm"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                                <TrendingUp className="h-4 w-4 mr-1" />
                                                Used by {usage.count} location{usage.count !== 1 ? 's' : ''}
                                            </div>
                                            {usage.count > 0 && (
                                                <p className="text-xs text-gray-500">
                                                    {usage.locationNames.slice(0, 2).join(', ')}
                                                    {usage.count > 2 && ` and ${usage.count - 2} more`}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex space-x-2">
                                            <Link href={`/super-admin/activities/${activity.id}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Edit3 className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteActivity(activity.id, activity.n)}
                                                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                                disabled={usage.count > 0}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Summary Stats */}
                {activities && activities.length > 0 && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Activity Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {activities.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Activities</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {activities.filter(a => a.en).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Enabled</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-600">
                                        {activities.filter(a => !a.en).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Disabled</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {activities.reduce((total, activity) =>
                                            total + getActivityUsage(activity.id).count, 0
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">Location Assignments</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
