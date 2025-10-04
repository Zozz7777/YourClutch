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
import { 
  Search, 
  Filter, 
  Users, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  MoreHorizontal,
  Eye,
  Shield,
  ShieldOff,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Building2,
  UserCog,
  DollarSign,
  Activity,
  MessageSquare,
  History
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

// Partner status enum
enum PartnerStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended"
}

// Partner type enum
enum PartnerType {
  PARTS_SHOP = "parts_shop",
  SERVICE_CENTER = "service_center",
  REPAIR_CENTER = "repair_center",
  ACCESSORIES_SHOP = "accessories_shop",
  IMPORTER_MANUFACTURER = "importer_manufacturer"
}

interface Partner {
  _id: string;
  partnerId: string;
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  addresses: Array<{
    line1: string;
    city: string;
    country: string;
  }>;
  apps: {
    mobile: {
      active: boolean;
      lastLoginAt?: string;
    };
    api?: {
      keyLastRotatedAt?: string;
    };
  };
  rating: {
    average: number;
    count: number;
    lastUpdatedAt: string;
  };
  notes: Array<{
    content: string;
    createdAt: string;
    createdBy: string;
  }>;
  audit: Array<{
    action: string;
    performedBy: string;
    performedAt: string;
    from?: string;
    to?: string;
    reason?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function PartnersPage() {
  const { t } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [minRating, setMinRating] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Load partners on component mount
  useEffect(() => {
    loadPartners();
  }, []);

  // Filter partners based on search and filters
  useEffect(() => {
    let filtered = partners;

    if (searchTerm) {
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.partnerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.primaryContact.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(partner => partner.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(partner => partner.status === statusFilter);
    }

    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      if (!isNaN(minRatingNum)) {
        filtered = filtered.filter(partner => partner.rating.average >= minRatingNum);
      }
    }

    setFilteredPartners(filtered);
  }, [partners, searchTerm, typeFilter, statusFilter, minRating]);

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.request("/api/v1/partners");
      if (response.success && response.data) {
        setPartners(response.data.partners || response.data);
      }
    } catch (error) {
      console.error("Error loading partners:", error);
      toast.error(t('partners.failedToLoadPartners'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (partnerId: string, newStatus: PartnerStatus) => {
    try {
      setIsLoading(true);
      const response = await apiService.request(`/api/v1/partners/${partnerId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ 
          status: newStatus,
          reason: `Status changed to ${newStatus}`
        })
      });

      if (response.success) {
        await loadPartners();
        toast.success(
          newStatus === PartnerStatus.ACTIVE 
            ? t('partners.partnerActivated')
            : t('partners.partnerSuspended')
        );
      }
    } catch (error) {
      console.error("Error updating partner status:", error);
      toast.error("Failed to update partner status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAccess = async (partnerId: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.request(`/api/v1/partners/${partnerId}/reset-access`, {
        method: "POST",
        body: JSON.stringify({ 
          reason: "Access reset by admin"
        })
      });

      if (response.success) {
        await loadPartners();
        toast.success(t('partners.accessReset'));
      }
    } catch (error) {
      console.error("Error resetting partner access:", error);
      toast.error("Failed to reset partner access");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculateRating = async (partnerId: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.request(`/api/v1/partners/${partnerId}/rating/recalculate`, {
        method: "POST"
      });

      if (response.success) {
        await loadPartners();
        toast.success(t('partners.ratingRecalculated'));
      }
    } catch (error) {
      console.error("Error recalculating rating:", error);
      toast.error("Failed to recalculate rating");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: PartnerStatus) => {
    switch (status) {
      case PartnerStatus.ACTIVE:
        return "default";
      case PartnerStatus.SUSPENDED:
        return "destructive";
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
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
            {t('partners.title')}
          </h1>
          <p className="text-muted-foreground font-sans">
            {t('partners.description')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('partners.totalPartners')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('partners.active')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.filter(p => p.status === PartnerStatus.ACTIVE).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('partners.suspended')}</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.filter(p => p.status === PartnerStatus.SUSPENDED).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.length > 0 
                ? (partners.reduce((sum, p) => sum + p.rating.average, 0) / partners.length).toFixed(1)
                : "0.0"
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('partners.searchPartners')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t('partners.allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('partners.allTypes')}</SelectItem>
                  {Object.values(PartnerType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`partners.partnerTypes.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t('partners.allStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('partners.allStatus')}</SelectItem>
                  {Object.values(PartnerStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`partners.statusOptions.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t('partners.minRating')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('partners.minRating')}</SelectItem>
                  <SelectItem value="1">1+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('partners.title')}</CardTitle>
          <CardDescription>{t('partners.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('partners.loadingPartners')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPartners.map((partner) => (
                <div
                  key={partner._id}
                  className="flex items-center justify-between p-4 border border-border rounded-[0.625rem] hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedPartner(partner);
                    setIsDetailOpen(true);
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {partner.partnerId} • {partner.primaryContact.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getStatusColor(partner.status)}>
                            {t(`partners.statusOptions.${partner.status}`)}
                          </Badge>
                          <Badge variant={getTypeColor(partner.type)}>
                            {t(`partners.partnerTypes.${partner.type}`)}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {renderStars(partner.rating.average)}
                            <span className="text-xs text-muted-foreground">
                              ({partner.rating.count})
                            </span>
                          </div>
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
                        setSelectedPartner(partner);
                        setIsDetailOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('partners.view')}
                    </Button>
                    {partner.status === PartnerStatus.ACTIVE ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(partner.partnerId, PartnerStatus.SUSPENDED);
                        }}
                      >
                        <ShieldOff className="h-4 w-4 mr-2" />
                        {t('partners.suspend')}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(partner.partnerId, PartnerStatus.ACTIVE);
                        }}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {t('partners.activate')}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetAccess(partner.partnerId);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t('partners.resetAccess')}
                    </Button>
                  </div>
                </div>
              ))}

              {filteredPartners.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('partners.noPartnersFound')}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('partners.partnerDetails')}</DialogTitle>
            <DialogDescription>
              {selectedPartner?.name} - {selectedPartner?.partnerId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPartner && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="overview">{t('partners.overview')}</TabsTrigger>
                <TabsTrigger value="health">{t('partners.healthSlas')}</TabsTrigger>
                <TabsTrigger value="contacts">{t('partners.contacts')}</TabsTrigger>
                <TabsTrigger value="services">{t('partners.services')}</TabsTrigger>
                <TabsTrigger value="contracts">{t('partners.contractsDocs')}</TabsTrigger>
                <TabsTrigger value="finance">{t('partners.finance')}</TabsTrigger>
                <TabsTrigger value="activity">{t('partners.activity')}</TabsTrigger>
                <TabsTrigger value="audit">{t('partners.audit')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedPartner.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Partner ID</Label>
                    <p className="text-sm text-muted-foreground">{selectedPartner.partnerId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {t(`partners.partnerTypes.${selectedPartner.type}`)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={getStatusColor(selectedPartner.status)}>
                      {t(`partners.statusOptions.${selectedPartner.status}`)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Rating</Label>
                    <div className="flex items-center space-x-1">
                      {renderStars(selectedPartner.rating.average)}
                      <span className="text-sm text-muted-foreground">
                        {selectedPartner.rating.average.toFixed(1)} ({selectedPartner.rating.count} reviews)
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedPartner.createdAt)}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contacts" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Primary Contact</Label>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm">{selectedPartner.primaryContact.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {selectedPartner.primaryContact.email}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {selectedPartner.primaryContact.phone}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Addresses</Label>
                    <div className="mt-2 space-y-2">
                      {selectedPartner.addresses.map((address, index) => (
                        <div key={index} className="text-sm text-muted-foreground flex items-start">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                          <div>
                            <p>{address.line1}</p>
                            <p>{address.city}, {address.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">App Access</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mobile App</span>
                        <Badge variant={selectedPartner.apps.mobile.active ? "default" : "secondary"}>
                          {selectedPartner.apps.mobile.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {selectedPartner.apps.mobile.lastLoginAt && (
                        <p className="text-sm text-muted-foreground">
                          Last login: {formatDate(selectedPartner.apps.mobile.lastLoginAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="audit" className="space-y-4">
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Audit Trail</Label>
                  <div className="space-y-2">
                    {selectedPartner.audit.map((entry, index) => (
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
                        {entry.reason && (
                          <p className="text-sm text-muted-foreground">
                            Reason: {entry.reason}
                          </p>
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
    </div>
  );
}
