'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Clock, MapPin, Car, Wrench } from 'lucide-react';

export default function UserActivityMonitor() {
  const activityData = [
    {
      user: 'John Smith',
      app: 'Clutch App',
      action: 'Booked Service',
      location: 'Downtown Service Center',
      timestamp: '5 minutes ago',
      type: 'booking'
    },
    {
      user: 'Sarah Johnson',
      app: 'Clutch Partners',
      action: 'Completed Repair',
      location: 'AutoTech Solutions',
      timestamp: '12 minutes ago',
      type: 'service'
    },
    {
      user: 'Mike Chen',
      app: 'Clutch App',
      action: 'Ordered Parts',
      location: 'Online',
      timestamp: '18 minutes ago',
      type: 'purchase'
    },
    {
      user: 'Emily Davis',
      app: 'Clutch Partners',
      action: 'Diagnosed Issue',
      location: 'Fleet Management Co.',
      timestamp: '25 minutes ago',
      type: 'diagnostic'
    },
    {
      user: 'Alex Rodriguez',
      app: 'Clutch App',
      action: 'Scheduled Maintenance',
      location: 'Service Center Plus',
      timestamp: '32 minutes ago',
      type: 'maintenance'
    }
  ];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Clock className="h-4 w-4" />;
      case 'service': return <Wrench className="h-4 w-4" />;
      case 'purchase': return <Car className="h-4 w-4" />;
      case 'diagnostic': return <MapPin className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'booking': return 'text-blue-500';
      case 'service': return 'text-green-500';
      case 'purchase': return 'text-purple-500';
      case 'diagnostic': return 'text-orange-500';
      case 'maintenance': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-blue-100 text-blue-800';
      case 'service': return 'bg-green-100 text-green-800';
      case 'purchase': return 'bg-purple-100 text-purple-800';
      case 'diagnostic': return 'bg-orange-100 text-orange-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Activity Monitor
        </CardTitle>
        <CardDescription>
          Real-time user activity across Clutch and Partners apps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {activityData.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className={`${getActionColor(activity.type)} mt-1`}>
                {getActionIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{activity.user}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.app}
                    </Badge>
                    <Badge className={`text-xs ${getTypeColor(activity.type)}`}>
                      {activity.type}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {activity.action}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  📍 {activity.location}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {activity.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Users (Last Hour)</span>
              <span className="font-medium">45</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Peak Usage</span>
            <span className="font-medium">2:00 PM - 4:00 PM</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avg. Session Duration</span>
            <span className="font-medium">12.5 minutes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
