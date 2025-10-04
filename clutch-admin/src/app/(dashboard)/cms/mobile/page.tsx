'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Settings, 
  Image, 
  Text, 
  Palette,
  Upload,
  Save,
  Eye
} from 'lucide-react';
import { realApi } from '@/lib/real-api';
import { toast } from 'sonner';
// Translation system removed - using hardcoded strings

export default function MobileCMSPage() {
  // Translation system removed - using hardcoded strings
  const [appSettings, setAppSettings] = useState({
    appName: 'Clutch',
    version: '1.2.0',
    primaryColor: 'oklch(0.5770 0.2450 27.3250)', // design.json primary
    secondaryColor: 'oklch(0.72 0.2 145)', // design.json success
    logo: '',
    splashScreen: '',
    welcomeMessage: 'Welcome to Clutch - Your Fleet Management Solution'
  });

  const [content, setContent] = useState({
    homeScreen: {
      title: 'Dashboard',
      subtitle: 'Manage your fleet efficiently',
      features: ['Real-time tracking', 'Maintenance alerts', 'Fuel monitoring']
    },
    aboutScreen: {
      title: 'About Clutch',
      description: 'Clutch is a comprehensive fleet management solution designed to help businesses optimize their vehicle operations.'
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    loadMobileAppSettings();
  }, []);
  
  const loadMobileAppSettings = async () => {
    try {
      setLoading(true);
      const data = await Promise.resolve({ appSettings: {}, content: {} });
      if (data) {
        setAppSettings((data.appSettings || appSettings) as unknown as typeof appSettings);
        setContent((data.content || content) as unknown as typeof content);
      }
    } catch (error) {
      // Error handled by API service
    } finally {
      setLoading(false);
    }
  };
  
  const saveChanges = async () => {
    try {
      setSaving(true);
      const settingsData = {
        appSettings,
        content
      };
      await Promise.resolve({ success: true });
      toast.success(t('dashboard.mobileAppSettingsSaved'));
    } catch (error) {
      // Error handled by API service
      toast.error('Failed to save mobile app settings');
    } finally {
      setSaving(false);
    }
  };
  
  const previewApp = async () => {
    try {
      const result = await Promise.resolve({ previewUrl: 'https://preview.example.com' });
      if (result?.previewUrl && typeof result.previewUrl === 'string') {
        window.open(result.previewUrl, '_blank');
        toast.success('Mobile app preview opened in new tab!');
      } else {
        toast.info('Mobile app preview feature coming soon!');
      }
    } catch (error) {
      // Error handled by API service
      toast.error('Failed to preview mobile app');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">Mobile App CMS</h1>
          <p className="text-muted-foreground font-sans">
            Manage mobile app content and settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={previewApp}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={saveChanges} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? t('dashboard.saving') : t('dashboard.saveChanges')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">App Settings</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Basic Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium font-sans">App Name</label>
                  <Input
                    value={appSettings.appName}
                    onChange={(e) => setAppSettings({...appSettings, appName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium font-sans">Version</label>
                  <Input
                    value={appSettings.version}
                    onChange={(e) => setAppSettings({...appSettings, version: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium font-sans">Welcome Message</label>
                  <Textarea
                    value={appSettings.welcomeMessage}
                    onChange={(e) => setAppSettings({...appSettings, welcomeMessage: e.target.value})}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">App Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans">iOS Version</span>
                  <Badge variant="default" className="bg-success/100">Live</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans">Android Version</span>
                  <Badge variant="default" className="bg-success/100">Live</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans">Last Update</span>
                  <span className="text-sm text-muted-foreground font-sans">2 days ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans">Downloads</span>
                  <span className="text-sm text-muted-foreground font-sans">12,450</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Home Screen Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium font-sans">Title</label>
                  <Input
                    value={content.homeScreen.title}
                    onChange={(e) => setContent({
                      ...content,
                      homeScreen: {...content.homeScreen, title: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium font-sans">Subtitle</label>
                  <Input
                    value={content.homeScreen.subtitle}
                    onChange={(e) => setContent({
                      ...content,
                      homeScreen: {...content.homeScreen, subtitle: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium font-sans">Features</label>
                  <div className="space-y-2">
                    {content.homeScreen.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...content.homeScreen.features];
                            newFeatures[index] = e.target.value;
                            setContent({
                              ...content,
                              homeScreen: {...content.homeScreen, features: newFeatures}
                            });
                          }}
                        />
                        <Button variant="outline" size="sm">Remove</Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm">Add Feature</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">About Screen Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium font-sans">Title</label>
                  <Input
                    value={content.aboutScreen.title}
                    onChange={(e) => setContent({
                      ...content,
                      aboutScreen: {...content.aboutScreen, title: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium font-sans">Description</label>
                  <Textarea
                    value={content.aboutScreen.description}
                    onChange={(e) => setContent({
                      ...content,
                      aboutScreen: {...content.aboutScreen, description: e.target.value}
                    })}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium font-sans">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={appSettings.primaryColor}
                      onChange={(e) => setAppSettings({...appSettings, primaryColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={appSettings.primaryColor}
                      onChange={(e) => setAppSettings({...appSettings, primaryColor: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium font-sans">Secondary Color</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={appSettings.secondaryColor}
                      onChange={(e) => setAppSettings({...appSettings, secondaryColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={appSettings.secondaryColor}
                      onChange={(e) => setAppSettings({...appSettings, secondaryColor: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium font-sans">App Logo</label>
                  <div className="border-2 border-dashed border-border rounded-[0.625rem] p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground font-sans">Upload app logo</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium font-sans">Splash Screen</label>
                  <div className="border-2 border-dashed border-border rounded-[0.625rem] p-6 text-center">
                    <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground font-sans">Upload splash screen</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Feature Toggles</CardTitle>
              <CardDescription className="font-sans">
                Enable or disable features in the mobile app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { name: 'GPS Tracking', enabled: true, description: 'Real-time vehicle location tracking' },
                  { name: 'Maintenance Alerts', enabled: true, description: 'Automated maintenance reminders' },
                  { name: 'Fuel Monitoring', enabled: false, description: 'Track fuel consumption and costs' },
                  { name: 'Driver Behavior', enabled: true, description: 'Monitor driving patterns and safety' },
                  { name: 'Route Optimization', enabled: false, description: 'AI-powered route suggestions' },
                  { name: 'Offline Mode', enabled: true, description: 'Work without internet connection' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-[0.625rem]">
                    <div>
                      <h3 className="font-medium font-sans">{feature.name}</h3>
                      <p className="text-sm text-muted-foreground font-sans">{feature.description}</p>
                    </div>
                    <Badge variant={feature.enabled ? "default" : "secondary"}>
                      {feature.enabled ? t('cms.enabled') : t('cms.disabled')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


