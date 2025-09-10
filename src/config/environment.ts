/**
 * Environment Configuration Manager for Telegive Dashboard
 * Centralized configuration management with validation and type safety
 */

export type Environment = 'development' | 'staging' | 'production';

export interface ServiceConfig {
  name: string;
  url?: string;
  required: boolean;
  timeout: number;
}

export interface FeatureFlags {
  realTimeUpdates: boolean;
  analytics: boolean;
  debugMode: boolean;
  performanceMonitoring: boolean;
  errorReporting: boolean;
}

export interface EnvironmentConfig {
  environment: Environment;
  apiBaseUrl: string;
  wsUrl?: string;
  services: Record<string, ServiceConfig>;
  features: FeatureFlags;
  ui: {
    theme: {
      primaryColor: string;
      secondaryColor: string;
    };
    pagination: {
      itemsPerPage: number;
    };
    upload: {
      maxFileSize: number;
      allowedImageTypes: string[];
      allowedVideoTypes: string[];
    };
  };
  monitoring: {
    healthCheckInterval: number;
    errorReportingEnabled: boolean;
    performanceTrackingEnabled: boolean;
  };
}

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: EnvironmentConfig;
  private validationErrors: string[] = [];

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
    
    if (this.validationErrors.length > 0) {
      console.error('Environment configuration errors:', this.validationErrors);
      
      if (this.config.environment === 'production') {
        throw new Error(`Production environment has configuration errors: ${this.validationErrors.join(', ')}`);
      }
    }
  }

  static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  private loadConfig(): EnvironmentConfig {
    const environment = this.getEnvironment();
    
    const baseConfig: EnvironmentConfig = {
      environment,
      apiBaseUrl: this.getRequired('VITE_API_BASE_URL'),
      wsUrl: import.meta.env.VITE_WS_URL,
      
      services: {
        auth: {
          name: 'auth',
          url: import.meta.env.VITE_TELEGIVE_AUTH_URL,
          required: true,
          timeout: 10000,
        },
        channel: {
          name: 'channel',
          url: import.meta.env.VITE_TELEGIVE_CHANNEL_URL,
          required: false,
          timeout: 10000,
        },
        bot: {
          name: 'bot',
          url: import.meta.env.VITE_TELEGIVE_BOT_URL,
          required: false,
          timeout: 10000,
        },
        participant: {
          name: 'participant',
          url: import.meta.env.VITE_TELEGIVE_PARTICIPANT_URL,
          required: false,
          timeout: 10000,
        },
        media: {
          name: 'media',
          url: import.meta.env.VITE_TELEGIVE_MEDIA_URL,
          required: false,
          timeout: 15000, // Longer timeout for media uploads
        },
        giveaway: {
          name: 'giveaway',
          url: import.meta.env.VITE_TELEGIVE_GIVEAWAY_URL,
          required: true,
          timeout: 10000,
        },
      },
      
      features: {
        realTimeUpdates: this.getBooleanEnv('VITE_ENABLE_REAL_TIME_UPDATES', true),
        analytics: this.getBooleanEnv('VITE_ENABLE_ANALYTICS', false),
        debugMode: this.getBooleanEnv('VITE_ENABLE_DEBUG_MODE', environment === 'development'),
        performanceMonitoring: this.getBooleanEnv('VITE_ENABLE_PERFORMANCE_MONITORING', environment === 'production'),
        errorReporting: this.getBooleanEnv('VITE_ENABLE_ERROR_REPORTING', environment === 'production'),
      },
      
      ui: {
        theme: {
          primaryColor: import.meta.env.VITE_THEME_PRIMARY_COLOR || '#3b82f6',
          secondaryColor: import.meta.env.VITE_THEME_SECONDARY_COLOR || '#64748b',
        },
        pagination: {
          itemsPerPage: this.getNumberEnv('VITE_ITEMS_PER_PAGE', 20),
        },
        upload: {
          maxFileSize: this.getNumberEnv('VITE_MAX_FILE_SIZE', 52428800), // 50MB
          allowedImageTypes: this.getArrayEnv('VITE_ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif']),
          allowedVideoTypes: this.getArrayEnv('VITE_ALLOWED_VIDEO_TYPES', ['video/mp4', 'video/mov', 'video/avi']),
        },
      },
      
      monitoring: {
        healthCheckInterval: this.getNumberEnv('VITE_HEALTH_CHECK_INTERVAL', 30000),
        errorReportingEnabled: this.getBooleanEnv('VITE_ERROR_REPORTING_ENABLED', environment === 'production'),
        performanceTrackingEnabled: this.getBooleanEnv('VITE_PERFORMANCE_TRACKING_ENABLED', environment === 'production'),
      },
    };

    // Environment-specific overrides
    return this.applyEnvironmentOverrides(baseConfig);
  }

  private getEnvironment(): Environment {
    const env = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || 'development';
    
    if (!['development', 'staging', 'production'].includes(env)) {
      this.validationErrors.push(`Invalid environment: ${env}`);
      return 'development';
    }
    
    return env as Environment;
  }

  private getRequired(key: string): string {
    const value = import.meta.env[key];
    if (!value) {
      this.validationErrors.push(`Required environment variable ${key} is not set`);
      return '';
    }
    return value;
  }

  private getBooleanEnv(key: string, defaultValue: boolean): boolean {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  private getNumberEnv(key: string, defaultValue: number): number {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      this.validationErrors.push(`Invalid number for ${key}: ${value}`);
      return defaultValue;
    }
    
    return parsed;
  }

  private getArrayEnv(key: string, defaultValue: string[]): string[] {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }

  private applyEnvironmentOverrides(config: EnvironmentConfig): EnvironmentConfig {
    switch (config.environment) {
      case 'development':
        return {
          ...config,
          features: {
            ...config.features,
            debugMode: true,
            analytics: false,
            errorReporting: false,
          },
          monitoring: {
            ...config.monitoring,
            healthCheckInterval: 60000, // Less frequent in development
            errorReportingEnabled: false,
            performanceTrackingEnabled: false,
          },
        };

      case 'staging':
        return {
          ...config,
          features: {
            ...config.features,
            debugMode: false,
            analytics: true,
            errorReporting: true,
          },
          monitoring: {
            ...config.monitoring,
            errorReportingEnabled: true,
            performanceTrackingEnabled: true,
          },
        };

      case 'production':
        return {
          ...config,
          features: {
            ...config.features,
            debugMode: false,
            analytics: true,
            errorReporting: true,
          },
          monitoring: {
            ...config.monitoring,
            errorReportingEnabled: true,
            performanceTrackingEnabled: true,
          },
        };

      default:
        return config;
    }
  }

  private validateConfig(): void {
    const { config } = this;

    // Validate API base URL
    if (!config.apiBaseUrl) {
      this.validationErrors.push('API base URL is required');
    } else {
      try {
        new URL(config.apiBaseUrl);
      } catch {
        this.validationErrors.push(`Invalid API base URL: ${config.apiBaseUrl}`);
      }
    }

    // Validate WebSocket URL if provided
    if (config.wsUrl) {
      try {
        const url = new URL(config.wsUrl);
        if (!['ws:', 'wss:'].includes(url.protocol)) {
          this.validationErrors.push(`WebSocket URL must use ws:// or wss:// protocol: ${config.wsUrl}`);
        }
      } catch {
        this.validationErrors.push(`Invalid WebSocket URL: ${config.wsUrl}`);
      }
    }

    // Validate required services in production
    if (config.environment === 'production') {
      Object.entries(config.services).forEach(([name, service]) => {
        if (service.required && !service.url) {
          this.validationErrors.push(`Required service ${name} URL not configured for production`);
        }
        
        if (service.url) {
          try {
            new URL(service.url);
          } catch {
            this.validationErrors.push(`Invalid URL for service ${name}: ${service.url}`);
          }
        }
      });
    }

    // Validate file size limits
    if (config.ui.upload.maxFileSize <= 0) {
      this.validationErrors.push('Max file size must be greater than 0');
    }

    if (config.ui.upload.maxFileSize > 100 * 1024 * 1024) { // 100MB
      this.validationErrors.push('Max file size should not exceed 100MB');
    }

    // Validate pagination
    if (config.ui.pagination.itemsPerPage <= 0 || config.ui.pagination.itemsPerPage > 100) {
      this.validationErrors.push('Items per page must be between 1 and 100');
    }

    // Validate health check interval
    if (config.monitoring.healthCheckInterval < 10000) { // 10 seconds minimum
      this.validationErrors.push('Health check interval must be at least 10 seconds');
    }
  }

  // Public API methods

  getConfig(): Readonly<EnvironmentConfig> {
    return Object.freeze({ ...this.config });
  }

  getEnvironment(): Environment {
    return this.config.environment;
  }

  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  getWebSocketUrl(): string | undefined {
    return this.config.wsUrl;
  }

  getServiceConfig(serviceName: string): ServiceConfig | undefined {
    return this.config.services[serviceName];
  }

  getServiceUrl(serviceName: string): string | undefined {
    return this.config.services[serviceName]?.url;
  }

  getAllServiceUrls(): Record<string, string> {
    const urls: Record<string, string> = {};
    
    Object.entries(this.config.services).forEach(([name, service]) => {
      if (service.url) {
        urls[name] = service.url;
      }
    });
    
    return urls;
  }

  getRequiredServices(): string[] {
    return Object.entries(this.config.services)
      .filter(([, service]) => service.required)
      .map(([name]) => name);
  }

  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.config.features[feature];
  }

  getFeatureFlags(): Readonly<FeatureFlags> {
    return Object.freeze({ ...this.config.features });
  }

  getUIConfig(): Readonly<EnvironmentConfig['ui']> {
    return Object.freeze({ ...this.config.ui });
  }

  getMonitoringConfig(): Readonly<EnvironmentConfig['monitoring']> {
    return Object.freeze({ ...this.config.monitoring });
  }

  isProduction(): boolean {
    return this.config.environment === 'production';
  }

  isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  isStaging(): boolean {
    return this.config.environment === 'staging';
  }

  getValidationErrors(): string[] {
    return [...this.validationErrors];
  }

  hasValidationErrors(): boolean {
    return this.validationErrors.length > 0;
  }

  // Utility methods

  exportEnvTemplate(): string {
    const template = [
      '# Telegive Dashboard Environment Configuration',
      '# Copy this file to .env.local and fill in your actual values',
      '',
      '# Environment',
      'VITE_ENVIRONMENT=production',
      '',
      '# API Configuration',
      'VITE_API_BASE_URL=https://api.telegive.com',
      'VITE_WS_URL=wss://api.telegive.com/ws',
      '',
      '# Service URLs',
      'VITE_TELEGIVE_AUTH_URL=https://telegive-auth-production.up.railway.app',
      'VITE_TELEGIVE_CHANNEL_URL=https://telegive-channel-production.up.railway.app',
      'VITE_TELEGIVE_BOT_URL=https://telegive-bot-production.up.railway.app',
      'VITE_TELEGIVE_PARTICIPANT_URL=https://telegive-participant-production.up.railway.app',
      'VITE_TELEGIVE_MEDIA_URL=https://telegive-media-production.up.railway.app',
      'VITE_TELEGIVE_GIVEAWAY_URL=https://telegive-giveaway-production.up.railway.app',
      '',
      '# Feature Flags',
      'VITE_ENABLE_REAL_TIME_UPDATES=true',
      'VITE_ENABLE_ANALYTICS=false',
      'VITE_ENABLE_DEBUG_MODE=false',
      'VITE_ENABLE_PERFORMANCE_MONITORING=true',
      'VITE_ENABLE_ERROR_REPORTING=true',
      '',
      '# UI Configuration',
      'VITE_THEME_PRIMARY_COLOR=#3b82f6',
      'VITE_THEME_SECONDARY_COLOR=#64748b',
      'VITE_ITEMS_PER_PAGE=20',
      '',
      '# Upload Configuration',
      'VITE_MAX_FILE_SIZE=52428800',
      'VITE_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif',
      'VITE_ALLOWED_VIDEO_TYPES=video/mp4,video/mov,video/avi',
      '',
      '# Monitoring',
      'VITE_HEALTH_CHECK_INTERVAL=30000',
      'VITE_ERROR_REPORTING_ENABLED=true',
      'VITE_PERFORMANCE_TRACKING_ENABLED=true',
    ];

    return template.join('\n');
  }

  exportConfigSummary(): string {
    const summary = {
      environment: this.config.environment,
      apiBaseUrl: this.config.apiBaseUrl,
      servicesConfigured: Object.keys(this.config.services).length,
      requiredServices: this.getRequiredServices(),
      enabledFeatures: Object.entries(this.config.features)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature),
      validationErrors: this.validationErrors,
    };

    return JSON.stringify(summary, null, 2);
  }
}

// Global instance
export const envManager = EnvironmentManager.getInstance();

// Export commonly used values
export const {
  getConfig,
  getEnvironment,
  getApiBaseUrl,
  getServiceUrl,
  getAllServiceUrls,
  isFeatureEnabled,
  getUIConfig,
  isProduction,
  isDevelopment,
} = envManager;

