"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";

interface SpendData {
  period: string;
  totalSpend: number;
  costSavings: number;
  spendUnderManagement: number;
  maverickSpend: number;
  complianceRate: number;
  transactionCount: number;
}

interface CategorySpend {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface SupplierSpend {
  supplierId: string;
  supplierName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  averageOrderValue: number;
}

interface SpendChartProps {
  data: SpendData[];
  categoryData: CategorySpend[];
  supplierData: SupplierSpend[];
  onRefresh: () => void;
  onExport: () => void;
  loading?: boolean;
}

export default function SpendChart({
  data,
  categoryData,
  supplierData,
  onRefresh,
  onExport,
  loading = false
}: SpendChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [viewType, setViewType] = useState<'overview' | 'category' | 'supplier'>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTotalSpend = () => {
    return data.reduce((sum, item) => sum + item.totalSpend, 0);
  };

  const getTotalSavings = () => {
    return data.reduce((sum, item) => sum + item.costSavings, 0);
  };

  const getAverageCompliance = () => {
    if (data.length === 0) return 0;
    const totalCompliance = data.reduce((sum, item) => sum + item.complianceRate, 0);
    return totalCompliance / data.length;
  };

  const getSpendTrend = () => {
    if (data.length < 2) return 'stable';
    const firstPeriod = data[0].totalSpend;
    const lastPeriod = data[data.length - 1].totalSpend;
    const change = ((lastPeriod - firstPeriod) / firstPeriod) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  // Mock chart rendering - in a real implementation, you'd use a charting library like Chart.js or Recharts
  const renderChart = () => {
    return (
      <div className="h-64 flex items-center justify-center bg-muted rounded-md">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Chart visualization would go here</p>
          <p className="text-sm text-muted-foreground">
            Using libraries like Chart.js, Recharts, or D3.js
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Spend Analytics</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm">Period:</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1M</SelectItem>
                <SelectItem value="3m">3M</SelectItem>
                <SelectItem value="6m">6M</SelectItem>
                <SelectItem value="12m">12M</SelectItem>
                <SelectItem value="24m">24M</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm">Chart:</label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={viewType} onValueChange={setViewType}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="supplier">By Supplier</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spend</p>
                      <p className="text-2xl font-bold">{formatCurrency(getTotalSpend())}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(getSpendTrend())}
                    <span className={`text-sm ml-1 ${getTrendColor(getSpendTrend())}`}>
                      {getSpendTrend() === 'up' ? 'Increasing' : getSpendTrend() === 'down' ? 'Decreasing' : 'Stable'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Cost Savings</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalSavings())}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {formatPercentage((getTotalSavings() / getTotalSpend()) * 100)} of total spend
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Compliance Rate</p>
                      <p className="text-2xl font-bold">{formatPercentage(getAverageCompliance())}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Average across all periods
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Transactions</p>
                      <p className="text-2xl font-bold">
                        {data.reduce((sum, item) => sum + item.transactionCount, 0).toLocaleString()}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Total transactions
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Spend Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart()}
              </CardContent>
            </Card>

            {/* Recent Data */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Spend Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.slice(-5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <div className="font-medium">{item.period}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.transactionCount} transactions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.totalSpend)}</div>
                        <div className="text-sm text-green-600">
                          +{formatCurrency(item.costSavings)} savings
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="category" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spend by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart()}
              </CardContent>
            </Card>

            <div className="space-y-2">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{category.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPercentage(category.percentage)} of total spend
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(category.amount)}</div>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(category.trend)}
                      <span className="text-sm text-muted-foreground">
                        {category.trend === 'up' ? 'Increasing' : category.trend === 'down' ? 'Decreasing' : 'Stable'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="supplier" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spend by Supplier</CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart()}
              </CardContent>
            </Card>

            <div className="space-y-2">
              {supplierData.map((supplier, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{supplier.supplierName}</div>
                      <div className="text-sm text-muted-foreground">
                        {supplier.transactionCount} transactions • 
                        Avg: {formatCurrency(supplier.averageOrderValue)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(supplier.amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPercentage(supplier.percentage)} of total spend
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
