'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { LuGift as Gift, LuPenLine as PenLine, LuPlus as Plus, LuTrash2 as Trash2, LuTrendingUp as TrendingUp } from 'react-icons/lu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip/tooltip';
import { useCreateReward, useDeleteReward, useGlobalRewards, useUpdateReward } from '@/hooks/useReward';
import { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/button/button';
import { EmptyState } from '@/components/molecules/empty-state/empty-state';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { Icon } from '@/components/atoms/icon/icon';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { RewardForm } from '@/components/organisms/reward-form/reward-form';
import { Skeleton } from '@/components/atoms/skeleton/skeleton';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToastNotifications } from '@/hooks/useToast';

export default function SuperAdminGlobalRewards() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
    const { success, error, info } = useToastNotifications();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingReward, setEditingReward] = useState<string | null>(null);

    // Data fetching
    const {
        data: rewards,
        isLoading: isLoadingRewards,
        error: rewardsError,
        refetch: refetchRewards
    } = useGlobalRewards();

    // Mutations
    const createReward = useCreateReward();
    const updateReward = useUpdateReward();
    const deleteReward = useDeleteReward();

    // Check authentication and admin status
    useEffect(() => {
        if (!isAuthLoading) {
            if (!isAuthenticated || !user?.isSuperAdmin) {
                router.push('/super-admin/login');
                return;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, isAuthLoading, user]);

    // Handle reward creation
    const handleCreateReward = async (data: {
        count: number;
        name: string;
        icon: string;
    }) => {
        info('Creating global reward...', 'Reward Creation');

        try {
            await createReward.mutateAsync({
                count: data.count,
                name: data.name,
                icon: data.icon,
                type: 'global',
            });

            success(
                `Global reward "${data.name}" created successfully! Athletes will earn this reward after ${data.count} check-ins.`,
                'Reward Created'
            );

            setShowCreateForm(false);

        } catch (err) {
            console.error('Reward creation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create reward';
            error(errorMessage, 'Creation Failed');
            throw err; // Let the form handle the error state
        }
    };

    // Handle reward update
    const handleUpdateReward = async (data: {
        count: number;
        name: string;
        icon: string;
    }) => {
        if (!editingReward) return;

        info('Updating global reward...', 'Reward Update');

        try {
            await updateReward.mutateAsync({
                id: editingReward,
                data: {
                    cnt: data.count,
                    n: data.name,
                    i: data.icon,
                }
            });

            success(
                `Global reward "${data.name}" updated successfully!`,
                'Reward Updated'
            );

            setEditingReward(null);

        } catch (err) {
            console.error('Reward update error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to update reward';
            error(errorMessage, 'Update Failed');
            throw err; // Let the form handle the error state
        }
    };

    // Handle reward deletion
    const handleDeleteReward = async (rewardId: string, rewardName: string) => {
        if (!confirm(`Are you sure you want to delete "${rewardName}"? This action cannot be undone and will affect all athletes who have claimed or are working towards this reward.`)) {
            return;
        }

        info(`Deleting global reward "${rewardName}"...`, 'Reward Deletion');

        try {
            await deleteReward.mutateAsync(rewardId);

            success(
                `Global reward "${rewardName}" has been deleted successfully.`,
                'Reward Deleted'
            );

        } catch (err) {
            console.error('Reward deletion error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete reward';
            error(errorMessage, 'Deletion Failed');
        }
    };

    // Get reward being edited
    const rewardBeingEdited = editingReward ? rewards?.find(r => r.id === editingReward) : null;

    // Loading state
    if (isAuthLoading || isLoadingRewards) {
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
                                        <div className="flex items-center space-x-3">
                                            <Skeleton circle width={48} height={48} />
                                            <div className="space-y-1">
                                                <Skeleton variant="text" width="100px" />
                                                <Skeleton variant="text" width="60px" height={20} />
                                            </div>
                                        </div>
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
    if (rewardsError) {
        return (
            <ErrorDisplay
                title="Failed to Load Global Rewards"
                message="Unable to load the global rewards. Please try again."
                error={rewardsError}
                onRetry={refetchRewards}
                onGoHome={() => router.push('/super-admin')}
            />
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <PageHeader
                    title="Manage Global Rewards"
                    description="Create and manage global rewards that athletes earn across all host locations"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/super-admin' },
                        { label: 'Global Rewards', current: true }
                    ]}
                    actions={
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Global Reward
                        </Button>
                    }
                />

                {/* Create Reward Form */}
                {showCreateForm && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Create New Global Reward</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RewardForm
                                onSubmit={handleCreateReward}
                                onCancel={() => setShowCreateForm(false)}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Edit Reward Form */}
                {editingReward && rewardBeingEdited && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Edit Global Reward</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RewardForm
                                defaultValues={{
                                    count: rewardBeingEdited.cnt,
                                    name: rewardBeingEdited.n,
                                    icon: rewardBeingEdited.i,
                                }}
                                isEdit={true}
                                onSubmit={handleUpdateReward}
                                onCancel={() => setEditingReward(null)}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Rewards Grid */}
                {!rewards || rewards.length === 0 ? (
                    <EmptyState
                        icon={<Gift className="h-12 w-12" />}
                        title="No global rewards found"
                        description="Get started by creating your first global reward that athletes can earn across all host locations."
                        actionLabel="Create Global Reward"
                        onAction={() => setShowCreateForm(true)}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rewards.sort((a, b) => a.cnt - b.cnt).map((reward) => (
                            <Card key={reward.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-primary rounded-full">
                                                <Icon name={reward.i} variant="reward" size="lg" className="text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {reward.n}
                                                </h3>
                                                {/* <Badge variant="default" size="sm" className="mt-1">
                                                    Global Reward
                                                </Badge> */}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex items-center text-sm text-gray-600 mb-1">
                                            <TrendingUp className="h-4 w-4 mr-1" />
                                            Earned after {reward.cnt} check-ins
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Created: {new Date(reward.c * 1000).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex space-x-2">
                                        <TouchTarget
                                            onClick={() => setEditingReward(reward.id)}
                                            className="flex-1"
                                        >
                                            <Button variant="outline" size="sm" className="w-full">
                                                <PenLine className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </TouchTarget>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <TouchTarget onClick={() => handleDeleteReward(reward.id, reward.n)}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TouchTarget>
                                            </TooltipTrigger>
                                            <TooltipContent align='end'>
                                                Delete global reward
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Summary Stats */}
                {/* {rewards && rewards.length > 0 && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Global Rewards Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {rewards.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Global Rewards</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {Math.min(...rewards.map(r => r.cnt))}
                                    </div>
                                    <div className="text-sm text-gray-600">Lowest Requirement</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {Math.max(...rewards.map(r => r.cnt))}
                                    </div>
                                    <div className="text-sm text-gray-600">Highest Requirement</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {Math.round(rewards.reduce((sum, r) => sum + r.cnt, 0) / rewards.length)}
                                    </div>
                                    <div className="text-sm text-gray-600">Average Requirement</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )} */}

                {/* Help Section */}
                <div className="mt-6 bg-blue-50 border-1 border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Global Rewards Guidelines
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Global rewards are earned by athletes through check-ins at any host location</li>
                                    <li>Set meaningful check-in requirements that encourage regular participation</li>
                                    <li>Choose clear, descriptive names and appropriate icons for better recognition</li>
                                    <li>Consider creating a progression of rewards with increasing requirements</li>
                                    <li>Deleting rewards will affect all athletes who have claimed or are working towards them</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
