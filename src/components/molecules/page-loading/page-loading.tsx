
'use client';

import * as React from 'react';

import { Card, CardContent } from '@/components/atoms/card/card';

import { LoadingSpinner } from '@/components/atoms/loading-spinner/loading-spinner';

interface PageLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
  fullScreen = true,
}) => {
  const containerClasses = fullScreen
    ? 'flex items-center justify-center min-h-screen bg-gray-100'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" message={message} />
        </CardContent>
      </Card>
    </div>
  );
};