export const PATHS = {
  home: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  app: '/app',
  profile: '/app/profile',
  adminManagement: '/app/admin-management',
  regionManagement: '/app/region-management',
  ownerManagement: '/app/owner-management',
  playerManagement: '/app/player-management',
  facilityManagement: '/app/facility-management',
  facilityManagementNew: '/app/facility-management/new',
  communityManagement: '/app/community-management',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];
