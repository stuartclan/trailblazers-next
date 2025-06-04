'use client';

import * as React from 'react';

import { cn } from '@/lib/utils/ui';

interface MobileSafeAreaProps {
  children: React.ReactNode;
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export const MobileSafeArea: React.FC<MobileSafeAreaProps> = ({
  children,
  top = true,
  bottom = true,
  className
}) => {
  return (
    <div
      className={cn(
        'min-h-screen',
        top && 'pt-safe-top',
        bottom && 'pb-safe-bottom md:pb-0',
        className
      )}
      style={{
        paddingTop: top ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: bottom ? 'calc(env(safe-area-inset-bottom) + 60px)' : undefined,
      }}
    >
      {children}
    </div>
  );
};