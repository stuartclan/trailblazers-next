'use client';

import { Activity, Calendar, MapPin, TrendingUp, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/atoms/badge/badge';
import { Button } from '@/components/atoms/button/button';
import { EmptyState } from '@/components/molecules/empty-state/empty-state';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { Select } from '@/components/atoms/select/select';
import { Skeleton } from '@/components/atoms/skeleton/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useHosts } from '@/hooks/useHost';
import { useLocations } from '@/hooks/useLocation';
import { useRouter } from 'next/navigation';
import { useToastNotifications } from '@/hooks/useToast';

// TODO: Not sure the purpose of this page

// Mock analytics data - in a real implementation, this would come from API calls
const generateMockAnalytics = (locations: any[], hosts: any[]) => {
    if (!locations || locations.length === 0) return null;

    // Generate mock data for demonstration
    const locationStats = locations.map(location => ({
        id: location.id,
        name: location.n,
        hostName: hosts?.find(h => h.id === location.hid)?.n || 'Unknown',
        totalCheckIns: Math.floor(Math.random() * 500) + 50,
        uniqueAthletes: Math.floor(Math.random() * 100) + 20,
        activitiesCount: location.acts?.length || 0,
        averageCheckInsPerWeek: Math.floor(Math.random() * 50) + 10,
        lastCheckIn: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        topActivity: location.acts?.[0] || null,
    }));

    const totalCheckIns = locationStats.reduce((sum, loc) => sum + loc.totalCheckIns, 0);
    const totalUniqueAthletes = locationStats.reduce((sum, loc) => sum + loc.uniqueAthletes, 0);
    const averageActivitiesPerLocation = locationStats.reduce((sum, loc) => sum + loc.activitiesCount, 0) / locations.length;

    // Mock weekly trend data
    const weeklyTrends = Array.from({ length: 8 }, (_, i) => ({
        week: `Week ${i + 1}`,
        checkIns: Math.floor(Math.random() * 200) + 100,
        athletes: Math.floor(Math.random() * 50) + 25,
    }));

    // Mock host performance data
    const hostPerformance = hosts?.map(host => {
        const hostLocations = locations.filter(loc => loc.hid === host.id);
        const hostStats = locationStats.filter(stat => hostLocations.some(loc => loc.id === stat.id));

        return {
            hostId: host.id,
            hostName: host.n,
            locationCount: hostLocations.length,
            totalCheckIns: hostStats.reduce((sum, stat) => sum + stat.totalCheckIns, 0),
            avgCheckInsPerLocation: hostStats.length > 0
                ? Math.round(hostStats.reduce((sum, stat) => sum + stat.totalCheckIns, 0) / hostStats.length)
                : 0,
        };
    }).filter(host => host.locationCount > 0) || [];

    return {
        overview: {
            totalCheckIns,
            totalUniqueAthletes,
            totalLocations: locations.length,
            averageActivitiesPerLocation: Math.round(averageActivitiesPerLocation * 10) / 10,
        },
        locationStats,
        weeklyTrends,
        hostPerformance,
    };
};

export default function SuperAdminLocationAnalytics() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading, getUserGroup } = useAuth();
    const { success, error, info } = useToastNotifications();

    const [selectedHost, setSelectedHost] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');

    // Data fetching
    const {
        data: locations,
        isLoading: isLoadingLocations,
        error: locationsError,
    } = useLocations();

    const {
        data: hosts,
        isLoading: isLoadingHosts,
        error: hostsError,
    } = useHosts();

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

    // Filter locations by selected host
    const filteredLocations = selectedHost === 'all'
        ? locations || []
        : (locations || []).filter(loc => loc.hid === selectedHost);

    // Generate analytics data
    const analytics = generateMockAnalytics(filteredLocations, hosts || []);

    // Loading state
    if (isAuthLoading || isLoadingLocations || isLoadingHosts) {
        return (
            <div className="min-h-screen">
                <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
                    <div className="space-y-2">
                        <Skeleton variant="text" width="250px" height={32} />
                        <Skeleton variant="text" width="350px" height={20} />
                    </div>

                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Card key={index} className="p-6">
                                <div className="flex items-center space-x-4">
                                    <Skeleton circle width={48} height={48} />
                                    <div className="space-y-2">
                                        <Skeleton variant="text" width="60px" height={24} />
                                        <Skeleton variant="text" width="80px" height={16} />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <Skeleton variant="text" width="200px" height={24} className="mb-4" />
                            <Skeleton height={300} variant="rounded" />
                        </Card>
                        <Card className="p-6">
                            <Skeleton variant="text" width="200px" height={24} className="mb-4" />
                            <Skeleton height={300} variant="rounded" />
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (locationsError || hostsError) {
        return (
            <ErrorDisplay
                title="Failed to Load Analytics"
                message="Unable to load location analytics data. Please try again."
                error={locationsError || hostsError}
                onGoHome={() => router.push('/super-admin')}
            />
        );
    }

    // No data state
    if (!analytics || filteredLocations.length === 0) {
        return (
            <div className="min-h-screen">
                <div className="container max-w-7xl mx-auto px-4 py-8">
                    <PageHeader
                        title="Location Analytics"
                        description="Analyze location performance and usage statistics"
                        breadcrumbs={[
                            { label: 'Dashboard', href: '/super-admin' },
                            { label: 'Locations', href: '/super-admin/locations' },
                            { label: 'Analytics', current: true }
                        ]}
                    />

                    <EmptyState
                        icon={<TrendingUp className="h-12 w-12" />}
                        title="No location data available"
                        description="Create some locations and collect check-in data to see analytics."
                        actionLabel="Go to Locations"
                        onAction={() => router.push('/super-admin/locations')}
                    />
                </div>
            </div>
        );
    }

    // Chart colors
    const chartColors = ['#b73e00', '#c68565', '#8b380d', '#f59e0b', '#10b981'];

    return (
        <div className="min-h-screen">
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <PageHeader
                    title="Location Analytics"
                    description="Analyze location performance and usage statistics"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/super-admin' },
                        { label: 'Locations', href: '/super-admin/locations' },
                        { label: 'Analytics', current: true }
                    ]}
                    actions={
                        <div className="flex space-x-3">
                            <Select
                                options={[
                                    { value: 'all', label: 'All Hosts' },
                                    ...(hosts || []).map(host => ({
                                        value: host.id,
                                        label: host.n
                                    }))
                                ]}
                                value={selectedHost}
                                onValueChange={setSelectedHost}
                                placeholder="Filter by host"
                            />
                            <Select
                                options={[
                                    { value: '7d', label: 'Last 7 days' },
                                    { value: '30d', label: 'Last 30 days' },
                                    { value: '90d', label: 'Last 90 days' },
                                    { value: '1y', label: 'Last year' },
                                ]}
                                value={selectedPeriod}
                                onValueChange={setSelectedPeriod}
                                placeholder="Select period"
                            />
                        </div>
                    }
                />

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-primary-light rounded-lg">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {analytics.overview.totalCheckIns.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Check-ins</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {analytics.overview.totalUniqueAthletes.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Unique Athletes</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <MapPin className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {analytics.overview.totalLocations}
                                    </div>
                                    <div className="text-sm text-gray-600">Active Locations</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Activity className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {analytics.overview.averageActivitiesPerLocation}
                                    </div>
                                    <div className="text-sm text-gray-600">Avg Activities/Location</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Weekly Trends Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Check-in Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analytics.weeklyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="checkIns"
                                        stroke={chartColors[0]}
                                        strokeWidth={2}
                                        name="Check-ins"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="athletes"
                                        stroke={chartColors[1]}
                                        strokeWidth={2}
                                        name="Athletes"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Host Performance Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Host Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analytics.hostPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hostName" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="totalCheckIns" fill={chartColors[0]} name="Total Check-ins" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Location Performance Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Location Performance Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Host</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-700">Check-ins</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-700">Athletes</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-700">Activities</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-700">Weekly Avg</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Last Check-in</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.locationStats
                                        .sort((a, b) => b.totalCheckIns - a.totalCheckIns)
                                        .map((location) => (
                                            <tr key={location.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-gray-900">{location.name}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="outline" size="sm">
                                                        {location.hostName}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium">
                                                    {location.totalCheckIns.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {location.uniqueAthletes}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {location.activitiesCount}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {location.averageCheckInsPerWeek}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {location.lastCheckIn.toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/super-admin/locations/${location.id}`)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Note about demo data */}
                <div className="mt-6 bg-amber-50 border-1 border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">
                                Demo Data Notice
                            </h3>
                            <p className="mt-1 text-sm text-amber-700">
                                This analytics dashboard currently displays mock data for demonstration purposes.
                                In a production environment, this would be connected to real check-in data from the database.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
