"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Filter, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  MoreHorizontal,
  Scale,
  Plus,
  Edit,
  Trash2,
  FileCheck,
  AlertTriangle,
  Building2,
  User,
  Calendar,
  Star,
  Phone,
  Mail,
  MapPin,
  History,
  Settings
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

// Contract status enum
enum ContractStatus {
  DRAFT = "draft",
  GENERATED = "generated",
  SIGNED = "signed",
  APPROVED = "approved",
  DECLINED = "declined"
}

// Contract type enum
enum ContractType {
  PERSON = "person",
  COMPANY = "company"
}

// Partner type enum
enum PartnerType {
  PARTS_SHOP = "parts_shop",
  SERVICE_CENTER = "service_center",
  REPAIR_CENTER = "repair_center",
  ACCESSORIES_SHOP = "accessories_shop",
  IMPORTER_MANUFACTURER = "importer_manufacturer"
}

interface Contract {
  _id: string;
  leadId: string;
  partnerId?: string;
  partnerType: PartnerType;
  contractType: ContractType;
  status: ContractStatus;
  templateId: string;
  templateKey: string;
  generatedDocxUrl?: string;
  generatedPdfUrl?: string;
  signedPdfUrl?: string;
  notes: Array<{
    content: string;
    createdAt: string;
    createdBy: string;
  }>;
  audit: Array<{
    action: string;
    performedBy: string;
    performedAt: string;
    details?: any;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ContractTemplate {
  _id: string;
  key: string;
  name: string;
  partnerType: PartnerType;
  contractType: ContractType;
  locale: string;
  version: number;
  description: string;
  placeholders: string[];
  s3KeyDocx: string;
  s3UrlDocx: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LegalPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("contracts");
  
  // Contracts state
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [contractSearch, setContractSearch] = useState("");
  const [contractStatusFilter, setContractStatusFilter] = useState("all");
  const [contractTypeFilter, setContractTypeFilter] = useState("all");
  const [partnerTypeFilter, setPartnerTypeFilter] = useState("all");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isContractDetailOpen, setIsContractDetailOpen] = useState(false);
  
  // Templates state
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ContractTemplate[]>([]);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templatePartnerTypeFilter, setTemplatePartnerTypeFilter] = useState("all");
  const [templateContractTypeFilter, setTemplateContractTypeFilter] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [isTemplateDetailOpen, setIsTemplateDetailOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    name: "",
    partnerType: "",
    contractType: "",
    locale: "en",
    description: ""
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadContracts();
    loadTemplates();
  }, []);

  // Filter contracts
  useEffect(() => {
    let filtered = contracts;

    if (contractSearch) {
      filtered = filtered.filter(contract =>
        contract._id.toLowerCase().includes(contractSearch.toLowerCase()) ||
        contract.leadId.toLowerCase().includes(contractSearch.toLowerCase()) ||
        (contract.partnerId && contract.partnerId.toLowerCase().includes(contractSearch.toLowerCase()))
      );
    }

    if (contractStatusFilter !== "all") {
      filtered = filtered.filter(contract => contract.status === contractStatusFilter);
    }

    if (contractTypeFilter !== "all") {
      filtered = filtered.filter(contract => contract.contractType === contractTypeFilter);
    }

    if (partnerTypeFilter !== "all") {
      filtered = filtered.filter(contract => contract.partnerType === partnerTypeFilter);
    }

    setFilteredContracts(filtered);
  }, [contracts, contractSearch, contractStatusFilter, contractTypeFilter, partnerTypeFilter]);

  // Filter templates
  useEffect(() => {
    let filtered = templates;

    if (templateSearch) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        template.key.toLowerCase().includes(templateSearch.toLowerCase())
      );
    }

    if (templatePartnerTypeFilter !== "all") {
      filtered = filtered.filter(template => template.partnerType === templatePartnerTypeFilter);
    }

    if (templateContractTypeFilter !== "all") {
      filtered = filtered.filter(template => template.contractType === templateContractTypeFilter);
    }

    setFilteredTemplates(filtered);
  }, [templates, templateSearch, templatePartnerTypeFilter, templateContractTypeFilter]);

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.request("/api/v1/contracts");
      if (response.success && response.data) {
        setContracts(response.data.contracts || response.data);
      }
    } catch (error) {
      console.error("Error loading contracts:", error);
      toast.error(t('legal.failedToLoadContracts'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.request("/api/v1/contract-templates");
      if (response.success && response.data) {
        setTemplates(response.data.templates || response.data);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error(t('contractTemplates.failedToLoadTemplates'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveContract = async (contractId: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.request(`/api/v1/contracts/${contractId}/approve`, {
        method: "POST",
        body: JSON.stringify({ notes: "Contract approved by legal team" })
      });

      if (response.success) {
        await loadContracts();
        toast.success(t('legal.contractApproved'));
      }
    } catch (error) {
      console.error("Error approving contract:", error);
      toast.error("Failed to approve contract");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineContract = async (contractId: string, reason: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.request(`/api/v1/contracts/${contractId}/decline`, {
        method: "POST",
        body: JSON.stringify({ reason, notes: "Contract declined by legal team" })
      });

      if (response.success) {
        await loadContracts();
        toast.success(t('legal.contractDeclined'));
      }
    } catch (error) {
      console.error("Error declining contract:", error);
      toast.error("Failed to decline contract");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadTemplate = async () => {
    if (!uploadFile || !uploadForm.name || !uploadForm.partnerType || !uploadForm.contractType) {
      toast.error("Please fill all required fields and select a file");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('template', uploadFile);
      formData.append('name', uploadForm.name);
      formData.append('partnerType', uploadForm.partnerType);
      formData.append('contractType', uploadForm.contractType);
      formData.append('locale', uploadForm.locale);
      formData.append('description', uploadForm.description);

      const response = await apiService.request("/api/v1/contract-templates", {
        method: "POST",
        body: formData
      });

      if (response.success) {
        await loadTemplates();
        setIsUploadDialogOpen(false);
        setUploadForm({ name: "", partnerType: "", contractType: "", locale: "en", description: "" });
        setUploadFile(null);
        toast.success(t('contractTemplates.templateUploaded'));
      }
    } catch (error) {
      console.error("Error uploading template:", error);
      toast.error("Failed to upload template");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.APPROVED:
        return "default";
      case ContractStatus.SIGNED:
        return "secondary";
      case ContractStatus.GENERATED:
        return "outline";
      case ContractStatus.DECLINED:
        return "destructive";
      case ContractStatus.DRAFT:
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getTypeColor = (type: PartnerType) => {
    switch (type) {
      case PartnerType.SERVICE_CENTER:
        return "default";
      case PartnerType.PARTS_SHOP:
        return "secondary";
      case PartnerType.REPAIR_CENTER:
        return "outline";
      case PartnerType.ACCESSORIES_SHOP:
        return "info";
      case PartnerType.IMPORTER_MANUFACTURER:
        return "warning";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            {t('legal.title')}
          </h1>
          <p className="text-muted-foreground font-sans">
            {t('legal.description')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('legal.totalContracts')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('legal.pendingReview')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts.filter(c => c.status === ContractStatus.SIGNED).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('legal.approved')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts.filter(c => c.status === ContractStatus.APPROVED).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('legal.declined')}</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts.filter(c => c.status === ContractStatus.DECLINED).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contracts">{t('legal.contracts')}</TabsTrigger>
          <TabsTrigger value="templates">{t('legal.templates')}</TabsTrigger>
        </TabsList>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          {/* Contracts Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={t('legal.searchContracts')}
                      value={contractSearch}
                      onChange={(e) => setContractSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={contractStatusFilter} onValueChange={setContractStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder={t('legal.allStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('legal.allStatus')}</SelectItem>
                      {Object.values(ContractStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`legal.contractStatus.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={contractTypeFilter} onValueChange={setContractTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder={t('legal.allTypes')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('legal.allTypes')}</SelectItem>
                      {Object.values(ContractType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`legal.contractTypes.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={partnerTypeFilter} onValueChange={setPartnerTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Partner Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Partner Types</SelectItem>
                      {Object.values(PartnerType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`partners.partnerTypes.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t('legal.contracts')}</CardTitle>
              <CardDescription>{t('legal.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">{t('legal.loadingContracts')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContracts.map((contract) => (
                    <div
                      key={contract._id}
                      className="flex items-center justify-between p-4 border border-border rounded-[0.625rem] hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedContract(contract);
                        setIsContractDetailOpen(true);
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{contract._id}</p>
                            <p className="text-sm text-muted-foreground">
                              {contract.leadId} • {contract.partnerType}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={getStatusColor(contract.status)}>
                                {t(`legal.contractStatus.${contract.status}`)}
                              </Badge>
                              <Badge variant={getTypeColor(contract.partnerType)}>
                                {t(`partners.partnerTypes.${contract.partnerType}`)}
                              </Badge>
                              <Badge variant="outline">
                                {t(`legal.contractTypes.${contract.contractType}`)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContract(contract);
                            setIsContractDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('legal.view')}
                        </Button>
                        {contract.status === ContractStatus.SIGNED && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveContract(contract._id);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {t('legal.approve')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                const reason = prompt("Enter decline reason:");
                                if (reason) {
                                  handleDeclineContract(contract._id, reason);
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {t('legal.decline')}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredContracts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">{t('legal.noContractsFound')}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Templates Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t('contractTemplates.title')}</h2>
              <p className="text-muted-foreground">{t('contractTemplates.description')}</p>
            </div>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('contractTemplates.uploadTemplate')}
            </Button>
          </div>

          {/* Templates Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search templates..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={templatePartnerTypeFilter} onValueChange={setTemplatePartnerTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Partner Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.values(PartnerType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`contractTemplates.partnerTypes.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={templateContractTypeFilter} onValueChange={setTemplateContractTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Contract Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.values(ContractType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`contractTemplates.contractTypes.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant={template.active ? "default" : "secondary"}>
                      {template.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getTypeColor(template.partnerType)}>
                        {t(`contractTemplates.partnerTypes.${template.partnerType}`)}
                      </Badge>
                      <Badge variant="outline">
                        {t(`contractTemplates.contractTypes.${template.contractType}`)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Version: {template.version}</p>
                      <p>Locale: {template.locale}</p>
                      <p>Placeholders: {template.placeholders.length}</p>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsTemplateDetailOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('contractTemplates.preview')}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        {t('contractTemplates.edit')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('contractTemplates.noTemplatesFound')}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Template Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('contractTemplates.uploadNewTemplate')}</DialogTitle>
            <DialogDescription>
              Upload a new contract template for document generation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="templateName">{t('contractTemplates.templateName')}</Label>
              <Input
                id="templateName"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="Enter template name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnerType">{t('contractTemplates.partnerType')}</Label>
                <Select value={uploadForm.partnerType} onValueChange={(value) => setUploadForm({ ...uploadForm, partnerType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PartnerType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`contractTemplates.partnerTypes.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="contractType">{t('contractTemplates.contractType')}</Label>
                <Select value={uploadForm.contractType} onValueChange={(value) => setUploadForm({ ...uploadForm, contractType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ContractType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`contractTemplates.contractTypes.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="locale">Locale</Label>
              <Select value={uploadForm.locale} onValueChange={(value) => setUploadForm({ ...uploadForm, locale: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Enter template description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="file">{t('contractTemplates.selectFile')}</Label>
              <Input
                id="file"
                type="file"
                accept=".docx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadTemplate} disabled={isLoading}>
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contract Detail Dialog */}
      <Dialog open={isContractDetailOpen} onOpenChange={setIsContractDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('legal.contractDetails')}</DialogTitle>
            <DialogDescription>
              {selectedContract?._id} - {selectedContract?.leadId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedContract && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">{t('legal.overview')}</TabsTrigger>
                <TabsTrigger value="files">{t('legal.files')}</TabsTrigger>
                <TabsTrigger value="audit">{t('legal.audit')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Contract ID</Label>
                    <p className="text-sm text-muted-foreground">{selectedContract._id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Lead ID</Label>
                    <p className="text-sm text-muted-foreground">{selectedContract.leadId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={getStatusColor(selectedContract.status)}>
                      {t(`legal.contractStatus.${selectedContract.status}`)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Contract Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {t(`legal.contractTypes.${selectedContract.contractType}`)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Partner Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {t(`partners.partnerTypes.${selectedContract.partnerType}`)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedContract.createdAt)}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="files" className="space-y-4">
                <div className="space-y-4">
                  {selectedContract.generatedDocxUrl && (
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Generated DOCX</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                  
                  {selectedContract.generatedPdfUrl && (
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Generated PDF</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                  
                  {selectedContract.signedPdfUrl && (
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileCheck className="h-4 w-4" />
                        <span className="text-sm">Signed PDF</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="audit" className="space-y-4">
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Audit Trail</Label>
                  <div className="space-y-2">
                    {selectedContract.audit.map((entry, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{entry.action}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.performedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          By: {entry.performedBy}
                        </p>
                        {entry.details && (
                          <pre className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(entry.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Detail Dialog */}
      <Dialog open={isTemplateDetailOpen} onOpenChange={setIsTemplateDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('contractTemplates.templateDetails')}</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name} - {selectedTemplate?.key}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Version</Label>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.version}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Partner Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {t(`contractTemplates.partnerTypes.${selectedTemplate.partnerType}`)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contract Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {t(`contractTemplates.contractTypes.${selectedTemplate.contractType}`)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Locale</Label>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.locale}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedTemplate.active ? "default" : "secondary"}>
                    {selectedTemplate.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">{t('contractTemplates.detectedPlaceholders')}</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTemplate.placeholders.map((placeholder, index) => (
                    <Badge key={index} variant="outline">
                      {placeholder}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
