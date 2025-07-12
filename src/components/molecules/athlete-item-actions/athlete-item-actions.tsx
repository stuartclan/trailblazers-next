import { ACTIVITY_TERM, ACTIVITY_TERM_SINGULAR } from "@/lib/utils/constants";
import { FC, useState } from "react";
import { Icon, RewardIcons } from "@/components/atoms/icon/icon";

import { ActivityEntity } from "@/lib/db/entities/types";
import { ActivityIconCircle } from "../activity-icon-circle/activity-icon-circle";
import { AthleteCheckInStatus } from "../athlete-item/athlete-item";
import { Button } from "@/components/atoms/button/button";
import { Skeleton } from "@/components/atoms/skeleton/skeleton";
import { cn } from "@/lib/utils/ui";
import { useAthleteCheckInCount } from "@/hooks/useCheckIn";

interface AthleteItemActionsProps {
  activities?: ActivityEntity[];
  hostId: string;
  status: AthleteCheckInStatus;
  onActivityToggle: (
    athleteStatus: AthleteCheckInStatus,
    activity: ActivityEntity
  ) => Promise<void>;
}

export const AthleteItemActions: FC<AthleteItemActionsProps> = ({
  activities,
  hostId,
  status,
  onActivityToggle,
}) => {
  const { athlete: { id: athleteId } } = status;
  const { data: checkInCount, isLoading: isCheckInCountLoading } = useAthleteCheckInCount(athleteId, hostId);
  const [selectingActivity, setIsSelectingActivity] = useState<ActivityEntity | null>(null);
  const selectActivity = (activity: ActivityEntity) => {
    setIsSelectingActivity(activity);
    onActivityToggle(status, activity).then(() => {
      setIsSelectingActivity(null);
    });
  }

  return (
    <>
      {isCheckInCountLoading && <Skeleton height={84} className="col-span-full" />}
      {!isCheckInCountLoading && (
        <div className="grid grid-flow-row-dense grid-cols-9 gap-x-4 col-span-full items-center justify-between p-3 gap-2 bg-secondary">
          <div className="col-span-6">
            <div className="grid grid-cols-3 grid-auto-rows justify-start gap-4">
              {activities?.slice(0, 3).map((activity) => {
                const isSelected = status.currentActivity === activity.id;

                return (
                  <Button
                    key={activity.id}
                    variant={isSelected ? 'default' : 'ghost'}
                    onClick={() => selectActivity(activity)}
                    className={cn(
                      'flex flex-col items-center justify-center p-2 border-1 rounded-lg transition-discrete duration-200',
                      'hover:shadow-md active:scale-95 min-h-[60px] min-w-[60px]',
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
                      busy={(selectingActivity && activity === selectingActivity) || undefined}
                    />
                    {activity.n}
                  </Button>
                );
              })}
            </div>
          </div>
          {/* {legacyCount && (
            <div className="col-span-2 flex items-center">
              <div className="flex items-center justify-center relative">
                <MdEmojiEvents className="text-white/60 stroke-white/60" size={60} />
                <span className="absolute top-3 text-primary font-bold">{legacyCount}</span>
              </div>
              <span className="text-white/60">legacy check-ins</span>
            </div>
          )} */}
          <div className="col-span-3 text-white flex items-center justify-center gap-1">
            <div className="relative">
              {/* TODO: Get current reward icon for this athlete/host */}
              <Icon
                name={RewardIcons.Star}
                variant='reward'
                className='w-12 h-12 stroke-white fill-white'
              />
              <span className="absolute inset-0 flex items-center justify-center text-primary font-bold text-sm">
                {checkInCount}
              </span>
            </div>
            <span>Host<br />{checkInCount !== 1 ? ACTIVITY_TERM : ACTIVITY_TERM_SINGULAR}</span>
          </div>
        </div >
      )}
    </>
  );
}
