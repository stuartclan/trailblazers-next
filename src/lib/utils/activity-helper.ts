import { ActivityIcons } from "@/components/atoms/icon/icon";

// Popular activity-related Material Icons
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
