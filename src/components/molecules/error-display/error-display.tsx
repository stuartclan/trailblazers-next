// src/components/molecules/error-display/error-display.tsx
'use client';

import * as React from 'react';

import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';

import { Alert } from '@/components/atoms/alert/alert';
import { Button } from '@/components/atoms/button/button';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  onGoHome?: () => void;
  fullScreen?: boolean;
  showRetry?: boolean;
  showGoHome?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  onGoHome,
  fullScreen = true,
  showRetry = true,
  showGoHome = true,
}) => {
  const containerClasses = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center py-8';

  const errorMessage = message || (error instanceof Error ? error.message : error) || 'An unexpected error occurred';

  return (
    <div className={containerClasses}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="error">
            {errorMessage}
          </Alert>

          <div className="flex flex-col gap-2">
            {showRetry && onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {showGoHome && onGoHome && (
              <Button variant="outline" onClick={onGoHome} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
