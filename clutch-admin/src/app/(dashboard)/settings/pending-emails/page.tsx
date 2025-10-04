"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  ExternalLink,
  Copy,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { handleError, handleDataLoadError } from "@/lib/error-handler";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

interface PendingEmail {
  _id: string;
  type: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  invitationLink: string;
  employeeData: {
    name: string;
    role: string;
    department: string;
  };
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  attempts: number;
  lastAttempt?: string;
  sentAt?: string;
  sentBy?: string;
}

export default function PendingEmailsPage() {
  const { user, hasPermission } = useAuth();
  const { t } = useLanguage();
  const [pendingEmails, setPendingEmails] = useState<PendingEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<PendingEmail | null>(null);

  useEffect(() => {
    const loadPendingEmails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("clutch-admin-token");
        
        const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/pending-emails", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setPendingEmails(data.data?.pendingEmails || []);
        } else {
          handleDataLoadError(new Error('Failed to load pending emails'), 'pending_emails');
          toast.error(t('pendingEmails.failedToLoadPendingEmails'));
        }
      } catch (error) {
        handleDataLoadError(error, 'pending_emails');
        toast.error(t('pendingEmails.failedToLoadPendingEmails'));
      } finally {
        setLoading(false);
      }
    };

    if (user && hasPermission('manage_employees')) {
      loadPendingEmails();
    }
  }, [user, hasPermission]);

  const filteredEmails = pendingEmails.filter((email) => {
    const matchesSearch = 
      email.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.employeeData.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || email.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewEmail = (email: PendingEmail) => {
    setSelectedEmail(email);
    setShowEmailDialog(true);
  };

  const handleMarkAsSent = async (emailId: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      const response = await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/pending-emails/${emailId}/mark-sent`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success(t('pendingEmails.emailMarkedAsSent'));
        // Reload emails
        window.location.reload();
      } else {
        toast.error(t('pendingEmails.failedToMarkEmail'));
      }
    } catch (error) {
      handleError(error, { component: 'PendingEmailsPage', action: 'mark_email_sent' });
      toast.error(t('pendingEmails.failedToMarkEmail'));
    }
  };

  const handleCopyInvitationLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success(t('pendingEmails.invitationLinkCopied'));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-warning"><Clock className="w-3 h-3 mr-1" />{t('pendingEmails.pending')}</Badge>;
      case 'sent':
        return <Badge variant="outline" className="text-success"><CheckCircle className="w-3 h-3 mr-1" />{t('pendingEmails.sent')}</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-destructive"><XCircle className="w-3 h-3 mr-1" />{t('pendingEmails.failed')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!hasPermission('manage_employees')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('pendingEmails.accessDenied')}</h3>
              <p className="text-muted-foreground">{t('pendingEmails.noPermissionMessage')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('pendingEmails.title')}</h1>
          <p className="text-muted-foreground">
            {t('pendingEmails.description')}
          </p>
        </div>
      </div>

      {/* Email Service Status Alert */}
      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-warning" />
            <div>
              <h4 className="font-semibold text-warning">{t('pendingEmails.emailServiceStatus')}</h4>
              <p className="text-sm text-warning/80">
                {t('pendingEmails.emailServiceMockMode')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t('pendingEmails.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">{t('pendingEmails.allStatus')}</option>
              <option value="pending">{t('pendingEmails.pending')}</option>
              <option value="sent">{t('pendingEmails.sent')}</option>
              <option value="failed">{t('pendingEmails.failed')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Emails Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('pendingEmails.pendingEmailsCount', { count: filteredEmails.length })}</CardTitle>
          <CardDescription>
            {t('pendingEmails.pendingEmailsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">{t('pendingEmails.loadingPendingEmails')}</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('pendingEmails.noPendingEmails')}</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? t('pendingEmails.noEmailsMatchFilters')
                  : t('pendingEmails.allEmailsProcessed')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pendingEmails.employee')}</TableHead>
                  <TableHead>{t('pendingEmails.email')}</TableHead>
                  <TableHead>{t('pendingEmails.subject')}</TableHead>
                  <TableHead>{t('pendingEmails.status')}</TableHead>
                  <TableHead>{t('pendingEmails.created')}</TableHead>
                  <TableHead>{t('pendingEmails.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmails.map((email) => (
                  <TableRow key={email._id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{email.employeeData.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {email.employeeData.role} • {email.employeeData.department}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{email.to}</TableCell>
                    <TableCell className="max-w-xs truncate">{email.subject}</TableCell>
                    <TableCell>{getStatusBadge(email.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(email.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEmail(email)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {t('pendingEmails.view')}
                        </Button>
                        {email.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsSent(email._id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {t('pendingEmails.markSent')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Email Details Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('pendingEmails.emailDetails')}</DialogTitle>
            <DialogDescription>
              {t('pendingEmails.emailDetailsDescription')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('pendingEmails.to')}</label>
                  <p className="text-sm text-muted-foreground">{selectedEmail.to}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('pendingEmails.subject')}</label>
                  <p className="text-sm text-muted-foreground">{selectedEmail.subject}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">{t('pendingEmails.employeeDetails')}</label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p><strong>{t('pendingEmails.name')}</strong> {selectedEmail.employeeData.name}</p>
                  <p><strong>{t('pendingEmails.role')}</strong> {selectedEmail.employeeData.role}</p>
                  <p><strong>{t('pendingEmails.department')}</strong> {selectedEmail.employeeData.department}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">{t('pendingEmails.invitationLink')}</label>
                <div className="mt-1 flex items-center space-x-2">
                  <Input
                    value={selectedEmail.invitationLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyInvitationLink(selectedEmail.invitationLink)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {t('pendingEmails.copy')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedEmail.invitationLink, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {t('pendingEmails.open')}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">{t('pendingEmails.emailContent')}</label>
                <div className="mt-1 p-3 bg-muted rounded-md max-h-60 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              {t('pendingEmails.close')}
            </Button>
            {selectedEmail?.status === 'pending' && (
              <Button onClick={() => {
                handleMarkAsSent(selectedEmail._id);
                setShowEmailDialog(false);
              }}>
                <Send className="w-3 h-3 mr-1" />
                {t('pendingEmails.markAsSent')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


