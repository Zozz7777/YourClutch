"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Upload,
  DollarSign,
  Calendar,
  User,
  Building,
  FolderOpen,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface RequestItem {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  estimatedUnitPrice: number;
  estimatedTotalPrice: number;
  category: string;
  specifications: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  expectedDeliveryDate: string;
  notes: string;
}

interface ProcurementRequestFormProps {
  initialData?: {
    requestNumber?: string;
    title?: string;
    description?: string;
    department?: string;
    project?: string;
    requestedBy?: string;
    items?: RequestItem[];
    totalAmount?: number;
    priority?: string;
    notes?: string;
  };
  onSubmit: (data: any) => void;
  onSave: (data: any) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
  loading?: boolean;
}

export default function ProcurementRequestForm({
  initialData,
  onSubmit,
  onSave,
  onCancel,
  mode,
  loading = false
}: ProcurementRequestFormProps) {
  const [formData, setFormData] = useState({
    requestNumber: initialData?.requestNumber || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    department: initialData?.department || '',
    project: initialData?.project || '',
    requestedBy: initialData?.requestedBy || '',
    items: initialData?.items || [],
    totalAmount: initialData?.totalAmount || 0,
    priority: initialData?.priority || 'medium',
    notes: initialData?.notes || ''
  });

  const [newItem, setNewItem] = useState<Partial<RequestItem>>({
    itemName: '',
    description: '',
    quantity: 1,
    unitOfMeasure: 'unit',
    estimatedUnitPrice: 0,
    estimatedTotalPrice: 0,
    category: '',
    specifications: '',
    urgency: 'medium',
    expectedDeliveryDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const departments = [
    'IT', 'Finance', 'HR', 'Operations', 'Marketing', 'Sales', 'Procurement'
  ];

  const categories = [
    'Office Supplies', 'IT Equipment', 'Furniture', 'Software', 'Services', 
    'Maintenance', 'Raw Materials', 'Professional Services'
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const unitMeasures = [
    'unit', 'piece', 'kg', 'liter', 'meter', 'hour', 'day', 'month', 'year'
  ];

  useEffect(() => {
    calculateTotalAmount();
  }, [formData.items]);

  const calculateTotalAmount = () => {
    const total = formData.items.reduce((sum, item) => sum + item.estimatedTotalPrice, 0);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  };

  const addItem = () => {
    if (!newItem.itemName || !newItem.quantity || !newItem.estimatedUnitPrice) {
      setErrors({ ...errors, newItem: 'Please fill in all required fields' });
      return;
    }

    const item: RequestItem = {
      id: Date.now().toString(),
      itemName: newItem.itemName!,
      description: newItem.description || '',
      quantity: newItem.quantity!,
      unitOfMeasure: newItem.unitOfMeasure || 'unit',
      estimatedUnitPrice: newItem.estimatedUnitPrice!,
      estimatedTotalPrice: newItem.quantity! * newItem.estimatedUnitPrice!,
      category: newItem.category || '',
      specifications: newItem.specifications || '',
      urgency: newItem.urgency || 'medium',
      expectedDeliveryDate: newItem.expectedDeliveryDate || '',
      notes: newItem.notes || ''
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({
      itemName: '',
      description: '',
      quantity: 1,
      unitOfMeasure: 'unit',
      estimatedUnitPrice: 0,
      estimatedTotalPrice: 0,
      category: '',
      specifications: '',
      urgency: 'medium',
      expectedDeliveryDate: '',
      notes: ''
    });

    setErrors({ ...errors, newItem: '' });
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (itemId: string, field: keyof RequestItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'estimatedUnitPrice') {
            updatedItem.estimatedTotalPrice = updatedItem.quantity * updatedItem.estimatedUnitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.requestedBy) newErrors.requestedBy = 'Requested by is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    const level = urgencyLevels.find(l => l.value === urgency);
    return level?.color || 'text-gray-600';
  };

  const getUrgencyLabel = (urgency: string) => {
    const level = urgencyLevels.find(l => l.value === urgency);
    return level?.label || urgency;
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>
              {mode === 'create' ? 'Create Procurement Request' : 
               mode === 'edit' ? 'Edit Procurement Request' : 
               'View Procurement Request'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter request title"
                disabled={isReadOnly}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="requestNumber">Request Number</Label>
              <Input
                id="requestNumber"
                value={formData.requestNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, requestNumber: e.target.value }))}
                placeholder="Auto-generated"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                disabled={isReadOnly}
              >
                <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
            </div>

            <div>
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                value={formData.project}
                onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                placeholder="Enter project name"
                disabled={isReadOnly}
              />
            </div>

            <div>
              <Label htmlFor="requestedBy">Requested By *</Label>
              <Input
                id="requestedBy"
                value={formData.requestedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
                placeholder="Enter requester name"
                disabled={isReadOnly}
                className={errors.requestedBy ? 'border-red-500' : ''}
              />
              {errors.requestedBy && <p className="text-sm text-red-500 mt-1">{errors.requestedBy}</p>}
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter request description"
              disabled={isReadOnly}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Request Items</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Total: {formData.items.length} items
              </span>
              <Badge variant="outline">
                {formData.totalAmount.toLocaleString()} EGP
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errors.items && <p className="text-sm text-red-500 mb-4">{errors.items}</p>}
          
          {/* Add New Item */}
          {!isReadOnly && (
            <Card className="mb-4 border-dashed">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="itemName">Item Name *</Label>
                    <Input
                      id="itemName"
                      value={newItem.itemName || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, itemName: e.target.value }))}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newItem.quantity || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Unit Price *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      value={newItem.estimatedUnitPrice || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, estimatedUnitPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="Enter unit price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newItem.category || ''}
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select
                      value={newItem.urgency || 'medium'}
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, urgency: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate">Expected Delivery</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={newItem.expectedDeliveryDate || ''}
                      onChange={(e) => setNewItem(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="itemDescription">Description</Label>
                  <Textarea
                    id="itemDescription"
                    value={newItem.description || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter item description"
                    rows={2}
                  />
                </div>

                {errors.newItem && <p className="text-sm text-red-500 mt-2">{errors.newItem}</p>}

                <div className="flex justify-end mt-4">
                  <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items List */}
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.itemName}</span>
                        <Badge variant="outline" className={getUrgencyColor(item.urgency)}>
                          {getUrgencyLabel(item.urgency)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.quantity} {item.unitOfMeasure} × {item.estimatedUnitPrice.toLocaleString()} EGP = {item.estimatedTotalPrice.toLocaleString()} EGP
                      </div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {!isReadOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Enter any additional notes or requirements"
            disabled={isReadOnly}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      {!isReadOnly && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            Submit Request
          </Button>
        </div>
      )}
    </div>
  );
}
