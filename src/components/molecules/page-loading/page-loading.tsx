'use client';

import * as React from 'react';

import { Card, CardContent } from '@/components/atoms/card/card';
import { Skeleton, SkeletonCard } from '@/components/atoms/skeleton/skeleton';

interface PageLoadingProps {
  message?: string;
  fullScreen?: boolean;
  variant?: 'spinner' | 'skeleton';
  skeletonType?: 'form' | 'table' | 'cards' | 'dashboard';
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
  fullScreen = true,
  variant = 'skeleton',
  skeletonType = 'cards',
}) => {
  const containerClasses = fullScreen
    ? 'flex items-center justify-center min-h-screen bg-gray-100'
    : 'flex items-center justify-center py-8';

  if (variant === 'spinner') {
    return (
      <div className={containerClasses}>
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">{message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderSkeleton = () => {
    switch (skeletonType) {
      case 'form':
        return (
          <div className="w-full max-w-2xl space-y-6">
            <div className="space-y-2">
              <Skeleton variant="text" width="40%" height={32} />
              <Skeleton variant="text" width="60%" height={20} />
            </div>
            
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton variant="text" width="25%" height={16} />
                <Skeleton height={40} variant="rounded" />
              </div>
            ))}
            
            <div className="flex space-x-3 pt-4">
              <Skeleton width={100} height={40} variant="rounded" />
              <Skeleton width={120} height={40} variant="rounded" />
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="w-full max-w-4xl">
            <div className="mb-6">
              <Skeleton variant="text" width="30%" height={32} />
              <Skeleton variant="text" width="50%" height={20} className="mt-2" />
            </div>
            
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <Skeleton variant="text" width="25%" height={24} />
                  <Skeleton width={120} height={36} variant="rounded" />
                </div>
              </div>
              
              <div className="divide-y">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="p-4 flex items-center space-x-4">
                    <Skeleton circle width={40} height={40} />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </div>
                    <Skeleton width={80} height={32} variant="rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="w-full max-w-6xl space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton variant="text" width="300px" height={32} />
                <Skeleton variant="text" width="200px" height={20} />
              </div>
              <Skeleton width={120} height={40} variant="rounded" />
            </div>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center space-x-3">
                    <Skeleton circle width={48} height={48} />
                    <div className="space-y-2">
                      <Skeleton variant="text" width="80px" />
                      <Skeleton variant="text" width="60px" height={24} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonCard showAvatar lines={4} />
              <SkeletonCard lines={5} />
            </div>
          </div>
        );

      case 'cards':
      default:
        return (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} showAvatar={index % 2 === 0} lines={3} />
            ))}
          </div>
        );
    }
  };

  return (
    <div className={containerClasses}>
      {renderSkeleton()}
    </div>
  );
};
