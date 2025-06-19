'use client';

import './card.scss';

import * as React from 'react';

import { cn } from '@/lib/utils/ui';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'filled';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'card rounded-lg shadow-sm',
        variant === 'default' && 'bg-white',
        variant === 'outline' && 'border-1 border-gray-200 bg-transparent',
        variant === 'filled' && 'bg-gray-50',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('card__header flex flex-row justify-between items-center space-x-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('card__title text-primary text-xl font-semibold leading-none', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

type CardSubTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const CardSubTitle = React.forwardRef<HTMLHeadingElement, CardSubTitleProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-gray-600 mt-2 font-normal', className)}
      {...props}
    />
  )
);
CardSubTitle.displayName = 'CardSubTitle';

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('card__description text-sm text-gray-500', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

type CardContentProps = React.HTMLAttributes<HTMLDivElement>

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('card-content p-6 pt-0', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('card-footer flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardSubTitle, CardDescription, CardContent, CardFooter };