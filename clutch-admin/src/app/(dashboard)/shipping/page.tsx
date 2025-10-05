"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin,
  Truck,
  Package,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Download,
  Settings,
  Globe,
  Navigation,
  Route,
  Zap,
  Target,
  BarChart3,
  Calculator,
  FileText,
  Map
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

interface ShippingZone {
  _id: string;
  zoneId: string;
  governorate: string;
  city: string;
  district?: string;
  areas: string[];
  cost: number;
  estimatedDays: number;
  isActive: boolean;
  freeShippingThreshold?: number;
  weightLimits?: {
    maxWeight?: number;
    maxDimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
  deliveryOptions?: {
    standard: {
      enabled: boolean;
      cost: number;
      days: number;
    };
    express: {
      enabled: boolean;
      cost: number;
      days: number;
    };
    overnight: {
      enabled: boolean;
      cost: number;
      days: number;
    };
  };
  restrictions?: {
    excludedItems: string[];
    specialHandling: string[];
    timeRestrictions?: {
      startTime: string;
      endTime: string;
      daysOfWeek: number[];
    };
  };
  notes?: string;
  metadata?: {
    distanceFromCairo?: number;
    population?: number;
    economicTier: 'high' | 'medium' | 'low';
  };
  createdAt: string;
  updatedAt: string;
}

interface LocationData {
  governorates: Array<{
    name: string;
    code: string;
    cities: Array<{
      name: string;
      districts: string[];
    }>;
  }>;
  defaultShippingCosts: Record<string, number>;
  estimatedDeliveryDays: Record<string, number>;
}

export default function ShippingPage() {
  const { t } = useLanguage();
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [filteredZones, setFilteredZones] = useState<ShippingZone[]>([]);
  const [locations, setLocations] = useState<LocationData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [governorateFilter, setGovernorateFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("zones");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  // Form state for creating/editing zones
  const [formData, setFormData] = useState({
    governorate: "",
    city: "",
    district: "",
    areas: [] as string[],
    cost: 0,
    estimatedDays: 1,
    isActive: true,
    freeShippingThreshold: 0,
    weightLimits: {
      maxWeight: 0,
      maxDimensions: {
        length: 0,
        width: 0,
        height: 0
      }
    },
    deliveryOptions: {
      standard: {
        enabled: true,
        cost: 0,
        days: 1
      },
      express: {
        enabled: false,
        cost: 0,
        days: 1
      },
      overnight: {
        enabled: false,
        cost: 0,
        days: 1
      }
    },
    restrictions: {
      excludedItems: [] as string[],
      specialHandling: [] as string[],
      timeRestrictions: {
        startTime: "09:00",
        endTime: "17:00",
        daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
      }
    },
    notes: ""
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter data when search term or filters change
  useEffect(() => {
    filterData();
  }, [searchTerm, governorateFilter, cityFilter, statusFilter, zones]);

  // Update cities when governorate changes
  useEffect(() => {
    if (selectedGovernorate && locations) {
      const governorate = locations.governorates.find(g => g.name === selectedGovernorate);
      if (governorate) {
        setSelectedCity("");
        setSelectedDistrict("");
      }
    }
  }, [selectedGovernorate, locations]);

  // Update districts when city changes
  useEffect(() => {
    if (selectedCity && selectedGovernorate && locations) {
      const governorate = locations.governorates.find(g => g.name === selectedGovernorate);
      const city = governorate?.cities.find(c => c.name === selectedCity);
      if (city) {
        setSelectedDistrict("");
      }
    }
  }, [selectedCity, selectedGovernorate, locations]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [zonesResponse, locationsResponse] = await Promise.all([
        apiService.get('/shipping/zones'),
        apiService.get('/shipping/locations')
      ]);

      if (zonesResponse.success) {
        setZones(zonesResponse.data.zones);
      }

      if (locationsResponse.success) {
        setLocations(locationsResponse.data);
      }
    } catch (error) {
      console.error('Error loading shipping data:', error);
      toast.error('Failed to load shipping data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    let filtered = zones;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(zone => 
        zone.governorate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.district?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply governorate filter
    if (governorateFilter !== "all") {
      filtered = filtered.filter(zone => zone.governorate === governorateFilter);
    }

    // Apply city filter
    if (cityFilter !== "all") {
      filtered = filtered.filter(zone => zone.city === cityFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(zone => zone.isActive === isActive);
    }

    setFilteredZones(filtered);
  };

  const handleCreateZone = async () => {
    try {
      const response = await apiService.post('/shipping/zones', formData);
      
      if (response.success) {
        toast.success('Shipping zone created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        loadData();
      } else {
        toast.error(response.message || 'Failed to create shipping zone');
      }
    } catch (error) {
      console.error('Error creating shipping zone:', error);
      toast.error('Failed to create shipping zone');
    }
  };

  const handleEditZone = async () => {
    if (!selectedZone) return;

    try {
      const response = await apiService.put(`/shipping/zones/${selectedZone._id}`, formData);
      
      if (response.success) {
        toast.success('Shipping zone updated successfully');
        setIsEditDialogOpen(false);
        setSelectedZone(null);
        resetForm();
        loadData();
      } else {
        toast.error(response.message || 'Failed to update shipping zone');
      }
    } catch (error) {
      console.error('Error updating shipping zone:', error);
      toast.error('Failed to update shipping zone');
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this shipping zone?')) return;

    try {
      const response = await apiService.delete(`/shipping/zones/${zoneId}`);
      
      if (response.success) {
        toast.success('Shipping zone deleted successfully');
        loadData();
      } else {
        toast.error(response.message || 'Failed to delete shipping zone');
      }
    } catch (error) {
      console.error('Error deleting shipping zone:', error);
      toast.error('Failed to delete shipping zone');
    }
  };

  const handleToggleZone = async (zoneId: string, isActive: boolean) => {
    try {
      const response = await apiService.put(`/shipping/zones/${zoneId}`, { isActive });
      
      if (response.success) {
        toast.success(`Shipping zone ${isActive ? 'enabled' : 'disabled'} successfully`);
        loadData();
      } else {
        toast.error(response.message || 'Failed to toggle shipping zone');
      }
    } catch (error) {
      console.error('Error toggling shipping zone:', error);
      toast.error('Failed to toggle shipping zone');
    }
  };

  const handleBulkUpdate = async () => {
    if (!selectedGovernorate) {
      toast.error('Please select a governorate for bulk update');
      return;
    }

    try {
      const response = await apiService.post('/shipping/bulk-update', {
        governorate: selectedGovernorate,
        updates: {
          cost: formData.cost,
          estimatedDays: formData.estimatedDays,
          isActive: formData.isActive
        }
      });
      
      if (response.success) {
        toast.success(`Updated ${response.data.modifiedCount} zones in ${selectedGovernorate}`);
        loadData();
      } else {
        toast.error(response.message || 'Failed to perform bulk update');
      }
    } catch (error) {
      console.error('Error performing bulk update:', error);
      toast.error('Failed to perform bulk update');
    }
  };

  const resetForm = () => {
    setFormData({
      governorate: "",
      city: "",
      district: "",
      areas: [],
      cost: 0,
      estimatedDays: 1,
      isActive: true,
      freeShippingThreshold: 0,
      weightLimits: {
        maxWeight: 0,
        maxDimensions: {
          length: 0,
          width: 0,
          height: 0
        }
      },
      deliveryOptions: {
        standard: {
          enabled: true,
          cost: 0,
          days: 1
        },
        express: {
          enabled: false,
          cost: 0,
          days: 1
        },
        overnight: {
          enabled: false,
          cost: 0,
          days: 1
        }
      },
      restrictions: {
        excludedItems: [],
        specialHandling: [],
        timeRestrictions: {
          startTime: "09:00",
          endTime: "17:00",
          daysOfWeek: [1, 2, 3, 4, 5]
        }
      },
      notes: ""
    });
  };

  const openEditDialog = (zone: ShippingZone) => {
    setSelectedZone(zone);
    setFormData({
      governorate: zone.governorate,
      city: zone.city,
      district: zone.district || "",
      areas: zone.areas,
      cost: zone.cost,
      estimatedDays: zone.estimatedDays,
      isActive: zone.isActive,
      freeShippingThreshold: zone.freeShippingThreshold || 0,
      weightLimits: zone.weightLimits || {
        maxWeight: 0,
        maxDimensions: {
          length: 0,
          width: 0,
          height: 0
        }
      },
      deliveryOptions: zone.deliveryOptions || {
        standard: { enabled: true, cost: 0, days: 1 },
        express: { enabled: false, cost: 0, days: 1 },
        overnight: { enabled: false, cost: 0, days: 1 }
      },
      restrictions: zone.restrictions || {
        excludedItems: [],
        specialHandling: [],
        timeRestrictions: {
          startTime: "09:00",
          endTime: "17:00",
          daysOfWeek: [1, 2, 3, 4, 5]
        }
      },
      notes: zone.notes || ""
    });
    setIsEditDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getEconomicTierBadge = (tier: string) => {
    const colors = {
      high: "bg-green-500",
      medium: "bg-yellow-500",
      low: "bg-red-500"
    };
    
    return (
      <Badge variant="default" className={colors[tier as keyof typeof colors]}>
        {tier.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping Management</h1>
          <p className="text-muted-foreground">
            Manage shipping zones, costs, and delivery options across Egypt
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Zones
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Zones
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create Shipping Zone</DialogTitle>
                <DialogDescription>
                  Configure a new shipping zone with delivery options and restrictions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Governorate</Label>
                    <Select
                      value={formData.governorate}
                      onValueChange={(value) => {
                        setFormData({ ...formData, governorate: value });
                        setSelectedGovernorate(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select governorate" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations?.governorates.map((gov) => (
                          <SelectItem key={gov.name} value={gov.name}>
                            {gov.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>City</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => {
                        setFormData({ ...formData, city: value });
                        setSelectedCity(value);
                      }}
                      disabled={!formData.governorate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations?.governorates
                          .find(g => g.name === formData.governorate)
                          ?.cities.map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                              {city.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>District</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => setFormData({ ...formData, district: value })}
                      disabled={!formData.city}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations?.governorates
                          .find(g => g.name === formData.governorate)
                          ?.cities.find(c => c.name === formData.city)
                          ?.districts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Shipping Cost (EGP)</Label>
                    <Input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <Label>Estimated Days</Label>
                    <Input
                      type="number"
                      value={formData.estimatedDays}
                      onChange={(e) => setFormData({ ...formData, estimatedDays: Number(e.target.value) })}
                      placeholder="3"
                    />
                  </div>
                </div>

                <div>
                  <Label>Free Shipping Threshold (EGP)</Label>
                  <Input
                    type="number"
                    value={formData.freeShippingThreshold}
                    onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                    placeholder="300"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active Zone</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateZone}>
                    Create Zone
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search zones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={governorateFilter} onValueChange={setGovernorateFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Governorates</SelectItem>
            {locations?.governorates.map((gov) => (
              <SelectItem key={gov.name} value={gov.name}>
                {gov.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Update</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="space-y-4">
          {/* Zones Table */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Zones</CardTitle>
              <CardDescription>Manage shipping zones and delivery costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredZones.map((zone) => (
                  <div key={zone._id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">
                          {zone.governorate} - {zone.city}
                          {zone.district && ` - ${zone.district}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {zone.areas.length > 0 && `Areas: ${zone.areas.join(', ')}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(zone.isActive)}
                        {zone.metadata?.economicTier && getEconomicTierBadge(zone.metadata.economicTier)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(zone)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteZone(zone._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cost</span>
                        <p className="font-medium">{formatCurrency(zone.cost)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Est. Days</span>
                        <p className="font-medium">{zone.estimatedDays} days</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Free Threshold</span>
                        <p className="font-medium">
                          {zone.freeShippingThreshold ? formatCurrency(zone.freeShippingThreshold) : 'None'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Distance from Cairo</span>
                        <p className="font-medium">
                          {zone.metadata?.distanceFromCairo ? `${zone.metadata.distanceFromCairo} km` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={zone.isActive}
                          onCheckedChange={(checked) => handleToggleZone(zone._id, checked)}
                        />
                        <span className="text-sm">Active</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {zone.deliveryOptions?.express?.enabled && (
                          <Badge variant="outline" className="text-xs">
                            Express Available
                          </Badge>
                        )}
                        {zone.deliveryOptions?.overnight?.enabled && (
                          <Badge variant="outline" className="text-xs">
                            Overnight Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          {/* Bulk Update */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Update Zones</CardTitle>
              <CardDescription>Update multiple zones at once by governorate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Governorate</Label>
                  <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select governorate" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.governorates.map((gov) => (
                        <SelectItem key={gov.name} value={gov.name}>
                          {gov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>New Cost (EGP)</Label>
                  <Input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label>New Est. Days</Label>
                  <Input
                    type="number"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: Number(e.target.value) })}
                    placeholder="3"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Set all zones as {formData.isActive ? 'active' : 'inactive'}</Label>
              </div>
              
              <Button onClick={handleBulkUpdate} disabled={!selectedGovernorate}>
                <Settings className="h-4 w-4 mr-2" />
                Update All Zones in {selectedGovernorate}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          {/* Shipping Calculator */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Cost Calculator</CardTitle>
              <CardDescription>Calculate shipping costs for any address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Governorate</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select governorate" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.governorates.map((gov) => (
                        <SelectItem key={gov.name} value={gov.name}>
                          {gov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>City</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cairo">Cairo</SelectItem>
                      <SelectItem value="giza">Giza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Order Value (EGP)</Label>
                  <Input
                    type="number"
                    placeholder="500"
                  />
                </div>
              </div>
              
              <Button className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Shipping Cost
              </Button>
              
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Shipping Cost Estimate</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Standard Delivery:</span>
                    <span className="font-medium">{formatCurrency(50)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Days:</span>
                    <span className="font-medium">3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free Shipping Threshold:</span>
                    <span className="font-medium">{formatCurrency(300)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Shipping Zone</DialogTitle>
            <DialogDescription>
              Update shipping zone configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Shipping Cost (EGP)</Label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Estimated Days</Label>
                <Input
                  type="number"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData({ ...formData, estimatedDays: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active Zone</Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditZone}>
                Update Zone
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
