import { ACTIVITY_TERM, ACTIVITY_TERM_SINGULAR } from "@/lib/utils/constants";
import { ActivityEntity, AthleteEntity } from "@/lib/db/entities/types";
import { Icon, RewardIcons } from "@/components/atoms/icon/icon";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";

import { AthleteItemActions } from "../athlete-item-actions/athlete-item-actions";
import { useState } from "react";

export interface AthleteCheckInStatus {
  athlete: AthleteEntity;
  canCheckIn: boolean;
  currentActivity: string | null;
  needsDisclaimer: boolean;
}

interface AthleteItemProps {
  hostId: string;
  status: AthleteCheckInStatus;
  activities?: ActivityEntity[];
  onActivityToggle: (
    athleteStatus: AthleteCheckInStatus,
    activity: ActivityEntity
  ) => Promise<void>;
}

export const AthleteItem: React.FC<AthleteItemProps> = ({
  hostId,
  status,
  activities,
  onActivityToggle,
}) => {
  const [showActions, setShowActions] = useState(false);
  const globalCount = status.athlete.gc || 0;

  return (
    <div
      key={status.athlete.id}
    >
      <div
        className="grid grid-cols-9 gap-x-4 p-3 items-center cursor-pointer hover:bg-gray-50 transition-colors relative"
        onClick={() => setShowActions((prev) => !prev)}
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
        <div className="col-span-3 flex items-center justify-center">
          <div className="relative">
            {/* TODO: Get current reward icon for this athlete */}
            <Icon
              name={RewardIcons.Shirt}
              variant='reward'
              className='w-16 h-16 stroke-primary fill-primary'
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
              {globalCount}
            </span>
          </div>
          <span>{globalCount !== 1 ? ACTIVITY_TERM : ACTIVITY_TERM_SINGULAR}</span>
        </div>
        {!showActions && <LuChevronDown className="text-gray-400 absolute right-4" />}
        {showActions && <LuChevronUp className="text-gray-400 absolute right-4" />}
      </div>
      {/* Activity Buttons */}
      {showActions && (
        <AthleteItemActions
          activities={activities}
          hostId={hostId}
          status={status}
          onActivityToggle={onActivityToggle}
        />
      )}
    </div>
  )
};
