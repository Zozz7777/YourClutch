"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { useLanguage } from '@/contexts/language-context';
import { 
  Fuel, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart,
  Download,
  Eye,
  Truck,
  Activity,
  Target
} from 'lucide-react';

interface FuelCostMetricsProps {
  className?: string;
}

interface CostMetrics {
  totalCost: number;
  fuelCost: number;
  maintenanceCost: number;
  insuranceCost: number;
  otherCosts: number;
  costPerVehicle: number;
  costPerMile: number;
  fuelEfficiency: number;
  totalMiles: number;
  totalVehicles: number;
}

export function FuelCostMetrics({ className = '' }: FuelCostMetricsProps) {
  const { t } = useLanguage();
  const [costMetrics, setCostMetrics] = React.useState<CostMetrics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadCostMetrics = async () => {
      try {
        const [vehicles, payments] = await Promise.all([
          productionApi.getFleetVehicles(),
          productionApi.getPayments()
        ]);

        // Load real fuel cost data from API
        try {
          const fuelCostData = await productionApi.getFuelCostMetrics();
          
          if (fuelCostData && Array.isArray(fuelCostData) && fuelCostData.length > 0) {
            // Aggregate real fuel cost data
            const totalVehicles = vehicles?.length || 0;
            const totalCost = fuelCostData.reduce((sum, record) => sum + (record.totalCost || 0), 0);
            const fuelCost = fuelCostData.reduce((sum, record) => sum + (record.fuelCost || 0), 0);
            const maintenanceCost = fuelCostData.reduce((sum, record) => sum + (record.maintenanceCost || 0), 0);
            const insuranceCost = fuelCostData.reduce((sum, record) => sum + (record.insuranceCost || 0), 0);
            const otherCosts = fuelCostData.reduce((sum, record) => sum + (record.otherCosts || 0), 0);
            const totalMiles = fuelCostData.reduce((sum, record) => sum + (record.miles || 0), 0);
            const fuelEfficiency = fuelCostData.length > 0 
              ? fuelCostData.reduce((sum, record) => sum + (record.fuelEfficiency || 0), 0) / fuelCostData.length 
              : 8.5; // Default fallback

            const costPerVehicle = totalVehicles > 0 ? totalCost / totalVehicles : 0;
            const costPerMile = totalMiles > 0 ? totalCost / totalMiles : 0;

            setCostMetrics({
              totalCost,
              fuelCost,
              maintenanceCost,
              insuranceCost,
              otherCosts,
              costPerVehicle,
              costPerMile,
              fuelEfficiency,
              totalMiles,
              totalVehicles
            });
          } else {
            // No fuel cost data available, set empty data
            setCostMetrics({
              totalCost: 0,
              fuelCost: 0,
              maintenanceCost: 0,
              insuranceCost: 0,
              otherCosts: 0,
              costPerVehicle: 0,
              costPerMile: 0,
              fuelEfficiency: 0,
              totalMiles: 0,
              totalVehicles: vehicles?.length || 0
            });
          }
        } catch (error) {
          // If fuel cost API fails, set empty data
          setCostMetrics({
            totalCost: 0,
            fuelCost: 0,
            maintenanceCost: 0,
            insuranceCost: 0,
            otherCosts: 0,
            costPerVehicle: 0,
            costPerMile: 0,
            fuelEfficiency: 0,
            totalMiles: 0,
            totalVehicles: vehicles?.length || 0
          });
        }
      } catch (error) {
        // Failed to load cost metrics - set default values
        setCostMetrics({
          totalCost: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          insuranceCost: 0,
          otherCosts: 0,
          costPerVehicle: 0,
          costPerMile: 0,
          fuelEfficiency: 8.5,
          totalMiles: 0,
          totalVehicles: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCostMetrics();
  }, []);

  const getCostColor = (cost: number, threshold: number) => {
    if (cost <= threshold * 0.8) return 'text-success';
    if (cost <= threshold) return 'text-warning';
    return 'text-destructive';
  };

  const getCostBadge = (cost: number, threshold: number) => {
    if (cost <= threshold * 0.8) return 'bg-success/10 text-success';
    if (cost <= threshold) return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  const getCostLevel = (cost: number, threshold: number) => {
    if (cost <= threshold * 0.8) return 'Excellent';
    if (cost <= threshold) return 'Good';
    return 'High';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-destructive';
      case 'down': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-success" />
            <span>Fuel & Cost Metrics</span>
          </CardTitle>
          <CardDescription>Loading cost metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded-[0.625rem] w-3/4"></div>
            <div className="h-4 bg-muted rounded-[0.625rem] w-1/2"></div>
            <div className="h-4 bg-muted rounded-[0.625rem] w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!costMetrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-success" />
            <span>Fuel & Cost Metrics</span>
          </CardTitle>
          <CardDescription>Unable to load cost metrics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const costBreakdown = [
    { name: 'Fuel', cost: costMetrics.fuelCost, color: 'text-success', bgColor: 'bg-success/10' },
    { name: 'Maintenance', cost: costMetrics.maintenanceCost, color: 'text-warning', bgColor: 'bg-warning/10' },
    { name: 'Insurance', cost: costMetrics.insuranceCost, color: 'text-primary', bgColor: 'bg-primary/10' },
    { name: 'Other', cost: costMetrics.otherCosts, color: 'text-muted-foreground', bgColor: 'bg-muted/50' }
  ];

  const targetCostPerVehicle = 1200; // Target monthly cost per vehicle
  const targetCostPerMile = 0.85; // Target cost per mile

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Fuel className="h-5 w-5 text-success" />
          <span>Fuel & Cost Metrics</span>
        </CardTitle>
        <CardDescription>
          Operating cost per vehicle, per client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <DollarSign className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">
              {(costMetrics.totalCost || 0).toLocaleString()} EGP
            </p>
            <p className="text-xs text-muted-foreground">Total Monthly Cost</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Truck className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{costMetrics.totalVehicles}</p>
            <p className="text-xs text-muted-foreground">Total Vehicles</p>
          </div>
        </div>

        {/* Cost Per Vehicle */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getCostColor(costMetrics.costPerVehicle, targetCostPerVehicle)}`} />
            <span className={`text-2xl font-bold ${getCostColor(costMetrics.costPerVehicle, targetCostPerVehicle)}`}>
              {(costMetrics.costPerVehicle || 0).toFixed(0)} EGP
            </span>
            <Badge className={getCostBadge(costMetrics.costPerVehicle, targetCostPerVehicle)}>
              {getCostLevel(costMetrics.costPerVehicle, targetCostPerVehicle)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Cost Per Vehicle (Monthly)</p>
          <div className="mt-3">
            <Progress value={(costMetrics.costPerVehicle / targetCostPerVehicle) * 100} className="h-2" />
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Cost Breakdown</h4>
          <div className="space-y-2">
            {costBreakdown.map((item) => {
              const percentage = (item.cost / costMetrics.totalCost) * 100;
              return (
                <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${item.bgColor}`}>
                      <Fuel className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {(item.cost || 0).toLocaleString()} EGP
                    </p>
                    <div className="w-16 mt-1">
                      <Progress value={percentage} className="h-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <BarChart3 className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-primary">
              {(costMetrics.costPerMile || 0).toFixed(2)} EGP
            </p>
            <p className="text-xs text-muted-foreground">Cost Per Mile</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <Fuel className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-sm font-bold text-warning">
              {(costMetrics.fuelEfficiency || 0).toFixed(1)} MPG
            </p>
            <p className="text-xs text-muted-foreground">Fuel Efficiency</p>
          </div>
        </div>

        {/* Cost Trends */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Cost Trends</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
              <div className="flex items-center space-x-3">
                <Fuel className="h-4 w-4 text-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">Fuel Costs</p>
                  <p className="text-xs text-muted-foreground">Monthly trend</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">+5.2%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
              <div className="flex items-center space-x-3">
                <Truck className="h-4 w-4 text-warning" />
                <div>
                  <p className="text-sm font-medium text-foreground">Maintenance Costs</p>
                  <p className="text-xs text-muted-foreground">Monthly trend</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-success" />
                <span className="text-sm text-success">-2.1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-primary mb-2">💡 Cost Insights</h5>
          <ul className="text-xs text-primary space-y-1">
            <li>• Total monthly fleet cost: {(costMetrics.totalCost || 0).toLocaleString()} EGP</li>
            <li>• Cost per vehicle: {(costMetrics.costPerVehicle || 0).toFixed(0)} EGP (target: {targetCostPerVehicle} EGP)</li>
            <li>• Cost per mile: {(costMetrics.costPerMile || 0).toFixed(2)} EGP (target: {targetCostPerMile} EGP)</li>
            <li>• Fuel efficiency: {(costMetrics.fuelEfficiency || 0).toFixed(1)} MPG</li>
            <li>• Total miles driven: {(costMetrics.totalMiles || 0).toLocaleString()}</li>
            {costMetrics.costPerVehicle > targetCostPerVehicle && (
              <li>• Cost per vehicle above target - consider optimization</li>
            )}
            {costMetrics.fuelCost > costMetrics.totalCost * 0.4 && (
              <li>• High fuel costs - consider route optimization</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default FuelCostMetrics;





