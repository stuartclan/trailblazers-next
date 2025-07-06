'use client';

import { ActivityEntity, AthleteEntity, HostEntity, LocationEntity } from '@/lib/db/entities/types';
import { AthleteCheckInStatus, AthleteItem } from '@/components/molecules/athlete-item/athlete-item';
import { ChangeEvent, FC, useCallback, useEffect, useRef, useState } from 'react';
import { LuPlus, LuSearch as Search, LuUser as User } from 'react-icons/lu';
import { useCreateCheckIn, useDeleteCheckIn, useUpdateCheckIn } from '@/hooks/useCheckIn';

import { Button } from '@/components/atoms/button/button';
import { CheckInHelper } from '@/lib/utils/helpers/checkin';
import { DisclaimerModal } from '@/components/molecules/disclaimer-modal/disclaimer-modal';
import { Input } from '@/components/atoms/input/input';
import { SkeletonSearchResults } from '@/components/atoms/skeleton/skeleton';
import { cn } from '@/lib/utils/ui';
import { isWithinCurrentWeek } from '@/lib/utils/dates';
import { useAthleteSearch } from '@/hooks/useAthlete';
import { useLocationActivities } from '@/hooks/useActivity';
import { useSearchParams } from 'next/navigation';
import { useToastNotifications } from '@/hooks/useToast';

interface CheckInFlowProps {
  host: HostEntity;
  location: LocationEntity;
  onNewAthlete?: () => void;
  className?: string;
}

// Helper functions for optimization
class Helpers {
  /**
   * Parse the composite lw value to get timestamp and activity ID
   */
  static parseLwValue(lwValue: string): { timestamp: number; activityId: string } | null {
    if (!lwValue || !lwValue.includes('#')) return null;

    const [timestampStr, activityId] = lwValue.split('#');
    const timestamp = parseInt(timestampStr);

    if (isNaN(timestamp) || !activityId) return null;

    return { timestamp, activityId };
  }

  /**
   * Check if athlete can check in at a specific host this week
   */
  static canCheckInAtHost(athlete: AthleteEntity, hostId: string): boolean {
    const lwValue = athlete.lw?.[hostId];
    if (!lwValue) return true; // Never checked in at this host

    const parsed = this.parseLwValue(lwValue);
    if (!parsed) return true; // Invalid data, allow check-in

    return !isWithinCurrentWeek(parsed.timestamp);
  }

  /**
   * Get current activity for athlete at a specific host this week
   */
  static getCurrentWeekActivity(athlete: AthleteEntity, hostId: string): string | null {
    const lwValue = athlete.lw?.[hostId];
    if (!lwValue) return null;

    const parsed = this.parseLwValue(lwValue);
    if (!parsed || !isWithinCurrentWeek(parsed.timestamp)) return null;

    return parsed.activityId;
  }

  /**
   * Process athletes into optimized status objects
   */
  static processAthletes(athletes: AthleteEntity[], hostId: string): AthleteCheckInStatus[] {
    return athletes.map(athlete => ({
      athlete,
      canCheckIn: this.canCheckInAtHost(athlete, hostId),
      currentActivity: this.getCurrentWeekActivity(athlete, hostId),
      needsDisclaimer: !(athlete.ds?.[hostId])
    }));
  }
}

export const CheckInFlow: FC<CheckInFlowProps> = ({
  host,
  location,
  onNewAthlete,
  className,
}) => {
  const { success, error, info } = useToastNotifications();
  const searchParams = useSearchParams();
  const newAthleteLastName = searchParams.get('naln');

  // State management
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [athleteStatuses, setAthleteStatuses] = useState<AthleteCheckInStatus[]>([]);
  const [disclaimerAthlete, setDisclaimerAthlete] = useState<AthleteEntity | null>(null);
  const [activeAthleteId, setActiveAthleteId] = useState<string | null>(null);
  const [pendingCheckIn, setPendingCheckIn] = useState<{
    athlete: AthleteEntity;
    activity: ActivityEntity;
  } | null>(null);

  // Timers
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const resetTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Data fetching
  const { data: activities } = useLocationActivities(host.id, location.id);
  const { data: searchResults, isLoading: isSearchLoading } = useAthleteSearch(debouncedSearchQuery);

  // Mutations
  const createCheckIn = useCreateCheckIn();
  const updateCheckIn = useUpdateCheckIn();
  const deleteCheckIn = useDeleteCheckIn();

  // Auto-reset timer function
  const resetAutoResetTimer = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }

    resetTimeoutRef.current = setTimeout(() => {
      setIsSearching(false);
      setSearchQuery('');
      setDebouncedSearchQuery('');
      setAthleteStatuses([]);
      info('Search reset due to inactivity');
    }, 30000); // 30 seconds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initiateSearch = (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    initiateSearch(query);

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

    // Reset the auto-reset timer
    resetAutoResetTimer();
  };

  // Process search results without additional API calls
  useEffect(() => {
    if (!searchResults || !activities) return;

    // Process athletes using optimization helper - no additional API calls needed!
    const statuses = Helpers.processAthletes(searchResults, host.id);
    setAthleteStatuses(statuses);
    setIsSearching(false);
  }, [searchResults, activities, host.id]);

  useEffect(() => {
    if (newAthleteLastName) {
      initiateSearch(newAthleteLastName);
      setDebouncedSearchQuery(newAthleteLastName);
      resetAutoResetTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newAthleteLastName]);

  // Perform the actual check-in
  const performCheckIn = async (athlete: AthleteEntity, activity: ActivityEntity) => {
    resetAutoResetTimer(); // Extend the timer on interaction
    try {
      const checkIn = await createCheckIn.mutateAsync({
        athleteId: athlete.id,
        hostId: host.id,
        locationId: location.id,
        activityId: activity.id,
      });

      success(`${athlete.fn} ${athlete.ln} checked in for ${activity.n}!`);

      // Update local state to reflect the new check-in
      const checkInTimestamp = checkIn.c;
      setAthleteStatuses(prev => prev.map(status =>
        status.athlete.id === athlete.id
          ? {
            ...status,
            canCheckIn: false, // They've now checked in this week
            currentActivity: activity.id,
            needsDisclaimer: false,
            athlete: {
              ...status.athlete,
              // Update the optimization properties locally
              gc: CheckInHelper.shouldIncrementGlobalCount(athlete) ? status.athlete.gc + 1 : status.athlete.gc,
              lw: {
                ...status.athlete.lw,
                [host.id]: `${checkInTimestamp}#${activity.id}`
              }
            }
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
    resetAutoResetTimer(); // Extend the timer on interaction
    const { athlete, currentActivity, needsDisclaimer, canCheckIn } = athleteStatus;

    // If they have a current activity, handle update/delete
    if (currentActivity) {
      if (currentActivity === activity.id) {
        // Same activity - remove check-in
        try {
          // Find the current check-in timestamp from lw property
          const lwValue = athlete.lw?.[host.id];
          if (lwValue) {
            const parsed = Helpers.parseLwValue(lwValue);
            if (parsed) {
              await deleteCheckIn.mutateAsync({
                athleteId: athlete.id,
                timestamp: parsed.timestamp
              });

              success(`Removed check-in for ${athlete.fn} ${athlete.ln}`);

              // Update local state
              setAthleteStatuses(prev => prev.map(status => {
                if (status.athlete.id === athlete.id) {
                  delete status.athlete.lw[host.id];
                  const hasCheckins = Object.keys(status.athlete.lw).length > 0;

                  return {
                    ...status,
                    canCheckIn: true,
                    currentActivity: null,
                    athlete: {
                      ...status.athlete,
                      gc: !hasCheckins ? status.athlete.gc - 1 : status.athlete.gc,
                    }
                  }
                }
                return status;
              }));
            }
          }
        } catch (err) {
          console.error('Error removing check-in:', err);
          error('Failed to remove check-in');
        }
        return;
      } else {
        // Different activity - update check-in
        try {
          const lwValue = athlete.lw?.[host.id];
          if (lwValue) {
            const parsed = Helpers.parseLwValue(lwValue);
            if (parsed) {
              await updateCheckIn.mutateAsync({
                athleteId: athlete.id,
                hostId: host.id,
                timestamp: parsed.timestamp,
                activityId: activity.id
              });

              success(`Updated check-in for ${athlete.fn} ${athlete.ln} - set to ${activity.n}`);

              // Update local state
              setAthleteStatuses(prev => prev.map(status =>
                status.athlete.id === athlete.id
                  ? {
                    ...status,
                    currentActivity: activity.id,
                    athlete: {
                      ...status.athlete,
                      lw: {
                        ...status.athlete.lw,
                        [host.id]: `${parsed.timestamp}#${activity.id}`
                      }
                    }
                  }
                  : status
              ));
            }
          }
        } catch (err) {
          console.error('Error updating check-in:', err);
          error('Failed to update check-in. Please try again.');
        }
        return;
      }
    }

    // New check-in flow
    if (!canCheckIn) {
      error('Athlete has already checked in at this host this week');
      return;
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
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  // TODO: Update this method to get the global rewards and associated icon
  // Get reward icon class based on check-in count
  // const getRewardIconClass = (count: number): string => {
  //   if (count >= 60) return 'user-activity__icon--complete-60';
  //   if (count >= 30) return 'user-activity__icon--complete-30';
  //   if (count >= 8) return 'user-activity__icon--complete';
  //   return 'user-activity__icon';
  // };

  return (
    <div className={cn('space-y-6', className)}>
      {/* <Card>
        <CardHeader>
          <CardTitle className="uppercase">Athlete Check-in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6"> */}
      <div className="grid grid-cols-3 items-end justify-between gap-4">
        {/* Search Input */}
        <div className='col-span-2'>
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
        <Button onClick={onNewAthlete} variant="default" >
          <LuPlus className="h-4 w-4" />
          <span className="ml-2">Register New Athlete</span>
        </Button>
      </div>

      {/* Search Results */}
      {athleteStatuses.length > 0 && (
        <div className="border-1 rounded-md overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-9 gap-4 p-3 bg-gray-50 border-b font-medium text-sm">
            <div className="col-span-3">Last Name</div>
            <div className="col-span-3">First Name</div>
            <div className="col-span-3 text-center">Progress</div>
          </div>

          {/* Athletes */}
          <div className="divide-y">
            {athleteStatuses.map((status) => (
              <AthleteItem
                key={status.athlete.id}
                hostId={host.id}
                status={status}
                activities={activities}
                onActivityToggle={handleActivityToggle}
                activeAthleteId={activeAthleteId}
                onFocusToggle={setActiveAthleteId}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {debouncedSearchQuery.length >= 2 && !isSearchLoading && athleteStatuses.length === 0 && (
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
        <div className="text-center pb-8 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Ready for Check-in</p>
          <p className="text-sm">Search for an athlete by last name to begin</p>
        </div>
      )}
      {/* Searching */}
      {searchQuery.length > 0 && isSearching && (
        <div className="text-center pb-8 text-gray-500">
          <SkeletonSearchResults count={3} />
        </div>
      )}
      {/* </CardContent>
      </Card> */}

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
