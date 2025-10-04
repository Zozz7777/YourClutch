"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuHeader
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp,
  Clock,
  ExternalLink
} from "lucide-react";
import { notificationService, Notification } from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load initial notifications
    notificationService.loadNotifications();

    // Subscribe to updates
    const unsubscribe = notificationService.subscribe((notifications, unreadCount) => {
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    });

    // Set up polling for new notifications (every 30 seconds)
    const interval = setInterval(() => {
      notificationService.loadNotifications();
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    await notificationService.handleAction(notification);
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'contract_signed':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'contract_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'contract_declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'partner_created':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'lead_status_change':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationTitle = (notification: Notification) => {
    switch (notification.type) {
      case 'contract_signed':
        return t('notifications.contractSigned') || 'Contract Signed';
      case 'contract_approved':
        return t('notifications.contractApproved') || 'Contract Approved';
      case 'contract_declined':
        return t('notifications.contractDeclined') || 'Contract Declined';
      case 'partner_created':
        return t('notifications.partnerCreated') || 'New Partner Created';
      case 'lead_status_change':
        return t('notifications.leadStatusChange') || 'Lead Status Updated';
      default:
        return notification.title;
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'contract_signed':
        return t('notifications.contractSignedMessage', { contractId: notification.data.contractId }) || 
               `Contract ${notification.data.contractId} has been signed and is ready for review.`;
      case 'contract_approved':
        return t('notifications.contractApprovedMessage', { contractId: notification.data.contractId }) || 
               `Contract ${notification.data.contractId} has been approved.`;
      case 'contract_declined':
        return t('notifications.contractDeclinedMessage', { contractId: notification.data.contractId }) || 
               `Contract ${notification.data.contractId} has been declined.`;
      case 'partner_created':
        return t('notifications.partnerCreatedMessage', { partnerId: notification.data.partnerId }) || 
               `New partner ${notification.data.partnerId} has been created.`;
      case 'lead_status_change':
        return t('notifications.leadStatusChangeMessage', { 
          leadId: notification.data.leadId, 
          status: notification.data.status 
        }) || 
               `Lead ${notification.data.leadId} status changed to ${notification.data.status}.`;
      default:
        return notification.message;
    }
  };

  const getActionText = (notification: Notification) => {
    switch (notification.type) {
      case 'contract_signed':
        return t('notifications.reviewContract') || 'Review Contract';
      case 'contract_approved':
        return t('notifications.viewPartner') || 'View Partner';
      case 'contract_declined':
        return t('notifications.viewLead') || 'View Lead';
      case 'partner_created':
        return t('notifications.viewPartner') || 'View Partner';
      case 'lead_status_change':
        return t('notifications.viewLead') || 'View Lead';
      default:
        return notification.actionText || t('notifications.view') || 'View';
    }
  };

  const getActionUrl = (notification: Notification) => {
    switch (notification.type) {
      case 'contract_signed':
      case 'contract_approved':
      case 'contract_declined':
        return '/legal';
      case 'partner_created':
        return '/partners';
      case 'lead_status_change':
        return '/sales';
      default:
        return notification.actionUrl || '#';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuHeader className="flex items-center justify-between">
          <span className="font-semibold">
            {t('notifications.title') || 'Notifications'}
          </span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-6 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              {t('notifications.markAllRead') || 'Mark all read'}
            </Button>
          )}
        </DropdownMenuHeader>
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('notifications.noNotifications') || 'No notifications'}</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex items-start space-x-3 p-3 cursor-pointer"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {getNotificationTitle(notification)}
                  </p>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {getNotificationMessage(notification)}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-blue-600">
                      {getActionText(notification)}
                    </span>
                    <ExternalLink className="h-3 w-3 text-blue-600" />
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-muted-foreground">
              {t('notifications.viewAll') || 'View all notifications'}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
