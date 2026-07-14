export const PATHS = {
  home: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  app: '/app',
  dashboard: '/app/dashboard',
  profile: '/app/profile',
  adminManagement: '/app/admin-management',
  regionManagement: '/app/region-management',
  ownerManagement: '/app/owner-management',
  playerManagement: '/app/player-management',
  facilityManagement: '/app/facility-management',
  facilityManagementNew: '/app/facility-management/new',
  communityManagement: '/app/community-management',
  bookingManagement: '/app/booking-management',
  clubSubscriptions: '/app/club-subscriptions',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];
