'use client'

import { useEffect } from 'react';

// Helper function to load Material Icons stylesheet
export function useMaterialIcons() {
  useEffect(() => {
    // Check if Material Icons is already loaded
    const exists = document.querySelector('link[href*="material-icons"]');

    if (!exists) {
      // Create link element for Material Icons
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';

      // Append to head
      document.head.appendChild(link);
    }
  }, []);
}

// Enum of available icon names for activities
export enum ActivityIcon {
  // Outdoor activities
  DirectionsBike = 'directions_bike',
  DirectionsWalk = 'directions_walk',
  DirectionsRun = 'directions_run',
  Hiking = 'hiking',
  Downhill = 'downhill_skiing',
  NordicWalking = 'nordic_walking',
  Kayaking = 'kayaking',
  Surfing = 'surfing',
  Rowing = 'rowing',
  Pool = 'pool',
  Sailboat = 'sailing',
  Snowboarding = 'snowboarding',
  Snowshoeing = 'snowshoeing',
  Ice = 'ac_unit',
  Waves = 'waves',

  // Indoor activities
  FitnessCenter = 'fitness_center',
  SportsGymnastics = 'sports_gymnastics',
  SportsTennis = 'sports_tennis',
  SportsBasketball = 'sports_basketball',
  SportsVolleyball = 'sports_volleyball',

  // Rewards
  EmojiEvents = 'emoji_events',
  Verified = 'verified',
  Pets = 'pets',
  LocalActivity = 'local_activity',
  Redeem = 'redeem',
  CardGiftcard = 'card_giftcard',
  Celebration = 'celebration',
  Star = 'star',
}

// Enum of available colors
export enum IconColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Info = 'info',
  Dark = 'dark',
  Light = 'light',
}

// Helper component for displaying Material icons
export function MaterialIcon({
  icon,
  color = IconColor.Primary,
  size = 'default'
}: {
  icon: string | ActivityIcon;
  color?: string | IconColor;
  size?: 'small' | 'default' | 'large';
}) {
  const sizeClass =
    size === 'small' ? 'text-base' :
      size === 'large' ? 'text-3xl' :
        'text-2xl';

  const colorClass =
    color === IconColor.Primary ? 'text-primary' :
      color === IconColor.Secondary ? 'text-secondary' :
        color === IconColor.Success ? 'text-success' :
          color === IconColor.Warning ? 'text-warning' :
            color === IconColor.Error ? 'text-error' :
              color === IconColor.Info ? 'text-info' :
                color === IconColor.Dark ? 'text-gray-800' :
                  color === IconColor.Light ? 'text-gray-300' :
                    '';

  return (
    <span className={`material-icons ${sizeClass} ${colorClass}`}>
      {icon}
    </span>
  );
}
