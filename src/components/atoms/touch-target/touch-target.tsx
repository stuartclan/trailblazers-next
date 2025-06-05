'use client';

import * as React from 'react';

import { cn } from '@/lib/utils/ui';

interface TouchTargetProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Minimum touch target size (defaults to 44px for accessibility)
   */
  minSize?: number;
  /**
   * Whether to show ripple effect on touch
   */
  ripple?: boolean;
  /**
   * Whether to provide haptic feedback on touch
   */
  haptic?: boolean;
  /**
   * Whether the target is disabled
   */
  disabled?: boolean;
  /**
   * Custom ripple color
   */
  rippleColor?: string;
}

const TouchTarget = React.forwardRef<HTMLDivElement, TouchTargetProps>(
  ({ 
    className, 
    children, 
    minSize = 44, 
    ripple = true, 
    haptic = false, 
    disabled = false,
    rippleColor = 'rgba(255, 255, 255, 0.3)',
    onClick,
    onTouchStart,
    ...props 
  }, ref) => {
    const [rippleEffect, setRippleEffect] = React.useState<{
      x: number;
      y: number;
      id: number;
    } | null>(null);

    const handleTouch = (e: React.TouchEvent<HTMLDivElement>) => {
      if (disabled) return;

      // Add haptic feedback
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }

      // Create ripple effect
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        setRippleEffect({ x, y, id: Date.now() });
        
        // Remove ripple after animation
        setTimeout(() => setRippleEffect(null), 600);
      }

      onTouchStart?.(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;

      // Create ripple effect for mouse clicks too
      if (ripple && !rippleEffect) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setRippleEffect({ x, y, id: Date.now() });
        setTimeout(() => setRippleEffect(null), 600);
      }

      onClick?.(e);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden select-none touch-manipulation',
          'active:scale-95 transition-transform duration-75',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        style={{
          minWidth: `${minSize}px`,
          minHeight: `${minSize}px`,
        }}
        onTouchStart={handleTouch}
        onClick={handleClick}
        {...props}
      >
        {children}
        
        {/* Ripple effect */}
        {rippleEffect && (
          <span
            className="absolute rounded-full pointer-events-none animate-ping"
            style={{
              left: rippleEffect.x - 10,
              top: rippleEffect.y - 10,
              width: 20,
              height: 20,
              backgroundColor: rippleColor,
            }}
          />
        )}
      </div>
    );
  }
);

TouchTarget.displayName = 'TouchTarget';

// Export all components
export { TouchTarget };