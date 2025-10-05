'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Users, 
  FileText, 
  Package, 
  FileCheck, 
  DollarSign, 
  Truck, 
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Handshake,
  ClipboardList,
  Receipt,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Types
interface ProcurementRequest {
  id: string;
  requestNumber: string;
  requestedBy: string;
  department: string;
  totalAmount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'ordered' | 'cancelled';
  createdAt: string;
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: string;
  }>;
}

interface Supplier {
  id: string;
  supplierName: string;
  contactInfo: {
    primaryContact: {
      name: string;
      email: string;
      phone: string;
    };
  };
  performance: {
    overallSPI: number;
    deliveryScore: number;
    qualityScore: number;
    complianceScore: number;
  };
  risk: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  status: {
    isActive: boolean;
    isPreferred: boolean;
  };
  productCategories: string[];
}

interface RFQ {
  id: string;
  rfqNumber: string;
  status: 'draft' | 'issued' | 'bidding_open' | 'bidding_closed' | 'evaluated' | 'awarded' | 'cancelled';
  items: Array<{
    itemName: string;
    quantity: number;
    category: string;
  }>;
  suppliers: Array<{
    supplierId: string;
    supplierName: string;
    status: 'invited' | 'viewed' | 'quoted' | 'declined' | 'no_response';
  }>;
  timeline: {
    issueDate: string;
    dueDate: string;
  };
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  totalAmount: number;
  status: 'draft' | 'issued' | 'acknowledged' | 'in_transit' | 'partially_received' | 'received' | 'completed' | 'cancelled';
  delivery: {
    expectedDeliveryDate: string;
    actualDeliveryDate?: string;
  };
  createdAt: string;
}

interface Contract {
  id: string;
  contractNumber: string;
  supplierName: string;
  contractType: string;
  terms: {
    startDate: string;
    endDate: string;
    value: number;
  };
  status: 'draft' | 'active' | 'expiring_soon' | 'expired' | 'renewed' | 'cancelled' | 'suspended';
  usage: {
    utilization: number;
    totalSpent: number;
  };
}

interface Budget {
  id: string;
  name: string;
  type: 'department' | 'project';
  totalBudget: number;
  spentAmount: number;
  committedAmount: number;
  availableAmount: number;
  utilizationPercentage: number;
  status: 'healthy' | 'at_risk' | 'over_budget';
}

interface GoodsReceipt {
  id: string;
  receiptId: string;
  poNumber: string;
  supplierName: string;
  receivedDate: string;
  status: 'draft' | 'received' | 'inspected' | 'accepted' | 'rejected' | 'partial' | 'completed';
  quality: {
    inspectionStatus: 'pending' | 'in_progress' | 'passed' | 'failed' | 'conditional';
  };
  discrepancies: {
    hasDiscrepancy: boolean;
    discrepancyType?: string;
  };
}

interface DashboardData {
  overview: {
    totalRequests: number;
    approvedRequests: number;
    pendingRequests: number;
    totalSpend: number;
    totalSuppliers: number;
    activeSuppliers: number;
    totalContracts: number;
    activeContracts: number;
    totalBudget: number;
    spentBudget: number;
    availableBudget: number;
    budgetUtilization: number;
  };
  metrics: {
    approvalRate: number;
    averageRequestValue: number;
    supplierUtilization: number;
    contractUtilization: number;
  };
}

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch procurement data from backend
        const [dashboardResponse, requestsResponse, suppliersResponse] = await Promise.all([
          apiService.get('/procurement/dashboard'),
          apiService.get('/procurement'),
          apiService.get('/procurement-suppliers')
        ]);

        if (dashboardResponse.success && dashboardResponse.data) {
          setDashboardData(dashboardResponse.data);
        }

        if (requestsResponse.success && requestsResponse.data) {
          setRequests(requestsResponse.data);
        }

        if (suppliersResponse.success && suppliersResponse.data) {
          setSuppliers(suppliersResponse.data);
        }
      } catch (error) {
        console.error('Error fetching procurement data:', error);
        toast.error('Failed to load procurement data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
      case 'completed':
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
      case 'pending':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'cancelled':
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'in_transit':
      case 'received':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement Management</h1>
          <p className="text-muted-foreground">
            Manage procurement requests, suppliers, contracts, and budgets
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="rfq">RFQ</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="receipts">Goods Receipt</TabsTrigger>
          <TabsTrigger value="risk-management">Risk Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          {dashboardData && (
            <>
              {/* Overview Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.overview.totalRequests}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData.overview.pendingRequests} pending approval
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      EGP {dashboardData.overview.totalSpend.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.overview.activeSuppliers}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData.overview.totalSuppliers} total suppliers
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.overview.budgetUtilization}%</div>
                    <p className="text-xs text-muted-foreground">
                      EGP {dashboardData.overview.availableBudget.toLocaleString()} available
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common procurement tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Plus className="h-6 w-6 mb-2" />
                      Create Request
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <FileText className="h-6 w-6 mb-2" />
                      Create RFQ
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <DollarSign className="h-6 w-6 mb-2" />
                      Manage Budgets
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pending Approvals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {requests.filter(r => r.status === 'pending_approval').slice(0, 3).map((request) => (
                        <div key={request.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{request.requestNumber}</p>
                            <p className="text-xs text-muted-foreground">{request.department}</p>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm">Request REQ-2024-002 approved</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <p className="text-sm">PO PO-2024-001 issued</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <p className="text-sm">New supplier added</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm">3 contracts expiring soon</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-red-600" />
                        <p className="text-sm">IT budget at 85%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Procurement Requests</CardTitle>
                  <CardDescription>Manage and track procurement requests</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      className="pl-8 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Request
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{request.requestNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.requestedBy} • {request.department}
                          </p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          {request.items.length} items • EGP {request.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Suppliers</CardTitle>
                  <CardDescription>Manage supplier relationships and performance</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search suppliers..."
                      className="pl-8 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Supplier
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((supplier) => (
                  <Card key={supplier.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{supplier.supplierName}</CardTitle>
                        <Badge className={getRiskColor(supplier.risk.riskLevel)}>
                          {supplier.risk.riskLevel}
                        </Badge>
                      </div>
                      <CardDescription>
                        {supplier.contactInfo.primaryContact.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">SPI Score</span>
                          <span className="font-medium">{supplier.performance.overallSPI}%</span>
                        </div>
                        <Progress value={supplier.performance.overallSPI} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span>Delivery: {supplier.performance.deliveryScore}%</span>
                          <span>Quality: {supplier.performance.qualityScore}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant={supplier.status.isPreferred ? 'default' : 'secondary'}>
                            {supplier.status.isPreferred ? 'Preferred' : 'Standard'}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RFQ Tab */}
        <TabsContent value="rfq" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Request for Quotes</CardTitle>
                  <CardDescription>Manage RFQ process and supplier quotes</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create RFQ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No RFQs found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first RFQ to start the procurement process.
                </p>
                <div className="mt-6">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create RFQ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="purchase-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Purchase Orders</CardTitle>
                  <CardDescription>Track purchase orders and deliveries</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create PO
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No purchase orders found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create purchase orders from approved requests.
                </p>
                <div className="mt-6">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create PO
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          {/* Contract Lifecycle Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Contract Lifecycle Management</h2>
              <p className="text-muted-foreground">Manage supplier contracts from creation to renewal</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Contracts
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Contract
              </Button>
            </div>
          </div>

          {/* Contract Status Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground">+5 this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">32</div>
                <p className="text-xs text-muted-foreground">66.7% of total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">8</div>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">5</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
          </div>

          {/* Contract Lifecycle Stages */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Draft</CardTitle>
                <div className="text-2xl font-bold">3</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>TechCorp Agreement</span>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>OfficeMax Contract</span>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Under Review</CardTitle>
                <div className="text-2xl font-bold">5</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Service Solutions</span>
                    <Badge variant="secondary">Review</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Maintenance Plus</span>
                    <Badge variant="secondary">Review</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active</CardTitle>
                <div className="text-2xl font-bold">32</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Furniture World</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>IT Equipment Co.</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expiring</CardTitle>
                <div className="text-2xl font-bold">8</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Marketing Agency</span>
                    <Badge variant="destructive">15 days</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Cleaning Services</span>
                    <Badge variant="destructive">7 days</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contract Management Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contract Management</CardTitle>
                  <CardDescription>Manage contract lifecycle and renewals</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Input placeholder="Search contracts..." className="w-64" />
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Contract</th>
                      <th className="text-left py-2">Supplier</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Value</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Expiry</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">CTR-2024-001</div>
                          <div className="text-sm text-muted-foreground">IT Equipment Supply</div>
                        </div>
                      </td>
                      <td className="py-2">TechCorp Inc.</td>
                      <td className="py-2">Fixed Price</td>
                      <td className="py-2">$450,000</td>
                      <td className="py-2">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </td>
                      <td className="py-2">2024-12-31</td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">CTR-2024-002</div>
                          <div className="text-sm text-muted-foreground">Office Supplies</div>
                        </div>
                      </td>
                      <td className="py-2">OfficeMax Pro</td>
                      <td className="py-2">Blanket</td>
                      <td className="py-2">$180,000</td>
                      <td className="py-2">
                        <Badge variant="secondary">Under Review</Badge>
                      </td>
                      <td className="py-2">2025-03-15</td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">CTR-2024-003</div>
                          <div className="text-sm text-muted-foreground">Furniture Supply</div>
                        </div>
                      </td>
                      <td className="py-2">Furniture World</td>
                      <td className="py-2">Time & Materials</td>
                      <td className="py-2">$320,000</td>
                      <td className="py-2">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </td>
                      <td className="py-2">2024-11-30</td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">CTR-2024-004</div>
                          <div className="text-sm text-muted-foreground">Service Agreement</div>
                        </div>
                      </td>
                      <td className="py-2">Service Solutions</td>
                      <td className="py-2">Retainer</td>
                      <td className="py-2">$280,000</td>
                      <td className="py-2">
                        <Badge variant="destructive">Expiring</Badge>
                      </td>
                      <td className="py-2">2024-02-15</td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">
                        <div>
                          <div className="font-medium">CTR-2024-005</div>
                          <div className="text-sm text-muted-foreground">Maintenance Services</div>
                        </div>
                      </td>
                      <td className="py-2">Maintenance Plus</td>
                      <td className="py-2">Fixed Price</td>
                      <td className="py-2">$150,000</td>
                      <td className="py-2">
                        <Badge variant="outline">Draft</Badge>
                      </td>
                      <td className="py-2">-</td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Contract Lifecycle Analytics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contract Status Distribution</CardTitle>
                <CardDescription>Current distribution of contract statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: 32, fill: '#22c55e' },
                          { name: 'Under Review', value: 5, fill: '#eab308' },
                          { name: 'Draft', value: 3, fill: '#6b7280' },
                          { name: 'Expiring', value: 8, fill: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Active', value: 32, fill: '#22c55e' },
                          { name: 'Under Review', value: 5, fill: '#eab308' },
                          { name: 'Draft', value: 3, fill: '#6b7280' },
                          { name: 'Expiring', value: 8, fill: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, '']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contract Value Trends</CardTitle>
                <CardDescription>Contract values over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={[
                      { month: 'Jul', value: 1200000, contracts: 8 },
                      { month: 'Aug', value: 1500000, contracts: 10 },
                      { month: 'Sep', value: 1800000, contracts: 12 },
                      { month: 'Oct', value: 2200000, contracts: 15 },
                      { month: 'Nov', value: 2500000, contracts: 18 },
                      { month: 'Dec', value: 2800000, contracts: 20 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => [
                        name === 'value' ? `$${value.toLocaleString()}` : value,
                        name === 'value' ? 'Value' : 'Contracts'
                      ]} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} name="Contract Value" />
                      <Line yAxisId="right" type="monotone" dataKey="contracts" stroke="#82ca9d" strokeWidth={2} name="Number of Contracts" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Budgets</CardTitle>
                  <CardDescription>Manage department and project budgets</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Budget
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No budgets found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create budgets for departments and projects.
                </p>
                <div className="mt-6">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Budget
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goods Receipt Tab */}
        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Goods Receipt</CardTitle>
                  <CardDescription>Track received goods and quality inspection</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Receipt
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No receipts found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Record goods receipts when items are delivered.
                </p>
                <div className="mt-6">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Receipt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Management Tab */}
        <TabsContent value="risk-management" className="space-y-6">
          {/* Risk Management Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Risk Management</h2>
              <p className="text-muted-foreground">Supplier risk assessment and monitoring</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Risk Report
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
            </div>
          </div>

          {/* Risk Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+3 this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3</div>
                <p className="text-xs text-muted-foreground">Requires immediate attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">7</div>
                <p className="text-xs text-muted-foreground">Monitor closely</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Assessments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Need immediate review</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Risk Assessments</CardTitle>
                  <CardDescription>Current supplier risk assessment status</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Input placeholder="Search assessments..." className="w-64" />
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Supplier</th>
                      <th className="text-left py-2">Risk Level</th>
                      <th className="text-left py-2">Risk Score</th>
                      <th className="text-left py-2">Last Assessment</th>
                      <th className="text-left py-2">Next Due</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">TechCorp Inc.</td>
                      <td className="py-2">
                        <Badge variant="destructive">Critical</Badge>
                      </td>
                      <td className="py-2">92</td>
                      <td className="py-2">2024-01-15</td>
                      <td className="py-2">2024-02-15</td>
                      <td className="py-2">
                        <Badge variant="outline">Under Review</Badge>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">OfficeMax Pro</td>
                      <td className="py-2">
                        <Badge variant="secondary">High</Badge>
                      </td>
                      <td className="py-2">75</td>
                      <td className="py-2">2024-01-10</td>
                      <td className="py-2">2024-02-10</td>
                      <td className="py-2">
                        <Badge variant="default">Approved</Badge>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Furniture World</td>
                      <td className="py-2">
                        <Badge variant="outline">Medium</Badge>
                      </td>
                      <td className="py-2">45</td>
                      <td className="py-2">2024-01-05</td>
                      <td className="py-2">2024-04-05</td>
                      <td className="py-2">
                        <Badge variant="default">Approved</Badge>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Service Solutions</td>
                      <td className="py-2">
                        <Badge variant="secondary">High</Badge>
                      </td>
                      <td className="py-2">68</td>
                      <td className="py-2">2023-12-20</td>
                      <td className="py-2">2024-01-20</td>
                      <td className="py-2">
                        <Badge variant="destructive">Overdue</Badge>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">Maintenance Plus</td>
                      <td className="py-2">
                        <Badge className="bg-green-100 text-green-800">Low</Badge>
                      </td>
                      <td className="py-2">25</td>
                      <td className="py-2">2024-01-12</td>
                      <td className="py-2">2024-07-12</td>
                      <td className="py-2">
                        <Badge variant="default">Approved</Badge>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Risk Trends Chart */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
                <CardDescription>Current distribution of supplier risk levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Low Risk', value: 8, fill: '#22c55e' },
                          { name: 'Medium Risk', value: 6, fill: '#eab308' },
                          { name: 'High Risk', value: 7, fill: '#f97316' },
                          { name: 'Critical Risk', value: 3, fill: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Low Risk', value: 8, fill: '#22c55e' },
                          { name: 'Medium Risk', value: 6, fill: '#eab308' },
                          { name: 'High Risk', value: 7, fill: '#f97316' },
                          { name: 'Critical Risk', value: 3, fill: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, '']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Trends Over Time</CardTitle>
                <CardDescription>Risk assessment trends over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={[
                      { month: 'Jul', critical: 1, high: 5, medium: 8, low: 6 },
                      { month: 'Aug', critical: 2, high: 6, medium: 7, low: 5 },
                      { month: 'Sep', critical: 1, high: 4, medium: 9, low: 6 },
                      { month: 'Oct', critical: 3, high: 5, medium: 8, low: 4 },
                      { month: 'Nov', critical: 2, high: 6, medium: 7, low: 5 },
                      { month: 'Dec', critical: 3, high: 7, medium: 6, low: 8 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Critical" />
                      <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} name="High" />
                      <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} name="Medium" />
                      <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} name="Low" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
              <p className="text-muted-foreground">Procurement insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,450,000</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+8 new this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78.5%</div>
                <p className="text-xs text-muted-foreground">$1,925,000 of $2,450,000</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Spend Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Spend Trends</CardTitle>
                <CardDescription>Monthly procurement spending over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={[
                      { month: 'Jan', spend: 180000, budget: 200000 },
                      { month: 'Feb', spend: 220000, budget: 200000 },
                      { month: 'Mar', spend: 195000, budget: 200000 },
                      { month: 'Apr', spend: 240000, budget: 200000 },
                      { month: 'May', spend: 210000, budget: 200000 },
                      { month: 'Jun', spend: 260000, budget: 200000 },
                      { month: 'Jul', spend: 230000, budget: 200000 },
                      { month: 'Aug', spend: 280000, budget: 200000 },
                      { month: 'Sep', spend: 250000, budget: 200000 },
                      { month: 'Oct', spend: 290000, budget: 200000 },
                      { month: 'Nov', spend: 270000, budget: 200000 },
                      { month: 'Dec', spend: 320000, budget: 200000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                      <Legend />
                      <Line type="monotone" dataKey="spend" stroke="#8884d8" strokeWidth={2} name="Actual Spend" />
                      <Line type="monotone" dataKey="budget" stroke="#82ca9d" strokeWidth={2} name="Budget" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Spend by Category</CardTitle>
                <CardDescription>Procurement spending distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'IT Equipment', value: 450000, fill: '#8884d8' },
                          { name: 'Office Supplies', value: 180000, fill: '#82ca9d' },
                          { name: 'Furniture', value: 320000, fill: '#ffc658' },
                          { name: 'Services', value: 280000, fill: '#ff7300' },
                          { name: 'Maintenance', value: 150000, fill: '#00ff00' },
                          { name: 'Marketing', value: 200000, fill: '#ff00ff' },
                          { name: 'Other', value: 870000, fill: '#0088fe' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'IT Equipment', value: 450000, fill: '#8884d8' },
                          { name: 'Office Supplies', value: 180000, fill: '#82ca9d' },
                          { name: 'Furniture', value: 320000, fill: '#ffc658' },
                          { name: 'Services', value: 280000, fill: '#ff7300' },
                          { name: 'Maintenance', value: 150000, fill: '#00ff00' },
                          { name: 'Marketing', value: 200000, fill: '#ff00ff' },
                          { name: 'Other', value: 870000, fill: '#0088fe' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers by Spend</CardTitle>
                <CardDescription>Leading suppliers by procurement volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={[
                      { name: 'TechCorp Inc.', spend: 450000, orders: 45 },
                      { name: 'OfficeMax Pro', spend: 380000, orders: 32 },
                      { name: 'Furniture World', spend: 320000, orders: 18 },
                      { name: 'Service Solutions', spend: 280000, orders: 25 },
                      { name: 'Maintenance Plus', spend: 150000, orders: 12 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                      <Legend />
                      <Bar dataKey="spend" fill="#8884d8" name="Spend Amount" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Department Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Procurement activity by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={[
                      { department: 'IT', requests: 45, spend: 650000, avgValue: 14444 },
                      { department: 'HR', requests: 28, spend: 180000, avgValue: 6429 },
                      { department: 'Finance', requests: 32, spend: 220000, avgValue: 6875 },
                      { department: 'Operations', requests: 38, spend: 420000, avgValue: 11053 },
                      { department: 'Marketing', requests: 25, spend: 150000, avgValue: 6000 },
                      { department: 'Sales', requests: 30, spend: 280000, avgValue: 9333 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => [
                        name === 'spend' ? `$${value.toLocaleString()}` : value,
                        name === 'spend' ? 'Spend' : name === 'requests' ? 'Requests' : 'Avg Value'
                      ]} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="requests" fill="#8884d8" name="Requests" />
                      <Bar yAxisId="right" dataKey="spend" fill="#82ca9d" name="Spend" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for top suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Supplier</th>
                      <th className="text-left py-2">On-Time Delivery</th>
                      <th className="text-left py-2">Quality Rating</th>
                      <th className="text-left py-2">Cost Performance</th>
                      <th className="text-left py-2">SPI Score</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">TechCorp Inc.</td>
                      <td className="py-2">98.5%</td>
                      <td className="py-2">4.8/5</td>
                      <td className="py-2">Excellent</td>
                      <td className="py-2">94.2</td>
                      <td className="py-2"><Badge variant="default">Preferred</Badge></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">OfficeMax Pro</td>
                      <td className="py-2">95.2%</td>
                      <td className="py-2">4.6/5</td>
                      <td className="py-2">Good</td>
                      <td className="py-2">89.7</td>
                      <td className="py-2"><Badge variant="secondary">Active</Badge></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Furniture World</td>
                      <td className="py-2">92.8%</td>
                      <td className="py-2">4.4/5</td>
                      <td className="py-2">Good</td>
                      <td className="py-2">86.3</td>
                      <td className="py-2"><Badge variant="secondary">Active</Badge></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Service Solutions</td>
                      <td className="py-2">89.1%</td>
                      <td className="py-2">4.2/5</td>
                      <td className="py-2">Fair</td>
                      <td className="py-2">82.1</td>
                      <td className="py-2"><Badge variant="outline">Under Review</Badge></td>
                    </tr>
                    <tr>
                      <td className="py-2">Maintenance Plus</td>
                      <td className="py-2">96.7%</td>
                      <td className="py-2">4.7/5</td>
                      <td className="py-2">Excellent</td>
                      <td className="py-2">91.8</td>
                      <td className="py-2"><Badge variant="default">Preferred</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
