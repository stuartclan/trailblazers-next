'use client';

import * as React from 'react';

import { ActivityEntity } from '@/lib/db/entities/types';
import { Icon } from '@/components/atoms/icon/icon';
import { SkeletonActivitySelector } from '@/components/atoms/skeleton/skeleton';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { cn } from '@/lib/utils/ui';
import { useActivities } from '@/hooks/useActivity';

interface ActivitySelectorProps {
  value?: string | null;
  onChange?: (activityId: string) => void;
  activities?: ActivityEntity[]; // Optional - if provided, will use these instead of fetching
  limit?: number; // Maximum number of activities to show
  gridCols?: 2 | 3 | 4; // Number of columns in the grid
  disabled?: boolean;
  error?: string;
  hideTitle?: boolean;
}

/**
 * A specialized component for selecting activities with enhanced touch interactions
 */
export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  value,
  onChange,
  activities: providedActivities,
  limit = 10,
  gridCols = 3,
  disabled = false,
  error,
  hideTitle = false,
}) => {
  // Fetch activities if not provided
  const { data: fetchedActivities, isLoading } = useActivities(false);
  
  // Use provided activities or fetched ones
  const activities = providedActivities || fetchedActivities || [];

  // Limit the number of activities shown
  const limitedActivities = activities.slice(0, limit);

  // Handle click on an activity
  const handleActivityClick = (activityId: string) => {
    if (!disabled && onChange) {
      onChange(activityId);
    }
  };

  // Define grid column classes
  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[gridCols];

  return (
    <div className="activity-selector">
      {!hideTitle && (
        <div className="mb-3">
          <h3 className="text-lg font-medium">Select Activity</h3>
        </div>
      )}

      {isLoading ? (
        <SkeletonActivitySelector count={limit} />
      ) : activities.length === 0 ? (
        <div className="py-4 text-center text-gray-500">
          No activities available
        </div>
      ) : (
        <div className={cn('grid gap-3', gridColsClass)}>
          {limitedActivities.map((activity) => (
            <TouchTarget
              key={activity.id}
              ripple={true}
              haptic={true}
              disabled={disabled || !activity.en}
              onClick={() => handleActivityClick(activity.id)}
              className={cn(
                'flex flex-col items-center justify-center p-4 border-1 rounded-lg transition-all duration-200',
                'hover:shadow-md active:scale-98',
                value === activity.id
                  ? 'bg-primary-light border-primary text-primary shadow-md'
                  : 'bg-white hover:bg-gray-50 border-gray-200',
                (disabled || !activity.en) && 'opacity-60 cursor-not-allowed'
              )}
            >
              <div className="text-2xl mb-2 transition-transform duration-200">
                <Icon 
                  name={activity.i} 
                  size="lg" 
                  color={value === activity.id ? 'primary' : 'inherit'} 
                />
              </div>
              <span className="text-sm font-medium text-center leading-tight">
                {activity.n}
              </span>
            </TouchTarget>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-500">{error}</div>
      )}
    </div>
  );
};