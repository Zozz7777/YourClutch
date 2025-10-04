"use client";

import React, { useState, useEffect } from "react";

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Flag,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Users,
  Globe,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Target,
  Calendar,
  Activity,
  Zap,
} from "lucide-react";
import { productionApi } from "@/lib/production-api";
import { handleDataLoadError } from "@/lib/error-handler";
// Translation system removed - using hardcoded strings

interface FeatureFlag {
  _id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  type: "boolean" | "string" | "number" | "json";
  defaultValue: string | number | boolean;
  currentValue: string | number | boolean;
  environment: "development" | "staging" | "production";
  tags: string[];
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: {
    id: string;
    name: string;
    email: string;
  };
  rollout: {
    percentage: number;
    targetUsers: string[];
    targetSegments: string[];
    conditions: Record<string, unknown>;
  };
  analytics: {
    impressions: number;
    conversions: number;
    conversionRate: number;
    lastEvaluated: string;
  };
}

interface ABTest {
  _id: string;
  name: string;
  description: string;
  featureFlagId: string;
  status: "draft" | "running" | "paused" | "completed";
  variants: {
    name: string;
    value: string | number | boolean;
    percentage: number;
    metrics: {
      impressions: number;
      conversions: number;
      conversionRate: number;
    };
  }[];
  startDate: string;
  endDate: string;
  successMetric: string;
  minimumSampleSize: number;
  confidenceLevel: number;
  results: {
    winner: string;
    confidence: number;
    significance: boolean;
    lift: number;
  };
  createdAt: string;
}

interface Rollout {
  _id: string;
  name: string;
  featureFlagId: string;
  type: "percentage" | "user_list" | "segment" | "geographic";
  status: "scheduled" | "active" | "paused" | "completed";
  target: {
    percentage?: number;
    userIds?: string[];
    segments?: string[];
    countries?: string[];
    regions?: string[];
  };
  schedule: {
    startDate: string;
    endDate?: string;
    timezone: string;
  };
  metrics: {
    totalUsers: number;
    exposedUsers: number;
    conversionRate: number;
  };
  createdAt: string;
}

export default function FeatureFlagsPage() {
  const t = (key: string, params?: any) => key;
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [rollouts, setRollouts] = useState<Rollout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [environmentFilter, setEnvironmentFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showABTestDialog, setShowABTestDialog] = useState(false);
  const [showRolloutDialog, setShowRolloutDialog] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);

  // Form data states
  const [createFlagData, setCreateFlagData] = useState({
    name: "",
    key: "",
    description: "",
      type: "boolean",
    defaultValue: "",
    environment: "development",
    tags: ""
  });
  
  const [createABTestData, setCreateABTestData] = useState({
    name: "",
    description: "",
    featureFlagId: "",
    successMetric: "",
    startDate: "",
    endDate: "",
    confidenceLevel: "95"
  });
  
  const [createRolloutData, setCreateRolloutData] = useState({
    name: "",
    featureFlagId: "",
      type: "percentage",
    percentage: "",
    startDate: "",
    endDate: ""
  });


  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadAllData = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        
        // Add debouncing to prevent excessive API calls
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(async () => {
          if (!isMounted) return;
          
          // Load all data with error handling
          const [flagsData, abTestsData, rolloutsData] = await Promise.allSettled([
            productionApi.getFeatureFlags(),
            productionApi.getABTests(),
            productionApi.getRollouts()
          ]);

          // Handle feature flags data with validation
          let flagsArray: FeatureFlag[] = [];
          if (flagsData.status === 'fulfilled' && Array.isArray(flagsData.value)) {
            flagsArray = flagsData.value.map((flag: any) => ({
              _id: flag._id || flag.id || `flag_${Date.now()}_${Math.random()}`,
              name: flag.name || 'Unnamed Flag',
              key: flag.key || 'unnamed_flag',
              description: flag.description || '',
              enabled: Boolean(flag.enabled),
              type: flag.type || 'boolean',
              defaultValue: flag.defaultValue || false,
              currentValue: flag.currentValue || flag.defaultValue || false,
              environment: flag.environment || 'development',
              tags: Array.isArray(flag.tags) ? flag.tags : [],
              createdBy: flag.createdBy || { id: 'unknown', name: 'Unknown', email: 'unknown@example.com' },
              createdAt: flag.createdAt || new Date().toISOString(),
              updatedAt: flag.updatedAt || new Date().toISOString(),
              lastModifiedBy: flag.lastModifiedBy || { id: 'unknown', name: 'Unknown', email: 'unknown@example.com' },
              rollout: flag.rollout || { percentage: 0, targetUsers: [], targetSegments: [], conditions: {} },
              analytics: flag.analytics || { impressions: 0, conversions: 0, conversionRate: 0, lastEvaluated: new Date().toISOString() }
            }));
          }
          
          // Handle AB tests data with validation
          let abTestsArray: ABTest[] = [];
          if (abTestsData.status === 'fulfilled' && Array.isArray(abTestsData.value)) {
            abTestsArray = abTestsData.value.map((test: any) => ({
              _id: test._id || test.id || `test_${Date.now()}_${Math.random()}`,
              name: test.name || 'Unnamed Test',
              description: test.description || '',
              featureFlagId: test.featureFlagId || '',
              status: test.status || 'draft',
              variants: Array.isArray(test.variants) ? test.variants : [],
              startDate: test.startDate || new Date().toISOString(),
              endDate: test.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              successMetric: test.successMetric || 'conversion_rate',
              minimumSampleSize: test.minimumSampleSize || 1000,
              confidenceLevel: test.confidenceLevel || 95,
              results: test.results || { winner: '', confidence: 0, significance: false, lift: 0 },
              createdAt: test.createdAt || new Date().toISOString()
            }));
          }
          
          // Handle rollouts data with validation
          let rolloutsArray: Rollout[] = [];
          if (rolloutsData.status === 'fulfilled' && Array.isArray(rolloutsData.value)) {
            rolloutsArray = rolloutsData.value.map((rollout: any) => ({
              _id: rollout._id || rollout.id || `rollout_${Date.now()}_${Math.random()}`,
              name: rollout.name || 'Unnamed Rollout',
              featureFlagId: rollout.featureFlagId || '',
              type: rollout.type || 'percentage',
              status: rollout.status || 'scheduled',
              target: rollout.target || { percentage: 0 },
              schedule: rollout.schedule || { startDate: new Date().toISOString(), timezone: 'UTC' },
              metrics: rollout.metrics || { totalUsers: 0, exposedUsers: 0, conversionRate: 0 },
              createdAt: rollout.createdAt || new Date().toISOString()
            }));
          }
          
          if (isMounted) {
            setFeatureFlags(flagsArray);
            setABTests(abTestsArray);
            setRollouts(rolloutsArray);
          }
          
          // Log any errors
          if (flagsData.status === 'rejected') {
            handleDataLoadError(flagsData.reason, 'feature_flags');
          }
          if (abTestsData.status === 'rejected') {
            handleDataLoadError(abTestsData.reason, 'ab_tests');
          }
          if (rolloutsData.status === 'rejected') {
            handleDataLoadError(rolloutsData.reason, 'rollouts');
          }
          
        }, 300); // 300ms debounce
        
      } catch (error) {
        if (!isMounted) return;
        
        handleDataLoadError(error, 'feature_flags_data');
        setFeatureFlags([]);
        setABTests([]);
        setRollouts([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAllData();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  
  const createFeatureFlag = async () => {
    try {
      const flagData = {
        name: createFlagData.name,
        key: createFlagData.key,
        description: createFlagData.description,
        enabled: false,
        type: createFlagData.type,
        defaultValue: createFlagData.defaultValue,
        currentValue: createFlagData.defaultValue,
        environment: createFlagData.environment,
        tags: createFlagData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdBy: {
          id: "current-user",
          name: t('featureFlags.currentUser') || 'Current User',
          email: "user@example.com"
        },
        rollout: {
          percentage: 0,
          targetUsers: [],
          targetSegments: [],
          conditions: {}
        },
        analytics: {
          impressions: 0,
          conversions: 0,
          conversionRate: 0,
          lastEvaluated: new Date().toISOString()
        }
      };
      
      const newFlag = await productionApi.createFeatureFlag(flagData);
      if (newFlag) {
        setFeatureFlags(prev => [...(Array.isArray(prev) ? prev : []), newFlag as unknown as FeatureFlag]);
        setShowCreateDialog(false);
        setCreateFlagData({
          name: "",
          key: "",
          description: "",
          type: "boolean",
          defaultValue: "",
          environment: "development",
          tags: ""
        });
      }
    } catch (error) {
      // Error handled by API service
    }
  };
  
  const createABTest = async () => {
    try {
      const abTestData = {
        name: createABTestData.name,
        description: createABTestData.description,
        featureFlagId: createABTestData.featureFlagId,
        status: "draft",
        variants: [],
        startDate: createABTestData.startDate,
        endDate: createABTestData.endDate,
        successMetric: createABTestData.successMetric,
        minimumSampleSize: 1000,
        confidenceLevel: parseInt(createABTestData.confidenceLevel),
        results: {
          winner: "",
          confidence: 0,
          significance: false,
          lift: 0
        }
      };
      
      const newTest = await productionApi.createABTest(abTestData);
      if (newTest) {
        setABTests(prev => [...(Array.isArray(prev) ? prev : []), newTest as unknown as ABTest]);
        setShowABTestDialog(false);
        setCreateABTestData({
          name: "",
          description: "",
          featureFlagId: "",
          successMetric: "",
          startDate: "",
          endDate: "",
          confidenceLevel: "95"
        });
      }
    } catch (error) {
      // Error handled by API service
    }
  };
  
  const createRollout = async () => {
    try {
      const rolloutData = {
        name: createRolloutData.name,
        featureFlagId: createRolloutData.featureFlagId,
        type: createRolloutData.type,
        status: "scheduled",
        target: {
          percentage: parseInt(createRolloutData.percentage) || 0
        },
        schedule: {
          startDate: createRolloutData.startDate,
          endDate: createRolloutData.endDate || undefined,
          timezone: "Africa/Cairo"
        },
        metrics: {
          totalUsers: 0,
          exposedUsers: 0,
          conversionRate: 0
        }
      };
      
      const newRollout = await productionApi.createRollout(rolloutData);
      if (newRollout) {
        setRollouts(prev => [...(Array.isArray(prev) ? prev : []), newRollout as unknown as Rollout]);
        setShowRolloutDialog(false);
        setCreateRolloutData({
          name: "",
          featureFlagId: "",
          type: "percentage",
          percentage: "",
          startDate: "",
          endDate: ""
        });
      }
    } catch (error) {
      // Error handled by API service
    }
  };

  const toggleFeatureFlag = async (flagId: string, enabled: boolean) => {
    try {
      await productionApi.updateFeatureFlag(flagId, { enabled: enabled });
      setFeatureFlags(prev => 
        (Array.isArray(prev) ? prev : []).map(flag => 
          flag?._id === flagId 
            ? { ...flag, enabled, updatedAt: new Date().toISOString() }
            : flag
        )
      );
    } catch (error) {
      // Error handled by API service
    }
  };

  const getStatusVariant = (enabled: boolean) => {
    return enabled ? "default" : "outline";
  };

  const getEnvironmentVariant = (environment: string) => {
    switch (environment) {
      case "production":
        return "destructive";
      case "staging":
        return "secondary";
      case "development":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getABTestStatusVariant = (status: string) => {
    switch (status) {
      case "running":
        return "default";
      case "paused":
        return "secondary";
      case "completed":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  const featureFlagsArray = Array.isArray(featureFlags) ? featureFlags : [];
  const abTestsArray = Array.isArray(abTests) ? abTests : [];
  
  const filteredFlags = featureFlagsArray.filter((flag) => {
    if (!flag) return false;
    const matchesSearch = (flag?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (flag?.key || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (flag?.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "enabled" && flag?.enabled) ||
                         (statusFilter === "disabled" && !flag?.enabled);
    const matchesEnvironment = environmentFilter === "all" || flag?.environment === environmentFilter;
    return matchesSearch && matchesStatus && matchesEnvironment;
  });

  const totalFlags = featureFlagsArray.length;
  const enabledFlags = featureFlagsArray.filter(f => f?.enabled).length;
  const productionFlags = featureFlagsArray.filter(f => f?.environment === "production").length;
  const totalImpressions = featureFlagsArray.reduce((sum, f) => sum + (f?.analytics?.impressions || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading feature flags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">
            Manage feature flags and toggles
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowRolloutDialog(true)} variant="outline">
            <Globe className="mr-2 h-4 w-4" />
            {t('dashboard.createRollout')}
          </Button>
          <Button onClick={() => setShowABTestDialog(true)} variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            {t('dashboard.createAbTest')}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('dashboard.createFlag')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlags}</div>
            <p className="text-xs text-muted-foreground">
              {enabledFlags} enabled, {totalFlags - enabledFlags} disabled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Flags</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionFlags}</div>
            <p className="text-xs text-muted-foreground">
              Live in production
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all flags
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('featureFlags.activeABTests')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {abTestsArray.filter(t => t?.status === "running").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            {t('dashboard.manageFeatureToggles')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feature flags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  {t('dashboard.status')}: {statusFilter === "all" ? t('dashboard.all') : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  {t('dashboard.allStatus')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("enabled")}>
{t('dashboard.enabled')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("disabled")}>
{t('dashboard.disabled')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  {t('dashboard.env')}: {environmentFilter === "all" ? t('dashboard.all') : environmentFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setEnvironmentFilter("all")}>
                  {t('dashboard.allEnvironments')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEnvironmentFilter("production")}>
                  {t('dashboard.production')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEnvironmentFilter("staging")}>
                  {t('dashboard.staging')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEnvironmentFilter("development")}>
                  {t('dashboard.development')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {Array.isArray(filteredFlags) ? filteredFlags.map((flag) => {
              // Validate flag object before rendering
              if (!flag || typeof flag !== 'object' || !flag._id) {
                return null;
              }
              
              return (
              <Card key={flag._id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{flag.name}</h3>
                        <Badge variant={getStatusVariant(flag.enabled)}>
                          {flag.enabled ? t('dashboard.enabled') : t('dashboard.disabled')}
                        </Badge>
                        <Badge variant={getEnvironmentVariant(flag.environment)}>
                          {flag.environment}
                        </Badge>
                        <Badge variant="outline">
                          {flag.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{flag.description}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        <code className="bg-muted px-2 py-1 rounded">{flag.key}</code>
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Current Value</p>
                          <p className="text-sm text-muted-foreground">
                            {typeof flag.currentValue === "boolean" 
                              ? flag.currentValue.toString() 
                              : flag.currentValue}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t('featureFlags.rollout')}</p>
                          <p className="text-sm text-muted-foreground">
                            {flag.rollout.percentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Impressions</p>
                          <p className="text-sm text-muted-foreground">
                            {flag.analytics.impressions.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Conversion Rate</p>
                          <p className="text-sm text-muted-foreground">
                            {flag.analytics.conversionRate.toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>Created by {flag.createdBy.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(flag.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-4 w-4" />
                          <span>Last evaluated: {new Date(flag.analytics.lastEvaluated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatureFlag(flag._id, !flag.enabled)}
                      >
                        {flag.enabled ? (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
{t('featureFlags.disable')}
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
{t('featureFlags.enable')}
                          </>
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedFlag(flag)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
{t('featureFlags.editFlag')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
{t('featureFlags.configureRollout')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
{t('featureFlags.deleteFlag')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            }) : null}
          </div>
        </CardContent>
      </Card>

      {/* A/B Tests */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.abTests')}</CardTitle>
          <CardDescription>
            {t('dashboard.monitorAndManageAbTests')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(abTests) ? abTests.map((test) => {
              // Validate test object before rendering
              if (!test || typeof test !== 'object' || !test._id) {
                return null;
              }
              
              return (
              <Card key={test._id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{test.name}</h3>
                        <Badge variant={getABTestStatusVariant(test.status)}>
                          {test.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{test.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">{t('dashboard.successMetric')}</p>
                          <p className="text-sm text-muted-foreground">{test.successMetric}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Confidence Level</p>
                          <p className="text-sm text-muted-foreground">{test.confidenceLevel}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Sample Size</p>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(test?.variants) ? test.variants.reduce((sum, v) => sum + (v?.metrics?.impressions || 0), 0) : 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Duration</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.ceil((new Date(test.endDate).getTime() - new Date(test.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Variants:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Array.isArray(test?.variants) ? test.variants.map((variant, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]">
                              <div>
                                <p className="font-medium">{variant.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {variant.metrics.impressions} impressions, {variant.metrics.conversions} conversions
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{variant.metrics.conversionRate.toFixed(2)}%</p>
                                <p className="text-sm text-muted-foreground">{variant.percentage}% traffic</p>
                              </div>
                            </div>
                          )) : null}
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Results
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Detailed Analytics
                        </DropdownMenuItem>
                        {test.status === "running" && (
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Test
                          </DropdownMenuItem>
                        )}
                        {test.status === "paused" && (
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Resume Test
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Test
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
              );
            }) : null}
          </div>
        </CardContent>
      </Card>

      {/* Create Feature Flag Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('dashboard.createFeatureFlag')}</DialogTitle>
            <DialogDescription>
              {t('dashboard.createNewFeatureFlag')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t('dashboard.flagName')}</Label>
                <Input 
                  id="name" 
                  placeholder={t('dashboard.enterFlagName')} 
                  value={createFlagData.name}
                  onChange={(e) => setCreateFlagData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="key">Flag Key</Label>
                <Input 
                  id="key" 
                  placeholder="flag_key_name" 
                  value={createFlagData.key}
                  onChange={(e) => setCreateFlagData(prev => ({ ...prev, key: e.target.value }))}
                />
              </div>
            </div>
            <div>
                <Label htmlFor="description">{t('dashboard.description')}</Label>
              <Input 
                id="description" 
                placeholder={t('dashboard.describeWhatThisFlagControls')} 
                value={createFlagData.description}
                onChange={(e) => setCreateFlagData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createFlagData.type}
                  onChange={(e) => setCreateFlagData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="boolean">Boolean</option>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div>
                <Label htmlFor="defaultValue">Default Value</Label>
                <Input 
                  id="defaultValue" 
                  placeholder="false" 
                  value={createFlagData.defaultValue}
                  onChange={(e) => setCreateFlagData(prev => ({ ...prev, defaultValue: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="environment">{t('dashboard.environment')}</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createFlagData.environment}
                  onChange={(e) => setCreateFlagData(prev => ({ ...prev, environment: e.target.value }))}
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input 
                id="tags" 
                placeholder="ui, frontend, feature" 
                value={createFlagData.tags}
                onChange={(e) => setCreateFlagData(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createFeatureFlag}>
{t('featureFlags.createFlag')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create A/B Test Dialog */}
      <Dialog open={showABTestDialog} onOpenChange={setShowABTestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('dashboard.createAbTest')}</DialogTitle>
            <DialogDescription>
              {t('dashboard.createNewAbTest')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="testName">{t('dashboard.testName')}</Label>
              <Input 
                id="testName" 
                placeholder={t('dashboard.enterTestName')} 
                value={createABTestData.name}
                onChange={(e) => setCreateABTestData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="testDescription">{t('dashboard.testDescription')}</Label>
              <Input 
                id="testDescription" 
                placeholder={t('dashboard.describeTheTestHypothesis')} 
                value={createABTestData.description}
                onChange={(e) => setCreateABTestData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="featureFlag">Feature Flag</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createABTestData.featureFlagId}
                  onChange={(e) => setCreateABTestData(prev => ({ ...prev, featureFlagId: e.target.value }))}
                >
                  <option value="">Select feature flag</option>
                  {Array.isArray(featureFlags) ? featureFlags.map((flag) => (
                    <option key={flag?._id} value={flag?._id}>
                      {flag?.name}
                    </option>
                  )) : null}
                </select>
              </div>
              <div>
                <Label htmlFor="successMetric">Success Metric</Label>
                <Input 
                  id="successMetric" 
                  placeholder="conversion_rate" 
                  value={createABTestData.successMetric}
                  onChange={(e) => setCreateABTestData(prev => ({ ...prev, successMetric: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={createABTestData.startDate}
                  onChange={(e) => setCreateABTestData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={createABTestData.endDate}
                  onChange={(e) => setCreateABTestData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="confidenceLevel">Confidence Level</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createABTestData.confidenceLevel}
                  onChange={(e) => setCreateABTestData(prev => ({ ...prev, confidenceLevel: e.target.value }))}
                >
                  <option value="90">90%</option>
                  <option value="95">95%</option>
                  <option value="99">99%</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowABTestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createABTest}>
              {t('dashboard.createTest')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Rollout Dialog */}
      <Dialog open={showRolloutDialog} onOpenChange={setShowRolloutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard.createRollout')}</DialogTitle>
            <DialogDescription>
              {t('dashboard.createGradualRollout')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="rolloutName">{t('dashboard.rolloutName')}</Label>
              <Input 
                id="rolloutName" 
                placeholder={t('dashboard.enterRolloutName')} 
                value={createRolloutData.name}
                onChange={(e) => setCreateRolloutData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="rolloutFlag">Feature Flag</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={createRolloutData.featureFlagId}
                onChange={(e) => setCreateRolloutData(prev => ({ ...prev, featureFlagId: e.target.value }))}
              >
                <option value="">Select feature flag</option>
                {Array.isArray(featureFlags) ? featureFlags.map((flag) => (
                  <option key={flag?._id} value={flag?._id}>
                    {flag?.name}
                  </option>
                )) : null}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rolloutType">{t('featureFlags.rolloutType')}</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createRolloutData.type}
                  onChange={(e) => setCreateRolloutData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="percentage">{t('featureFlags.percentage')}</option>
                  <option value="user_list">User List</option>
                  <option value="segment">User Segment</option>
                  <option value="geographic">Geographic</option>
                </select>
              </div>
              <div>
                <Label htmlFor="rolloutPercentage">{t('featureFlags.percentage')}</Label>
                <Input 
                  id="rolloutPercentage" 
                  type="number" 
                  min="0" 
                  max="100" 
                  placeholder="0" 
                  value={createRolloutData.percentage}
                  onChange={(e) => setCreateRolloutData(prev => ({ ...prev, percentage: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rolloutStart">Start Date</Label>
                <Input 
                  id="rolloutStart" 
                  type="datetime-local" 
                  value={createRolloutData.startDate}
                  onChange={(e) => setCreateRolloutData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="rolloutEnd">End Date (Optional)</Label>
                <Input 
                  id="rolloutEnd" 
                  type="datetime-local" 
                  value={createRolloutData.endDate}
                  onChange={(e) => setCreateRolloutData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRolloutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createRollout}>
  {t('featureFlags.createRollout')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


