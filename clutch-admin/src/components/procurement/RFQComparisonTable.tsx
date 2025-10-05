"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3
} from "lucide-react";

interface QuoteItem {
  rfqItemId: string;
  quotedUnitPrice: number;
  quotedTotalPrice: number;
  deliveryTime: number;
  notes: string;
}

interface SupplierQuote {
  supplierId: string;
  supplierName: string;
  items: QuoteItem[];
  totalQuoteAmount: number;
  currency: string;
  paymentTerms: string;
  deliveryTime: number;
  quoteDate: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }>;
  notes: string;
}

interface EvaluationResult {
  supplierId: string;
  supplierName: string;
  scores: {
    [key: string]: {
      score: number;
      weight: number;
      weightedScore: number;
    };
  };
  totalScore: number;
  rank: number;
}

interface RFQComparisonTableProps {
  rfqId: string;
  rfqItems: Array<{
    _id: string;
    itemName: string;
    description: string;
    quantity: number;
    unitOfMeasure: string;
    specifications: string;
  }>;
  supplierQuotes: SupplierQuote[];
  evaluations?: EvaluationResult[];
  onSelectQuote: (supplierId: string) => void;
  onAwardRFQ: (supplierId: string) => void;
  selectedSupplierId?: string;
  canAward: boolean;
}

export default function RFQComparisonTable({
  rfqId,
  rfqItems,
  supplierQuotes,
  evaluations = [],
  onSelectQuote,
  onAwardRFQ,
  selectedSupplierId,
  canAward
}: RFQComparisonTableProps) {
  const [sortBy, setSortBy] = useState<'price' | 'score' | 'delivery'>('score');
  const [showOnlySubmitted, setShowOnlySubmitted] = useState(true);

  const formatCurrency = (amount: number, currency: string = 'EGP') => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="secondary">Submitted</Badge>;
      case 'under_review':
        return <Badge variant="warning">Under Review</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Award className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Award className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-orange-500" />;
      default:
        return <span className="text-sm font-medium">#{rank}</span>;
    }
  };

  const getEvaluationForSupplier = (supplierId: string) => {
    return evaluations.find(eval => eval.supplierId === supplierId);
  };

  const sortedQuotes = [...supplierQuotes].sort((a, b) => {
    if (showOnlySubmitted && a.status !== 'submitted') return 1;
    if (showOnlySubmitted && b.status !== 'submitted') return -1;

    switch (sortBy) {
      case 'price':
        return a.totalQuoteAmount - b.totalQuoteAmount;
      case 'delivery':
        return a.deliveryTime - b.deliveryTime;
      case 'score':
        const evalA = getEvaluationForSupplier(a.supplierId);
        const evalB = getEvaluationForSupplier(b.supplierId);
        return (evalB?.totalScore || 0) - (evalA?.totalScore || 0);
      default:
        return 0;
    }
  });

  const getBestPrice = () => {
    const submittedQuotes = supplierQuotes.filter(q => q.status === 'submitted');
    if (submittedQuotes.length === 0) return 0;
    return Math.min(...submittedQuotes.map(q => q.totalQuoteAmount));
  };

  const getBestDelivery = () => {
    const submittedQuotes = supplierQuotes.filter(q => q.status === 'submitted');
    if (submittedQuotes.length === 0) return 0;
    return Math.min(...submittedQuotes.map(q => q.deliveryTime));
  };

  const bestPrice = getBestPrice();
  const bestDelivery = getBestDelivery();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Quote Comparison</span>
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-submitted"
                checked={showOnlySubmitted}
                onCheckedChange={(checked) => setShowOnlySubmitted(checked as boolean)}
              />
              <label htmlFor="show-submitted" className="text-sm">
                Show only submitted quotes
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'score' | 'delivery')}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="score">Score</option>
                <option value="price">Price</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Price</TableHead>
                <TableHead className="text-right">Delivery (Days)</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Payment Terms</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedQuotes.map((quote, index) => {
                const evaluation = getEvaluationForSupplier(quote.supplierId);
                const isBestPrice = quote.totalQuoteAmount === bestPrice;
                const isBestDelivery = quote.deliveryTime === bestDelivery;
                const isSelected = selectedSupplierId === quote.supplierId;

                return (
                  <TableRow 
                    key={quote.supplierId}
                    className={isSelected ? 'bg-blue-50' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {evaluation && getRankIcon(evaluation.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quote.supplierName}</div>
                        <div className="text-sm text-muted-foreground">
                          Quote Date: {new Date(quote.quoteDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(quote.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <span className={isBestPrice ? 'font-bold text-green-600' : ''}>
                          {formatCurrency(quote.totalQuoteAmount, quote.currency)}
                        </span>
                        {isBestPrice && <Star className="h-4 w-4 text-green-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <span className={isBestDelivery ? 'font-bold text-green-600' : ''}>
                          {quote.deliveryTime}
                        </span>
                        {isBestDelivery && <Truck className="h-4 w-4 text-green-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {evaluation ? (
                        <div className="flex items-center justify-end space-x-2">
                          <span className={`font-medium ${getScoreColor(evaluation.totalScore)}`}>
                            {evaluation.totalScore}
                          </span>
                          <Progress value={evaluation.totalScore} className="w-16 h-2" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not evaluated</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm">{quote.paymentTerms}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectQuote(quote.supplierId)}
                        >
                          {isSelected ? <CheckCircle className="h-4 w-4" /> : 'Select'}
                        </Button>
                        {canAward && isSelected && (
                          <Button
                            onClick={() => onAwardRFQ(quote.supplierId)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Award className="h-4 w-4 mr-1" />
                            Award
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {evaluations.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Evaluation Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evaluations.slice(0, 3).map((evaluation) => (
                <Card key={evaluation.supplierId} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{evaluation.supplierName}</span>
                      <div className="flex items-center space-x-1">
                        {getRankIcon(evaluation.rank)}
                        <span className="text-sm font-medium">#{evaluation.rank}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {evaluation.totalScore}
                    </div>
                    <div className="space-y-1">
                      {Object.entries(evaluation.scores).map(([criterion, score]) => (
                        <div key={criterion} className="flex justify-between text-sm">
                          <span className="capitalize">{criterion.toLowerCase()}</span>
                          <span className="font-medium">{score.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {supplierQuotes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>No quotes received yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
