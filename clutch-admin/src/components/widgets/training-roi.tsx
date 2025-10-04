"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { useLanguage } from '@/contexts/language-context';
import { 
  Cpu, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Download,
  Eye,
  Target,
  Activity,
  Zap
} from 'lucide-react';

interface TrainingROIProps {
  className?: string;
}

interface TrainingROIData {
  gpuHours: number;
  trainingCost: number;
  businessValue: number;
  roi: number;
  modelsTrained: number;
  accuracyImprovement: number;
  costPerModel: number;
  valuePerModel: number;
}

export function TrainingROI({ className = '' }: TrainingROIProps) {
  const { t } = useLanguage();
  const [roiData, setRoiData] = React.useState<TrainingROIData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadROIData = async () => {
      try {
        // Get training ROI data from API
        const roiData = await productionApi.getTrainingROI();
        
        // Ensure roiData exists and has the expected structure
        if (roiData && typeof roiData === 'object') {
          const { 
            gpuHours = 0, 
            trainingCost = 0, 
            businessValue = 0, 
            roi = 0, 
            modelsTrained = 0, 
            accuracyImprovement = 0, 
            costPerModel = 0, 
            valuePerModel = 0 
          } = roiData;

          setRoiData({
            gpuHours: Number(gpuHours) || 0,
            trainingCost: Number(trainingCost) || 0,
            businessValue: Number(businessValue) || 0,
            roi: Number(roi) || 0,
            modelsTrained: Number(modelsTrained) || 0,
            accuracyImprovement: Number(accuracyImprovement) || 0,
            costPerModel: Number(costPerModel) || 0,
            valuePerModel: Number(valuePerModel) || 0
          });
        } else {
          // Set default values if API returns invalid data
          setRoiData({
            gpuHours: 0,
            trainingCost: 0,
            businessValue: 0,
            roi: 0,
            modelsTrained: 0,
            accuracyImprovement: 0,
            costPerModel: 0,
            valuePerModel: 0
          });
        }
      } catch (error) {
        // Failed to load training ROI data - set default values
        setRoiData({
          gpuHours: 0,
          trainingCost: 0,
          businessValue: 0,
          roi: 0,
          modelsTrained: 0,
          accuracyImprovement: 0,
          costPerModel: 0,
          valuePerModel: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadROIData();
  }, []);

  const getROIColor = (roi: number) => {
    if (roi >= 200) return 'text-success';
    if (roi >= 100) return 'text-warning';
    return 'text-destructive';
  };

  const getROIBadge = (roi: number) => {
    if (roi >= 200) return 'bg-success/10 text-success';
    if (roi >= 100) return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  const getROILevel = (roi: number) => {
    if (roi >= 200) return 'Excellent';
    if (roi >= 100) return 'Good';
    if (roi >= 50) return 'Fair';
    return 'Poor';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 20) return 'text-success';
    if (accuracy >= 10) return 'text-warning';
    return 'text-destructive';
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 20) return 'bg-success/10 text-success';
    if (accuracy >= 10) return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy >= 20) return 'High';
    if (accuracy >= 10) return 'Medium';
    return 'Low';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-primary" />
            <span>Training Cost vs ROI</span>
          </CardTitle>
          <CardDescription>Loading training ROI data...</CardDescription>
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

  if (!roiData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-primary" />
            <span>Training Cost vs ROI</span>
          </CardTitle>
          <CardDescription>Unable to load training ROI data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cpu className="h-5 w-5 text-primary" />
          <span>Training Cost vs ROI</span>
        </CardTitle>
        <CardDescription>
          GPU hours vs business value delivered
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Cpu className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{(roiData.gpuHours || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">GPU Hours</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Target className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{roiData.modelsTrained}</p>
            <p className="text-xs text-muted-foreground">Models Trained</p>
          </div>
        </div>

        {/* ROI Display */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <TrendingUp className={`h-6 w-6 ${getROIColor(roiData.roi || 0)}`} />
            <span className={`text-2xl font-bold ${getROIColor(roiData.roi || 0)}`}>
              {(roiData.roi || 0).toFixed(0)}%
            </span>
            <Badge className={getROIBadge(roiData.roi || 0)}>
              {getROILevel(roiData.roi || 0)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Return on Investment</p>
          <div className="mt-3">
            <Progress value={Math.min((roiData.roi || 0) / 3, 100)} className="h-2" />
          </div>
        </div>

        {/* Cost vs Value Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Cost vs Value</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-foreground">Training Cost</p>
                  <p className="text-xs text-muted-foreground">GPU compute costs</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  ${(roiData.trainingCost || 0).toLocaleString()}
                </p>
                <Badge variant="outline" className="text-xs">
                  ${(roiData.costPerModel || 0).toFixed(0)}/model
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-4 w-4 text-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">Business Value</p>
                  <p className="text-xs text-muted-foreground">Value delivered</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  ${(roiData.businessValue || 0).toLocaleString()}
                </p>
                <Badge variant="outline" className="text-xs">
                  ${(roiData.valuePerModel || 0).toFixed(0)}/model
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Model Performance */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Model Performance</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
              <div className="flex items-center space-x-3">
                <Zap className="h-4 w-4 text-warning" />
                <div>
                  <p className="text-sm font-medium text-foreground">Accuracy Improvement</p>
                  <p className="text-xs text-muted-foreground">Average across models</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${getAccuracyColor(roiData.accuracyImprovement)}`}>
                  +{roiData.accuracyImprovement.toFixed(1)}%
                </p>
                <Badge className={getAccuracyBadge(roiData.accuracyImprovement)}>
                  {getAccuracyLevel(roiData.accuracyImprovement)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <BarChart3 className="h-4 w-4 text-success mx-auto mb-1" />
            <p className="text-sm font-bold text-success">
              ${(roiData.businessValue / roiData.gpuHours).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Value Per GPU Hour</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <Activity className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-sm font-bold text-warning">
              {(roiData.gpuHours / roiData.modelsTrained).toFixed(0)}h
            </p>
            <p className="text-xs text-muted-foreground">Hours Per Model</p>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Cost Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>GPU Compute</span>
              <span>{(roiData.trainingCost || 0).toLocaleString()} EGP</span>
            </div>
            <Progress value={100} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>Data Storage</span>
              <span>500 EGP</span>
            </div>
            <Progress value={20} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>Model Deployment</span>
              <span>300 EGP</span>
            </div>
            <Progress value={12} className="h-2" />
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
          <h5 className="text-sm font-medium text-primary mb-2">💡 Training ROI Insights</h5>
          <ul className="text-xs text-primary space-y-1">
            <li>• Total ROI: {(roiData.roi || 0).toFixed(0)}%</li>
            <li>• Training cost: ${(roiData.trainingCost || 0).toLocaleString()}</li>
            <li>• Business value: ${(roiData.businessValue || 0).toLocaleString()}</li>
            <li>• {roiData.modelsTrained || 0} models trained with {(roiData.gpuHours || 0).toLocaleString()} GPU hours</li>
            <li>• Average accuracy improvement: +{(roiData.accuracyImprovement || 0).toFixed(1)}%</li>
            <li>• Cost per model: ${(roiData.costPerModel || 0).toFixed(0)}</li>
            <li>• Value per model: ${(roiData.valuePerModel || 0).toFixed(0)}</li>
            {(roiData.roi || 0) >= 200 && (
              <li>• Excellent ROI - training investments are highly profitable</li>
            )}
            {(roiData.roi || 0) < 100 && (
              <li>• ROI below target - consider optimizing training efficiency</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default TrainingROI;





