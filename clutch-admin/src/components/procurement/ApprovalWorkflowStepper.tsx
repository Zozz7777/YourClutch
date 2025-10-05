"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  User, 
  Mail, 
  Calendar,
  AlertCircle,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { format, parseISO } from 'date-fns';

interface ApprovalStep {
  step: number;
  approverId: string;
  approverName: string;
  approverEmail: string;
  role: string;
  roleName: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  isRequired: boolean;
  canDelegate: boolean;
  maxDelegationLevel: number;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  comments: string;
  approvalDate: string | null;
  delegatedTo: string | null;
  delegationReason: string | null;
}

interface ApprovalWorkflowStepperProps {
  requestId: string;
  approvalChain: ApprovalStep[];
  currentStep: number;
  status: string;
  onApprove: (stepIndex: number, comments: string) => void;
  onReject: (stepIndex: number, comments: string) => void;
  onDelegate: (stepIndex: number, delegateId: string, reason: string) => void;
  canTakeAction: boolean;
  userRole: string;
}

export default function ApprovalWorkflowStepper({
  requestId,
  approvalChain,
  currentStep,
  status,
  onApprove,
  onReject,
  onDelegate,
  canTakeAction,
  userRole
}: ApprovalWorkflowStepperProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [actionComments, setActionComments] = useState<{ [key: number]: string }>({});
  const [delegationData, setDelegationData] = useState<{ [key: number]: { delegateId: string; reason: string } }>({});

  const toggleStepExpansion = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusIcon = (step: ApprovalStep, index: number) => {
    if (step.status === 'approved') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (step.status === 'rejected') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (index === currentStep) {
      return <Clock className="h-5 w-5 text-blue-500" />;
    }
    if (index < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getStatusBadge = (step: ApprovalStep, index: number) => {
    if (step.status === 'approved') {
      return <Badge variant="success">Approved</Badge>;
    }
    if (step.status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (index === currentStep) {
      return <Badge variant="warning">Pending</Badge>;
    }
    if (index < currentStep) {
      return <Badge variant="success">Approved</Badge>;
    }
    return <Badge variant="secondary">Waiting</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const canTakeActionOnStep = (step: ApprovalStep, index: number) => {
    return canTakeAction && 
           index === currentStep && 
           step.status === 'pending' &&
           (step.approverId === userRole || step.canDelegate);
  };

  const handleAction = (action: 'approve' | 'reject' | 'delegate', stepIndex: number) => {
    const comments = actionComments[stepIndex] || '';
    
    switch (action) {
      case 'approve':
        onApprove(stepIndex, comments);
        break;
      case 'reject':
        onReject(stepIndex, comments);
        break;
      case 'delegate':
        const delegation = delegationData[stepIndex];
        if (delegation) {
          onDelegate(stepIndex, delegation.delegateId, delegation.reason);
        }
        break;
    }
  };

  const progressPercentage = approvalChain.length > 0 ? (currentStep / approvalChain.length) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Approval Workflow</span>
          <div className="flex items-center space-x-2">
            <Progress value={progressPercentage} className="w-32" />
            <span className="text-sm text-muted-foreground">
              {currentStep} of {approvalChain.length} steps
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvalChain.map((step, index) => (
            <Card key={step.step} className={`${index === currentStep ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(step, index)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Step {step.step}</span>
                        {getStatusBadge(step, index)}
                        {step.isRequired && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {step.roleName} • {step.department}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">{step.approverName}</div>
                      <div className="text-xs text-muted-foreground">{step.approverEmail}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStepExpansion(index)}
                    >
                      {expandedSteps.has(index) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {expandedSteps.has(index) && (
                  <div className="mt-4 space-y-4">
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Due Date</Label>
                        <div className={`flex items-center space-x-1 ${isOverdue(step.dueDate) ? 'text-red-600' : ''}`}>
                          <Calendar className="h-4 w-4" />
                          <span>{format(parseISO(step.dueDate), 'PPP')}</span>
                          {isOverdue(step.dueDate) && <AlertCircle className="h-4 w-4" />}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Priority</Label>
                        <div className={`font-medium ${getPriorityColor(step.priority)}`}>
                          {step.priority.charAt(0).toUpperCase() + step.priority.slice(1)}
                        </div>
                      </div>
                    </div>

                    {step.comments && (
                      <div>
                        <Label className="text-muted-foreground">Comments</Label>
                        <div className="mt-1 p-2 bg-muted rounded-md text-sm">
                          {step.comments}
                        </div>
                      </div>
                    )}

                    {step.approvalDate && (
                      <div>
                        <Label className="text-muted-foreground">Approval Date</Label>
                        <div className="text-sm">
                          {format(parseISO(step.approvalDate), 'PPP p')}
                        </div>
                      </div>
                    )}

                    {step.delegatedTo && (
                      <div>
                        <Label className="text-muted-foreground">Delegated To</Label>
                        <div className="text-sm">
                          {step.delegatedTo} - {step.delegationReason}
                        </div>
                      </div>
                    )}

                    {canTakeActionOnStep(step, index) && (
                      <div className="space-y-4">
                        <Separator />
                        
                        <div>
                          <Label htmlFor={`comments-${index}`}>Comments</Label>
                          <Textarea
                            id={`comments-${index}`}
                            placeholder="Add your comments..."
                            value={actionComments[index] || ''}
                            onChange={(e) => setActionComments(prev => ({ ...prev, [index]: e.target.value }))}
                            className="mt-1"
                          />
                        </div>

                        {step.canDelegate && (
                          <div className="space-y-2">
                            <Label>Delegate To</Label>
                            <Select
                              value={delegationData[index]?.delegateId || ''}
                              onValueChange={(value) => setDelegationData(prev => ({
                                ...prev,
                                [index]: { ...prev[index], delegateId: value }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select delegate" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="delegate1">John Smith (Manager)</SelectItem>
                                <SelectItem value="delegate2">Jane Doe (Supervisor)</SelectItem>
                              </SelectContent>
                            </Select>
                            <Textarea
                              placeholder="Delegation reason..."
                              value={delegationData[index]?.reason || ''}
                              onChange={(e) => setDelegationData(prev => ({
                                ...prev,
                                [index]: { ...prev[index], reason: e.target.value }
                              }))}
                            />
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleAction('approve', index)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleAction('reject', index)}
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          {step.canDelegate && (
                            <Button
                              onClick={() => handleAction('delegate', index)}
                              variant="outline"
                            >
                              Delegate
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
