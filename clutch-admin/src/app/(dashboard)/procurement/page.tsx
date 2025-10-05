'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

  // Mock data for demonstration
  useEffect(() => {
    const mockDashboardData: DashboardData = {
      overview: {
        totalRequests: 156,
        approvedRequests: 142,
        pendingRequests: 14,
        totalSpend: 2450000,
        totalSuppliers: 89,
        activeSuppliers: 76,
        totalContracts: 23,
        activeContracts: 18,
        totalBudget: 5000000,
        spentBudget: 2450000,
        availableBudget: 2550000,
        budgetUtilization: 49
      },
      metrics: {
        approvalRate: 91,
        averageRequestValue: 15705,
        supplierUtilization: 85,
        contractUtilization: 78
      }
    };

    const mockRequests: ProcurementRequest[] = [
      {
        id: '1',
        requestNumber: 'REQ-2024-001',
        requestedBy: 'John Smith',
        department: 'IT',
        totalAmount: 15000,
        status: 'pending_approval',
        createdAt: '2024-01-15',
        items: [
          { itemName: 'Laptop', quantity: 5, unitPrice: 3000, totalPrice: 15000, category: 'IT Equipment' }
        ]
      },
      {
        id: '2',
        requestNumber: 'REQ-2024-002',
        requestedBy: 'Sarah Johnson',
        department: 'Marketing',
        totalAmount: 8500,
        status: 'approved',
        createdAt: '2024-01-14',
        items: [
          { itemName: 'Marketing Materials', quantity: 100, unitPrice: 85, totalPrice: 8500, category: 'Marketing' }
        ]
      }
    ];

    const mockSuppliers: Supplier[] = [
      {
        id: '1',
        supplierName: 'Tech Solutions Ltd',
        contactInfo: {
          primaryContact: {
            name: 'Mike Wilson',
            email: 'mike@techsolutions.com',
            phone: '+1-555-0123'
          }
        },
        performance: {
          overallSPI: 92,
          deliveryScore: 95,
          qualityScore: 88,
          complianceScore: 93
        },
        risk: { riskLevel: 'low' },
        status: { isActive: true, isPreferred: true },
        productCategories: ['IT Equipment', 'Software']
      }
    ];

    setDashboardData(mockDashboardData);
    setRequests(mockRequests);
    setSuppliers(mockSuppliers);
    setLoading(false);
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
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="rfq">RFQ</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="receipts">Goods Receipt</TabsTrigger>
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
                      ${dashboardData.overview.totalSpend.toLocaleString()}
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
                      ${dashboardData.overview.availableBudget.toLocaleString()} available
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
                          {request.items.length} items • ${request.totalAmount.toLocaleString()}
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
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contracts</CardTitle>
                  <CardDescription>Manage supplier contracts and agreements</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Contract
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No contracts found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create contracts with your suppliers.
                </p>
                <div className="mt-6">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Contract
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Procurement insights and reporting</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Analytics Dashboard</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  View procurement analytics and insights.
                </p>
                <div className="mt-6">
                  <Button>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
