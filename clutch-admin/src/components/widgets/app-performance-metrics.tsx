'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

export default function AppPerformanceMetrics() {
  const performanceData = [
    {
      app: 'Clutch App',
      platform: 'Mobile',
      uptime: 99.8,
      responseTime: 1.2,
      errorRate: 0.1,
      crashes: 2,
      users: 1250,
      status: 'excellent'
    },
    {
      app: 'Clutch Partners',
      platform: 'Mobile',
      uptime: 99.9,
      responseTime: 0.8,
      errorRate: 0.05,
      crashes: 0,
      users: 340,
      status: 'excellent'
    },
    {
      app: 'Clutch Partners Windows',
      platform: 'Desktop',
      uptime: 99.5,
      responseTime: 0.5,
      errorRate: 0.2,
      crashes: 1,
      users: 120,
      status: 'good'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-yellow-600';
      case 'warning': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-yellow-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          App Performance Metrics
        </CardTitle>
        <CardDescription>
          Performance monitoring for all Clutch applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {performanceData.map((app, index) => (
          <div key={app.app} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{app.app}</div>
                <div className="text-sm text-muted-foreground">{app.platform}</div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(app.status)}
                <Badge variant="outline">{app.users} users</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-medium">{app.uptime}%</span>
                </div>
                <Progress value={app.uptime} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-medium">{app.responseTime}s</span>
                </div>
                <Progress value={100 - (app.responseTime * 20)} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-red-500">{app.crashes}</div>
                <div className="text-xs text-muted-foreground">Crashes</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-500">{app.errorRate}%</div>
                <div className="text-xs text-muted-foreground">Error Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-500">{app.users}</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall System Health</span>
            <span className="font-medium text-green-600">99.4%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avg. Response Time</span>
            <span className="font-medium">0.8s</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Active Users</span>
            <span className="font-medium">1,710</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
