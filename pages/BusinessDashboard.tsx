import { useState, useEffect } from 'react';
import { useAuth } from '../src/context/auth-context.tsx';
import { useData } from '../src/context/data-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';

import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Send, Settings as SettingsIcon, Upload, X, FileText, Trash2, Eye, Globe, Clock, Lock } from 'lucide-react';
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

  // Job filter state
  const [jobFilter, setJobFilter] = useState<'all' | 'approved' | 'rejected' | 'pending-paying'>('all');

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

  // Filter jobs based on selected filter
  const filteredJobs = myJobs.filter((job: Job) => {
    if (jobFilter === 'all') return true;
    if (jobFilter === 'approved') return myApplications.some(app => app.jobId === job.id && app.status === 'accepted');
    if (jobFilter === 'rejected') return myApplications.some(app => app.jobId === job.id && app.status === 'rejected');
    if (jobFilter === 'pending-paying') return myApplications.some(app => app.jobId === job.id && app.status === 'accepted') && !payments.some(p => p.fromUserId === user?.id && p.toUserId === myApplications.find(app => app.jobId === job.id && app.status === 'accepted')?.freelancerId && p.type === 'job-payment');
    return true;
  });

  const totalFundingRequested = myFundingRequests.reduce((sum: number, f: FundingRequest) => sum + f.amount, 0);
  const approvedFunding = myFundingRequests
    .filter((f: FundingRequest) => f.status === 'approved' || f.status === 'funded')
    .reduce((sum: number, f: FundingRequest) => sum + f.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl text-gray-800 mb-2">Business Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Welcome back, {user?.name}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border-gray-200 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gray-100 text-xs sm:text-sm">
              Profile
            </TabsTrigger>
            <TabsTrigger value="funding" className="data-[state=active]:bg-gray-100 text-xs sm:text-sm">
              Funding
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-gray-100 text-xs sm:text-sm">
              Jobs
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-gray-100 text-xs sm:text-sm">
              Payments
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-100 text-xs sm:text-sm">
              <SettingsIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
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
          </TabsContent>

          {/* Funding Tab */}
          <TabsContent value="funding" className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Create Funding Request</CardTitle>
                <CardDescription className="text-gray-600">
                  Request funding from the City of Tshwane
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <form onSubmit={handleCreateFundingRequest} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-gray-700 text-sm">Amount (ZAR)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="50000"
                        value={fundingForm.amount}
                        onChange={(e) => setFundingForm({ ...fundingForm, amount: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purpose" className="text-gray-700 text-sm">Purpose</Label>
                      <Input
                        id="purpose"
                        placeholder="Equipment Purchase"
                        value={fundingForm.purpose}
                        onChange={(e) => setFundingForm({ ...fundingForm, purpose: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fundingDescription" className="text-gray-700 text-sm">Description</Label>
                    <Textarea
                      id="fundingDescription"
                      placeholder="Describe how you will use the funding..."
                      value={fundingForm.description}
                      onChange={(e) => setFundingForm({ ...fundingForm, description: e.target.value })}
                      className="bg-white border-gray-300 text-gray-800 min-h-[100px] sm:min-h-[120px] text-sm"
                      required
                    />
                  </div>

                  <Button type="submit" className="bg-blue-400 hover:bg-blue-500 text-white text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Funding Requests</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-700 text-xs sm:text-sm">Purpose</TableHead>
                      <TableHead className="text-gray-700 text-xs sm:text-sm">Amount</TableHead>
                      <TableHead className="text-gray-700 text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-gray-700 text-xs sm:text-sm">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myFundingRequests.map((request: FundingRequest) => (
                      <TableRow key={request.id} className="border-gray-200">
                        <TableCell className="text-gray-800 text-xs sm:text-sm">{request.purpose}</TableCell>
                        <TableCell className="text-gray-800 text-xs sm:text-sm">{formatRands(request.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            request.status === 'approved' || request.status === 'funded' ? 'default' :
                            request.status === 'rejected' ? 'destructive' :
                            'secondary'
                          } className="text-xs">
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs sm:text-sm">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {myFundingRequests.length === 0 && (
                  <p className="text-gray-500 text-center py-4 text-sm">No funding requests yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Post a Job</CardTitle>
                <CardDescription className="text-gray-600">
                  Hire freelancers for your projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <form onSubmit={handleCreateJob} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="text-gray-700 text-sm">Job Title</Label>
                      <Input
                        id="jobTitle"
                        placeholder="Logo Design"
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-gray-700 text-sm">Budget (ZAR)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="3500"
                        value={jobForm.budget}
                        onChange={(e) => setJobForm({ ...jobForm, budget: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobDescription" className="text-gray-700 text-sm">Description</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Describe the job requirements..."
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      className="bg-white border-gray-300 text-gray-800 min-h-[100px] sm:min-h-[120px] text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requiredSkills" className="text-gray-700 text-sm">Required Skills (comma separated)</Label>
                      <Input
                        id="requiredSkills"
                        placeholder="Design, Photoshop, Branding"
                        value={jobForm.requiredSkills}
                        onChange={(e) => setJobForm({ ...jobForm, requiredSkills: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-700 text-sm">Location</Label>
                      <Input
                        id="location"
                        placeholder="Pretoria Central, Tshwane"
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-gray-700 text-sm">Duration</Label>
                      <Input
                        id="duration"
                        placeholder="2 weeks"
                        value={jobForm.duration}
                        onChange={(e) => setJobForm({ ...jobForm, duration: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline" className="text-gray-700 text-sm">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={jobForm.deadline}
                        onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="bg-blue-400 hover:bg-blue-500 text-white text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Post Job
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">My Job Postings</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={jobFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setJobFilter('all')}
                    className="text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant={jobFilter === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setJobFilter('approved')}
                    className="text-xs"
                  >
                    Approved
                  </Button>
                  <Button
                    variant={jobFilter === 'rejected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setJobFilter('rejected')}
                    className="text-xs"
                  >
                    Rejected
                  </Button>
                  <Button
                    variant={jobFilter === 'pending-paying' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setJobFilter('pending-paying')}
                    className="text-xs"
                  >
                    Pending Paying
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {filteredJobs.map((job: Job) => {
                  const applications = myApplications.filter((a: JobApplication) => a.jobId === job.id);
                  return (
                    <Card key={job.id} className="bg-gray-50 border-gray-200">
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg text-gray-800 mb-1 truncate">{job.title}</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{job.description}</p>
                            <div className="flex gap-1 sm:gap-2 flex-wrap mb-3">
                              {job.requiredSkills.map((skill: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs text-gray-700 border-gray-300">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:gap-4 text-xs sm:text-sm text-gray-600 gap-1">
                              <span>Duration: {job.duration}</span>
                              <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                              {job.location && <span>Location: {job.location}</span>}
                            </div>
                          </div>
                          <div className="text-right sm:ml-4 flex-shrink-0">
                            <div className="text-base sm:text-lg text-blue-500 mb-1">{formatRands(job.budget)}</div>
                            <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                              {job.status}
                            </Badge>
                          </div>
                        </div>

                        {applications.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-xs sm:text-sm text-gray-700 mb-3">Applications ({applications.length})</h4>
                            <div className="space-y-2 sm:space-y-3">
                              {applications.map((app: JobApplication) => (
                                <div key={app.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-white rounded-lg border border-gray-200 gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-gray-800 text-sm sm:text-base truncate">{app.freelancerName}</div>
                                    <div className="text-xs sm:text-sm text-gray-600 line-clamp-1">{app.coverLetter.substring(0, 100)}...</div>
                                    <div className="text-xs sm:text-sm text-blue-500 mt-1">Proposed: {formatRands(app.proposedRate)}</div>
                                  </div>
                                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleViewFreelancerProfile(app.freelancerId)}
                                      className="border-blue-500 text-blue-500 hover:bg-blue-500/10 text-xs"
                                    >
                                      View Profile
                                    </Button>
                                    {app.status === 'pending' && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleAcceptApplication(app.id, app.freelancerId, app.freelancerName)}
                                          className="bg-green-500 hover:bg-green-600 text-white text-xs"
                                        >
                                          Accept
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => updateJobApplication(app.id, { status: 'rejected' })}
                                          className="border-red-500 text-red-500 hover:bg-red-500/10 text-xs"
                                        >
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                    {app.status === 'accepted' && (
                                      <>
                                        <Badge variant="default" className="mr-1 sm:mr-2 text-xs">Accepted</Badge>
                                        <Button
                                          size="sm"
                                          onClick={() => setPaymentModal({
                                            open: true,
                                            freelancerId: app.freelancerId,
                                            freelancerName: app.freelancerName,
                                            amount: job.budget.toString(),
                                          })}
                                          className="bg-blue-400 hover:bg-blue-500 text-white text-xs"
                                        >
                                          Pay
                                        </Button>
                                      </>
                                    )}
                                    {app.status === 'rejected' && (
                                      <Badge variant="destructive" className="text-xs">Rejected</Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredJobs.length === 0 && (
                  <p className="text-slate-400 text-center py-4">
                    {jobFilter === 'all' ? 'No job postings yet' : `No ${jobFilter.replace('-', ' ')} jobs`}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
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
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      <Dialog open={paymentModal.open} onOpenChange={(open) => setPaymentModal({ ...paymentModal, open })}>
        <DialogContent className="bg-white border-gray-200 max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-800 text-sm sm:text-base">Pay Freelancer</DialogTitle>
            <DialogDescription className="text-gray-600 text-xs sm:text-sm">
              Send payment to {paymentModal.freelancerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm">Amount (ZAR)</Label>
              <Input
                type="number"
                value={paymentModal.amount}
                onChange={(e) => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                className="bg-white border-gray-300 text-gray-800 text-sm"
              />
            </div>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Payment will be processed via MOMO gateway</div>
              <div className="text-base sm:text-lg text-gray-800">Total: {formatRands(parseFloat(paymentModal.amount || '0'))}</div>
            </div>
            <Button
              onClick={handlePayFreelancer}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white text-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Freelancer Profile Modal */}
      <Dialog open={freelancerModal.open} onOpenChange={(open) => setFreelancerModal({ ...freelancerModal, open })}>
        <DialogContent className="bg-white border-gray-200 max-w-lg sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-800 text-lg">Freelancer Profile</DialogTitle>
            <DialogDescription className="text-gray-600">
              Detailed information about the freelancer
            </DialogDescription>
          </DialogHeader>
          {freelancerModal.freelancer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl font-bold">
                    {freelancerModal.freelancer.bio.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{freelancerModal.freelancer.userId}</h3>
                  <p className="text-gray-600">{freelancerModal.freelancer.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600">{freelancerModal.freelancer.rating} ({freelancerModal.freelancer.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Bio</h4>
                <p className="text-gray-600 text-sm">{freelancerModal.freelancer.bio}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {freelancerModal.freelancer.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Hourly Rate</h4>
                  <p className="text-blue-600 font-bold">{formatRands(freelancerModal.freelancer.hourlyRate)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Qualifications</h4>
                  <p className="text-gray-600 text-sm">
                    {freelancerModal.freelancer.qualifications && freelancerModal.freelancer.qualifications.length > 0
                      ? freelancerModal.freelancer.qualifications.join(', ')
                      : 'None listed'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Certifications</h4>
                  <p className="text-gray-600 text-sm">
                    {freelancerModal.freelancer.certifications && freelancerModal.freelancer.certifications.length > 0
                      ? freelancerModal.freelancer.certifications.join(', ')
                      : 'None listed'}
                  </p>
                </div>
              </div>


            </div>
          )}
        </DialogContent>
      </Dialog>


    </div>
  );
}
