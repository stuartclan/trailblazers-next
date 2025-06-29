'use client';

import * as React from 'react';

import { ActivityEntity, AthleteEntity, CheckInEntity, HostEntity, LocationEntity } from '@/lib/db/entities/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { Icon, IconNames } from '@/components/atoms/icon/icon';
import { LuSearch as Search, LuShirt as ShirtIcon, LuUser as User } from 'react-icons/lu';
import { useCreateCheckIn, useDeleteCheckIn, useUpdateCheckIn } from '@/hooks/useCheckIn';

import { ActivityIconCircle } from '@/components/molecules/activity-icon-circle/activity-icon-circle';
import { Button } from '@/components/atoms/button/button';
import { DisclaimerModal } from '@/components/molecules/disclaimer-modal/disclaimer-modal';
import { Input } from '@/components/atoms/input/input';
import { apiClient } from '@/lib/utils/api-client';
import { cn } from '@/lib/utils/ui';
import { useAthleteSearch } from '@/hooks/useAthlete';
import { useLocationActivities } from '@/hooks/useActivity';
import { useToastNotifications } from '@/hooks/useToast';

interface CheckInFlowProps {
  host: HostEntity;
  location: LocationEntity;
  onNewAthlete?: () => void;
  className?: string;
}

interface AthleteCheckInStatus {
  athlete: AthleteEntity;
  checkInCount: number;
  // hasCheckedInThisWeek: boolean;
  // currentActivity?: ActivityEntity;
  currentCheckIn?: CheckInEntity;
  needsDisclaimer: boolean;
}

export const CheckInFlow: React.FC<CheckInFlowProps> = ({
  host,
  location,
  onNewAthlete,
  className,
}) => {
  const { success, error, info } = useToastNotifications();

  // State management
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');
  const [athleteStatuses, setAthleteStatuses] = React.useState<AthleteCheckInStatus[]>([]);
  const [disclaimerAthlete, setDisclaimerAthlete] = React.useState<AthleteEntity | null>(null);
  const [pendingCheckIn, setPendingCheckIn] = React.useState<{
    athlete: AthleteEntity;
    activity: ActivityEntity;
  } | null>(null);

  // Timers
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const resetTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // Data fetching
  const { data: activities } = useLocationActivities(host.id, location.id);
  const { data: searchResults } = useAthleteSearch(debouncedSearchQuery);

  // Mutations
  const createCheckIn = useCreateCheckIn();
  const updateCheckIn = useUpdateCheckIn();
  const deleteCheckIn = useDeleteCheckIn();

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear existing search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length >= 2) {
      // Set new timeout for search
      searchTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchQuery(query);
      }, 300);
    } else {
      setDebouncedSearchQuery('');
      setAthleteStatuses([]);
    }

    // // Reset the auto-reset timer
    // resetAutoResetTimer();
  };

  // // Auto-reset timer function
  // const resetAutoResetTimer = React.useCallback(() => {
  //   if (resetTimeoutRef.current) {
  //     clearTimeout(resetTimeoutRef.current);
  //   }

  //   resetTimeoutRef.current = setTimeout(() => {
  //     setSearchQuery('');
  //     setDebouncedSearchQuery('');
  //     setAthleteStatuses([]);
  //     info('Search reset due to inactivity');
  //   }, 30000); // 30 seconds
  // }, [info]);

  // Process search results and fetch additional data
  React.useEffect(() => {
    if (!searchResults || !activities) return;

    const processAthletes = async () => {
      const statuses: AthleteCheckInStatus[] = [];

      for (const athlete of searchResults) {
        try {
          const [checkInCountResponse, lastCheckIn] = await Promise.all([
            // Fetch check-in count
            apiClient.get<{ count: number }>(`/api/athletes/${athlete.id}/checkins/count`),
            // // Last check-in for this host:
            // apiClient.get<{ hasCheckedIn: boolean }>(`/api/athletes/${athlete.id}/checkins/recent?hostId=${host.id}`),
            // Get last check-in
            apiClient.get<any[]>(`/api/athletes/${athlete.id}/checkins?limit=1`),
          ]);
          const checkInCount = checkInCountResponse.data?.count || 0;

          // // // Check if checked in this week at this host
          // // const recentCheckInResponse = await apiClient.get<{ hasCheckedIn: boolean }>(
          // //   `/api/athletes/${athlete.id}/checkins/recent?hostId=${host.id}`
          // // );
          // // const hasCheckedInThisWeek = recentCheckInResponse.data?.hasCheckedIn || false;
          // const lastCheckIn = await apiClient.get<any[]>(
          //   `/api/athletes/${athlete.id}/checkins?limit=1`
          // );

          // Check disclaimer status
          // const disclaimerResponse = await apiClient.get<{ hasSigned: boolean }>(
          //   `/api/athletes/${athlete.id}/disclaimer/${host.id}`
          // );
          // const needsDisclaimer = !(disclaimerResponse.data?.hasSigned || false);
          const needsDisclaimer = !(host.id in athlete.ds || false);

          // If they checked in this week, try to get their current activity
          // let currentActivity: ActivityEntity | undefined;
          let currentCheckIn: CheckInEntity | undefined;

          // if (hasCheckedInThisWeek) {
          // if (lastCheckIn) {
          // const checkInsResponse = await apiClient.get<any[]>(
          //   `/api/athletes/${athlete.id}/checkins?limit=1`
          // );
          // if (checkInsResponse.data) {
          if (lastCheckIn?.data?.length) {
            // const thisWeekCheckIn = checkInsResponse.data.find((checkIn: any) =>
            const thisWeekCheckIn = lastCheckIn.data.find((checkIn: any) => {
              // TODO: Are we just limiting it to one host a week or just one a week?
              // checkIn.hid === host.id && isWithinCurrentWeek(checkIn.ct);
              // const checkinTime = checkIn.c.split('#')[1];
              return isWithinCurrentWeek(checkIn.c);
            });
            if (thisWeekCheckIn) {
              currentCheckIn = thisWeekCheckIn;
              // currentActivity = activities.find(a => a.id === thisWeekCheckIn.actid);
            }
          }
          // }

          statuses.push({
            athlete,
            checkInCount,
            // hasCheckedInThisWeek,
            // currentActivity,
            currentCheckIn,
            needsDisclaimer,
          });
        } catch (err) {
          console.error('Error processing athlete:', athlete.id, err);
          // Add athlete with minimal data if there's an error
          statuses.push({
            athlete,
            checkInCount: 0,
            // hasCheckedInThisWeek: false,
            needsDisclaimer: true,
          });
        }
      }

      setAthleteStatuses(statuses);
    };

    processAthletes();
  }, [searchResults, activities, host.id]);

  // Helper function to check if timestamp is within current week
  const isWithinCurrentWeek = (timestampInSeconds: number): boolean => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const checkInDate = new Date(timestampInSeconds * 1000);
    return checkInDate >= weekStart;
  };

  // Perform the actual check-in
  const performCheckIn = async (athlete: AthleteEntity, activity: ActivityEntity) => {
    try {
      const checkIn = await createCheckIn.mutateAsync({
        athleteId: athlete.id,
        hostId: host.id,
        locationId: location.id,
        activityId: activity.id,
      });

      success(`${athlete.fn} ${athlete.ln} checked in for ${activity.n}!`);

      // Update local state
      setAthleteStatuses(prev => prev.map(status =>
        status.athlete.id === athlete.id
          ? {
            ...status,
            // hasCheckedInThisWeek: true,
            // currentActivity: activity,
            currentCheckIn: checkIn,
            // checkInCount: status.hasCheckedInThisWeek ? status.checkInCount : status.checkInCount + 1,
            checkInCount: status.checkInCount + 1,
            needsDisclaimer: false
          }
          : status
      ));

    } catch (err) {
      console.error('Check-in error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete check-in';
      error(errorMessage);
    }
  };

  // Handle activity selection/toggle
  const handleActivityToggle = async (
    athleteStatus: AthleteCheckInStatus,
    activity: ActivityEntity
  ) => {
    // resetAutoResetTimer(); // Extend the timer on interaction

    const { athlete, currentCheckIn, needsDisclaimer } = athleteStatus;

    if (currentCheckIn) {
      // Check if this is the same activity (toggle off)
      // const isSameActivity = currentCheckIn.actid === activity.id;

      if (currentCheckIn.actid === activity.id) {
        // Remove check-in
        try {
          // Find the check-in to delete
          // const checkInsResponse = await apiClient.get<any[]>(
          //   `/api/athletes/${athlete.id}/checkins?limit=10`
          // );
          // if (checkInsResponse.data) {

          // const thisWeekCheckIn = checkInsResponse.data.find((checkIn: any) =>
          //   checkIn.hid === host.id && isWithinCurrentWeek(checkIn.c)
          // );

          // if (thisWeekCheckIn) {
          await deleteCheckIn.mutateAsync({
            athleteId: athlete.id,
            // timestamp: thisWeekCheckIn.c
            timestamp: currentCheckIn.c
          });

          success(`Removed check-in for ${athlete.fn} ${athlete.ln}`);

          // Update local state
          setAthleteStatuses(prev => prev.map(status =>
            status.athlete.id === athlete.id
              ? {
                ...status,
                // hasCheckedInThisWeek: false,
                currentCheckIn: undefined,
                // currentActivity: undefined,
                checkInCount: status.checkInCount - 1
              }
              : status
          ));
          // }
          // }
        } catch (err) {
          console.error('Error removing check-in:', err);
          error('Failed to remove check-in');
        }
        return;
      } else {
        try {
          // Perform update
          const updatedCheckIn = await updateCheckIn.mutateAsync({
            athleteId: athlete.id,
            timestamp: currentCheckIn.c,
            activityId: activity.id
          });

          success(`Updated check-in for ${athlete.fn} ${athlete.ln} - set to ${activity.n}`);

          // Update local state
          setAthleteStatuses(prev => prev.map(status =>
            status.athlete.id === athlete.id
              ? {
                ...status,
                currentCheckIn: updatedCheckIn,
                // status.currentCheckIn ? {
                //   ...status.currentCheckIn,
                //   activityId: activity.id
                // } : undefined,
              }
              : status
          ));
        } catch (err) {
          console.error('Error updating check-in:', err);
          error('Failed to update check-in. Please try again.');
        }
        return;
      }
    }

    // Check if disclaimer is needed
    if (needsDisclaimer) {
      setDisclaimerAthlete(athlete);
      setPendingCheckIn({ athlete, activity });
      return;
    }

    // Perform check-in
    await performCheckIn(athlete, activity);
  };

  // Handle disclaimer acceptance
  const handleDisclaimerAccepted = () => {
    if (pendingCheckIn) {
      performCheckIn(pendingCheckIn.athlete, pendingCheckIn.activity);
    }
    setDisclaimerAthlete(null);
    setPendingCheckIn(null);
  };

  // Handle disclaimer modal close
  const handleDisclaimerClose = () => {
    setDisclaimerAthlete(null);
    setPendingCheckIn(null);
  };

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  // Get reward icon class based on check-in count
  const getRewardIconClass = (count: number): string => {
    if (count >= 60) return 'user-activity__icon--complete-60';
    if (count >= 30) return 'user-activity__icon--complete-30';
    if (count >= 8) return 'user-activity__icon--complete';
    return 'user-activity__icon';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="uppercase">Athlete Check-in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Input */}
          <div>
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by last name..."
              leftIcon={<Search className="h-4 w-4" />}
              label="Find Athlete"
            />

            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p className="mt-1 text-xs text-gray-500">
                Enter at least 2 characters to search
              </p>
            )}
          </div>

          {/* Search Results */}
          {athleteStatuses.length > 0 && (
            <div className="border-1 rounded-md overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b font-medium text-sm">
                <div className="col-span-3">Last Name</div>
                <div className="col-span-3">First Name</div>
                <div className="col-span-2 text-center">Activities</div>
                <div className="col-span-4">Check-in</div>
              </div>

              {/* Athletes */}
              <div className="divide-y">
                {athleteStatuses.map((status) => (
                  <div
                    key={status.athlete.id}
                    className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* Last Name */}
                    <div className="col-span-3 flex items-center">
                      <h5 className="font-medium">{status.athlete.ln}</h5>
                    </div>

                    {/* First Name + MI */}
                    <div className="col-span-3 flex items-center">
                      <span>
                        {status.athlete.fn} {status.athlete.mi || ''}
                      </span>
                    </div>

                    {/* Reward Icon with Count */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="relative">
                        <Icon
                          name={IconNames.Shirt}
                          // <ShirtIcon
                          className='w-16 h-16 stroke-primary fill-primary'
                        // color={'blue'}
                        />
                        {/* <Icon
                          name={ActivityIcon.DirectionsBike}
                          size='xxl'
                          className={cn(
                            getRewardIconClass(status.checkInCount)
                          )}
                        /> */}
                        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                          {status.checkInCount}
                        </span>
                      </div>
                    </div>

                    {/* Activity Buttons */}
                    <div className="col-span-4 flex items-center gap-2">
                      {activities?.slice(0, 3).map((activity) => {
                        const isSelected = status.currentCheckIn?.actid === activity.id;

                        return (
                          // <TouchTarget
                          //   key={activity.id}
                          //   onClick={() => handleActivityToggle(status, activity)}
                          //   haptic={true}
                          //   className={cn(
                          //     'flex flex-col items-center justify-center p-2 border-1 rounded-lg transition-all duration-200',
                          //     'hover:shadow-md active:scale-95 min-h-[60px] min-w-[60px]',
                          //     isSelected
                          //       ? 'bg-primary text-white border-primary shadow-md'
                          //       : 'bg-white hover:bg-gray-50 border-gray-200'
                          //   )}
                          // >
                          <Button
                            key={activity.id}
                            variant={isSelected ? 'default' : 'ghost'}
                            onClick={() => handleActivityToggle(status, activity)}
                            className={cn(
                              'flex flex-col items-center justify-center p-2 border-1 rounded-lg transition-all duration-200',
                              'hover:shadow-md active:scale-95 min-h-[60px] min-w-[60px]',
                              // isSelected
                              //   ? 'bg-primary text-white border-primary shadow-md'
                              //   : 'bg-white hover:bg-gray-50 border-gray-200'
                            )}
                          >
                            <ActivityIconCircle
                              activity={{
                                en: true,
                                i: activity.i,
                                n: activity.n
                              }}
                              size="sm"
                              variant={isSelected ? 'default' : 'ghost'}
                            />
                            {activity.n}
                          </Button>
                          // </TouchTarget>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {debouncedSearchQuery.length >= 2 && athleteStatuses.length === 0 && (
            <div className="text-center py-6">
              <div className="flex flex-col items-center space-y-4">
                <User className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-gray-600 mb-2">No athletes found</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Try a different search or register a new athlete
                  </p>
                  {onNewAthlete && (
                    <Button onClick={onNewAthlete} variant="outline">
                      Register New Athlete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {searchQuery.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Ready for Check-in</p>
              <p className="text-sm">Search for an athlete by last name to begin</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer Modal */}
      {disclaimerAthlete && (
        <DisclaimerModal
          isOpen={true}
          onClose={handleDisclaimerClose}
          athleteId={disclaimerAthlete.id}
          hostId={host.id}
          athleteName={`${disclaimerAthlete.fn} ${disclaimerAthlete.ln}`}
          disclaimerText={host.disc}
          onSuccess={handleDisclaimerAccepted}
        />
      )}
    </div>
  );
};
