import { apiService } from './api';

export interface Notification {
  id: string;
  type: 'contract_signed' | 'contract_approved' | 'contract_declined' | 'partner_created' | 'lead_status_change';
  title: string;
  message: string;
  data: {
    contractId?: string;
    leadId?: string;
    partnerId?: string;
    status?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
}

class NotificationService {
  private notifications: Notification[] = [];
  private unreadCount: number = 0;
  private listeners: Array<(notifications: Notification[], unreadCount: number) => void> = [];

  /**
   * Subscribe to notification updates
   */
  subscribe(listener: (notifications: Notification[], unreadCount: number) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications, this.unreadCount));
  }

  /**
   * Load notifications from server
   */
  async loadNotifications(): Promise<void> {
    try {
      const response = await apiService.request<NotificationResponse>('/api/v1/notifications');
      if (response.success && response.data) {
        this.notifications = response.data.notifications;
        this.unreadCount = response.data.unreadCount;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await apiService.request(`/api/v1/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      if (response.success) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.notifyListeners();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await apiService.request('/api/v1/notifications/read-all', {
        method: 'POST'
      });
      
      if (response.success) {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  /**
   * Get current notifications
   */
  getNotifications(): Notification[] {
    return this.notifications;
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.unreadCount;
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  /**
   * Handle notification action click
   */
  async handleAction(notification: Notification): Promise<void> {
    // Mark as read first
    await this.markAsRead(notification.id);
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  }
}

export const notificationService = new NotificationService();
