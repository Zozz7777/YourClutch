﻿import { apiService } from "./api";
import { errorHandler, withErrorHandling, handleApiResponse } from "./error-handler";

// Real API service that replaces mock data
export class RealApiService {
  
  // Dashboard APIs
  async getKPIMetrics(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/dashboard/kpis");
        return handleApiResponse(response, 'getKPIMetrics', []);
      },
      'getKPIMetrics',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getFleetVehicles(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/fleet/vehicles");
        return handleApiResponse(response, 'getFleetVehicles', []);
      },
      'getFleetVehicles',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getNotifications(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/notifications");
        return handleApiResponse(response, 'getNotifications', []);
      },
      'getNotifications',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Fleet APIs
  async getFleetVehicleById(vehicleId: string): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/fleet/vehicles/${vehicleId}`);
        return handleApiResponse(response, 'getFleetVehicleById', {});
      },
      'getFleetVehicleById',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async updateFleetVehicle(vehicleId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/fleet/vehicles/${vehicleId}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        });
        return handleApiResponse(response, 'updateFleetVehicle', {});
      },
      'updateFleetVehicle',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getMaintenanceForecast(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/fleet/maintenance/forecast");
        return handleApiResponse(response, 'getMaintenanceForecast', []);
      },
      'getMaintenanceForecast',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Finance APIs
  async getFinanceData(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/finance");
        return handleApiResponse(response, 'getFinanceData', []);
      },
      'getFinanceData',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getPayments(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/finance/payments");
        return handleApiResponse(response, 'getPayments', []);
      },
      'getPayments',
      { fallbackValue: [], showToast: false }
    )();
  }

  async createPayment(paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/finance/payments", {
          method: 'POST',
          body: JSON.stringify(paymentData)
        });
        return handleApiResponse(response, 'createPayment', {});
      },
      'createPayment',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Analytics APIs
  async getAnalytics(timeRange: string = '7d'): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/analytics?range=${timeRange}`);
        return handleApiResponse(response, 'getAnalytics', {});
      },
      'getAnalytics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getDashboardMetrics(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/dashboard/metrics");
        return handleApiResponse(response, 'getDashboardMetrics', {});
      },
      'getDashboardMetrics',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Enterprise APIs
  async getEnterpriseClients(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/enterprise/clients");
        return handleApiResponse(response, 'getEnterpriseClients', []);
      },
      'getEnterpriseClients',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getEnterpriseStats(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/enterprise/stats");
        return handleApiResponse(response, 'getEnterpriseStats', {});
      },
      'getEnterpriseStats',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Assets APIs
  async getAssets(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/assets");
        return handleApiResponse(response, 'getAssets', []);
      },
      'getAssets',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getMaintenanceRecords(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/assets/asset-maintenance");
        return handleApiResponse(response, 'getMaintenanceRecords', []);
      },
      'getMaintenanceRecords',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getAssetAssignments(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/assets/asset-assignments");
        return handleApiResponse(response, 'getAssetAssignments', []);
      },
      'getAssetAssignments',
      { fallbackValue: [], showToast: false }
    )();
  }

  async createAsset(assetData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/assets", {
          method: 'POST',
          body: JSON.stringify(assetData)
        });
        return handleApiResponse(response, 'createAsset', {});
      },
      'createAsset',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async updateMaintenanceRecord(recordId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/assets/maintenance", {
          method: 'PUT',
          body: JSON.stringify({ id: recordId, ...updates })
        });
        return handleApiResponse(response, 'updateMaintenanceRecord', {});
      },
      'updateMaintenanceRecord',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async updateAssetAssignment(assignmentId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/assets/assignments", {
          method: 'PUT',
          body: JSON.stringify({ id: assignmentId, ...updates })
        });
        return handleApiResponse(response, 'updateAssetAssignment', {});
      },
      'updateAssetAssignment',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Subscription APIs
  async getSubscriptions(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/finance/subscriptions");
        return handleApiResponse(response, 'getSubscriptions', []);
      },
      'getSubscriptions',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getPayouts(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/finance/payouts");
        return handleApiResponse(response, 'getPayouts', []);
      },
      'getPayouts',
      { fallbackValue: [], showToast: false }
    )();
  }

  // CMS APIs
  async getSEOData(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/cms/seo");
        return handleApiResponse(response, 'getSEOData', []);
      },
      'getSEOData',
      { fallbackValue: [], showToast: false }
    )();
  }

  async refreshSEO(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/cms/seo/refresh", {
          method: 'POST'
        });
        return handleApiResponse(response, 'refreshSEO', {});
      },
      'refreshSEO',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async optimizeSEO(optimizationData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/cms/seo/optimize", {
          method: 'POST',
          body: JSON.stringify(optimizationData)
        });
        return handleApiResponse(response, 'optimizeSEO', {});
      },
      'optimizeSEO',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Audit Trail APIs
  async getAuditLogs(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/audit/logs");
        const result = handleApiResponse(response, 'getAuditLogs', {});
        // Handle nested response structure from audit endpoint
        const auditLogs = (result as any)?.data?.auditLogs || result || [];
        // Ensure we always return an array
        return Array.isArray(auditLogs) ? auditLogs : [];
      },
      'getAuditLogs',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getSecurityEvents(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/audit/security-events");
        const result = handleApiResponse(response, 'getSecurityEvents', {});
        // Handle nested response structure from security events endpoint
        const securityEvents = (result as any)?.data?.securityEvents || result || [];
        // Ensure we always return an array
        return Array.isArray(securityEvents) ? securityEvents : [];
      },
      'getSecurityEvents',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getUserActivities(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/audit/user-activities");
        const result = handleApiResponse(response, 'getUserActivities', {});
        // Handle nested response structure from user activities endpoint
        const userActivities = (result as any)?.data?.userActivities || result || [];
        // Ensure we always return an array
        return Array.isArray(userActivities) ? userActivities : [];
      },
      'getUserActivities',
      { fallbackValue: [], showToast: false }
    )();
  }

  // System Health APIs
  async getSystemHealth(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/system/health");
        return handleApiResponse(response, 'getSystemHealth', {});
      },
      'getSystemHealth',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getAPIPerformance(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/system-performance");
        return handleApiResponse(response, 'getAPIPerformance', {});
      },
      'getAPIPerformance',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Settings APIs
  async getSettings(category: string): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>(`/api/v1/settings/${category}`);
        return handleApiResponse(response, 'getSettings', []);
      },
      'getSettings',
      { fallbackValue: [], showToast: false }
    )();
  }

  async updateSettings(settingsData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/settings", {
          method: 'PUT',
          body: JSON.stringify(settingsData)
        });
        return handleApiResponse(response, 'updateSettings', {});
      },
      'updateSettings',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Reports APIs
  async generateReport(reportType: string, options: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/reports/${reportType}`, {
          method: 'POST',
          body: JSON.stringify(options)
        });
        return handleApiResponse(response, 'generateReport', {});
      },
      'generateReport',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getReports(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/reports");
        return handleApiResponse(response, 'getReports', []);
      },
      'getReports',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Audit Trail APIs
  async getAuditTrail(filters: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
        const response = await apiService.makeRequest<Record<string, unknown>[]>(`/api/v1/audit-trail?${queryParams}`);
        return handleApiResponse(response, 'getAuditTrail', []);
      },
      'getAuditTrail',
      { fallbackValue: [], showToast: false }
    )();
  }

  // Integrations APIs
  async getIntegrations(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/integrations");
        return handleApiResponse(response, 'getIntegrations', []);
      },
      'getIntegrations',
      { fallbackValue: [], showToast: false }
    )();
  }

  async testIntegration(integrationId: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/integrations/${integrationId}/test`, {
          method: 'POST'
        });
        return handleApiResponse(response, 'testIntegration', false);
      },
      'testIntegration',
      { fallbackValue: false, showToast: false }
    )();
  }

  // Feature Flags APIs
  async getFeatureFlags(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/feature-flags");
        return handleApiResponse(response, 'getFeatureFlags', []);
      },
      'getFeatureFlags',
      { fallbackValue: [], showToast: false }
    )();
  }

  async updateFeatureFlag(flagId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>(`/api/v1/feature-flags/${flagId}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        });
        return handleApiResponse(response, 'updateFeatureFlag', {});
      },
      'updateFeatureFlag',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Chat APIs
  async getChatMessages(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/chat/messages");
        return handleApiResponse(response, 'getChatMessages', []);
      },
      'getChatMessages',
      { fallbackValue: [], showToast: false }
    )();
  }

  async sendChatMessage(messageData: Record<string, unknown>): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/chat/messages", {
          method: 'POST',
          body: JSON.stringify(messageData)
        });
        return handleApiResponse(response, 'sendChatMessage', {});
      },
      'sendChatMessage',
      { fallbackValue: {}, showToast: false }
    )();
  }

  // Communication APIs
  async getEmailNotifications(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/communication/email");
        return handleApiResponse(response, 'getEmailNotifications', []);
      },
      'getEmailNotifications',
      { fallbackValue: [], showToast: false }
    )();
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<boolean>(`/api/v1/notifications/${notificationId}/read`, {
          method: 'PUT'
        });
        return handleApiResponse(response, 'markNotificationAsRead', false);
      },
      'markNotificationAsRead',
      { fallbackValue: false, showToast: false }
    )();
  }

  // AI/ML APIs
  async getAIModels(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/ai/models");
        return handleApiResponse(response, 'getAIModels', []);
      },
      'getAIModels',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getFraudCases(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/ai/fraud-cases");
        return handleApiResponse(response, 'getFraudCases', []);
      },
      'getFraudCases',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getRecommendations(): Promise<Record<string, unknown>[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>[]>("/api/v1/ai/recommendations");
        return handleApiResponse(response, 'getRecommendations', []);
      },
      'getRecommendations',
      { fallbackValue: [], showToast: false }
    )();
  }

  async getTrainingROI(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/ai/training-roi");
        return handleApiResponse(response, 'getTrainingROI', {});
      },
      'getTrainingROI',
      { fallbackValue: {}, showToast: false }
    )();
  }

  async getRecommendationUplift(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      async () => {
        const response = await apiService.makeRequest<Record<string, unknown>>("/api/v1/ai/recommendation-uplift");
        return handleApiResponse(response, 'getRecommendationUplift', {});
      },
      'getRecommendationUplift',
      { fallbackValue: {}, showToast: false }
    )();
  }
}

// Export singleton instance
export const realApiService = new RealApiService();
export const realApi = realApiService;