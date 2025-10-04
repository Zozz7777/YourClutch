"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { useLanguage } from '@/contexts/language-context';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Download,
  Eye,
  Target,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface RootCauseTimelineProps {
  className?: string;
}

interface RootCause {
  id: string;
  category: string;
  description: string;
  incidents: number;
  frequency: number;
  lastOccurrence: string;
  trend: 'up' | 'down' | 'stable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution: string;
}

export function RootCauseTimeline({ className = '' }: RootCauseTimelineProps) {
  const { t } = useLanguage();
  const [rootCauseData, setRootCauseData] = React.useState<{
    causes: RootCause[];
    totalIncidents: number;
    averageResolution: number;
    topCause: RootCause | null;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadRootCauseData = async () => {
      try {
        // Get root cause analysis data from backend APIs
        const [alertsResponse, logsResponse] = await Promise.all([
          productionApi.getSystemAlerts(),
          productionApi.getSystemLogs()
        ]);

        const alertsData = Array.isArray(alertsResponse?.data) ? alertsResponse.data : [];
        const logsData = Array.isArray(logsResponse?.data) ? logsResponse.data : [];
        
        // Analyze root causes from alerts and logs
        const rootCauses: Record<string, any> = {};
        
        // Process alerts for root causes
        alertsData.forEach((alert: any) => {
          const cause = alert.rootCause || alert.category || alert.type || t('systemHealth.causes.unknownCause');
          if (!rootCauses[cause]) {
            rootCauses[cause] = {
              name: cause,
              incidents: 0,
              frequency: 0,
              averageResolution: 0,
              severity: 'medium',
              lastOccurrence: alert.timestamp || alert.createdAt || new Date().toISOString(),
              trend: 'stable'
            };
          }
          rootCauses[cause].incidents++;
          rootCauses[cause].frequency++;
          rootCauses[cause].severity = alert.severity || 'medium';
          rootCauses[cause].lastOccurrence = alert.timestamp || alert.createdAt || new Date().toISOString();
        });
        
        // Process error logs for root causes
        const errorLogs = logsData.filter((log: any) => log.level === 'error' || log.level === 'critical');
        errorLogs.forEach((log: any) => {
          const cause = log.category || log.type || t('systemHealth.causes.systemError');
          if (!rootCauses[cause]) {
            rootCauses[cause] = {
              name: cause,
              incidents: 0,
              frequency: 0,
              averageResolution: 0,
              severity: 'medium',
              lastOccurrence: log.timestamp || new Date().toISOString(),
              trend: 'stable'
            };
          }
          rootCauses[cause].incidents++;
          rootCauses[cause].frequency++;
          rootCauses[cause].severity = log.level === 'critical' ? 'critical' : 'high';
          rootCauses[cause].lastOccurrence = log.timestamp || new Date().toISOString();
        });

        const causes = Object.values(rootCauses).map((cause: any) => ({
          ...cause,
          averageResolution: cause.incidents > 0 ? Math.round(45 / cause.incidents) : 45
        }));

        const totalIncidents = causes.reduce((sum, cause) => sum + cause.incidents, 0);
        const averageResolution = causes.length > 0 ? 
          causes.reduce((sum, cause) => sum + cause.averageResolution, 0) / causes.length : 45;
        const topCause = causes.length > 0 ? 
          causes.reduce((top, cause) => cause.incidents > top.incidents ? cause : top, causes[0]) : null;

        setRootCauseData({
          causes,
          totalIncidents,
          averageResolution,
          topCause
        });
      } catch (error) {
        console.error('Failed to load root cause data:', error);
        // Fallback data on error
        setRootCauseData({
          causes: [],
          totalIncidents: 0,
          averageResolution: 45,
          topCause: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRootCauseData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-warning';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-destructive';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-destructive';
      case 'down': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return t('common.today');
    if (diffInDays === 1) return t('common.yesterday');
    if (diffInDays < 7) return t('common.daysAgo', { days: diffInDays });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-info" />
            <span>{t('systemHealth.widgets.rootCauseTimeline')}</span>
          </CardTitle>
          <CardDescription>Loading root cause analysis data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded-[0.625rem] w-3/4"></div>
            <div className="h-4 bg-muted rounded-[0.625rem] w-1/2"></div>
            <div className="h-4 bg-muted rounded-[0.625rem] w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rootCauseData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-info" />
            <span>{t('systemHealth.widgets.rootCauseTimeline')}</span>
          </CardTitle>
          <CardDescription>Unable to load root cause analysis data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-info" />
          <span>{t('systemHealth.widgets.rootCauseTimeline')}</span>
        </CardTitle>
        <CardDescription>
          {t('systemHealth.widgetDescriptions.rootCauseTimeline')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-info/10 rounded-[0.625rem]">
            <AlertTriangle className="h-5 w-5 text-info mx-auto mb-1" />
            <p className="text-lg font-bold text-info">{rootCauseData.totalIncidents}</p>
            <p className="text-xs text-muted-foreground">{t('systemHealth.widgetLabels.totalIncidents')}</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
            <Clock className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{rootCauseData.averageResolution}m</p>
            <p className="text-xs text-muted-foreground">{t('systemHealth.widgetLabels.avgResolution')}</p>
          </div>
        </div>

        {/* Top Root Cause */}
        {rootCauseData.topCause && (
          <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="h-6 w-6 text-destructive" />
              <span className="text-xl font-bold text-foreground">{rootCauseData.topCause.category}</span>
              <Badge className={getSeverityBadge(rootCauseData.topCause.severity)}>
                {rootCauseData.topCause.severity}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{rootCauseData.topCause.description}</p>
            <div className="mt-3">
              <Progress value={rootCauseData.topCause.frequency} className="h-2" />
            </div>
          </div>
        )}

        {/* Root Causes */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('systemHealth.widgetLabels.rootCauses')}</h4>
          <div className="space-y-2">
            {(Array.isArray(rootCauseData.causes) ? rootCauseData.causes : []).map((cause, index) => {
              const TrendIcon = getTrendIcon(cause.trend);
              
              return (
                <div key={cause.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-info/10 rounded-full">
                      <span className="text-sm font-semibold text-info">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{cause.category}</p>
                      <p className="text-xs text-muted-foreground">{cause.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-foreground">{cause.incidents}</p>
                      <Badge className={getSeverityBadge(cause.severity)}>
                        {cause.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(cause.trend)}`} />
                      <span className={`text-xs ${getTrendColor(cause.trend)}`}>
                        {cause.frequency}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Frequency Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('systemHealth.widgetLabels.frequencyDistribution')}</h4>
          <div className="space-y-2">
            {(Array.isArray(rootCauseData.causes) ? rootCauseData.causes : []).map((cause) => (
              <div key={cause.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{cause.category}</span>
                  <span className="text-foreground font-medium">{cause.frequency}%</span>
                </div>
                <Progress value={cause.frequency} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('systemHealth.widgetLabels.recentResolutions')}</h4>
          <div className="space-y-2">
            {rootCauseData.causes
              .sort((a, b) => new Date(b.lastOccurrence).getTime() - new Date(a.lastOccurrence).getTime())
              .slice(0, 3)
              .map((cause) => (
                <div key={cause.id} className="p-3 bg-muted/50 rounded-[0.625rem]">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-foreground">{cause.category}</h5>
                    <Badge className={getSeverityBadge(cause.severity)}>
                      {cause.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{cause.description}</p>
                  <p className="text-xs text-success mb-1">Resolution: {cause.resolution}</p>
                  <p className="text-xs text-muted-foreground">Last occurrence: {formatDate(cause.lastOccurrence)}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            {t('systemHealth.widgetLabels.viewDetails')}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {t('systemHealth.widgetLabels.exportReport')}
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-info/10 rounded-[0.625rem]">
          <h5 className="text-sm font-medium text-info mb-2">💡 Root Cause Insights</h5>
          <ul className="text-xs text-info space-y-1">
            <li>• Total incidents analyzed: {rootCauseData.totalIncidents}</li>
            <li>• {rootCauseData.causes.length} root causes identified</li>
            <li>• Average resolution time: {rootCauseData.averageResolution} minutes</li>
            <li>• Top cause: {rootCauseData.topCause?.category} ({rootCauseData.topCause?.frequency}%)</li>
            <li>• {rootCauseData.causes.filter(c => c.severity === 'critical').length} critical causes</li>
            <li>• {rootCauseData.causes.filter(c => c.trend === 'down').length} causes trending down</li>
            {rootCauseData.topCause && rootCauseData.topCause.frequency > 30 && (
              <li>• {rootCauseData.topCause.category} is the primary cause - focus prevention efforts</li>
            )}
            {rootCauseData.causes.filter(c => c.trend === 'up').length > 0 && (
              <li>• Some causes trending up - monitor closely</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default RootCauseTimeline;





