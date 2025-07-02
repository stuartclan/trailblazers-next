import { ActivityEntity, AthleteEntity } from "@/lib/db/entities/types";
import { Icon, RewardIcons } from "@/components/atoms/icon/icon";

import { ActivityIconCircle } from "../activity-icon-circle/activity-icon-circle";
import { Button } from "@/components/atoms/button/button";
import { cn } from "@/lib/utils/ui";
import { useState } from "react";

export interface AthleteCheckInStatus {
  athlete: AthleteEntity;
  canCheckIn: boolean;
  currentActivity: string | null;
  needsDisclaimer: boolean;
}

interface AthleteItemProps {
  status: AthleteCheckInStatus;
  activities?: ActivityEntity[];
  onActivityToggle: (
    athleteStatus: AthleteCheckInStatus,
    activity: ActivityEntity
  ) => Promise<void>;
}

export const AthleteItem: React.FC<AthleteItemProps> = ({
  status,
  activities,
  onActivityToggle,
}) => {
  const [activitiesVisible, setActivitiesVisible] = useState(false);

  return (
    <div
      key={status.athlete.id}
      className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-50 transition-colors"
      onClick={() => setActivitiesVisible((prev) => !prev)}
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

      {/* Global Count from athlete.gc property */}
      <div className="col-span-2 flex items-center justify-center">
        <div className="relative">
          {/* TODO: Get current reward icon for this athlete */}
          <Icon
            name={RewardIcons.Shirt}
            variant='reward'
            className='w-16 h-16 stroke-primary fill-primary'
          />
          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
            {status.athlete.gc || 0}
          </span>
        </div>
      </div>

      {/* Activity Buttons */}
      <div hidden={!activitiesVisible} className="col-span-4 flex items-center gap-2">
        {activities?.slice(0, 3).map((activity) => {
          const isSelected = status.currentActivity === activity.id;

          return (
            <Button
              key={activity.id}
              variant={isSelected ? 'default' : 'ghost'}
              onClick={() => onActivityToggle(status, activity)}
              className={cn(
                'flex flex-col items-center justify-center p-2 border-1 rounded-lg transition-all duration-200',
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
              />
              {activity.n}
            </Button>
          );
        })}
      </div>
    </div>
  )
};
