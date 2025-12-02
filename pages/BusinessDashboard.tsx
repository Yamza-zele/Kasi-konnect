import { useState, useEffect } from 'react';
import { useAuth } from '../src/context/auth-context.tsx';
import { useData } from '../src/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';


import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../components/ui/sidebar';
import { Settings as SettingsIcon, Upload, FileText, Trash2, Eye, Globe, Clock, Lock, LayoutDashboard, User, DollarSign, Briefcase, CreditCard } from 'lucide-react';
import { formatRands } from '../src/utils/currency.ts';
import { BusinessProfile, FundingRequest, Job, JobApplication, BusinessDocument } from '../lib/types.ts';
import { toast } from 'sonner';

export function BusinessDashboard() {
  const { user } = useAuth();
  const {
    businessProfiles,
    getBusinessProfile,
    updateBusinessProfile,
    createBusinessProfile,
    uploadBusinessDocument,
    deleteBusinessDocument,
    fundingRequests,
    createFundingRequest,
    jobs,
    createJob,
    jobApplications,
    updateJobApplication,
    createPayment,
    payments,
    getFreelancerProfile,
  } = useData();

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    companyName: '',
    industry: '',
    description: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
  });

  // Funding request form state
  const [fundingForm, setFundingForm] = useState({
    amount: '',
    purpose: '',
    description: '',
  });

  // Job posting form state
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    budget: '',
    requiredSkills: '',
    duration: '',
    deadline: '',
    location: '',
  });

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    freelancerId: '',
    freelancerName: '',
    amount: '',
  });

  // Freelancer profile modal state
  const [freelancerModal, setFreelancerModal] = useState({
    open: false,
    freelancer: null as any,
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    applicationAlerts: true,
    fundingUpdates: true,
    paymentNotifications: false,
    systemUpdates: false,
    weeklyReports: false,
    profileVisibility: 'public' as 'public' | 'private',
    language: 'en',
    timezone: 'Africa/Johannesburg',
  });

  // Document upload state
  const [documentUpload, setDocumentUpload] = useState({
    file: null as File | null,
    type: '',
    name: '',
  });



  useEffect(() => {
    if (user) {
      const userProfile = getBusinessProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        setProfileForm({
          companyName: userProfile.companyName,
          industry: userProfile.industry,
          description: userProfile.description,
          location: userProfile.location,
          contactEmail: userProfile.contactEmail,
          contactPhone: userProfile.contactPhone,
        });
      }
    }
  }, [user, businessProfiles]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      if (profile) {
        updateBusinessProfile(user.id, profileForm);
        toast.success('Profile updated successfully!');
      } else {
        createBusinessProfile({
          userId: user.id,
          ...profileForm,
          documents: [],
        });
        toast.success('Profile created successfully!');
      }
    }
  };

  const handleCreateFundingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && profile) {
      createFundingRequest({
        businessId: user.id,
        businessName: profile.companyName,
        amount: parseFloat(fundingForm.amount),
        purpose: fundingForm.purpose,
        description: fundingForm.description,
        status: 'pending',
        industry: profile.industry,
      });
      setFundingForm({ amount: '', purpose: '', description: '' });
      toast.success('Funding request submitted!');
    }
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && profile) {
      createJob({
        businessId: user.id,
        businessName: profile.companyName,
        title: jobForm.title,
        description: jobForm.description,
        budget: parseFloat(jobForm.budget),
        requiredSkills: jobForm.requiredSkills.split(',').map(s => s.trim()),
        duration: jobForm.duration,
        deadline: jobForm.deadline,
        location: jobForm.location,
        status: 'open',
      });
      setJobForm({ title: '', description: '', budget: '', requiredSkills: '', duration: '', deadline: '', location: '' });
      toast.success('Job posted successfully!');
    }
  };

  const handleAcceptApplication = (applicationId: string, _freelancerId: string, freelancerName: string) => {
    updateJobApplication(applicationId, { status: 'accepted' });
    toast.success(`Accepted application from ${freelancerName}`);
  };

  const handlePayFreelancer = () => {
    if (user && paymentModal.freelancerId && paymentModal.amount) {
      createPayment({
        fromUserId: user.id,
        toUserId: paymentModal.freelancerId,
        amount: parseFloat(paymentModal.amount),
        type: 'job-payment',
        status: 'completed',
        description: `Payment to ${paymentModal.freelancerName}`,
      });
      setPaymentModal({ open: false, freelancerId: '', freelancerName: '', amount: '' });
      toast.success(`Payment of ${formatRands(parseFloat(paymentModal.amount))} sent to ${paymentModal.freelancerName}!`);
    }
  };

  const handleViewFreelancerProfile = (freelancerId: string) => {
    const freelancer = getFreelancerProfile(freelancerId);
    if (freelancer) {
      setFreelancerModal({ open: true, freelancer });
    }
  };

  const handleUploadDocument = () => {
    if (user && documentUpload.file && documentUpload.type && documentUpload.name) {
      // Create a mock URL for the uploaded file (in a real app, this would be uploaded to a server)
      const mockUrl = URL.createObjectURL(documentUpload.file);

      uploadBusinessDocument(user.id, {
        name: documentUpload.name,
        type: documentUpload.type,
        url: mockUrl,
      });

      setDocumentUpload({ file: null, type: '', name: '' });
      toast.success('Document uploaded successfully!');
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    if (user) {
      deleteBusinessDocument(user.id, documentId);
      toast.success('Document deleted successfully!');
    }
  };

  const myFundingRequests = fundingRequests.filter((f: FundingRequest) => f.businessId === user?.id);
  const myJobs = jobs.filter((j: Job) => j.businessId === user?.id);
  const myApplications = jobApplications.filter((a: JobApplication) =>
    myJobs.some((j: Job) => j.id === a.jobId)
  );



  const totalFundingRequested = myFundingRequests.reduce((sum: number, f: FundingRequest) => sum + f.amount, 0);
  const approvedFunding = myFundingRequests
    .filter((f: FundingRequest) => f.status === 'approved' || f.status === 'funded')
    .reduce((sum: number, f: FundingRequest) => sum + f.amount, 0);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'funding', label: 'Funding', icon: DollarSign },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Business Dashboard</h2>
            <p className="text-sm text-sidebar-foreground/70">Welcome back, {user?.name}</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="relative"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {activeTab === item.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r transition-all duration-300" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-800">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Total Funding Requested</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-gray-800">
                        {formatRands(totalFundingRequested)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Approved Funding</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-green-500">
                        {formatRands(approvedFunding)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Active Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-gray-800">{myJobs.filter((j: Job) => j.status === 'open').length}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-gray-800">{myApplications.length}</div>
                    </CardContent>
                  </Card>
                </div>

                {!profile && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <p className="text-blue-600 mb-2">Complete your business profile to get started!</p>
                      <Button
                        onClick={() => setActiveTab('profile')}
                        className="bg-blue-400 hover:bg-blue-500 text-white"
                      >
                        Set Up Profile
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-800 text-sm sm:text-base">Recent Funding Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {myFundingRequests.slice(0, 3).map((request: FundingRequest) => (
                        <div key={request.id} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-gray-800 text-sm sm:text-base truncate">{request.purpose}</div>
                              <div className="text-xs sm:text-sm text-gray-600">{formatRands(request.amount)}</div>
                            </div>
                            <Badge variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'rejected' ? 'destructive' :
                              request.status === 'funded' ? 'default' :
                              'secondary'
                            } className="text-xs ml-2">
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {myFundingRequests.length === 0 && (
                        <p className="text-gray-500 text-sm">No funding requests yet</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-800 text-sm sm:text-base">Recent Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {myApplications.slice(0, 3).map((app: JobApplication) => {
                        const job = myJobs.find((j: Job) => j.id === app.jobId);
                        return (
                          <div key={app.id} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                              <div className="min-w-0 flex-1">
                                <div className="text-gray-800 text-sm sm:text-base truncate">{app.freelancerName}</div>
                                <div className="text-xs sm:text-sm text-gray-600 truncate">{job?.title}</div>
                              </div>
                              <Badge variant={
                                app.status === 'accepted' ? 'default' :
                                app.status === 'rejected' ? 'destructive' :
                                'secondary'
                              } className="text-xs ml-2">
                                {app.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                      {myApplications.length === 0 && (
                        <p className="text-gray-500 text-sm">No applications yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

          {activeTab === 'profile' && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Business Profile</CardTitle>
                <CardDescription className="text-gray-600">
                  Update your business information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-gray-700 text-sm">Company Name</Label>
                      <Input
                        id="companyName"
                        value={profileForm.companyName}
                        onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-gray-700 text-sm">Industry</Label>
                      <Select
                        value={profileForm.industry}
                        onValueChange={(value) => setProfileForm({ ...profileForm, industry: value })}
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800 text-sm">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="Technology" className="text-gray-800 text-sm">Technology</SelectItem>
                          <SelectItem value="Retail" className="text-gray-800 text-sm">Retail</SelectItem>
                          <SelectItem value="Manufacturing" className="text-gray-800 text-sm">Manufacturing</SelectItem>
                          <SelectItem value="Services" className="text-gray-800 text-sm">Services</SelectItem>
                          <SelectItem value="Other" className="text-gray-800 text-sm">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-700 text-sm">Description</Label>
                    <Textarea
                      id="description"
                      value={profileForm.description}
                      onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                      className="bg-white border-gray-300 text-gray-800 min-h-[80px] sm:min-h-[100px] text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-700 text-sm">Location</Label>
                      <Input
                        id="location"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="text-gray-700 text-sm">Phone</Label>
                      <Input
                        id="contactPhone"
                        value={profileForm.contactPhone}
                        onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-gray-700 text-sm">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={profileForm.contactEmail}
                      onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                      className="bg-white border-gray-300 text-gray-800 text-sm"
                      required
                    />
                  </div>

                  <Button type="submit" className="bg-blue-400 hover:bg-blue-500 text-white text-sm">
                    Save Profile
                  </Button>
                </form>

                {/* Document Upload Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg text-gray-800 mb-4">Required Documents</h3>

                  {/* Document Upload Form */}
                  <Card className="bg-gray-50 border-gray-200 mb-4">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700 text-sm">Document Type</Label>
                          <Select
                            value={documentUpload.type}
                            onValueChange={(value) => setDocumentUpload({ ...documentUpload, type: value })}
                          >
                            <SelectTrigger className="bg-white border-gray-300 text-gray-800 text-sm">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="business-license" className="text-sm">Business License</SelectItem>
                              <SelectItem value="tax-certificate" className="text-sm">Tax Certificate</SelectItem>
                              <SelectItem value="registration-certificate" className="text-sm">Registration Certificate</SelectItem>
                              <SelectItem value="id-document" className="text-sm">ID Document</SelectItem>
                              <SelectItem value="bank-statement" className="text-sm">Bank Statement</SelectItem>
                              <SelectItem value="proof-of-address" className="text-sm">Proof of Address</SelectItem>
                              <SelectItem value="financial-statements" className="text-sm">Financial Statements</SelectItem>
                              <SelectItem value="vat-certificate" className="text-sm">VAT Certificate</SelectItem>
                              <SelectItem value="company-registration" className="text-sm">Company Registration</SelectItem>
                              <SelectItem value="partnership-agreement" className="text-sm">Partnership Agreement</SelectItem>
                              <SelectItem value="other" className="text-sm">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700 text-sm">Document Name</Label>
                          <Input
                            placeholder="e.g., Company Registration Certificate"
                            value={documentUpload.name}
                            onChange={(e) => setDocumentUpload({ ...documentUpload, name: e.target.value })}
                            className="bg-white border-gray-300 text-gray-800 text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700 text-sm">File</Label>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setDocumentUpload({ ...documentUpload, file });
                              }
                            }}
                            className="bg-white border-gray-300 text-gray-800 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleUploadDocument}
                        disabled={!documentUpload.file || !documentUpload.type || !documentUpload.name}
                        className="bg-blue-400 hover:bg-blue-500 text-white text-sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Uploaded Documents List */}
                  <Card className="bg-white border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-gray-800 text-sm sm:text-base">Uploaded Documents</CardTitle>
                      <CardDescription className="text-gray-600 text-xs sm:text-sm">
                        Manage your uploaded documents
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {profile?.documents && profile.documents.length > 0 ? (
                        <div className="space-y-3">
                          {profile.documents.map((doc: BusinessDocument) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm text-gray-800 truncate">{doc.name}</div>
                                  <div className="text-xs text-gray-600">
                                    {doc.type} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={doc.verified ? "default" : "secondary"} className="text-xs">
                                  {doc.verified ? "Verified" : "Pending"}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(doc.url, '_blank')}
                                  className="text-xs"
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4 text-sm">No documents uploaded yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}



            {activeTab === 'payments' && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Payment History</CardTitle>
                  <CardDescription className="text-gray-600">
                    View all your payment transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Description</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Type</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Transaction ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments
                        .filter((p: any) => p.fromUserId === user?.id || p.toUserId === user?.id)
                        .map((payment: any) => (
                          <TableRow key={payment.id} className="border-gray-200">
                            <TableCell className="text-gray-800 text-xs sm:text-sm">{payment.description}</TableCell>
                            <TableCell className="text-gray-800 text-xs sm:text-sm">{formatRands(payment.amount)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs text-gray-700 border-gray-300">
                                {payment.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs sm:text-sm">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs">{payment.transactionId}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  {payments.filter((p: any) => p.fromUserId === user?.id || p.toUserId === user?.id).length === 0 && (
                    <p className="text-gray-500 text-center py-4 text-sm">No payments yet</p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Notification Preferences */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800 text-sm sm:text-base">Notification Preferences</CardTitle>
                    <CardDescription className="text-gray-600 text-xs sm:text-sm">
                      Manage how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Email Notifications</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <Button
                        variant={settings.emailNotifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, emailNotifications: !settings.emailNotifications });
                          toast.success('Settings updated');
                        }}
                        className={`text-xs ${settings.emailNotifications ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        {settings.emailNotifications ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">SMS Notifications</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Receive alerts via SMS</p>
                      </div>
                      <Button
                        variant={settings.smsNotifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, smsNotifications: !settings.smsNotifications });
                          toast.success('Settings updated');
                        }}
                        className={`text-xs ${settings.smsNotifications ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        {settings.smsNotifications ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Application Alerts</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Get notified of new job applications</p>
                      </div>
                      <Button
                        variant={settings.applicationAlerts ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, applicationAlerts: !settings.applicationAlerts });
                          toast.success('Settings updated');
                        }}
                        className={`text-xs ${settings.applicationAlerts ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        {settings.applicationAlerts ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Funding Updates</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Receive funding request status updates</p>
                      </div>
                      <Button
                        variant={settings.fundingUpdates ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, fundingUpdates: !settings.fundingUpdates });
                          toast.success('Settings updated');
                        }}
                        className={`text-xs ${settings.fundingUpdates ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        {settings.fundingUpdates ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Marketing Emails</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Receive news and updates</p>
                      </div>
                      <Button
                        variant={settings.marketingEmails ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, marketingEmails: !settings.marketingEmails });
                          toast.success('Settings updated');
                        }}
                        className={`text-xs ${settings.marketingEmails ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        {settings.marketingEmails ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Payment Notifications</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Get notified when payments are made</p>
                      </div>
                      <Button
                        variant={settings.paymentNotifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, paymentNotifications: !settings.paymentNotifications });
                          toast.success('Settings updated');
                        }}
                        className={`text-xs ${settings.paymentNotifications ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        {settings.paymentNotifications ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">System Updates</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Receive platform maintenance notifications</p>
                      </div>
                      <Button
                        variant={settings.systemUpdates ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, systemUpdates: !settings.systemUpdates });
                          toast.success('Settings updated');
                        }}
                        className={`text-xs ${settings.systemUpdates ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        {settings.systemUpdates ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Weekly Reports</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Receive weekly activity summaries</p>
                      </div>
                      <Button
                        variant={settings.weeklyReports ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, weeklyReports: !settings.weeklyReports });
                          toast.success('Settings updated');
                        }}
                        className={`text-xs ${settings.weeklyReports ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        {settings.weeklyReports ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy & Account */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800 text-sm sm:text-base">Privacy & Account</CardTitle>
                    <CardDescription className="text-gray-600 text-xs sm:text-sm">
                      Manage your account settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <Label className="text-gray-800 text-sm font-medium">Profile Visibility</Label>
                          <p className="text-xs text-gray-600">Control who can see your business profile</p>
                        </div>
                        <Select
                          value={settings.profileVisibility}
                          onValueChange={(value: 'public' | 'private') => {
                            setSettings({ ...settings, profileVisibility: value });
                            toast.success('Profile visibility updated');
                          }}
                        >
                          <SelectTrigger className="bg-white border-gray-300 text-gray-800 text-sm w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public" className="text-sm">Public</SelectItem>
                            <SelectItem value="private" className="text-sm">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <Label className="text-gray-800 text-sm font-medium">Language</Label>
                          <p className="text-xs text-gray-600">Choose your preferred language</p>
                        </div>
                        <Select
                          value={settings.language}
                          onValueChange={(value) => {
                            setSettings({ ...settings, language: value });
                            toast.success('Language updated');
                          }}
                        >
                          <SelectTrigger className="bg-white border-gray-300 text-gray-800 text-sm w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en" className="text-sm">English</SelectItem>
                            <SelectItem value="af" className="text-sm">Afrikaans</SelectItem>
                            <SelectItem value="zu" className="text-sm">isiZulu</SelectItem>
                            <SelectItem value="xh" className="text-sm">isiXhosa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <Label className="text-gray-800 text-sm font-medium">Timezone</Label>
                          <p className="text-xs text-gray-600">Set your local timezone</p>
                        </div>
                        <Select
                          value={settings.timezone}
                          onValueChange={(value) => {
                            setSettings({ ...settings, timezone: value });
                            toast.success('Timezone updated');
                          }}
                        >
                          <SelectTrigger className="bg-white border-gray-300 text-gray-800 text-sm w-40 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Africa/Johannesburg" className="text-sm">South Africa (SAST)</SelectItem>
                            <SelectItem value="Africa/Cairo" className="text-sm">Egypt (EET)</SelectItem>
                            <SelectItem value="Africa/Lagos" className="text-sm">Nigeria (WAT)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Lock className="w-5 h-5 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <Label className="text-gray-800 text-sm font-medium">Password</Label>
                          <p className="text-xs text-gray-600">Update your account password</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50 text-xs">
                          Change
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <div className="flex-1 min-w-0">
                          <Label className="text-red-700 text-sm font-medium">Delete Account</Label>
                          <p className="text-xs text-red-600">Permanently delete your account</p>
                        </div>
                        <Button variant="destructive" size="sm" className="text-xs">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

