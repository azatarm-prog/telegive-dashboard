/**
 * Health monitoring utilities for Telegive Dashboard
 */

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  services: Record<string, ServiceHealth>;
  metrics?: HealthMetrics;
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  url?: string;
  responseTime?: number;
  lastCheck: string;
  error?: string;
  consecutiveFailures?: number;
  successRate?: number;
}

export interface HealthMetrics {
  uptime: number;
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  performanceMetrics?: {
    averageResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
  };
}

export interface HealthCheckConfig {
  timeout: number;
  retries: number;
  interval: number;
  endpoints: string[];
}

export class HealthChecker {
  private config: HealthCheckConfig;
  private serviceStatuses: Map<string, ServiceHealth> = new Map();
  private startTime: number = Date.now();

  constructor(config: Partial<HealthCheckConfig> = {}) {
    this.config = {
      timeout: 10000, // 10 seconds
      retries: 3,
      interval: 30000, // 30 seconds
      endpoints: ['/health', '/health/live', '/api/health'],
      ...config,
    };
  }

  /**
   * Check health of a specific service
   */
  async checkServiceHealth(serviceName: string, serviceUrl: string): Promise<ServiceHealth> {
    const startTime = Date.now();
    let lastError: string | undefined;
    
    // Try multiple endpoints
    for (const endpoint of this.config.endpoints) {
      for (let attempt = 1; attempt <= this.config.retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

          const response = await fetch(`${serviceUrl}${endpoint}`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Telegive-Dashboard-HealthChecker/1.0',
            },
          });

          clearTimeout(timeoutId);
          const responseTime = Date.now() - startTime;

          if (response.ok) {
            const healthStatus: ServiceHealth = {
              name: serviceName,
              status: 'healthy',
              url: serviceUrl,
              responseTime,
              lastCheck: new Date().toISOString(),
              consecutiveFailures: 0,
            };

            this.updateServiceStatus(serviceName, healthStatus);
            return healthStatus;
          } else {
            lastError = `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error';
          
          if (attempt < this.config.retries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
    }

    // All attempts failed
    const responseTime = Date.now() - startTime;
    const currentStatus = this.serviceStatuses.get(serviceName);
    const consecutiveFailures = (currentStatus?.consecutiveFailures || 0) + 1;

    const healthStatus: ServiceHealth = {
      name: serviceName,
      status: 'unhealthy',
      url: serviceUrl,
      responseTime,
      lastCheck: new Date().toISOString(),
      error: lastError,
      consecutiveFailures,
    };

    this.updateServiceStatus(serviceName, healthStatus);
    return healthStatus;
  }

  /**
   * Check health of multiple services
   */
  async checkAllServices(services: Record<string, string>): Promise<Map<string, ServiceHealth>> {
    const promises = Object.entries(services).map(([name, url]) =>
      this.checkServiceHealth(name, url)
    );

    await Promise.allSettled(promises);
    return new Map(this.serviceStatuses);
  }

  /**
   * Get current health summary
   */
  getHealthSummary(): HealthStatus {
    const services: Record<string, ServiceHealth> = {};
    let healthyCount = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    this.serviceStatuses.forEach((service, name) => {
      services[name] = { ...service };
      
      if (service.status === 'healthy') {
        healthyCount++;
      }
      
      if (service.responseTime) {
        totalResponseTime += service.responseTime;
        responseTimeCount++;
      }
    });

    const totalServices = this.serviceStatuses.size;
    const overallStatus = this.determineOverallStatus(healthyCount, totalServices);
    
    const uptime = Date.now() - this.startTime;
    const averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.VITE_ENVIRONMENT || 'development',
      services,
      metrics: {
        uptime,
        performanceMetrics: {
          averageResponseTime,
          requestsPerMinute: 0, // Would need to be tracked separately
          errorRate: totalServices > 0 ? ((totalServices - healthyCount) / totalServices) * 100 : 0,
        },
      },
    };
  }

  /**
   * Update service status with success rate calculation
   */
  private updateServiceStatus(serviceName: string, newStatus: ServiceHealth): void {
    const currentStatus = this.serviceStatuses.get(serviceName);
    
    if (currentStatus) {
      // Calculate success rate based on recent checks (simplified)
      const wasHealthy = currentStatus.status === 'healthy';
      const isHealthy = newStatus.status === 'healthy';
      
      // Simple success rate calculation (would be more sophisticated in production)
      if (currentStatus.successRate !== undefined) {
        const weight = 0.1; // Weight for new measurement
        newStatus.successRate = currentStatus.successRate * (1 - weight) + (isHealthy ? 100 : 0) * weight;
      } else {
        newStatus.successRate = isHealthy ? 100 : 0;
      }
      
      // Reset consecutive failures if healthy
      if (isHealthy) {
        newStatus.consecutiveFailures = 0;
      }
    } else {
      newStatus.successRate = newStatus.status === 'healthy' ? 100 : 0;
    }

    this.serviceStatuses.set(serviceName, newStatus);
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(healthyCount: number, totalServices: number): 'healthy' | 'unhealthy' | 'degraded' {
    if (totalServices === 0) return 'healthy';
    if (healthyCount === totalServices) return 'healthy';
    if (healthyCount === 0) return 'unhealthy';
    return 'degraded';
  }

  /**
   * Get service status by name
   */
  getServiceStatus(serviceName: string): ServiceHealth | undefined {
    return this.serviceStatuses.get(serviceName);
  }

  /**
   * Check if a service is healthy
   */
  isServiceHealthy(serviceName: string): boolean {
    const status = this.serviceStatuses.get(serviceName);
    return status?.status === 'healthy';
  }

  /**
   * Get unhealthy services
   */
  getUnhealthyServices(): ServiceHealth[] {
    return Array.from(this.serviceStatuses.values()).filter(
      service => service.status === 'unhealthy'
    );
  }

  /**
   * Reset all service statuses
   */
  reset(): void {
    this.serviceStatuses.clear();
    this.startTime = Date.now();
  }

  /**
   * Export health data for monitoring
   */
  exportHealthData(): string {
    const data = {
      timestamp: new Date().toISOString(),
      summary: this.getHealthSummary(),
      services: Object.fromEntries(this.serviceStatuses),
      config: this.config,
    };

    return JSON.stringify(data, null, 2);
  }
}

/**
 * Browser-specific health checks
 */
export class BrowserHealthChecker extends HealthChecker {
  /**
   * Check browser-specific metrics
   */
  getBrowserMetrics(): HealthMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;

    return {
      uptime: Date.now() - this.startTime,
      memoryUsage: memory ? {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      } : undefined,
      performanceMetrics: {
        averageResponseTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        requestsPerMinute: 0, // Would need to be tracked
        errorRate: 0, // Would need to be tracked
      },
    };
  }

  /**
   * Check if the application is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get connection information
   */
  getConnectionInfo(): any {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    
    return null;
  }

  /**
   * Enhanced health summary with browser metrics
   */
  getEnhancedHealthSummary(): HealthStatus {
    const summary = this.getHealthSummary();
    
    return {
      ...summary,
      metrics: {
        ...summary.metrics,
        ...this.getBrowserMetrics(),
      },
    };
  }
}

/**
 * Health monitoring hook for React components
 */
export function createHealthMonitor(services: Record<string, string>, config?: Partial<HealthCheckConfig>) {
  const healthChecker = new BrowserHealthChecker(config);
  
  return {
    healthChecker,
    checkHealth: () => healthChecker.checkAllServices(services),
    getStatus: () => healthChecker.getEnhancedHealthSummary(),
    isServiceHealthy: (serviceName: string) => healthChecker.isServiceHealthy(serviceName),
    getUnhealthyServices: () => healthChecker.getUnhealthyServices(),
  };
}

/**
 * Default health check configuration for Telegive services
 */
export const TELEGIVE_HEALTH_CONFIG: HealthCheckConfig = {
  timeout: 10000,
  retries: 2,
  interval: 30000,
  endpoints: ['/health/live', '/health/ready', '/health', '/api/health'],
};

/**
 * Utility function to validate service URLs
 */
export function validateServiceUrls(services: Record<string, string>): { valid: string[], invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  Object.entries(services).forEach(([name, url]) => {
    try {
      new URL(url);
      valid.push(name);
    } catch {
      invalid.push(name);
    }
  });

  return { valid, invalid };
}

