/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_TELEGIVE_AUTH_URL: string;
  readonly VITE_TELEGIVE_CHANNEL_URL: string;
  readonly VITE_TELEGIVE_GIVEAWAY_URL: string;
  readonly VITE_TELEGIVE_PARTICIPANT_URL: string;
  readonly VITE_TELEGIVE_MEDIA_URL: string;
  readonly VITE_TELEGIVE_BOT_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENABLE_REAL_TIME_UPDATES: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_DEBUG_MODE: string;
  readonly VITE_MAX_FILE_SIZE: string;
  readonly VITE_ALLOWED_IMAGE_TYPES: string;
  readonly VITE_ALLOWED_VIDEO_TYPES: string;
  readonly VITE_THEME_PRIMARY_COLOR: string;
  readonly VITE_THEME_SECONDARY_COLOR: string;
  readonly VITE_ITEMS_PER_PAGE: string;
  readonly VITE_WS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

