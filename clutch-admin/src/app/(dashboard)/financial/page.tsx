"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  BarChart3,
  PieChart,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DollarSign as DollarIcon,
  Calculator,
  Receipt,
  Banknote,
  Wallet,
  Target,
  Zap
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

interface FinancialOverview {
  totalRevenue: number;
  totalCommissions: number;
  unpaidCommissions: number;
  totalPayouts: number;
  recentCommissions: any[];
  revenueByPaymentMethod: any[];
  commissionTrends: any[];
}

interface PartnerFinancial {
  _id: string;
  partnerId: string;
  commissionStructure: {
    type: 'fixed' | 'tiered' | 'category' | 'hybrid';
    fixedRate?: number;
    tieredRates?: any[];
    categoryRates?: any[];
    hybridConfig?: any;
  };
  vatApplicable: boolean;
  vatRate: number;
  clutchMarkupStrategy: 'partner_pays' | 'user_pays' | 'split';
  markupPercentage: number;
  financials: {
    totalRevenue: number;
    totalCommission: number;
    unpaidCommission: number;
    totalVatCollected: number;
    totalOrders: number;
    averageOrderValue: number;
  };
  lastPayoutDate?: string;
  nextPayoutDate?: string;
  contractTerms: {
    startDate: string;
    endDate?: string;
    isActive: boolean;
    autoRenew: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface Commission {
  _id: string;
  commissionId: string;
  partnerId: string;
  orderId: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  vatAmount: number;
  partnerNet: number;
  clutchRevenue: number;
  paymentMethod: string;
  category: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paidAt?: string;
  createdAt: string;
}

interface Payout {
  _id: string;
  payoutId: string;
  partnerId: string;
  amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  scheduledDate: string;
  paidDate?: string;
  createdAt: string;
}

export default function FinancialPage() {
  const { t } = useLanguage();
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [partners, setPartners] = useState<PartnerFinancial[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<PartnerFinancial[]>([]);
  const [filteredCommissions, setFilteredCommissions] = useState<Commission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPartner, setSelectedPartner] = useState<PartnerFinancial | null>(null);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter data when search term or filters change
  useEffect(() => {
    filterData();
  }, [searchTerm, statusFilter, partners, commissions]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [overviewResponse, partnersResponse, commissionsResponse, payoutsResponse] = await Promise.all([
        apiService.get('/financial/overview'),
        apiService.get('/financial/partners'),
        apiService.get('/financial/commissions'),
        apiService.get('/financial/payouts')
      ]);

      if (overviewResponse.success) {
        setOverview(overviewResponse.data);
      }

      if (partnersResponse.success) {
        setPartners(partnersResponse.data.partners);
      }

      if (commissionsResponse.success) {
        setCommissions(commissionsResponse.data.commissions);
      }

      if (payoutsResponse.success) {
        setPayouts(payoutsResponse.data.payouts);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    let filteredP = partners;
    let filteredC = commissions;

    // Apply search filter
    if (searchTerm) {
      filteredP = filteredP.filter(partner => 
        partner.partnerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      filteredC = filteredC.filter(commission => 
        commission.partnerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.orderId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter for commissions
    if (statusFilter !== "all") {
      filteredC = filteredC.filter(commission => commission.status === statusFilter);
    }

    setFilteredPartners(filteredP);
    setFilteredCommissions(filteredC);
  };

  const handleUpdateCommissionStructure = async (partnerId: string, commissionData: any) => {
    try {
      const response = await apiService.put(`/financial/partners/${partnerId}/commission`, commissionData);
      
      if (response.success) {
        toast.success('Commission structure updated successfully');
        setIsPartnerDialogOpen(false);
        setSelectedPartner(null);
        loadData();
      } else {
        toast.error(response.message || 'Failed to update commission structure');
      }
    } catch (error) {
      console.error('Error updating commission structure:', error);
      toast.error('Failed to update commission structure');
    }
  };

  const handleMarkCommissionAsPaid = async (commissionId: string) => {
    try {
      const response = await apiService.post(`/financial/commissions/${commissionId}/pay`);
      
      if (response.success) {
        toast.success('Commission marked as paid');
        loadData();
      } else {
        toast.error(response.message || 'Failed to mark commission as paid');
      }
    } catch (error) {
      console.error('Error marking commission as paid:', error);
      toast.error('Failed to mark commission as paid');
    }
  };

  const handleCreatePayout = async (partnerIds: string[], method: string) => {
    try {
      const response = await apiService.post('/financial/payouts', {
        partnerIds,
        method,
        scheduledDate: new Date().toISOString()
      });
      
      if (response.success) {
        toast.success('Payout created successfully');
        loadData();
      } else {
        toast.error(response.message || 'Failed to create payout');
      }
    } catch (error) {
      console.error('Error creating payout:', error);
      toast.error('Failed to create payout');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'paid':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
          <p className="text-muted-foreground">
            Manage partner commissions, payouts, and revenue tracking
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Calculator className="h-4 w-4 mr-2" />
            Create Payout
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search partners or commissions..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Input
            type="date"
            placeholder="Start Date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="w-40"
          />
          <Input
            type="date"
            placeholder="End Date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="w-40"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overview?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overview?.totalCommissions || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +8.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unpaid Commissions</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overview?.unpaidCommissions || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Pending payout
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overview?.totalPayouts || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +15.3% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
                <CardDescription>Breakdown of revenue by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overview?.revenueByPaymentMethod?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-primary" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }} />
                        <span className="text-sm font-medium capitalize">{item._id}</span>
                      </div>
                      <span className="text-sm font-bold">{formatCurrency(item.totalRevenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Trends</CardTitle>
                <CardDescription>Commission trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overview?.commissionTrends?.slice(0, 6).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {trend._id.month}/{trend._id.year}
                      </span>
                      <span className="text-sm font-bold">{formatCurrency(trend.total)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          {/* Partners Table */}
          <Card>
            <CardHeader>
              <CardTitle>Partner Financial Overview</CardTitle>
              <CardDescription>Manage partner commission structures and financial data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPartners.map((partner) => (
                  <div key={partner._id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{partner.partnerId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Commission Type: {partner.commissionStructure.type}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={partner.contractTerms.isActive ? "default" : "secondary"}>
                          {partner.contractTerms.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPartner(partner);
                            setIsPartnerDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Revenue</span>
                        <p className="font-medium">{formatCurrency(partner.financials.totalRevenue)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Unpaid Commission</span>
                        <p className="font-medium">{formatCurrency(partner.financials.unpaidCommission)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Orders</span>
                        <p className="font-medium">{partner.financials.totalOrders}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Order Value</span>
                        <p className="font-medium">{formatCurrency(partner.financials.averageOrderValue)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          {/* Commissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Management</CardTitle>
              <CardDescription>View and manage partner commissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCommissions.map((commission) => (
                  <div key={commission._id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Order #{commission.orderId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Partner: {commission.partnerId} • {commission.category}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(commission.status)}
                        {commission.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkCommissionAsPaid(commission._id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Order Amount</span>
                        <p className="font-medium">{formatCurrency(commission.orderAmount)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Commission Rate</span>
                        <p className="font-medium">{commission.commissionRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Commission Amount</span>
                        <p className="font-medium">{formatCurrency(commission.commissionAmount)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Partner Net</span>
                        <p className="font-medium">{formatCurrency(commission.partnerNet)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          {/* Payouts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payout Management</CardTitle>
              <CardDescription>View and manage partner payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div key={payout._id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Payout #{payout.payoutId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Partner: {payout.partnerId} • {payout.method}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(payout.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount</span>
                        <p className="font-medium">{formatCurrency(payout.amount)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Scheduled Date</span>
                        <p className="font-medium">{new Date(payout.scheduledDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Paid Date</span>
                        <p className="font-medium">
                          {payout.paidDate ? new Date(payout.paidDate).toLocaleDateString() : 'Not paid'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          {/* Costs Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral Costs</CardTitle>
                <CardDescription>Track referral program costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Referral cost tracking coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promo Code Costs</CardTitle>
                <CardDescription>Track promo code usage and costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Promo code cost tracking coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Partner Commission Dialog */}
      <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Commission Structure</DialogTitle>
            <DialogDescription>
              Configure commission structure for {selectedPartner?.partnerId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Commission Type</Label>
                <Select defaultValue={selectedPartner?.commissionStructure.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Rate</SelectItem>
                    <SelectItem value="tiered">Tiered Rate</SelectItem>
                    <SelectItem value="category">Category Based</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fixed Rate (%)</Label>
                <Input
                  type="number"
                  placeholder="5.0"
                  defaultValue={selectedPartner?.commissionStructure.fixedRate}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                defaultChecked={selectedPartner?.vatApplicable}
              />
              <Label>VAT Applicable</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                defaultChecked={selectedPartner?.vatApplicable}
              />
              <Label>VAT Rate (%)</Label>
              <Input
                type="number"
                placeholder="14"
                defaultValue={selectedPartner?.vatRate}
                className="w-20"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPartnerDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Handle commission structure update
                setIsPartnerDialogOpen(false);
              }}>
                Update Structure
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
