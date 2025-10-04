"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, FileText, Users, Building2, MapPin, Phone, Mail, Calendar, AlertCircle } from "lucide-react";
import { apiService } from "@/lib/api";

// Lead status enum
enum LeadStatus {
  NEW = "new",
  CONTACTED = "contacted",
  QUALIFIED = "qualified",
  PROPOSAL_SENT = "proposal_sent",
  CONTRACT_GENERATED = "contract_generated",
  CONTRACT_SIGNED = "contract_signed",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed"
}

// Partner type enum
enum PartnerType {
  PARTS_SHOP = "parts_shop",
  SERVICE_CENTER = "service_center",
  REPAIR_CENTER = "repair_center",
  ACCESSORIES_SHOP = "accessories_shop",
  IMPORTER_MANUFACTURER = "importer_manufacturer"
}

interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  partnerType: PartnerType;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  contractGenerated: boolean;
  contractSigned: boolean;
  contractApproved: boolean;
  partnerId?: string;
}

export default function SalesPage() {
  const { t } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for creating/editing leads
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    partnerType: "",
    notes: ""
  });

  // Load leads on component mount
  useEffect(() => {
    loadLeads();
  }, []);

  // Filter leads based on search and status
  useEffect(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        (lead.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter]);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.request("/api/v1/sales/leads");
      if (response.success && response.data) {
        setLeads(response.data);
      }
    } catch (error) {
      console.error("Error loading leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.request("/api/v1/sales/leads", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          status: LeadStatus.NEW
        })
      });

      if (response.success) {
        await loadLeads();
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error creating lead:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      setIsLoading(true);
      const response = await apiService.request(`/api/v1/sales/leads/${leadId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });

      if (response.success) {
        await loadLeads();
      }
    } catch (error) {
      console.error("Error updating lead status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContract = async (leadId: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.request(`/api/v1/sales/leads/${leadId}/contract`, {
        method: "POST"
      });

      if (response.success) {
        // Download the contract
        const blob = new Blob([response.data.contract], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-${leadId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        await loadLeads();
      }
    } catch (error) {
      console.error("Error generating contract:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadContract = async (leadId: string, file: File) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('contract', file);

      const response = await apiService.request(`/api/v1/sales/leads/${leadId}/contract/upload`, {
        method: "POST",
        body: formData
      });

      if (response.success) {
        await loadLeads();
      }
    } catch (error) {
      console.error("Error uploading contract:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      partnerType: "",
      notes: ""
    });
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW:
        return "bg-blue-100 text-blue-800";
      case LeadStatus.CONTACTED:
        return "bg-yellow-100 text-yellow-800";
      case LeadStatus.QUALIFIED:
        return "bg-green-100 text-green-800";
      case LeadStatus.PROPOSAL_SENT:
        return "bg-purple-100 text-purple-800";
      case LeadStatus.CONTRACT_GENERATED:
        return "bg-indigo-100 text-indigo-800";
      case LeadStatus.CONTRACT_SIGNED:
        return "bg-orange-100 text-orange-800";
      case LeadStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case LeadStatus.REJECTED:
        return "bg-red-100 text-red-800";
      case LeadStatus.COMPLETED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW:
        return <Clock className="h-4 w-4" />;
      case LeadStatus.CONTACTED:
        return <Phone className="h-4 w-4" />;
      case LeadStatus.QUALIFIED:
        return <CheckCircle className="h-4 w-4" />;
      case LeadStatus.PROPOSAL_SENT:
        return <FileText className="h-4 w-4" />;
      case LeadStatus.CONTRACT_GENERATED:
        return <Download className="h-4 w-4" />;
      case LeadStatus.CONTRACT_SIGNED:
        return <Upload className="h-4 w-4" />;
      case LeadStatus.APPROVED:
        return <CheckCircle className="h-4 w-4" />;
      case LeadStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
      case LeadStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPartnerTypeLabel = (type: PartnerType) => {
    switch (type) {
      case PartnerType.PARTS_SHOP:
        return "Parts Shop";
      case PartnerType.SERVICE_CENTER:
        return "Service Center";
      case PartnerType.REPAIR_CENTER:
        return "Repair Center";
      case PartnerType.ACCESSORIES_SHOP:
        return "Accessories Shop";
      case PartnerType.IMPORTER_MANUFACTURER:
        return "Importer/Manufacturer";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            {t('sales.title') || 'Sales Management'}
          </h1>
          <p className="text-muted-foreground font-sans">
            {t('sales.subtitle') || 'Manage leads, track partnerships, and oversee the sales pipeline'}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              {t('sales.createLead') || 'Create Lead'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('sales.createLead') || 'Create New Lead'}</DialogTitle>
              <DialogDescription>
                {t('sales.createLeadDesc') || 'Add a new partner lead to the sales pipeline'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">{t('sales.companyName') || 'Company Name'}</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">{t('sales.contactPerson') || 'Contact Person'}</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Enter contact person name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">{t('sales.email') || 'Email'}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t('sales.phone') || 'Phone'}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">{t('sales.address') || 'Address'}</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">{t('sales.city') || 'City'}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="partnerType">{t('sales.partnerType') || 'Partner Type'}</Label>
                <Select value={formData.partnerType} onValueChange={(value) => setFormData({ ...formData, partnerType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PartnerType.PARTS_SHOP}>Parts Shop</SelectItem>
                    <SelectItem value={PartnerType.SERVICE_CENTER}>Service Center</SelectItem>
                    <SelectItem value={PartnerType.REPAIR_CENTER}>Repair Center</SelectItem>
                    <SelectItem value={PartnerType.ACCESSORIES_SHOP}>Accessories Shop</SelectItem>
                    <SelectItem value={PartnerType.IMPORTER_MANUFACTURER}>Importer/Manufacturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">{t('sales.notes') || 'Notes'}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter any additional notes"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t('common.cancel') || 'Cancel'}
                </Button>
                <Button onClick={handleCreateLead} disabled={isLoading}>
                  {isLoading ? 'Creating...' : (t('sales.createLead') || 'Create Lead')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('sales.searchLeads') || 'Search leads...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={LeadStatus.NEW}>New</SelectItem>
                  <SelectItem value={LeadStatus.CONTACTED}>Contacted</SelectItem>
                  <SelectItem value={LeadStatus.QUALIFIED}>Qualified</SelectItem>
                  <SelectItem value={LeadStatus.PROPOSAL_SENT}>Proposal Sent</SelectItem>
                  <SelectItem value={LeadStatus.CONTRACT_GENERATED}>Contract Generated</SelectItem>
                  <SelectItem value={LeadStatus.CONTRACT_SIGNED}>Contract Signed</SelectItem>
                  <SelectItem value={LeadStatus.APPROVED}>Approved</SelectItem>
                  <SelectItem value={LeadStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={LeadStatus.COMPLETED}>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="grid gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{lead.companyName}</h3>
                    <Badge className={getStatusColor(lead.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(lead.status)}
                        {lead.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{lead.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{getPartnerTypeLabel(lead.partnerType)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{lead.address}, {lead.city}</span>
                  </div>
                  {lead.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">{lead.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {/* Status Actions */}
                  {lead.status === LeadStatus.NEW && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateLeadStatus(lead.id, LeadStatus.CONTACTED)}
                      disabled={isLoading}
                    >
                      Mark as Contacted
                    </Button>
                  )}
                  {lead.status === LeadStatus.CONTACTED && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateLeadStatus(lead.id, LeadStatus.QUALIFIED)}
                      disabled={isLoading}
                    >
                      Mark as Qualified
                    </Button>
                  )}
                  {lead.status === LeadStatus.QUALIFIED && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateLeadStatus(lead.id, LeadStatus.PROPOSAL_SENT)}
                      disabled={isLoading}
                    >
                      Send Proposal
                    </Button>
                  )}
                  {lead.status === LeadStatus.PROPOSAL_SENT && (
                    <Button
                      size="sm"
                      onClick={() => handleGenerateContract(lead.id)}
                      disabled={isLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Contract
                    </Button>
                  )}
                  {lead.status === LeadStatus.CONTRACT_GENERATED && (
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUploadContract(lead.id, file);
                          }
                        }}
                        className="hidden"
                        id={`upload-${lead.id}`}
                      />
                      <Button
                        size="sm"
                        onClick={() => document.getElementById(`upload-${lead.id}`)?.click()}
                        disabled={isLoading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Contract
                      </Button>
                    </div>
                  )}
                  {lead.status === LeadStatus.CONTRACT_SIGNED && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateLeadStatus(lead.id, LeadStatus.APPROVED)}
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateLeadStatus(lead.id, LeadStatus.REJECTED)}
                        disabled={isLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {lead.status === LeadStatus.APPROVED && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateLeadStatus(lead.id, LeadStatus.COMPLETED)}
                      disabled={isLoading}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leads found</h3>
              <p>Create your first lead to get started with the sales pipeline.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
