'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { Icon } from '../icon/icon';
import { cn } from '@/lib/utils/ui';

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    root: 'h-8 w-8',
    fallback: 'text-xs',
  },
  md: {
    root: 'h-10 w-10',
    fallback: 'text-sm',
  },
  lg: {
    root: 'h-16 w-16',
    fallback: 'text-lg',
  },
};

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = 'md', ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'avatar relative flex shrink-0 overflow-hidden rounded-full',
      sizeClasses[size].root,
      className
    )}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

type AvatarImageProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('avatar-image aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = 'AvatarImage';

interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, size = 'md', icon, children, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'avatar-fallback flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-700',
      sizeClasses[size].fallback,
      className
    )}
    {...props}
  >
    {icon ? <Icon name={icon} size={size} /> : children}
  </AvatarPrimitive.Fallback>
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };