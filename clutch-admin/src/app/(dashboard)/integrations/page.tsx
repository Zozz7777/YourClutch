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
  Settings, 
  TestTube, 
  Trash2, 
  Edit, 
  Eye, 
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Truck,
  Bell,
  Zap,
  Globe,
  Shield,
  Activity,
  TrendingUp,
  DollarSign,
  Users,
  MessageSquare,
  BarChart3
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

interface PaymentGateway {
  _id: string;
  gatewayId: string;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  supportedCurrencies: string[];
  environment: 'sandbox' | 'production';
  testStatus: 'not_tested' | 'passed' | 'failed';
  testMessage?: string;
  lastTested?: string;
  stats: {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    totalAmount: number;
    lastTransactionAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Integration {
  _id: string;
  integrationId: string;
  type: 'payment' | 'shipping' | 'notification' | 'analytics' | 'crm' | 'other';
  category: string;
  name: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  usage: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    lastUsed?: string;
  };
  healthCheck: {
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastCheck?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function IntegrationsPage() {
  const { t } = useLanguage();
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [filteredGateways, setFilteredGateways] = useState<PaymentGateway[]>([]);
  const [filteredIntegrations, setFilteredIntegrations] = useState<Integration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [environmentFilter, setEnvironmentFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("payment-gateways");

  // Form state for creating/editing gateways
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    credentials: {
      apiKey: "",
      secretKey: "",
      merchantId: "",
      webhookSecret: ""
    },
    supportedCurrencies: [] as string[],
    environment: "sandbox" as 'sandbox' | 'production',
    apiEndpoints: {
      sandbox: {
        baseUrl: "",
        paymentUrl: "",
        refundUrl: "",
        statusUrl: ""
      },
      production: {
        baseUrl: "",
        paymentUrl: "",
        refundUrl: "",
        statusUrl: ""
      }
    }
  });

  const currencies = ['EGP', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD'];

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter data when search term or filters change
  useEffect(() => {
    filterData();
  }, [searchTerm, statusFilter, environmentFilter, paymentGateways, integrations]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gatewaysResponse, integrationsResponse] = await Promise.all([
        apiService.get('/integrations/payment-gateways'),
        apiService.get('/integrations')
      ]);

      if (gatewaysResponse.success) {
        setPaymentGateways(gatewaysResponse.data);
      }

      if (integrationsResponse.success) {
        setIntegrations(integrationsResponse.data.integrations);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load integrations data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    let filteredG = paymentGateways;
    let filteredI = integrations;

    // Apply search filter
    if (searchTerm) {
      filteredG = filteredG.filter(gateway => 
        gateway.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gateway.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
      filteredI = filteredI.filter(integration => 
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filteredG = filteredG.filter(gateway => gateway.isActive === isActive);
      filteredI = filteredI.filter(integration => integration.isActive === isActive);
    }

    // Apply environment filter (for gateways only)
    if (environmentFilter !== "all") {
      filteredG = filteredG.filter(gateway => gateway.environment === environmentFilter);
    }

    setFilteredGateways(filteredG);
    setFilteredIntegrations(filteredI);
  };

  const handleCreateGateway = async () => {
    try {
      const response = await apiService.post('/integrations/payment-gateway', formData);
      
      if (response.success) {
        toast.success('Payment gateway created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        loadData();
      } else {
        toast.error(response.message || 'Failed to create payment gateway');
      }
    } catch (error) {
      console.error('Error creating payment gateway:', error);
      toast.error('Failed to create payment gateway');
    }
  };

  const handleEditGateway = async () => {
    if (!selectedGateway) return;

    try {
      const response = await apiService.put(`/integrations/payment-gateway/${selectedGateway._id}`, formData);
      
      if (response.success) {
        toast.success('Payment gateway updated successfully');
        setIsEditDialogOpen(false);
        setSelectedGateway(null);
        resetForm();
        loadData();
      } else {
        toast.error(response.message || 'Failed to update payment gateway');
      }
    } catch (error) {
      console.error('Error updating payment gateway:', error);
      toast.error('Failed to update payment gateway');
    }
  };

  const handleToggleGateway = async (gatewayId: string, isActive: boolean) => {
    try {
      const response = await apiService.post(`/integrations/payment-gateway/${gatewayId}/toggle`, { isActive });
      
      if (response.success) {
        toast.success(`Payment gateway ${isActive ? 'enabled' : 'disabled'} successfully`);
        loadData();
      } else {
        toast.error(response.message || 'Failed to toggle payment gateway');
      }
    } catch (error) {
      console.error('Error toggling payment gateway:', error);
      toast.error('Failed to toggle payment gateway');
    }
  };

  const handleTestGateway = async (gatewayId: string) => {
    try {
      const response = await apiService.post(`/integrations/payment-gateway/${gatewayId}/test`);
      
      if (response.success) {
        toast.success('Gateway test passed');
      } else {
        toast.error(response.data?.message || 'Gateway test failed');
      }
      loadData();
    } catch (error) {
      console.error('Error testing payment gateway:', error);
      toast.error('Failed to test payment gateway');
    }
  };

  const handleDeleteGateway = async (gatewayId: string) => {
    if (!confirm('Are you sure you want to delete this payment gateway?')) return;

    try {
      const response = await apiService.delete(`/integrations/payment-gateway/${gatewayId}`);
      
      if (response.success) {
        toast.success('Payment gateway deleted successfully');
        loadData();
      } else {
        toast.error(response.message || 'Failed to delete payment gateway');
      }
    } catch (error) {
      console.error('Error deleting payment gateway:', error);
      toast.error('Failed to delete payment gateway');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      credentials: {
        apiKey: "",
        secretKey: "",
        merchantId: "",
        webhookSecret: ""
      },
      supportedCurrencies: [],
      environment: "sandbox",
      apiEndpoints: {
        sandbox: {
          baseUrl: "",
          paymentUrl: "",
          refundUrl: "",
          statusUrl: ""
        },
        production: {
          baseUrl: "",
          paymentUrl: "",
          refundUrl: "",
          statusUrl: ""
        }
      }
    });
  };

  const openEditDialog = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setFormData({
      name: gateway.name,
      slug: gateway.slug,
      credentials: {
        apiKey: "",
        secretKey: "",
        merchantId: "",
        webhookSecret: ""
      },
      supportedCurrencies: gateway.supportedCurrencies,
      environment: gateway.environment,
      apiEndpoints: {
        sandbox: {
          baseUrl: "",
          paymentUrl: "",
          refundUrl: "",
          statusUrl: ""
        },
        production: {
          baseUrl: "",
          paymentUrl: "",
          refundUrl: "",
          statusUrl: ""
        }
      }
    });
    setIsEditDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (isActive: boolean, testStatus: string) => {
    if (!isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    switch (testStatus) {
      case 'passed':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Not Tested</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Manage payment gateways, shipping providers, and other integrations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Payment Gateway</DialogTitle>
              <DialogDescription>
                Configure a new payment gateway integration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Gateway Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Paymob"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., paymob"
                  />
                </div>
              </div>
              
              <div>
                <Label>Supported Currencies</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {currencies.map((currency) => (
                    <label key={currency} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.supportedCurrencies.includes(currency)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              supportedCurrencies: [...formData.supportedCurrencies, currency]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              supportedCurrencies: formData.supportedCurrencies.filter(c => c !== currency)
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{currency}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Environment</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value: 'sandbox' | 'production') => 
                    setFormData({ ...formData, environment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">API Credentials</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.credentials.apiKey}
                      onChange={(e) => setFormData({
                        ...formData,
                        credentials: { ...formData.credentials, apiKey: e.target.value }
                      })}
                      placeholder="Enter API key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secretKey">Secret Key</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      value={formData.credentials.secretKey}
                      onChange={(e) => setFormData({
                        ...formData,
                        credentials: { ...formData.credentials, secretKey: e.target.value }
                      })}
                      placeholder="Enter secret key"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGateway}>
                  Create Gateway
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
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
        <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Env</SelectItem>
            <SelectItem value="sandbox">Sandbox</SelectItem>
            <SelectItem value="production">Production</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="payment-gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="integrations">All Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="payment-gateways" className="space-y-4">
          {/* Payment Gateways Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGateways.map((gateway) => (
              <Card key={gateway._id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {gateway.logo ? (
                        <img
                          src={gateway.logo}
                          alt={gateway.name}
                          className="h-8 w-8 rounded"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{gateway.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{gateway.slug}</p>
                      </div>
                    </div>
                    {getStatusBadge(gateway.isActive, gateway.testStatus)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Environment</span>
                    <Badge variant="outline" className="capitalize">
                      {gateway.environment}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Test Status</span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(gateway.testStatus)}
                      <span className="capitalize">{gateway.testStatus.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Transactions</span>
                      <p className="font-medium">{gateway.stats.totalTransactions}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate</span>
                      <p className="font-medium">
                        {gateway.stats.totalTransactions > 0 
                          ? Math.round((gateway.stats.successfulTransactions / gateway.stats.totalTransactions) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={gateway.isActive}
                        onCheckedChange={(checked) => handleToggleGateway(gateway._id, checked)}
                      />
                      <span className="text-sm">Active</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestGateway(gateway._id)}
                      >
                        <TestTube className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(gateway)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteGateway(gateway._id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          {/* All Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration._id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {integration.logo ? (
                        <img
                          src={integration.logo}
                          alt={integration.name}
                          className="h-8 w-8 rounded"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                          {integration.type === 'payment' && <CreditCard className="h-4 w-4 text-primary" />}
                          {integration.type === 'shipping' && <Truck className="h-4 w-4 text-primary" />}
                          {integration.type === 'notification' && <Bell className="h-4 w-4 text-primary" />}
                          {integration.type === 'analytics' && <BarChart3 className="h-4 w-4 text-primary" />}
                          {integration.type === 'crm' && <Users className="h-4 w-4 text-primary" />}
                          {integration.type === 'other' && <Zap className="h-4 w-4 text-primary" />}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{integration.category}</p>
                      </div>
                    </div>
                    <Badge variant={integration.isActive ? "default" : "secondary"}>
                      {integration.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {integration.description && (
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Health Status</span>
                    <Badge 
                      variant={
                        integration.healthCheck.status === 'healthy' ? 'default' :
                        integration.healthCheck.status === 'unhealthy' ? 'destructive' : 'secondary'
                      }
                    >
                      {integration.healthCheck.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Requests</span>
                      <p className="font-medium">{integration.usage.totalRequests}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate</span>
                      <p className="font-medium">
                        {integration.usage.totalRequests > 0 
                          ? Math.round((integration.usage.successfulRequests / integration.usage.totalRequests) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={integration.isActive}
                        onCheckedChange={(checked) => {
                          // Handle integration toggle
                          console.log('Toggle integration:', integration._id, checked);
                        }}
                      />
                      <span className="text-sm">Active</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Payment Gateway</DialogTitle>
            <DialogDescription>
              Update payment gateway configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Gateway Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditGateway}>
                Update Gateway
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
