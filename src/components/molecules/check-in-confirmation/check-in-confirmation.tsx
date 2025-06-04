// src/components/molecules/check-in-confirmation/check-in-confirmation.tsx
'use client';

import * as React from 'react';

import { ActivityEntity, AthleteEntity, LocationEntity, PetEntity } from '@/lib/db/entities/types';
import { Calendar, CheckCircle, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';

import { Button } from '@/components/atoms/button/button';
import { Icon } from '@/components/atoms/icon/icon';
import { formatDateTime } from '@/lib/utils/dates';

interface CheckInConfirmationProps {
  athlete: AthleteEntity;
  activity: ActivityEntity;
  location: LocationEntity;
  pet?: PetEntity;
  timestamp: number;
  onNewCheckIn?: () => void;
  onViewHistory?: () => void;
  className?: string;
}

/**
 * Component to display check-in confirmation with details
 */
export const CheckInConfirmation: React.FC<CheckInConfirmationProps> = ({
  athlete,
  activity,
  location,
  pet,
  timestamp,
  onNewCheckIn,
  onViewHistory,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-xl text-green-600">
          Check-in Successful!
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Athlete Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
          <User className="h-5 w-5 text-gray-600" />
          <div>
            <p className="font-medium">
              {athlete.fn} {athlete.mi && athlete.mi + '. '}{athlete.ln}
            </p>
            <p className="text-sm text-gray-600">{athlete.e}</p>
          </div>
        </div>

        {/* Pet Info (if applicable) */}
        {pet && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md">
            <Icon name="pets" className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Pet Check-in</p>
              <p className="text-sm text-blue-600">{pet.n} also checked in!</p>
            </div>
          </div>
        )}

        {/* Activity Info */}
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-md">
          <Icon name={activity.i} className="h-5 w-5 text-purple-600" />
          <div>
            <p className="font-medium text-purple-800">Activity</p>
            <p className="text-sm text-purple-600">{activity.n}</p>
          </div>
        </div>

        {/* Location Info */}
        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-md">
          <MapPin className="h-5 w-5 text-orange-600" />
          <div>
            <p className="font-medium text-orange-800">Location</p>
            <p className="text-sm text-orange-600">{location.n}</p>
            <p className="text-xs text-orange-500">{location.a}</p>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
          <Calendar className="h-5 w-5 text-gray-600" />
          <div>
            <p className="font-medium">Check-in Time</p>
            <p className="text-sm text-gray-600">{formatDateTime(timestamp)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {onNewCheckIn && (
            <Button 
              onClick={onNewCheckIn}
              className="flex-1"
            >
              New Check-in
            </Button>
          )}
          {onViewHistory && (
            <Button 
              variant="outline"
              onClick={onViewHistory}
              className="flex-1"
            >
              View History
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> You can only check in once per week at each location. 
            Keep track of your progress toward rewards in the host admin area.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};