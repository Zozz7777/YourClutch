"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { productionApi } from "@/lib/production-api";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { handleError, handleDataLoadError } from "@/lib/error-handler";

// Import new Phase 2 widgets
import RBACOverview from '@/components/widgets/rbac-overview';
import AuditTrailInsights from '@/components/widgets/audit-trail-insights';
import SecurityAlerts from '@/components/widgets/security-alerts';
import IntegrationHealth from '@/components/widgets/integration-health';
import { 
  Settings, 
  Search, 
  Filter, 
  Save, 
  MoreHorizontal,
  User,
  Shield,
  Globe,
  Bell,
  Palette,
  Database,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Wifi,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Minus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SystemSetting {
  _id: string;
  key: string;
  value: unknown;
  type: "string" | "number" | "boolean" | "json" | "array";
  category: "general" | "security" | "notifications" | "appearance" | "integrations" | "advanced";
  description: string;
  isPublic: boolean;
  isRequired: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  updatedAt: string;
  updatedBy: string;
}

interface UserPreference {
  _id: string;
  userId: string;
  key: string;
  value: unknown;
  type: "string" | "number" | "boolean" | "json";
  category: "appearance" | "notifications" | "privacy" | "accessibility";
  updatedAt: string;
}

interface Integration {
  _id: string;
  name: string;
  type: "api" | "webhook" | "oauth" | "sso";
  status: "active" | "inactive" | "error" | "pending";
  description: string;
  configuration: Record<string, unknown>;
  lastSync?: string;
  errorCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userName: string;
  changes: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<"general" | "security" | "notifications" | "appearance" | "integrations" | "audit">("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { user, hasPermission } = useAuth();
  // Translation system removed - using hardcoded strings

  useEffect(() => {
    const loadSettingsData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Load system settings
        try {
          const settingsData = await productionApi.getSettings('system');
          setSystemSettings(Array.isArray(settingsData) ? settingsData : []);
        } catch (error) {
          handleDataLoadError(error, 'system_settings');
          setSystemSettings([]);
        }

        // Load user preferences
        try {
          const preferencesData = await productionApi.getSettings('preferences');
          setUserPreferences(Array.isArray(preferencesData) ? preferencesData : []);
        } catch (error) {
          handleDataLoadError(error, 'user_preferences');
          setUserPreferences([]);
        }

        // Load integrations
        try {
          const integrationsData = await productionApi.getSettings('integrations');
          setIntegrations(Array.isArray(integrationsData) ? integrationsData : []);
        } catch (error) {
          handleDataLoadError(error, 'integrations');
          setIntegrations([]);
        }

        // Load audit logs
        try {
          const auditData = await productionApi.getSettings('audit');
          setAuditLogs(Array.isArray(auditData) ? auditData : []);
        } catch (error) {
          handleDataLoadError(error, 'audit_logs');
          setAuditLogs([]);
        }
      } catch (error) {
        handleDataLoadError(error, 'settings_data');
        // Set empty arrays as fallback
        setSystemSettings([]);
        setUserPreferences([]);
        setIntegrations([]);
        setAuditLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettingsData();
  }, [user]);

  const handleSettingChange = (settingKey: string, newValue: unknown) => {
    setSystemSettings(prev => 
      (Array.isArray(prev) ? prev : []).map(setting => 
        setting?.key === settingKey 
          ? { ...setting, value: newValue }
          : setting
      )
    );
  };

  const handlePreferenceChange = (preferenceKey: string, newValue: unknown) => {
    setUserPreferences(prev => 
      (Array.isArray(prev) ? prev : []).map(preference => 
        preference?.key === preferenceKey 
          ? { ...preference, value: newValue }
          : preference
      )
    );
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      // Save system settings
      await fetch("https://clutch-main-nk7x.onrender.com/api/v1/settings/system", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: systemSettings }),
      });

      // Save user preferences
      await fetch("https://clutch-main-nk7x.onrender.com/api/v1/settings/preferences", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences: userPreferences }),
      });

      // Show success message
    } catch (error) {
      // Error handled by API service
    } finally {
      setIsSaving(false);
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "outline";
      case "error":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "default";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "general":
        return <Settings className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "notifications":
        return <Bell className="h-4 w-4" />;
      case "appearance":
        return <Palette className="h-4 w-4" />;
      case "integrations":
        return <Key className="h-4 w-4" />;
      case "advanced":
        return <Database className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const isPassword = setting.key.toLowerCase().includes("password") || setting.key.toLowerCase().includes("secret");
    const showPassword = showPasswords[setting.key];

    switch (setting.type) {
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
              className="rounded border-input"
            />
            <span className="text-sm">{setting.value ? 'Enabled' : 'Disabled'}</span>
          </div>
        );
      case "number":
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, Number(e.target.value))}
            min={setting.validation?.min}
            max={setting.validation?.max}
            className="w-32"
          />
        );
      case "json":
        return (
          <textarea
            value={JSON.stringify(setting.value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleSettingChange(setting.key, parsed);
              } catch (error) {
                // Invalid JSON, don't update
              }
            }}
            className="w-full h-20 p-2 border border-input rounded-md text-sm font-mono"
            placeholder="Enter JSON..."
          />
        );
      default:
        return (
          <div className="relative">
            <Input
              type={isPassword && !showPassword ? "password" : "text"}
              value={setting.value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              className="w-full"
            />
            {isPassword && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6"
                onClick={() => togglePasswordVisibility(setting.key)}
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            )}
          </div>
        );
    }
  };

  const renderPreferenceInput = (preference: UserPreference) => {
    switch (preference.type) {
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={preference.value}
              onChange={(e) => handlePreferenceChange(preference.key, e.target.checked)}
              className="rounded border-input"
            />
            <span className="text-sm">{preference.value ? 'Enabled' : 'Disabled'}</span>
          </div>
        );
      case "number":
        return (
          <Input
            type="number"
            value={preference.value}
            onChange={(e) => handlePreferenceChange(preference.key, Number(e.target.value))}
            className="w-32"
          />
        );
      default:
        return (
          <Input
            type="text"
            value={preference.value}
            onChange={(e) => handlePreferenceChange(preference.key, e.target.value)}
            className="w-full"
          />
        );
    }
  };

  // Create safe array variables
  const systemSettingsArray = Array.isArray(systemSettings) ? systemSettings : [];
  const userPreferencesArray = Array.isArray(userPreferences) ? userPreferences : [];
  const integrationsArray = Array.isArray(integrations) ? integrations : [];
  const auditLogsArray = Array.isArray(auditLogs) ? auditLogs : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        {hasPermission("manage_settings") && (
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-[0.625rem] w-fit">
        <Button
          variant={activeTab === "general" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("general")}
        >
          <Settings className="mr-2 h-4 w-4" />
          General
        </Button>
        <Button
          variant={activeTab === "security" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("security")}
        >
          <Shield className="mr-2 h-4 w-4" />
          Security
        </Button>
        <Button
          variant={activeTab === "notifications" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("notifications")}
        >
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </Button>
        <Button
          variant={activeTab === "appearance" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("appearance")}
        >
          <Palette className="mr-2 h-4 w-4" />
          Appearance
        </Button>
        <Button
          variant={activeTab === "integrations" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("integrations")}
        >
          <Key className="mr-2 h-4 w-4" />
          Integrations
        </Button>
        <Button
          variant={activeTab === "audit" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("audit")}
        >
          <Database className="mr-2 h-4 w-4" />
          Audit Log
        </Button>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Basic system configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {systemSettingsArray
                .filter(setting => setting?.category === "general")
                .map((setting) => (
                  <div key={setting?.key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(setting?.category || 'general')}
                        <label className="text-sm font-medium">{setting?.key || 'Unknown Setting'}</label>
                        {setting?.isRequired && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{setting?.description || 'No description available'}</p>
                    </div>
                    <div className="ml-4">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Security configuration and access control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {systemSettingsArray
                .filter(setting => setting?.category === "security")
                .map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <label className="text-sm font-medium">{setting.key}</label>
                        {setting.isRequired && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Settings */}
      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Notification preferences and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {systemSettingsArray
                .filter(setting => setting?.category === "notifications")
                .map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <label className="text-sm font-medium">{setting.key}</label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance Settings */}
      {activeTab === "appearance" && (
        <Card>
          <CardHeader>
            <CardTitle>Appearance Settings</CardTitle>
            <CardDescription>
              Theme and display preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* User Preferences */}
              <div>
                <h4 className="text-sm font-medium mb-4">User Preferences</h4>
                <div className="space-y-4">
                  {userPreferencesArray
                    .filter(pref => pref?.category === "appearance")
                    .map((preference) => (
                      <div key={preference.key} className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium">{preference.key}</label>
                        </div>
                        <div className="ml-4">
                          {renderPreferenceInput(preference)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* System Appearance Settings */}
              <div>
                <h4 className="text-sm font-medium mb-4">System Appearance</h4>
                <div className="space-y-4">
                  {systemSettingsArray
                    .filter(setting => setting?.category === "appearance")
                    .map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Palette className="h-4 w-4" />
                            <label className="text-sm font-medium">{setting.key}</label>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>
                        </div>
                        <div className="ml-4">
                          {renderSettingInput(setting)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrations */}
      {activeTab === "integrations" && (
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              Manage third-party integrations and API connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrationsArray.map((integration) => (
                <div key={integration._id} className="flex items-center justify-between p-4 border rounded-[0.625rem]">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-[0.625rem] bg-muted flex items-center justify-center">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusVariant(integration.status)}>
                          {integration.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {integration.type}
                        </span>
                        {integration.lastSync && (
                          <span className="text-xs text-muted-foreground">
                            Last sync: {formatRelativeTime(integration.lastSync)}
                          </span>
                        )}
                        {integration.errorCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {integration.errorCount} errors
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Integration
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Test Connection
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export Config
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Integration
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {integrationsArray.length === 0 && (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No integrations configured</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Audit Log */}
      {activeTab === "audit" && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>
              Track system changes and user activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogsArray.slice(0, 50).map((log) => (
                <div key={log._id} className="flex items-center justify-between p-4 border rounded-[0.625rem]">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.userName} • {log.resource} • {log.resourceId}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          IP: {log.ipAddress}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export Log
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            {auditLogsArray.length === 0 && (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No audit logs available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Phase 2: Settings Analytics Widgets */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings Analytics</h2>
            <p className="text-muted-foreground">
              From configs → governance & oversight
            </p>
          </div>
        </div>

        {/* Top Row - RBAC & Audit Trail */}
        <div className="grid gap-6 md:grid-cols-2">
          <RBACOverview />
          <AuditTrailInsights />
        </div>

        {/* Second Row - Security Alerts & Integration Health */}
        <div className="grid gap-6 md:grid-cols-2">
          <SecurityAlerts />
          <IntegrationHealth />
        </div>
      </div>
    </div>
  );
}


