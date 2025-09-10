export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  GIVEAWAYS: '/api/giveaways',
  PARTICIPANTS: '/api/participants',
  MEDIA: '/api/media',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_ACCOUNT: 'userAccount',
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '52428800'), // 50MB
  ALLOWED_IMAGE_TYPES: (import.meta.env.VITE_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif').split(','),
  ALLOWED_VIDEO_TYPES: (import.meta.env.VITE_ALLOWED_VIDEO_TYPES || 'video/mp4,video/mov,video/avi').split(','),
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || '20'),
  MAX_PAGE_SIZE: 100,
} as const;

export const VALIDATION = {
  MIN_WINNER_COUNT: 1,
  MAX_WINNER_COUNT: 100,
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 100,
  MIN_BODY_LENGTH: 10,
  MAX_BODY_LENGTH: 4000,
  MIN_MESSAGE_LENGTH: 5,
  MAX_MESSAGE_LENGTH: 1000,
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CREATE_GIVEAWAY: '/create-giveaway',
  HISTORY: '/history',
} as const;

