import { ActivityIcon } from "./material-icons";

// Popular activity-related Material Icons
export const AVAILABLE_ACTIVITIES = [
    // Defaults
    { name: ActivityIcon.DirectionsRun, label: 'Run', categories: ['Defaults', 'Outdoor'] },
    { name: ActivityIcon.DirectionsBike, label: 'Bike', categories: ['Defaults', 'Outdoor'] },
    { name: ActivityIcon.Hiking, label: 'Hike', categories: ['Defaults', 'Outdoor'] },

    // Outdoor activities
    { name: ActivityIcon.DirectionsWalk, label: 'Walk', categories: ['Outdoor'] },
    // { name: ActivityIcon.NordicWalking, label: 'Nordic Walking', category: 'Outdoor' },
    { name: ActivityIcon.Ice, label: 'Winter Sports', categories: ['Winter'] },
    { name: ActivityIcon.Downhill, label: 'Skiing', categories: ['Winter'] },
    { name: ActivityIcon.Snowboarding, label: 'Snow-boarding', categories: ['Winter'] },
    { name: ActivityIcon.Snowshoeing, label: 'Snow-shoeing', categories: ['Winter'] },
    { name: ActivityIcon.Waves, label: 'Water Sports', categories: ['Water'] },
    { name: ActivityIcon.Kayaking, label: 'Kayaking', categories: ['Water'] },
    { name: ActivityIcon.Rowing, label: 'Rafting', categories: ['Water'] },
    { name: ActivityIcon.Sailboat, label: 'Boating', categories: ['Water'] },
    { name: ActivityIcon.Pool, label: 'Swimming', categories: ['Water'] },
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
