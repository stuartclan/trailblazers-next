'use client';

import * as React from 'react';

import { Button, ButtonProps } from '@/components/atoms/button/button';

import { cn } from '@/lib/utils/ui';

interface TouchButtonProps extends ButtonProps {
  ripple?: boolean;
  haptic?: boolean;
}

export const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, ripple = true, haptic = false, onClick, children, ...props }, ref) => {
    const [rippleEffect, setRippleEffect] = React.useState<{ x: number; y: number; id: number } | null>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Add haptic feedback for mobile devices
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }

      // Create ripple effect
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setRippleEffect({ x, y, id: Date.now() });
        
        // Remove ripple after animation
        setTimeout(() => setRippleEffect(null), 600);
      }

      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'relative overflow-hidden min-h-[44px] min-w-[44px]', // Touch target size
          'touch-manipulation', // Optimize for touch
          'select-none', // Prevent text selection
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        
        {/* Ripple effect */}
        {rippleEffect && (
          <span
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
            style={{
              left: rippleEffect.x - 10,
              top: rippleEffect.y - 10,
              width: 20,
              height: 20,
            }}
          />
        )}
      </Button>
    );
  }
);

TouchButton.displayName = 'TouchButton';
