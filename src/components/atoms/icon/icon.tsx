'use client';

import * as React from 'react';

import { IoIosPint, IoIosShirt } from 'react-icons/io';
import {
  MdAcUnit,
  MdCardGiftcard,
  MdCelebration,
  MdDirectionsBike,
  MdDirectionsRun,
  MdDirectionsWalk,
  MdDownhillSkiing,
  MdEmojiEvents,
  MdFitnessCenter,
  MdHiking,
  MdKayaking,
  MdLocalActivity,
  MdNordicWalking,
  MdPets,
  MdPool,
  MdQuestionMark,
  MdRedeem,
  MdRowing,
  MdSailing,
  MdSnowboarding,
  MdSnowshoeing,
  MdSportsBasketball,
  MdSportsGymnastics,
  MdSportsTennis,
  MdSportsVolleyball,
  MdStar,
  MdSurfing,
  MdVerified,
  MdWaves,
} from "react-icons/md";

import { GiMailShirt } from 'react-icons/gi';
import { ImSpinner4 } from "react-icons/im";
import { cn } from '@/lib/utils/ui';

export enum IconNames {
  // Outdoor activities
  Bike,
  Walk,
  Run,
  Hiking,
  Skiing,
  NordicWalking,
  Kayaking,
  Surfing,
  Rowing,
  Pool,
  Sailboat,
  Snowboarding,
  Snowshoeing,
  Ice,
  Waves,

  // Indoor activities
  FitnessCenter,
  SportsGymnastics,
  SportsTennis,
  SportsBasketball,
  SportsVolleyball,

  // Rewards
  Shirt,
  ShirtLongSleeve,
  Trophy,
  Verified,
  Pets,
  Pint,
  LocalActivity,
  Redeem,
  CardGiftcard,
  Celebration,
  Star,

  // Misc
  Busy,
};

export const ActivityIcons = {
  Bike: 'bike',
  Walk: 'walk',
  Run: 'run',
  Hiking: 'hiking',
  Skiing: 'skiing',
  NordicWalking: 'nordicWalking',
  Kayaking: 'kayaking',
  Surfing: 'surfing',
  Rowing: 'rowing',
  Pool: 'pool',
  Sailboat: 'sailboat',
  Snowboarding: 'snowboarding',
  Snowshoeing: 'snowshoeing',
  Ice: 'ice',
  Waves: 'waves',
}

const activityMap = {
  [ActivityIcons.Bike]: IconNames.Bike,
  [ActivityIcons.Walk]: IconNames.Walk,
  [ActivityIcons.Run]: IconNames.Run,
  [ActivityIcons.Hiking]: IconNames.Hiking,
  [ActivityIcons.Skiing]: IconNames.Skiing,
  [ActivityIcons.NordicWalking]: IconNames.NordicWalking,
  [ActivityIcons.Kayaking]: IconNames.Kayaking,
  [ActivityIcons.Surfing]: IconNames.Surfing,
  [ActivityIcons.Rowing]: IconNames.Rowing,
  [ActivityIcons.Pool]: IconNames.Pool,
  [ActivityIcons.Sailboat]: IconNames.Sailboat,
  [ActivityIcons.Snowboarding]: IconNames.Snowboarding,
  [ActivityIcons.Snowshoeing]: IconNames.Snowshoeing,
  [ActivityIcons.Ice]: IconNames.Ice,
  [ActivityIcons.Waves]: IconNames.Waves,
}

export const RewardIcons = {
  Shirt: 'shirt',
  ShirtLongSleeve: 'shirtLongSleeve',
  Pint: 'pint',
  Trophy: 'trophy',
  Star: 'star',
}

const rewardMap = {
  [RewardIcons.Shirt]: IconNames.Shirt,
  [RewardIcons.ShirtLongSleeve]: IconNames.ShirtLongSleeve,
  [RewardIcons.Pint]: IconNames.Pint,
  [RewardIcons.Trophy]: IconNames.Trophy,
  [RewardIcons.Star]: IconNames.Star,
}

const iconMap: Record<IconNames, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  [IconNames.Bike]: MdDirectionsBike,
  [IconNames.Walk]: MdDirectionsWalk,
  [IconNames.Run]: MdDirectionsRun,
  [IconNames.Hiking]: MdHiking,
  [IconNames.Skiing]: MdDownhillSkiing,
  [IconNames.NordicWalking]: MdNordicWalking,
  [IconNames.Kayaking]: MdKayaking,
  [IconNames.Surfing]: MdSurfing,
  [IconNames.Rowing]: MdRowing,
  [IconNames.Pool]: MdPool,
  [IconNames.Sailboat]: MdSailing,
  [IconNames.Snowboarding]: MdSnowboarding,
  [IconNames.Snowshoeing]: MdSnowshoeing,
  [IconNames.Ice]: MdAcUnit,
  [IconNames.Waves]: MdWaves,
  [IconNames.FitnessCenter]: MdFitnessCenter,
  [IconNames.SportsGymnastics]: MdSportsGymnastics,
  [IconNames.SportsTennis]: MdSportsTennis,
  [IconNames.SportsBasketball]: MdSportsBasketball,
  [IconNames.SportsVolleyball]: MdSportsVolleyball,
  [IconNames.Shirt]: IoIosShirt,
  [IconNames.ShirtLongSleeve]: GiMailShirt,
  [IconNames.Pint]: IoIosPint,
  [IconNames.Trophy]: MdEmojiEvents,
  [IconNames.Verified]: MdVerified,
  [IconNames.Pets]: MdPets,
  [IconNames.LocalActivity]: MdLocalActivity,
  [IconNames.Redeem]: MdRedeem,
  [IconNames.CardGiftcard]: MdCardGiftcard,
  [IconNames.Celebration]: MdCelebration,
  [IconNames.Star]: MdStar,
  [IconNames.Busy]: ImSpinner4,
}

export interface IconProps extends React.HTMLAttributes<SVGSVGElement> {
  name: IconNames | string;
  variant?: 'activity' | 'reward' | 'icon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  color?:
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'muted'
  | 'inherit';
}

const sizeMap = {
  xs: '!text-sm',
  sm: '!text-base',
  md: '!text-lg',
  lg: '!text-xl',
  xl: '!text-2xl',
  xxl: '!text-4xl',
};

const colorMap = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  muted: 'text-gray-500',
  inherit: 'text-inherit',
};

const getIconName = (name: string | IconNames, variant: IconProps['variant'] | undefined) => {
  if (variant === 'activity') {
    return activityMap[name as keyof typeof activityMap];
  } else if (variant === 'reward') {
    return rewardMap[name as keyof typeof rewardMap];
  } else {
    return name;
  }
};

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({
    name,
    variant = 'activity',
    size = 'md',
    color = 'inherit',
    className,
    ...props
  }, ref) => {
    const iconName = getIconName(name, variant) as IconNames;

    const IconComponent = iconMap[iconName] as React.ComponentType<React.SVGProps<SVGSVGElement>> || MdQuestionMark;

    return (
      <IconComponent
        ref={ref}
        className={cn(
          sizeMap[size],
          colorMap[color],
          className,
        )}
        {...props}
      />
      // <span
      //   ref={ref}
      //   className={cn(
      //     'material-icons',
      //     sizeMap[size],
      //     colorMap[color],
      //     className
      //   )}
      //   {...props}
      // >
      //   {name}
      // </span>
    );
  }
);

Icon.displayName = 'Icon';

export { Icon };
