export const USER_DATA_KEYS = {
  trackerSessions: 'tracker_sessions',
  trackerActive: 'tracker_active',
  nutritionProfile: 'nutrition_profile',
  foodLogs: 'food_logs',
  customFoods: 'custom_foods',
  bookmarks: 'bookmarks',
} as const

export type UserDataKey = (typeof USER_DATA_KEYS)[keyof typeof USER_DATA_KEYS]
