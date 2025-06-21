'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';

import { ActivityForm } from '@/components/organisms/activity-form/activity-form';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { Skeleton } from '@/components/atoms/skeleton/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useCreateActivity } from '@/hooks/useActivity';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToastNotifications } from '@/hooks/useToast';

export default function SuperAdminNewActivity() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading, getUserGroup } = useAuth();
    const { success, error, info } = useToastNotifications();

    // Mutations
    const createActivity = useCreateActivity();

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

    // Handle activity creation
    const handleCreateActivity = async (data: {
        name: string;
        icon: string;
        enabled: boolean;
    }) => {
        info('Creating activity...', 'Activity Creation');

        try {
            const newActivity = await createActivity.mutateAsync({
                name: data.name,
                icon: data.icon,
                enabled: data.enabled,
            });

            success(
                `Activity "${data.name}" created successfully! You can now assign it to locations.`,
                'Activity Created'
            );

            // Redirect to the new activity's edit page
            router.push(`/super-admin/activities/${newActivity.id}`);

        } catch (err) {
            console.error('Activity creation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create activity';
            error(errorMessage, 'Creation Failed');
            throw err; // Let the form handle the error state
        }
    };

    // Handle cancel
    const handleCancel = () => {
        router.push('/super-admin/activities');
    };

    // Loading state
    if (isAuthLoading) {
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
                            {Array.from({ length: 3 }).map((_, index) => (
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

    return (
        <div className="min-h-screen">
            <div className="container max-w-2xl mx-auto px-4 py-8">
                <PageHeader
                    title="Create New Activity"
                    description="Add a new activity that can be assigned to locations"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/super-admin' },
                        { label: 'Activities', href: '/super-admin/activities' },
                        { label: 'New Activity', current: true }
                    ]}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Activity Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ActivityForm
                            onSubmit={handleCreateActivity}
                            onCancel={handleCancel}
                        />
                    </CardContent>
                </Card>

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
                                Activity Creation Guidelines
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Choose a clear, descriptive name that athletes will easily recognize</li>
                                    <li>Select an icon that visually represents the activity</li>
                                    <li>Activities can be enabled or disabled globally</li>
                                    <li>Only enabled activities can be assigned to locations</li>
                                    <li>Once created, activities can be assigned to multiple locations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
