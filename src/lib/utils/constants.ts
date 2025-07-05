// src/lib/utils/constants.ts
export const ACTIVITY_TERM = 'Check-ins';
export const ACTIVITY_TERM_SINGULAR = 'Check-in';

// Navigation Routes and Labels
export const ROUTES = {
    HOME: '/',

    // Super Admin Routes
    SUPER_ADMIN: {
        BASE: '/super-admin',
        LOGIN: '/super-admin/login',
        HOSTS: '/super-admin/hosts',
        ACTIVITIES: '/super-admin/activities',
        REWARDS: '/super-admin/rewards',
    },

    // Host Routes
    HOST: {
        LOGIN: '/host/login',
        SELECT_LOCATION: '/host/select-location',
        ADMIN: {
            BASE: '/host/admin',
            REWARDS: '/host/admin/rewards',
            EMERGENCY: '/host/admin/emergency',
            SETTINGS: '/host/admin/settings',
        },
    },

    // Public Routes
    CHECKIN: '/checkin',
    SIGNUP: '/signup',
} as const;

// Navigation Configuration
export const NAVIGATION = {
    SUPER_ADMIN: [
        { label: 'Hosts', route: ROUTES.SUPER_ADMIN.HOSTS },
        { label: 'Activities', route: ROUTES.SUPER_ADMIN.ACTIVITIES },
        { label: 'Rewards', route: ROUTES.SUPER_ADMIN.REWARDS },
    ],

    HOST_ADMIN: [
        { label: 'Rewards', route: ROUTES.HOST.ADMIN.REWARDS },
        { label: 'Emergency Contacts', route: ROUTES.HOST.ADMIN.EMERGENCY },
        { label: 'Host Settings', route: ROUTES.HOST.ADMIN.SETTINGS },
    ],
} as const;

// Pages where header should be hidden
export const HEADER_HIDDEN_ROUTES: string[] = [
    ROUTES.HOST.LOGIN,
    ROUTES.SUPER_ADMIN.LOGIN,
    ROUTES.HOST.SELECT_LOCATION,
] as const;

// Route patterns for active state detection
export const ROUTE_PATTERNS = {
    SUPER_ADMIN: /^\/super-admin/,
    HOST_ADMIN: /^\/host\/admin/,
    CHECKIN: /^\/checkin/,
    SIGNUP: /^\/signup/,
} as const;
