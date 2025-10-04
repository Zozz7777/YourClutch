'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Users, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AppOverview() {
  const appData = [
    {
      name: 'Clutch App',
      platform: 'Mobile',
      status: 'active',
      users: 1250,
      sessions: 3450,
      crashes: 2,
      version: '2.1.4',
      lastUpdate: '2 hours ago'
    },
    {
      name: 'Clutch Partners',
      platform: 'Mobile',
      status: 'active',
      users: 340,
      sessions: 890,
      crashes: 0,
      version: '1.8.2',
      lastUpdate: '1 day ago'
    },
    {
      name: 'Clutch Partners Windows',
      platform: 'Desktop',
      status: 'active',
      users: 120,
      sessions: 450,
      crashes: 1,
      version: '3.2.1',
      lastUpdate: '3 hours ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'Mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          App Overview
        </CardTitle>
        <CardDescription>
          Real-time status of Clutch and Partners applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {appData.map((app, index) => (
          <div key={app.name} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPlatformIcon(app.platform)}
                <div>
                  <div className="font-medium">{app.name}</div>
                  <div className="text-sm text-muted-foreground">
                    v{app.version} • {app.platform}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(app.status)}>
                  {app.status}
                </Badge>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">{app.users.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{app.sessions.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Sessions Today</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${app.crashes > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {app.crashes}
                </div>
                <div className="text-xs text-muted-foreground">Crashes</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Update</span>
              <span>{app.lastUpdate}</span>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Active Users</span>
            <span className="font-medium">1,710</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Sessions Today</span>
            <span className="font-medium">4,790</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">System Health</span>
            <span className="font-medium text-green-600">98.2%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
