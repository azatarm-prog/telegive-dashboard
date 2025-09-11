// Centralized service configuration
export const SERVICE_URLS = {
  AUTH: import.meta.env.VITE_TELEGIVE_AUTH_URL || 'https://web-production-ddd7e.up.railway.app',
  GIVEAWAY: import.meta.env.VITE_TELEGIVE_GIVEAWAY_URL || 'https://telegive-giveaway-production.up.railway.app',
  PARTICIPANT: import.meta.env.VITE_TELEGIVE_PARTICIPANT_URL || 'https://telegive-participant-production.up.railway.app',
  MEDIA: import.meta.env.VITE_TELEGIVE_MEDIA_URL || 'https://telegive-media-production.up.railway.app',
  CHANNEL: import.meta.env.VITE_TELEGIVE_CHANNEL_URL || 'https://telegive-channel-service.railway.app',
  BOT: import.meta.env.VITE_TELEGIVE_BOT_URL || 'https://telegive-bot-production.up.railway.app',
} as const;

// Helper function to get service URL by type
export const getServiceUrl = (service: keyof typeof SERVICE_URLS): string => {
  return SERVICE_URLS[service];
};

// Debug function to log all service URLs
export const logServiceUrls = () => {
  console.log('Service URLs Configuration:');
  Object.entries(SERVICE_URLS).forEach(([key, url]) => {
    console.log(`${key}: ${url}`);
  });
};

