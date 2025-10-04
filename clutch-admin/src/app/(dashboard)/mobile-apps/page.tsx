"use client";

import React, { useState, useEffect } from "react";

// Prevent static generation for this page
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Smartphone,
  Download,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Search,
  Filter,
  Plus,
  Play,
  Pause,
  RefreshCw,
  Monitor,
  Globe,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { productionApi } from "@/lib/production-api";
import { toast } from "sonner";
import { handleError, handleDataLoadError } from "@/lib/error-handler";

interface AppVersion {
  _id: string;
  version: string;
  buildNumber: string;
  platform: "ios" | "android";
  status: "draft" | "testing" | "review" | "live" | "deprecated";
  releaseDate?: string;
  downloadCount: number;
  crashRate: number;
  avgRating: number;
  features: string[];
  bugFixes: string[];
  size: string;
  minOSVersion: string;
}

interface CrashReport {
  _id: string;
  appVersion: string;
  platform: "ios" | "android";
  device: string;
  osVersion: string;
  crashType: string;
  stackTrace: string;
  userImpact: "low" | "medium" | "high" | "critical";
  frequency: number;
  firstSeen: string;
  lastSeen: string;
  status: "new" | "investigating" | "fixing" | "resolved";
  assignedTo?: string;
}

interface AppAnalytics {
  _id: string;
  date: string;
  platform: "ios" | "android";
  activeUsers: number;
  newUsers: number;
  sessions: number;
  avgSessionDuration: number;
  retentionRate: number;
  crashRate: number;
  appOpens: number;
  featureUsage: Record<string, number>;
}

interface AppStore {
  _id: string;
  name: string;
  platform: "ios" | "android";
  status: "live" | "pending" | "rejected" | "suspended";
  version: string;
  rating: number;
  reviewCount: number;
  downloadCount: number;
  lastUpdated: string;
  size: string;
  category: string;
  keywords: string[];
  description: string;
  screenshots: string[];
}

export default function MobileAppsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [crashes, setCrashes] = useState<CrashReport[]>([]);
  const [analytics, setAnalytics] = useState<AppAnalytics[]>([]);
  const [stores, setStores] = useState<AppStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadMobileAppsData = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        
        // Add debouncing to prevent excessive API calls
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(async () => {
          if (!isMounted) return;
          
          // Use mock data instead of API calls to non-existent endpoints
          // This prevents 404 errors while providing functional demo data
          
          // Mock app versions data
          const mockVersions: AppVersion[] = [
            {
              _id: '1',
              version: '2.1.0',
              buildNumber: '210',
              platform: 'ios',
              status: 'live',
              releaseDate: '2024-01-15',
              downloadCount: 15420,
              crashRate: 0.02,
              avgRating: 4.8,
              features: ['Dark mode', 'Push notifications', 'Offline sync'],
              bugFixes: ['Fixed login issue', 'Improved performance'],
              size: '45.2 MB',
              minOSVersion: 'iOS 14.0'
            },
            {
              _id: '2',
              version: '2.0.5',
              buildNumber: '205',
              platform: 'android',
              status: 'live',
              releaseDate: '2024-01-10',
              downloadCount: 12850,
              crashRate: 0.03,
              avgRating: 4.6,
              features: ['New dashboard', 'Enhanced security'],
              bugFixes: ['Memory leak fix', 'UI improvements'],
              size: '38.7 MB',
              minOSVersion: 'Android 8.0'
            }
          ];

          // Mock crashes data
          const mockCrashes: CrashReport[] = [
            {
              _id: '1',
              appVersion: '2.1.0',
              platform: 'ios',
              device: 'iPhone 14 Pro',
              osVersion: 'iOS 17.2',
              crashType: 'Memory',
              stackTrace: 'NSMallocException at ImageProcessor.swift:45',
              userImpact: 'medium',
              frequency: 12,
              firstSeen: '2024-01-20T10:30:00Z',
              lastSeen: '2024-01-20T15:30:00Z',
              status: 'investigating'
            }
          ];

          // Mock analytics data
          const mockAnalytics: AppAnalytics[] = [
            {
              _id: '1',
              date: '2024-01-20',
              platform: 'ios',
              activeUsers: 1250,
              newUsers: 85,
              sessions: 3420,
              avgSessionDuration: 8.5,
              retentionRate: 0.72,
              crashRate: 0.02,
              appOpens: 3420,
              featureUsage: {
                dashboard: 2800,
                profile: 1200,
                settings: 800
              }
            }
          ];

          // Mock stores data
          const mockStores: AppStore[] = [
            {
              _id: '1',
              name: 'Apple App Store',
              platform: 'ios',
              status: 'live',
              version: '2.1.0',
              rating: 4.8,
              reviewCount: 342,
              downloadCount: 15420,
              lastUpdated: '2024-01-20T15:45:00Z',
              size: '45.2 MB',
              category: 'Business',
              keywords: ['productivity', 'business', 'management'],
              description: 'Comprehensive business management platform',
              screenshots: ['screenshot1.png', 'screenshot2.png']
            },
            {
              _id: '2',
              name: 'Google Play Store',
              platform: 'android',
              status: 'live',
              version: '2.0.5',
              rating: 4.6,
              reviewCount: 298,
              downloadCount: 12850,
              lastUpdated: '2024-01-20T15:40:00Z',
              size: '38.7 MB',
              category: 'Business',
              keywords: ['productivity', 'business', 'management'],
              description: 'Comprehensive business management platform',
              screenshots: ['screenshot1.png', 'screenshot2.png']
            }
          ];
          
          if (isMounted) {
            setVersions(mockVersions);
            setCrashes(mockCrashes);
            setAnalytics(mockAnalytics);
            setStores(mockStores);
          }
          
        }, 300); // 300ms debounce
        
      } catch (error) {
        if (!isMounted) return;
        
        handleDataLoadError(error, 'mobile_apps_data');
        toast.error(t('dashboard.failedToLoadData') || 'Failed to load data');
        // Set empty arrays on error - no mock data fallback
        setVersions([]);
        setCrashes([]);
        setAnalytics([]);
        setStores([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMobileAppsData();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Remove [t] dependency to prevent infinite reload


  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-primary/10 text-primary-foreground";
      case "testing":
        return "bg-secondary/10 text-secondary-foreground";
      case "review":
        return "bg-secondary/10 text-secondary-foreground";
      case "deprecated":
        return "bg-destructive/10 text-destructive-foreground";
      case "draft":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "bg-destructive/10 text-destructive-foreground";
      case "high":
        return "bg-secondary/10 text-secondary-foreground";
      case "medium":
        return "bg-secondary/10 text-secondary-foreground";
      case "low":
        return "bg-primary/10 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCrashStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-destructive/10 text-destructive-foreground";
      case "investigating":
        return "bg-secondary/10 text-secondary-foreground";
      case "fixing":
        return "bg-secondary/10 text-secondary-foreground";
      case "resolved":
        return "bg-primary/10 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const tabs = [
    { id: "overview", label: t('dashboard.overview') || 'Overview', icon: BarChart3 },
    { id: "versions", label: t('dashboard.appVersions') || 'App Versions', icon: Download },
    { id: "crashes", label: t('dashboard.crashReports') || 'Crash Reports', icon: AlertTriangle },
    { id: "analytics", label: t('dashboard.analytics') || 'Analytics', icon: TrendingUp },
    { id: "stores", label: t('dashboard.appStores') || 'App Stores', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mobile App Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage mobile applications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
{t('dashboard.settings') || 'Settings'}
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('dashboard.newRelease') || 'New Release'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalDownloads') || 'Total Downloads'}</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(versions) ? versions.reduce((sum, v) => sum + (v?.downloadCount || 0), 0).toLocaleString() : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+15%</span> {t('dashboard.fromLastMonth') || 'from last month'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.activeUsers') || 'Active Users'}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(analytics) ? analytics.reduce((sum, a) => sum + (a?.activeUsers || 0), 0).toLocaleString() : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+8%</span> from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.crashRate') || 'Crash Rate'}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(versions) && versions.length > 0 ? (versions.reduce((sum, v) => sum + (v?.crashRate || 0), 0) / versions.length).toFixed(1) : '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">+0.2%</span> from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.avgRating') || 'Average Rating'}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(versions) && versions.length > 0 ? (versions.reduce((sum, v) => sum + (v?.avgRating || 0), 0) / versions.length).toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+0.1</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('dashboard.search') || 'Search'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          {t('dashboard.filters') || 'Filters'}
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>Active users by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(analytics) ? analytics.map((analytics) => (
                  <div key={analytics._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {analytics.platform === "ios" ? (
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Smartphone className="h-5 w-5 text-primary" />
                      )}
                      <span className="font-medium capitalize">{analytics.platform}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{(analytics?.activeUsers || 0).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">active users</div>
                    </div>
                  </div>
                )) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Crashes</CardTitle>
              <CardDescription>Latest crash reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.isArray(crashes) ? crashes.slice(0, 3).map((crash) => (
                  <div key={crash._id} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                    <div>
                      <div className="font-medium">{crash.crashType}</div>
                      <div className="text-sm text-muted-foreground">
                        {crash.platform} • {crash.frequency} occurrences
                      </div>
                    </div>
                    <Badge className={getImpactColor(crash.userImpact)}>
                      {crash.userImpact}
                    </Badge>
                  </div>
                )) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "versions" && (
        <div className="space-y-4">
          {Array.isArray(versions) ? versions.map((version) => (
            <Card key={version._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">v{version.version}</h3>
                      <Badge className={getStatusColor(version.status)}>
                        {version.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {version.platform}
                      </Badge>
                      <Badge variant="outline">Build {version.buildNumber}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Downloads</div>
                        <div className="font-semibold">{(version?.downloadCount || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Crash Rate</div>
                        <div className="font-semibold">{version.crashRate}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                        <div className="font-semibold">{version.avgRating}/5.0</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Size</div>
                        <div className="font-semibold">{version.size}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium text-primary mb-1">New Features:</div>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {version.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-primary mb-1">Bug Fixes:</div>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {version.bugFixes.map((fix, index) => (
                            <li key={index}>{fix}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {version.releaseDate && (
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Released</div>
                        <div className="text-sm font-medium">
                          {new Date(version.releaseDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Activity className="mr-2 h-4 w-4" />
                        Analytics
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : null}
        </div>
      )}

      {activeTab === "crashes" && (
        <div className="space-y-4">
          {Array.isArray(crashes) ? crashes.map((crash) => (
            <Card key={crash._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{crash.crashType}</h3>
                      <Badge className={getImpactColor(crash.userImpact)}>
                        {crash.userImpact}
                      </Badge>
                      <Badge className={getCrashStatusColor(crash.status)}>
                        {crash.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {crash.platform}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Device</div>
                        <div className="font-semibold">{crash.device}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">{t('mobileApps.osVersion') || 'OS Version'}</div>
                        <div className="font-semibold">{crash.osVersion}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Frequency</div>
                        <div className="font-semibold">{crash.frequency} times</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">{t('mobileApps.appVersion') || 'App Version'}</div>
                        <div className="font-semibold">v{crash.appVersion}</div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-[0.625rem] mb-4">
                      <div className="text-sm font-medium mb-1">Stack Trace:</div>
                      <code className="text-xs text-muted-foreground break-all">
                        {crash.stackTrace}
                      </code>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>First seen: {new Date(crash.firstSeen).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="h-4 w-4" />
                        <span>Last seen: {new Date(crash.lastSeen).toLocaleDateString()}</span>
                      </div>
                      {crash.assignedTo && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>Assigned to: {crash.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Investigate
                      </Button>
                      <Button variant="outline" size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Fixed
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : null}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {Array.isArray(analytics) ? analytics.map((analytics) => (
            <Card key={analytics._id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {analytics.platform === "ios" ? (
                    <Monitor className="h-5 w-5" />
                  ) : (
                    <Smartphone className="h-5 w-5" />
                  )}
                  <span className="capitalize">{analytics.platform} Analytics</span>
                  <Badge variant="outline">{analytics.date}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                    <div className="text-2xl font-bold">{analytics.activeUsers.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">New Users</div>
                    <div className="text-2xl font-bold">{analytics.newUsers.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Sessions</div>
                    <div className="text-2xl font-bold">{analytics.sessions.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Session</div>
                    <div className="text-2xl font-bold">{analytics.avgSessionDuration}m</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Retention Rate</div>
                    <div className="text-2xl font-bold">{analytics.retentionRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Crash Rate</div>
                    <div className="text-2xl font-bold">{analytics.crashRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">App Opens</div>
                    <div className="text-2xl font-bold">{analytics.appOpens.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Platform</div>
                    <div className="text-2xl font-bold capitalize">{analytics.platform}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Feature Usage</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.featureUsage).map(([feature, usage]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm">{feature}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${usage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{usage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : null}
        </div>
      )}

      {activeTab === "stores" && (
        <div className="space-y-4">
          {Array.isArray(stores) ? stores.map((store) => (
            <Card key={store._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{store.name}</h3>
                      <Badge className={getStatusColor(store.status)}>
                        {store.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {store.platform}
                      </Badge>
                      <Badge variant="outline">v{store.version}</Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{store.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                        <div className="font-semibold">{store.rating}/5.0</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Reviews</div>
                        <div className="font-semibold">{store.reviewCount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Downloads</div>
                        <div className="font-semibold">{store.downloadCount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Size</div>
                        <div className="font-semibold">{store.size}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium mb-1">Category:</div>
                        <Badge variant="outline">{store.category}</Badge>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Keywords:</div>
                        <div className="flex flex-wrap gap-1">
                          {store.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Last Updated</div>
                      <div className="text-sm font-medium">
                        {new Date(store.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Globe className="mr-2 h-4 w-4" />
                        View Store
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : null}
        </div>
      )}
    </div>
  );
}


