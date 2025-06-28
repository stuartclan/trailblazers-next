'use client';

import * as React from 'react';

import { ActivityIcons, Icon, RewardIcons } from "@/components/atoms/icon/icon";
import { LuSearch as Search, LuX as X } from 'react-icons/lu';

import { ActivityIconCircle } from '@/components/molecules/activity-icon-circle/activity-icon-circle';
import { Button } from '@/components/atoms/button/button';
import { Input } from '@/components/atoms/input/input';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { cn } from '@/lib/utils/ui';

// Activities - may want to relocate
export const AVAILABLE_ACTIVITIES = [
  // Defaults
  { name: ActivityIcons.Run, label: 'Run', categories: ['Defaults', 'Outdoor'] },
  { name: ActivityIcons.Bike, label: 'Bike', categories: ['Defaults', 'Outdoor'] },
  { name: ActivityIcons.Hiking, label: 'Hike', categories: ['Defaults', 'Outdoor'] },

  // Outdoor activities
  { name: ActivityIcons.Walk, label: 'Walk', categories: ['Outdoor'] },
  // { name: ActivityIcon.NordicWalking, label: 'Nordic Walking', category: 'Outdoor' },
  { name: ActivityIcons.Ice, label: 'Winter Sports', categories: ['Winter'] },
  { name: ActivityIcons.Skiing, label: 'Skiing', categories: ['Winter'] },
  { name: ActivityIcons.Snowboarding, label: 'Snow-boarding', categories: ['Winter'] },
  { name: ActivityIcons.Snowshoeing, label: 'Snow-shoeing', categories: ['Winter'] },
  { name: ActivityIcons.Waves, label: 'Water Sports', categories: ['Water'] },
  { name: ActivityIcons.Kayaking, label: 'Kayaking', categories: ['Water'] },
  { name: ActivityIcons.Rowing, label: 'Rafting', categories: ['Water'] },
  { name: ActivityIcons.Sailboat, label: 'Boating', categories: ['Water'] },
  { name: ActivityIcons.Pool, label: 'Swimming', categories: ['Water'] },
  // { name: ActivityIcon.Surfing, label: 'Surfing', categories: 'Water' },
  // { name: ActivityIcon.Sailboat, label: 'Sailing', categories: 'Water' },

  // Indoor activities
  // { name: ActivityIcon.FitnessCenter, label: 'Gym', categories: ['Indoor'] },
  // { name: ActivityIcon.SportsGymnastics, label: 'Gymnastics', categories: ['Indoor'] },
  // { name: ActivityIcon.SportsTennis, label: 'Tennis', categories: ['Indoor'] },
  // { name: ActivityIcon.SportsBasketball, label: 'Basketball', categories: ['Indoor'] },
  // { name: ActivityIcon.SportsVolleyball, label: 'Volleyball', categories: ['Indoor'] },

  // Other
  // { name: ActivityIcon.LocalActivity, label: 'Activity', categories: ['General'] },
  // { name: ActivityIcon.Star, label: 'Featured', categories: ['General'] },
];

// const CATEGORIES = ['All', 'Outdoor', 'Water', 'Winter', 'Indoor', 'Sports', 'General'];
export const ACTIVITY_CATEGORIES = ['All', 'Defaults', 'Outdoor', 'Winter', 'Water'];

// Available icons for rewards - curated list of appropriate reward icons
const AVAILABLE_REWARDS = [
  { name: RewardIcons.Shirt, label: 'T-shirt', categories: [] },
  { name: RewardIcons.ShirtLongSleeve, label: 'Long sleeve shirt', categories: [] },
  { name: RewardIcons.Trophy, label: 'Trophy', categories: [] },
  { name: RewardIcons.Star, label: 'Star', categories: [] },
];

interface IconPickerProps {
  value?: string;
  onChange?: (iconName: string) => void;
  label?: string;
  variant?: 'activity' | 'reward';
  error?: string;
  placeholder?: string;
  className?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  label = 'Select Icon',
  variant = 'activity',
  error,
  placeholder = 'Choose an icon for this activity',
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [previewIcon, setPreviewIcon] = React.useState<string | null>(null);

  const filteredIcons = React.useMemo(() => {
    switch (variant) {
      case 'activity':
        return AVAILABLE_ACTIVITIES.filter(icon => {
          const matchesSearch = searchTerm === '' ||
            icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            icon.name.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesCategory = selectedCategory === 'All' || icon.categories.includes(selectedCategory);

          return matchesSearch && matchesCategory;
        });
      case 'reward':
        return AVAILABLE_REWARDS.filter(icon => {
          return searchTerm === '' ||
            icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            icon.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
      default:
        return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory]);

  // Filter icons based on search and category
  // const filteredIcons = AVAILABLE_ACTIVITIES.filter(icon => {
  //   const matchesSearch = searchTerm === '' ||
  //     icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     icon.name.toLowerCase().includes(searchTerm.toLowerCase());

  //   const matchesCategory = selectedCategory === 'All' || icon.categories.includes(selectedCategory);

  //   return matchesSearch && matchesCategory;
  // });

  // Handle icon selection
  const handleIconSelect = (iconName: string) => {
    onChange?.(iconName);
    setIsOpen(false);
    setPreviewIcon(null);
  };

  // Get the currently selected icon
  const selectedIcon = variant === 'activity' ? AVAILABLE_ACTIVITIES.find(icon => icon.name === value) : AVAILABLE_REWARDS.find(icon => icon.name === value);

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Selected Icon Display / Trigger */}
      <div className="relative">
        <TouchTarget
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full p-3 border-1 rounded-md bg-white flex items-center justify-between cursor-pointer transition-colors',
            error ? 'border-red-500' : 'border-gray-300 hover:border-gray-400',
            isOpen && 'border-primary ring-2 ring-primary/20'
          )}
        >
          <div className="flex items-center space-x-3">
            {selectedIcon ? (
              <>
                {variant === 'activity' && (
                  <ActivityIconCircle activity={{ en: true, i: selectedIcon.name }} size='sm' />
                )}
                {variant === 'reward' && (
                  <Icon name={selectedIcon.name} variant='reward' size='sm' />
                )}
                {/* <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                                    <span className="material-icons text-primary">{selectedIcon.name}</span>
                                </div> */}
                <div>
                  <span className="font-medium text-gray-900">{selectedIcon.label}</span>
                  <div className="text-xs text-gray-500">{selectedIcon.categories.join(', ')}</div>
                </div>
              </>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>

          <Search className="h-4 w-4 text-gray-400" />
        </TouchTarget>

        {/* Dropdown Picker */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-1 border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
            {/* Search and Filter Header */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <Input
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                size="sm"
              />

              {/* Category Filter */}
              {variant === 'activity' && (
                <div className="flex flex-wrap gap-1">
                  {ACTIVITY_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type='button'
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-md transition-colors',
                        selectedCategory === category
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Icons Grid */}
            <div className="p-2 max-h-64 overflow-y-auto">
              {filteredIcons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No icons found</p>
                  <p className="text-xs">Try adjusting your search or category filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {filteredIcons.map((icon, idx) => (
                    <TouchTarget
                      key={`${icon.name}-${idx}`}
                      onClick={() => handleIconSelect(icon.name)}
                      onMouseEnter={() => setPreviewIcon(icon.name)}
                      onMouseLeave={() => setPreviewIcon(null)}
                      className={cn(
                        'p-3 rounded-lg border-1 transition-all duration-200 cursor-pointer',
                        'hover:border-primary hover:bg-gray-100 hover:shadow-md',
                        'flex flex-col items-center space-y-1',
                        value === icon.name
                          ? 'border-primary bg-primary text-white hover:text-primary shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:text-primary',
                        previewIcon === icon.name && 'transform scale-105'
                      )}
                      haptic
                    >
                      {variant === 'activity' && (
                        <ActivityIconCircle activity={{ en: true, i: icon.name }} size='md' />
                      )}
                      {variant === 'reward' && (
                        <Icon name={icon.name} variant='reward' size='md' />
                      )}
                      {/* <ActivityIconCircle activity={{ en: true, i: icon.name }} size='md' /> */}
                      {/* <div className={cn(
                                                'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                                                value === icon.name ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                                            )}>
                                                <span className="material-icons text-sm">{icon.name}</span>
                                            </div> */}
                      <span className="text-xs text-center leading-tight font-medium">
                        {icon.label}
                      </span>
                    </TouchTarget>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Close Button */}
            <div className="p-3 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} available
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Close
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Preview Selected Icon */}
      {selectedIcon && (
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span>Selected:</span>
          <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
            {selectedIcon.name}
          </code>
        </div>
      )}
    </div>
  );
};
