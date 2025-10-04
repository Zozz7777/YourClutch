"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL } from "@/lib/constants";
// Translation system removed - using hardcoded strings
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Save, 
  Eye, 
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  Camera,
  Upload,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: string;
  department?: string;
  position?: string;
  location?: string;
  bio?: string;
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginHistory: Array<{
      timestamp: string;
      ipAddress: string;
      userAgent: string;
      location?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProfileSettingsPage() {
  // Translation system removed - using hardcoded strings
  const { user, hasPermission } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    location: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("clutch-admin-token");
        
        const response = await fetch(`${API_BASE_URL}/api/v1/employees/profile/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).catch(() => null);
        
        if (response && response.ok) {
          const profileData = await response.json();
          const employee = profileData.data?.employee || profileData.data || profileData;
          setProfile(employee);
          setFormData({
            name: employee.name || "",
            email: employee.email || "",
            phone: employee.phoneNumber || "",
            department: employee.profile?.department || "",
            position: employee.profile?.position || "",
            location: employee.profile?.location || "",
            bio: employee.profile?.bio || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        } else {
          // Fallback to current user data if API fails
          if (user) {
            setProfile({
              _id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              status: user.status,
              preferences: {
                language: "en",
                timezone: "UTC",
                dateFormat: "MM/DD/YYYY",
                notifications: {
                  email: true,
                  push: true,
                  sms: false,
                },
              },
              security: {
                twoFactorEnabled: false,
                lastPasswordChange: new Date().toISOString(),
                loginHistory: [],
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            setFormData({
              name: user.name,
              email: user.email,
              phone: "",
              department: "",
              position: "",
              location: "",
              bio: "",
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          }
        }
      } catch (error) {
        // Error handled by API service
        // Fallback to current user data
        if (user) {
          setProfile({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            preferences: {
              language: "en",
              timezone: "UTC",
              dateFormat: "MM/DD/YYYY",
              notifications: {
                email: true,
                push: true,
                sms: false,
              },
            },
            security: {
              twoFactorEnabled: false,
              lastPasswordChange: new Date().toISOString(),
              loginHistory: [],
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setFormData({
            name: user.name,
            email: user.email,
            phone: "",
            department: "",
            position: "",
            location: "",
            bio: "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (category: string, key: string, value: unknown) => {
    if (!profile) return;
    
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [category]: {
            ...(prev.preferences as any)[category],
            [key]: value
          }
        }
      };
    });
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      const response = await fetch(`${API_BASE_URL}/api/v1/employees/profile/me`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phone,
          profile: {
            department: formData.department,
            position: formData.position,
            location: formData.location,
            bio: formData.bio,
          },
        }),
      });

      if (response.ok) {
        toast.success("Your profile has been updated successfully.");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      // Error handled by API service
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      const response = await fetch(`${API_BASE_URL}/api/v1/employees/change-password`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully.");
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        throw new Error("Failed to change password");
      }
    } catch (error) {
      // Error handled by API service
      toast.error("Failed to change password. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleAvatarUpload = async (results: any[]) => {
    if (results.length === 0) return;
    
    setIsUploadingAvatar(true);
    try {
      const result = results[0];
      if (result.success && result.fileUrl) {
        // Update profile with new avatar URL
        const token = localStorage.getItem("clutch-admin-token");
        
        const response = await fetch(`${API_BASE_URL}/api/v1/employees/profile/me`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            avatar: result.fileUrl
          }),
        });

        if (response.ok) {
          // Update local profile state
          setProfile(prev => prev ? { ...prev, avatar: result.fileUrl } : null);
          toast.success("Profile picture updated successfully!");
        } else {
          throw new Error("Failed to update profile picture");
        }
      }
    } catch (error) {
      toast.error("Failed to update profile picture. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      const response = await fetch(`${API_BASE_URL}/api/v1/employees/profile/me`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar: null
        }),
      });

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, avatar: undefined } : null);
        toast.success("Profile picture removed successfully!");
      } else {
        throw new Error("Failed to remove profile picture");
      }
    } catch (error) {
      toast.error("Failed to remove profile picture. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      const token = localStorage.getItem("clutch-admin-token");
      
      // Upload file first
      const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadResult = await uploadResponse.json();
      const imageUrl = uploadResult.data?.url || uploadResult.url;

      if (!imageUrl) {
        throw new Error("No image URL returned from upload");
      }

      // Update profile with new avatar URL
      const profileResponse = await fetch(`${API_BASE_URL}/api/v1/employees/profile/me`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar: imageUrl
        }),
      });

      if (profileResponse.ok) {
        setProfile(prev => prev ? { ...prev, avatar: imageUrl } : null);
        toast.success("Profile picture updated successfully!");
      } else {
        throw new Error("Failed to update profile picture");
      }
    } catch (error) {
      toast.error("Failed to update profile picture. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>
        <Button onClick={saveProfile} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Update Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileSelect}
                    className="hidden"
                    id="avatar-upload"
                    disabled={isUploadingAvatar}
                  />
                  <label htmlFor="avatar-upload">
                    <Button variant="outline" size="sm" disabled={isUploadingAvatar} asChild>
                      <span className="cursor-pointer">
                        <Camera className="mr-2 h-4 w-4" />
                        {profile.avatar ? 'Change Photo' : 'Add Photo'}
                      </span>
                    </Button>
                  </label>
                  
                  {profile.avatar && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Photo
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="outline">{profile.role}</Badge>
                  <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                    {profile.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Member since:</span>
                  <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                {profile.department && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Department:</span>
                    <span>{profile.department}</span>
                  </div>
                )}
                {profile.position && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Position:</span>
                    <span>{profile.position}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Enter your location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    placeholder="Enter your department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    placeholder="Enter your position"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full h-20 p-3 border border-input rounded-md resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.currentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                  >
                    {showPasswords.currentPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.newPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6"
                    onClick={() => togglePasswordVisibility("newPassword")}
                  >
                    {showPasswords.newPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  >
                    {showPasswords.confirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <Button onClick={changePassword} disabled={isSaving}>
                <Shield className="mr-2 h-4 w-4" />
                {isSaving ? 'Loading...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Two-Factor Authentication</Label>
                  <div className="flex items-center gap-2">
                    {profile.security.twoFactorEnabled ? (
                      <>
                        <Check className="h-4 w-4 text-success" />
                        <span className="text-sm text-success">Enabled</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-destructive">Disabled</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Last Password Change</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(profile.security.lastPasswordChange).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {profile.security.loginHistory.length > 0 && (
                <div className="space-y-2">
                  <Label>Recent Login Activity</Label>
                  <div className="space-y-2">
                    {profile.security.loginHistory.slice(0, 3).map((login, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{login.location || 'Unknown Location'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(login.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">{login.ipAddress}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


