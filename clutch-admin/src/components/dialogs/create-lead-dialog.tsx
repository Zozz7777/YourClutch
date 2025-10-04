"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';
import { toast } from 'sonner';
import { productionApi } from '@/lib/production-api';

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadCreated?: (lead: any) => void;
}

interface LeadFormData {
  title: string;
  type: 'parts_shop' | 'service_center' | 'repair_center' | 'accessories_shop' | 'importer_manufacturer';
  companyName: string;
  businessInfo: {
    address: string;
    taxId: string;
    licenseNumber: string;
    businessRegistration: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'contract_sent' | 'signed' | 'legal_review' | 'approved' | 'activated' | 'lost';
  assignedTo: string;
  value?: number;
  notes?: string;
}

export default function CreateLeadDialog({ 
  open, 
  onOpenChange, 
  onLeadCreated 
}: CreateLeadDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    title: '',
    type: 'parts_shop',
    companyName: '',
    businessInfo: {
      address: '',
      taxId: '',
      licenseNumber: '',
      businessRegistration: '',
    },
    contact: {
      name: '',
      email: '',
      phone: '',
      position: '',
    },
    status: 'new',
    assignedTo: '',
    value: undefined,
    notes: '',
  });

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof LeadFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.companyName || !formData.contact.name || !formData.contact.email || !formData.businessInfo.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Make API call to create the lead
      const response = await productionApi.createLead(formData);
      
      if (response.success) {
        toast.success('Lead created successfully');
        onLeadCreated?.(response.lead);
        onOpenChange(false);
      } else {
        toast.error(response.message || 'Failed to create lead');
      }
      
      // Reset form
      setFormData({
        title: '',
        type: 'parts_shop',
        companyName: '',
        businessInfo: {
          address: '',
          taxId: '',
          licenseNumber: '',
          businessRegistration: '',
        },
        contact: {
          name: '',
          email: '',
          phone: '',
          position: '',
        },
        status: 'new',
        assignedTo: '',
        value: undefined,
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to create lead');
      console.error('Error creating lead:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
          <DialogDescription>
            Add a new lead to your CRM system. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Lead Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter lead title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Partner Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select partner type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parts_shop">Parts Shop</SelectItem>
                  <SelectItem value="service_center">Service Center</SelectItem>
                  <SelectItem value="repair_center">Repair Center</SelectItem>
                  <SelectItem value="accessories_shop">Accessories Shop</SelectItem>
                  <SelectItem value="importer_manufacturer">Importer/Manufacturer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Business Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Business Address *</Label>
                <Input
                  id="address"
                  value={formData.businessInfo.address}
                  onChange={(e) => handleInputChange('businessInfo.address', e.target.value)}
                  placeholder="Enter business address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.businessInfo.taxId}
                  onChange={(e) => handleInputChange('businessInfo.taxId', e.target.value)}
                  placeholder="Enter tax ID"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={formData.businessInfo.licenseNumber}
                  onChange={(e) => handleInputChange('businessInfo.licenseNumber', e.target.value)}
                  placeholder="Enter license number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessRegistration">Business Registration</Label>
                <Input
                  id="businessRegistration"
                  value={formData.businessInfo.businessRegistration}
                  onChange={(e) => handleInputChange('businessInfo.businessRegistration', e.target.value)}
                  placeholder="Enter business registration"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  value={formData.contact.name}
                  onChange={(e) => handleInputChange('contact.name', e.target.value)}
                  placeholder="Enter contact name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleInputChange('contact.email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contact.phone}
                  onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPosition">Position</Label>
                <Input
                  id="contactPosition"
                  value={formData.contact.position}
                  onChange={(e) => handleInputChange('contact.position', e.target.value)}
                  placeholder="Enter position/title"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                  <SelectItem value="contract_sent">Contract Sent</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="legal_review">Legal Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="activated">Activated</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                placeholder="Enter assigned person"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Estimated Value (EGP)</Label>
            <Input
              id="value"
              type="number"
              value={formData.value || ''}
              onChange={(e) => handleInputChange('value', Number(e.target.value) || undefined)}
              placeholder="Enter estimated value"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
