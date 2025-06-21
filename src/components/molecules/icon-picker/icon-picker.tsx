'use client';

import * as React from 'react';

import { Search, X } from 'lucide-react';

import { ActivityIcon } from '@/lib/utils/material-icons';
import { Button } from '@/components/atoms/button/button';
import { Input } from '@/components/atoms/input/input';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { cn } from '@/lib/utils/ui';

interface IconPickerProps {
    value?: string;
    onChange?: (iconName: string) => void;
    label?: string;
    error?: string;
    placeholder?: string;
    className?: string;
}

// Popular activity-related Material Icons
const ACTIVITY_ICONS = [
    // Outdoor activities
    { name: ActivityIcon.DirectionsBike, label: 'Bike', category: 'Outdoor' },
    { name: ActivityIcon.DirectionsWalk, label: 'Walk', category: 'Outdoor' },
    { name: ActivityIcon.DirectionsRun, label: 'Run', category: 'Outdoor' },
    { name: ActivityIcon.Hiking, label: 'Hiking', category: 'Outdoor' },
    { name: ActivityIcon.Downhill, label: 'Skiing', category: 'Outdoor' },
    { name: ActivityIcon.NordicWalking, label: 'Nordic Walking', category: 'Outdoor' },
    { name: ActivityIcon.Kayaking, label: 'Kayaking', category: 'Water' },
    { name: ActivityIcon.Surfing, label: 'Surfing', category: 'Water' },
    { name: ActivityIcon.Pool, label: 'Swimming', category: 'Water' },
    { name: ActivityIcon.Sailboat, label: 'Sailing', category: 'Water' },
    { name: ActivityIcon.Snowboarding, label: 'Snowboarding', category: 'Winter' },
    { name: ActivityIcon.Ice, label: 'Ice Sports', category: 'Winter' },
    { name: ActivityIcon.Waves, label: 'Water Sports', category: 'Water' },

    // Indoor activities
    { name: ActivityIcon.FitnessCenter, label: 'Gym', category: 'Indoor' },
    { name: ActivityIcon.SportsGymnastics, label: 'Gymnastics', category: 'Indoor' },
    { name: ActivityIcon.SportsTennis, label: 'Tennis', category: 'Sports' },
    { name: ActivityIcon.SportsBasketball, label: 'Basketball', category: 'Sports' },
    { name: ActivityIcon.SportsVolleyball, label: 'Volleyball', category: 'Sports' },

    // General
    { name: ActivityIcon.LocalActivity, label: 'Activity', category: 'General' },
    { name: ActivityIcon.Star, label: 'Featured', category: 'General' },
];

const CATEGORIES = ['All', 'Outdoor', 'Water', 'Winter', 'Indoor', 'Sports', 'General'];

export const IconPicker: React.FC<IconPickerProps> = ({
    value,
    onChange,
    label = 'Select Icon',
    error,
    placeholder = 'Choose an icon for this activity',
    className,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState('All');
    const [previewIcon, setPreviewIcon] = React.useState<string | null>(null);

    // Filter icons based on search and category
    const filteredIcons = ACTIVITY_ICONS.filter(icon => {
        const matchesSearch = searchTerm === '' ||
            icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            icon.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || icon.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Handle icon selection
    const handleIconSelect = (iconName: string) => {
        onChange?.(iconName);
        setIsOpen(false);
        setPreviewIcon(null);
    };

    // Get the currently selected icon
    const selectedIcon = ACTIVITY_ICONS.find(icon => icon.name === value);

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
                                <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                                    <span className="material-icons text-primary">{selectedIcon.name}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">{selectedIcon.label}</span>
                                    <div className="text-xs text-gray-500">{selectedIcon.category}</div>
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
                            <div className="flex flex-wrap gap-1">
                                {CATEGORIES.map((category) => (
                                    <button
                                        key={category}
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
                                    {filteredIcons.map((icon) => (
                                        <TouchTarget
                                            key={icon.name}
                                            onClick={() => handleIconSelect(icon.name)}
                                            onMouseEnter={() => setPreviewIcon(icon.name)}
                                            onMouseLeave={() => setPreviewIcon(null)}
                                            className={cn(
                                                'p-3 rounded-lg border-1 transition-all duration-200 cursor-pointer',
                                                'hover:border-primary hover:bg-primary-light hover:shadow-md',
                                                'flex flex-col items-center space-y-1',
                                                value === icon.name
                                                    ? 'border-primary bg-primary-light shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300',
                                                previewIcon === icon.name && 'transform scale-105'
                                            )}
                                            haptic
                                        >
                                            <div className={cn(
                                                'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                                                value === icon.name ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                                            )}>
                                                <span className="material-icons text-sm">{icon.name}</span>
                                            </div>
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
