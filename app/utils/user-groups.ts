/**
 * User group utilities
 */

// User group constants
export const USER_GROUPS = {
  ADMIN: 1,
  USER: 2,
} as const;

export const USER_GROUP_NAMES = {
  [USER_GROUPS.ADMIN]: 'admin',
  [USER_GROUPS.USER]: 'user',
} as const;

export const USER_GROUP_DISPLAY_NAMES = {
  [USER_GROUPS.ADMIN]: 'Administrator',
  [USER_GROUPS.USER]: 'Regular User',
} as const;

/**
 * Check if user is admin
 */
export function isAdmin(userGroupId: number): boolean {
  return userGroupId === USER_GROUPS.ADMIN;
}

/**
 * Check if user is regular user
 */
export function isRegularUser(userGroupId: number): boolean {
  return userGroupId === USER_GROUPS.USER;
}

/**
 * Get user group display name
 */
export function getUserGroupDisplayName(userGroupId: number): string {
  return USER_GROUP_DISPLAY_NAMES[userGroupId as keyof typeof USER_GROUP_DISPLAY_NAMES] || 'Unknown';
}

/**
 * Get user group name
 */
export function getUserGroupName(userGroupId: number): string {
  return USER_GROUP_NAMES[userGroupId as keyof typeof USER_GROUP_NAMES] || 'unknown';
}

/**
 * Default user group for new registrations
 */
export const DEFAULT_USER_GROUP_ID = USER_GROUPS.USER;
