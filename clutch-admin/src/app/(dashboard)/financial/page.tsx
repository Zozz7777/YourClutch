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
import { Progress } from "@/components/ui/progress";
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
  Zap,
  Building,
  Truck,
  Handshake,
  PiggyBank,
  TrendingUp as RevenueIcon,
  TrendingDown as ExpenseIcon,
  Activity,
  AlertCircle,
  CheckCircle as SuccessIcon,
  Clock as PendingIcon,
  RefreshCw,
  Plus,
  Minus,
  Equal,
  Settings,
  BarChart,
  LineChart,
  PieChart as PieChartIcon,
  TrendingUp as GrowthIcon,
  AlertTriangle as WarningIcon,
  Info,
  ExternalLink
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

// Interfaces for comprehensive financial data
interface RevenueFlow {
  totalOrders: number;
  totalRevenue: number;
  clutchRevenue: number;
  partnerCommissions: number;
  paymentGatewayFees: number;
  netRevenue: number;
}

interface PaymentCollections {
  byMethod: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
  pending: number;
  collected: number;
  reconciled: number;
}

interface WeeklyPayouts {
  totalPayouts: number;
  pendingPayouts: number;
  completedPayouts: number;
  totalAmount: number;
  pendingAmount: number;
}

interface PayrollData {
  totalEmployees: number;
  monthlyPayroll: number;
  totalTaxes: number;
  pendingPayments: number;
  completedPayments: number;
}

interface CompanyExpenses {
  totalExpenses: number;
  byCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  byDepartment: Array<{
    department: string;
    amount: number;
    percentage: number;
  }>;
  pendingApprovals: number;
  overduePayments: number;
}

interface FinancialHealth {
  currentRatio: number;
  quickRatio: number;
  debtToEquity: number;
  profitMargin: number;
  roi: number;
  workingCapital: number;
}

interface CashFlow {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  cashPosition: number;
}

export default function FinancialPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");
  const [loading, setLoading] = useState(true);

  // Financial data state
  const [revenueFlow, setRevenueFlow] = useState<RevenueFlow | null>(null);
  const [paymentCollections, setPaymentCollections] = useState<PaymentCollections | null>(null);
  const [weeklyPayouts, setWeeklyPayouts] = useState<WeeklyPayouts | null>(null);
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [companyExpenses, setCompanyExpenses] = useState<CompanyExpenses | null>(null);
  const [financialHealth, setFinancialHealth] = useState<FinancialHealth | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlow | null>(null);

  // Load financial data
  useEffect(() => {
    loadFinancialData();
  }, [dateRange]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Load all financial data in parallel
      const [
        revenueResponse,
        collectionsResponse,
        payoutsResponse,
        payrollResponse,
        expensesResponse,
        healthResponse,
        cashFlowResponse
      ] = await Promise.all([
        apiService.get("/api/v1/revenue-management/analytics"),
        apiService.get("/api/v1/revenue-management/collections"),
        apiService.get("/api/v1/revenue-management/weekly-payout-summary"),
        apiService.get("/api/v1/payroll/cost-analysis"),
        apiService.get("/api/v1/company-expenses/analysis"),
        apiService.get("/api/v1/financial/health"),
        apiService.get("/api/v1/revenue-management/cash-flow")
      ]);

      if (revenueResponse.success) {
        setRevenueFlow(revenueResponse.data as RevenueFlow);
      }
      if (collectionsResponse.success) {
        setPaymentCollections(collectionsResponse.data as PaymentCollections);
      }
      if (payoutsResponse.success) {
        setWeeklyPayouts(payoutsResponse.data as WeeklyPayouts);
      }
      if (payrollResponse.success) {
        setPayrollData(payrollResponse.data as PayrollData);
      }
      if (expensesResponse.success) {
        setCompanyExpenses(expensesResponse.data as CompanyExpenses);
      }
      if (healthResponse.success) {
        setFinancialHealth(healthResponse.data as FinancialHealth);
      }
      if (cashFlowResponse.success) {
        setCashFlow(cashFlowResponse.data as CashFlow);
      }
    } catch (error) {
      console.error("Error loading financial data:", error);
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-EG').format(num);
  };

  const getHealthColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "text-green-600";
    if (value >= thresholds.warning) return "text-yellow-600";
    return "text-red-600";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
          <p className="text-muted-foreground">
            Complete financial overview and management for Clutch
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadFinancialData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <RevenueIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueFlow ? formatCurrency(revenueFlow.totalRevenue) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              From all payment methods
            </p>
          </CardContent>
        </Card>

        {/* Clutch Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clutch Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueFlow ? formatCurrency(revenueFlow.clutchRevenue) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              After partner commissions
            </p>
          </CardContent>
        </Card>

        {/* Net Cash Flow */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cashFlow ? formatCurrency(cashFlow.netCashFlow) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              Operating cash flow
            </p>
          </CardContent>
        </Card>

        {/* Cash Position */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Position</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cashFlow ? formatCurrency(cashFlow.cashPosition) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              Available cash
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Flow Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RevenueIcon className="h-5 w-5 mr-2" />
                  Revenue Flow
                </CardTitle>
                <CardDescription>
                  Complete revenue breakdown from all sources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {revenueFlow && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Orders</span>
                      <span className="font-medium">{formatNumber(revenueFlow.totalOrders)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Revenue</span>
                      <span className="font-medium">{formatCurrency(revenueFlow.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Clutch Revenue</span>
                      <span className="font-medium text-green-600">{formatCurrency(revenueFlow.clutchRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Partner Commissions</span>
                      <span className="font-medium text-blue-600">{formatCurrency(revenueFlow.partnerCommissions)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Gateway Fees</span>
                      <span className="font-medium text-red-600">{formatCurrency(revenueFlow.paymentGatewayFees)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Net Revenue</span>
                        <span className="text-green-600">{formatCurrency(revenueFlow.netRevenue)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Financial Health Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Financial Health
                </CardTitle>
                <CardDescription>
                  Key financial ratios and indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {financialHealth && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current Ratio</span>
                      <span className={`font-medium ${getHealthColor(financialHealth.currentRatio, { good: 2, warning: 1.5 })}`}>
                        {financialHealth.currentRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quick Ratio</span>
                      <span className={`font-medium ${getHealthColor(financialHealth.quickRatio, { good: 1, warning: 0.8 })}`}>
                        {financialHealth.quickRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Debt-to-Equity</span>
                      <span className={`font-medium ${getHealthColor(financialHealth.debtToEquity, { good: 0.5, warning: 1 })}`}>
                        {financialHealth.debtToEquity.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Profit Margin</span>
                      <span className={`font-medium ${getHealthColor(financialHealth.profitMargin, { good: 10, warning: 5 })}`}>
                        {financialHealth.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ROI</span>
                      <span className={`font-medium ${getHealthColor(financialHealth.roi, { good: 15, warning: 10 })}`}>
                        {financialHealth.roi.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Working Capital</span>
                      <span className="font-medium">{formatCurrency(financialHealth.workingCapital)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Collections & Payouts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Collections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentCollections && (
                  <div className="space-y-3">
                    {paymentCollections.byMethod.map((method, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{method.method.replace('_', ' ')}</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(method.amount)}</div>
                          <div className="text-xs text-muted-foreground">{method.count} transactions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Handshake className="h-5 w-5 mr-2" />
                  Weekly Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyPayouts && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Payouts</span>
                      <span className="font-medium">{weeklyPayouts.totalPayouts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending</span>
                      <span className="font-medium text-yellow-600">{weeklyPayouts.pendingPayouts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed</span>
                      <span className="font-medium text-green-600">{weeklyPayouts.completedPayouts}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total Amount</span>
                        <span>{formatCurrency(weeklyPayouts.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentCollections?.byMethod.map((method, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm capitalize">{method.method.replace('_', ' ')}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(method.amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">This Month</span>
                    <span className="font-medium text-green-600">+12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Month</span>
                    <span className="font-medium text-green-600">+8.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">YTD Growth</span>
                    <span className="font-medium text-green-600">+24.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Online Payments</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">COD Delivery</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Installments</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cash to Partners</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {companyExpenses?.byCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm capitalize">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(category.amount)}</div>
                      <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expenses by Department</CardTitle>
              </CardHeader>
              <CardContent>
                {companyExpenses?.byDepartment.map((department, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      <span className="text-sm capitalize">{department.department}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(department.amount)}</div>
                      <div className="text-xs text-muted-foreground">{department.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expense Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm">Pending Approvals</span>
                  </div>
                  <Badge variant="outline">{companyExpenses?.pendingApprovals || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm">Overdue Payments</span>
                  </div>
                  <Badge variant="destructive">{companyExpenses?.overduePayments || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payrollData?.totalEmployees || 0}</div>
                <p className="text-xs text-muted-foreground">Active staff</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payrollData ? formatCurrency(payrollData.monthlyPayroll) : "—"}
                </div>
                <p className="text-xs text-muted-foreground">Total cost</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payrollData ? formatCurrency(payrollData.totalTaxes) : "—"}
                </div>
                <p className="text-xs text-muted-foreground">Withheld</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {payrollData?.pendingPayments || 0}
                </div>
                <p className="text-xs text-muted-foreground">Payments</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payout Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Payouts</span>
                    <span className="font-medium">{weeklyPayouts?.totalPayouts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pending</span>
                    <span className="font-medium text-yellow-600">{weeklyPayouts?.pendingPayouts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completed</span>
                    <span className="font-medium text-green-600">{weeklyPayouts?.completedPayouts || 0}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount</span>
                      <span>{weeklyPayouts ? formatCurrency(weeklyPayouts.totalAmount) : "—"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Weekly Payouts
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Payout Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Payout Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Profit & Loss Statement
                </Button>
                <Button className="w-full" variant="outline">
                  <BarChart className="h-4 w-4 mr-2" />
                  Balance Sheet
                </Button>
                <Button className="w-full" variant="outline">
                  <LineChart className="h-4 w-4 mr-2" />
                  Cash Flow Statement
                </Button>
                <Button className="w-full" variant="outline">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Revenue Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PDF
                </Button>
                <Button className="w-full" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Send via Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}