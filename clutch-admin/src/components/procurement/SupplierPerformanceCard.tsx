"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  Truck,
  Shield,
  Headphones,
  BarChart3,
  Calendar,
  Award,
  AlertCircle
} from "lucide-react";

interface PerformanceScores {
  delivery: {
    score: number;
    onTimePercentage: number;
    averageDelay: number;
    totalDeliveries: number;
    onTimeDeliveries: number;
    details: string;
  };
  quality: {
    score: number;
    acceptanceRate: number;
    rejectionRate: number;
    qualityIssueRate: number;
    totalItems: number;
    acceptedItems: number;
    rejectedItems: number;
    details: string;
  };
  compliance: {
    score: number;
    complianceRate: number;
    issueRate: number;
    totalChecks: number;
    passedChecks: number;
    complianceIssues: number;
    details: string;
  };
  cost: {
    score: number;
    totalSpend: number;
    totalSavings: number;
    savingsPercentage: number;
    costEfficiencyScore: number;
    details: string;
  };
  support: {
    score: number;
    isPreferred: boolean;
    relationshipStatus: string;
    details: string;
  };
}

interface SupplierPerformanceCardProps {
  supplierId: string;
  supplierName: string;
  spi: number;
  performanceLevel: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'CRITICAL';
  scores: PerformanceScores;
  trends?: {
    trend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'NO_DATA';
    change: number;
    changePercentage: number;
    firstSPI: number;
    lastSPI: number;
    dataPoints: number;
  };
  onViewDetails?: () => void;
  onCompare?: () => void;
  compact?: boolean;
}

export default function SupplierPerformanceCard({
  supplierId,
  supplierName,
  spi,
  performanceLevel,
  scores,
  trends,
  onViewDetails,
  onCompare,
  compact = false
}: SupplierPerformanceCardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case 'EXCELLENT':
        return 'text-green-600';
      case 'GOOD':
        return 'text-blue-600';
      case 'AVERAGE':
        return 'text-yellow-600';
      case 'POOR':
        return 'text-orange-600';
      case 'CRITICAL':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPerformanceLevelBadge = (level: string) => {
    switch (level) {
      case 'EXCELLENT':
        return <Badge variant="success">Excellent</Badge>;
      case 'GOOD':
        return <Badge variant="default">Good</Badge>;
      case 'AVERAGE':
        return <Badge variant="secondary">Average</Badge>;
      case 'POOR':
        return <Badge variant="outline">Poor</Badge>;
      case 'CRITICAL':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'DECLINING':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'STABLE':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">{supplierName}</div>
                <div className="text-sm text-muted-foreground">SPI: {spi}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getPerformanceLevelBadge(performanceLevel)}
              {trends && getTrendIcon(trends.trend)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-blue-600" />
            <span>{supplierName}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getPerformanceLevelBadge(performanceLevel)}
            {trends && getTrendIcon(trends.trend)}
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Award className="h-4 w-4" />
            <span>SPI: {spi}</span>
          </div>
          {trends && (
            <div className="flex items-center space-x-1">
              {getTrendIcon(trends.trend)}
              <span>
                {trends.change > 0 ? '+' : ''}{trends.changePercentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="cost">Cost</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Overall Performance</div>
                <div className="flex items-center space-x-2">
                  <Progress value={spi} className="flex-1" />
                  <span className="text-sm font-medium">{spi}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Performance Level</div>
                <div className={`font-medium ${getPerformanceLevelColor(performanceLevel)}`}>
                  {performanceLevel}
                </div>
              </div>
            </div>

            {trends && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">First SPI</div>
                  <div className="font-medium">{trends.firstSPI}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Latest SPI</div>
                  <div className="font-medium">{trends.lastSPI}</div>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              {onViewDetails && (
                <Button onClick={onViewDetails} variant="outline" size="sm">
                  View Details
                </Button>
              )}
              {onCompare && (
                <Button onClick={onCompare} variant="outline" size="sm">
                  Compare
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4" />
                  <span className="font-medium">Delivery Performance</span>
                </div>
                <Badge variant="outline">{scores.delivery.score}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>On-Time Deliveries</span>
                  <span>{scores.delivery.onTimeDeliveries}/{scores.delivery.totalDeliveries}</span>
                </div>
                <Progress value={scores.delivery.onTimePercentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {scores.delivery.onTimePercentage.toFixed(1)}% on time
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Average Delay</div>
                  <div className="font-medium">{scores.delivery.averageDelay.toFixed(1)} days</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Deliveries</div>
                  <div className="font-medium">{scores.delivery.totalDeliveries}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Quality Performance</span>
                </div>
                <Badge variant="outline">{scores.quality.score}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Acceptance Rate</span>
                  <span>{scores.quality.acceptanceRate.toFixed(1)}%</span>
                </div>
                <Progress value={scores.quality.acceptanceRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Items Accepted</div>
                  <div className="font-medium">{scores.quality.acceptedItems}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Items Rejected</div>
                  <div className="font-medium">{scores.quality.rejectedItems}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Compliance Performance</span>
                </div>
                <Badge variant="outline">{scores.compliance.score}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Compliance Rate</span>
                  <span>{scores.compliance.complianceRate.toFixed(1)}%</span>
                </div>
                <Progress value={scores.compliance.complianceRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Checks Passed</div>
                  <div className="font-medium">{scores.compliance.passedChecks}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Checks</div>
                  <div className="font-medium">{scores.compliance.totalChecks}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cost" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Cost Performance</span>
                </div>
                <Badge variant="outline">{scores.cost.score}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Spend</span>
                  <span className="font-medium">{formatCurrency(scores.cost.totalSpend)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Savings</span>
                  <span className="text-green-600 font-medium">{formatCurrency(scores.cost.totalSavings)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Savings Percentage</span>
                  <span className="text-green-600 font-medium">{scores.cost.savingsPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
