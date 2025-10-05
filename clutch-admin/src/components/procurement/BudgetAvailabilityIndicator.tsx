"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Info,
  Calendar,
  Building,
  FolderOpen
} from "lucide-react";

interface BudgetData {
  budgetId: string;
  budgetName: string;
  totalBudget: number;
  committedAmount: number;
  spentAmount: number;
  availableAmount: number;
  utilizationPercentage: number;
  alertLevel: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
  categories?: Array<{
    name: string;
    allocatedAmount: number;
    committedAmount: number;
    spentAmount: number;
    availableAmount: number;
  }>;
}

interface BudgetAvailabilityIndicatorProps {
  requestAmount: number;
  departmentBudget?: BudgetData;
  projectBudget?: BudgetData;
  onBudgetCheck: (result: any) => void;
  showDetails?: boolean;
}

export default function BudgetAvailabilityIndicator({
  requestAmount,
  departmentBudget,
  projectBudget,
  onBudgetCheck,
  showDetails = true
}: BudgetAvailabilityIndicatorProps) {
  const [budgetCheck, setBudgetCheck] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (requestAmount > 0) {
      performBudgetCheck();
    }
  }, [requestAmount, departmentBudget, projectBudget]);

  const performBudgetCheck = async () => {
    setIsChecking(true);
    
    try {
      // Simulate budget check API call
      const result = {
        isAvailable: true,
        warnings: [],
        errors: [],
        recommendations: [],
        departmentBudget: departmentBudget,
        projectBudget: projectBudget,
        totalAvailable: (departmentBudget?.availableAmount || 0) + (projectBudget?.availableAmount || 0),
        totalCommitted: (departmentBudget?.committedAmount || 0) + (projectBudget?.committedAmount || 0),
        totalSpent: (departmentBudget?.spentAmount || 0) + (projectBudget?.spentAmount || 0)
      };

      // Check availability
      if (departmentBudget && requestAmount > departmentBudget.availableAmount) {
        result.isAvailable = false;
        result.errors.push(`Insufficient department budget: ${departmentBudget.availableAmount.toLocaleString()} EGP available, ${requestAmount.toLocaleString()} EGP required`);
      }

      if (projectBudget && requestAmount > projectBudget.availableAmount) {
        result.isAvailable = false;
        result.errors.push(`Insufficient project budget: ${projectBudget.availableAmount.toLocaleString()} EGP available, ${requestAmount.toLocaleString()} EGP required`);
      }

      // Add warnings
      if (departmentBudget && departmentBudget.alertLevel === 'CRITICAL') {
        result.warnings.push('Department budget is critically low');
      }

      if (projectBudget && projectBudget.alertLevel === 'CRITICAL') {
        result.warnings.push('Project budget is critically low');
      }

      // Add recommendations
      if (requestAmount > 50000) {
        result.recommendations.push({
          type: 'HIGH_VALUE_REQUEST',
          message: 'High-value request. Consider breaking into smaller phases.',
          priority: 'MEDIUM'
        });
      }

      setBudgetCheck(result);
      onBudgetCheck(result);
    } catch (error) {
      console.error('Error checking budget:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'EXCEEDED':
        return 'text-red-600';
      case 'CRITICAL':
        return 'text-red-500';
      case 'WARNING':
        return 'text-yellow-500';
      default:
        return 'text-green-600';
    }
  };

  const getAlertLevelIcon = (level: string) => {
    switch (level) {
      case 'EXCEEDED':
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
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

  if (isChecking) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-muted-foreground">Checking budget availability...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!budgetCheck) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card className={budgetCheck.isAvailable ? 'border-green-200' : 'border-red-200'}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            {budgetCheck.isAvailable ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span>Budget Availability</span>
            <Badge variant={budgetCheck.isAvailable ? 'success' : 'destructive'}>
              {budgetCheck.isAvailable ? 'Available' : 'Insufficient'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Request Amount</div>
              <div className="font-medium">{formatCurrency(requestAmount)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Available</div>
              <div className="font-medium">{formatCurrency(budgetCheck.totalAvailable)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {budgetCheck.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {budgetCheck.errors.map((error: string, index: number) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {budgetCheck.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {budgetCheck.warnings.map((warning: string, index: number) => (
                <div key={index}>{warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Details */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department Budget */}
          {departmentBudget && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Department Budget</span>
                  <Badge variant="outline">{departmentBudget.budgetName}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Budget</span>
                    <span className="font-medium">{formatCurrency(departmentBudget.totalBudget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Committed</span>
                    <span>{formatCurrency(departmentBudget.committedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Spent</span>
                    <span>{formatCurrency(departmentBudget.spentAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Available</span>
                    <span className={departmentBudget.availableAmount >= requestAmount ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(departmentBudget.availableAmount)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilization</span>
                    <span className={getAlertLevelColor(departmentBudget.alertLevel)}>
                      {departmentBudget.utilizationPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={departmentBudget.utilizationPercentage} 
                    className="h-2"
                  />
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {getAlertLevelIcon(departmentBudget.alertLevel)}
                    <span>{departmentBudget.alertLevel}</span>
                  </div>
                </div>

                {/* Categories */}
                {departmentBudget.categories && departmentBudget.categories.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Categories</div>
                    <div className="space-y-1">
                      {departmentBudget.categories.map((category, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span>{category.name}</span>
                          <span>{formatCurrency(category.availableAmount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Project Budget */}
          {projectBudget && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4" />
                  <span>Project Budget</span>
                  <Badge variant="outline">{projectBudget.budgetName}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Budget</span>
                    <span className="font-medium">{formatCurrency(projectBudget.totalBudget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Committed</span>
                    <span>{formatCurrency(projectBudget.committedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Spent</span>
                    <span>{formatCurrency(projectBudget.spentAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Available</span>
                    <span className={projectBudget.availableAmount >= requestAmount ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(projectBudget.availableAmount)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilization</span>
                    <span className={getAlertLevelColor(projectBudget.alertLevel)}>
                      {projectBudget.utilizationPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={projectBudget.utilizationPercentage} 
                    className="h-2"
                  />
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {getAlertLevelIcon(projectBudget.alertLevel)}
                    <span>{projectBudget.alertLevel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recommendations */}
      {budgetCheck.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {budgetCheck.recommendations.map((rec: any, index: number) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-muted rounded-md">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm">
                    <div className="font-medium">{rec.message}</div>
                    <div className="text-muted-foreground">Priority: {rec.priority}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
