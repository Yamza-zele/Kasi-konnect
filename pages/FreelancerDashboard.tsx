import { useState, useEffect } from 'react';
import { useAuth } from '../src/context/auth-context.tsx';
import { useData } from '../src/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
import { Wallet, Star, Send, Upload, FileText, Trash2, Settings as SettingsIcon, LayoutDashboard, User, Briefcase, DollarSign, BookOpen } from 'lucide-react';
import { formatRands } from '../src/utils/currency.ts';
import { FreelancerProfile } from '../lib/types.ts';
import { toast } from 'sonner';

export function FreelancerDashboard() {
  const { user } = useAuth();
  const {
    freelancerProfiles,
    getFreelancerProfile,
    updateFreelancerProfile,
    createFreelancerProfile,
    uploadFreelancerDocument,
    deleteFreelancerDocument,
    jobs,
    jobApplications,
    createJobApplication,
    payments,
    withdrawals,
    createWithdrawal,
  } = useData();

  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    bio: '',
    skills: '',
    hourlyRate: '',
    category: '',
    portfolio: '',
    idNumber: '',
    qualifications: '',
    certifications: '',
  });

  // Document upload state
  const [documentUpload, setDocumentUpload] = useState({
    file: null as File | null,
    type: '',
    name: '',
  });

  // Application form state
  const [applicationModal, setApplicationModal] = useState({
    open: false,
    jobId: '',
    jobTitle: '',
    coverLetter: '',
    proposedRate: '',
  });

  // Withdrawal form state
  const [withdrawalModal, setWithdrawalModal] = useState({
    open: false,
    amount: '',
    momoNumber: '',
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    jobAlerts: true,
    paymentNotifications: true,
    systemUpdates: false,
    weeklyReports: false,
    profileViews: false,
    profileVisibility: 'public' as 'public' | 'private',
    language: 'en',
    timezone: 'Africa/Johannesburg',
  });

  useEffect(() => {
    if (user) {
      const userProfile = getFreelancerProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        setProfileForm({
          bio: userProfile.bio,
          skills: userProfile.skills.join(', '),
          hourlyRate: userProfile.hourlyRate.toString(),
          category: userProfile.category,
          portfolio: userProfile.portfolio,
          idNumber: userProfile.idNumber || '',
          qualifications: userProfile.qualifications?.join(', ') || '',
          certifications: userProfile.certifications?.join(', ') || '',
        });
      }
    }
  }, [user, freelancerProfiles]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedProfile = {
        bio: profileForm.bio,
        skills: profileForm.skills.split(',').map(s => s.trim()),
        hourlyRate: parseFloat(profileForm.hourlyRate),
        category: profileForm.category,
        portfolio: profileForm.portfolio,
        rating: profile?.rating || 0,
        reviewCount: profile?.reviewCount || 0,
        idNumber: profileForm.idNumber,
        qualifications: profileForm.qualifications.split(',').map(s => s.trim()).filter(s => s),
        certifications: profileForm.certifications.split(',').map(s => s.trim()).filter(s => s),
      };

      if (profile) {
        updateFreelancerProfile(user.id, updatedProfile);
        toast.success('Profile updated successfully!');
      } else {
        createFreelancerProfile({
          userId: user.id,
          ...updatedProfile,
          documents: [],
        });
        toast.success('Profile created successfully!');
      }
    }
  };

  const handleApplyForJob = () => {
    if (user && applicationModal.jobId) {
      createJobApplication({
        jobId: applicationModal.jobId,
        freelancerId: user.id,
        freelancerName: user.name,
        coverLetter: applicationModal.coverLetter,
        proposedRate: parseFloat(applicationModal.proposedRate),
        status: 'pending',
      });
      setApplicationModal({ open: false, jobId: '', jobTitle: '', coverLetter: '', proposedRate: '' });
      toast.success('Application submitted successfully!');
    }
  };

  const handleWithdrawal = () => {
    if (user && withdrawalModal.amount && withdrawalModal.momoNumber) {
      const amount = parseFloat(withdrawalModal.amount);

      if (amount > availableBalance) {
        toast.error('Insufficient balance');
        return;
      }

      if (amount < 50) {
        toast.error('Minimum withdrawal amount is R 50.00');
        return;
      }

      if (!/^27\d{9}$/.test(withdrawalModal.momoNumber)) {
        toast.error('Invalid MOMO number format. Use: 27XXXXXXXXX');
        return;
      }

      createWithdrawal({
        freelancerId: user.id,
        amount,
        momoNumber: withdrawalModal.momoNumber,
        status: 'completed',
      });

      setWithdrawalModal({ open: false, amount: '', momoNumber: '' });
      toast.success(`Withdrawal of ${formatRands(amount)} processed successfully!`);
    }
  };

  const handleDocumentUpload = () => {
    if (user && documentUpload.file && documentUpload.type && documentUpload.name) {
      // Create a mock URL for the uploaded file (in a real app, this would be uploaded to a server)
      const mockUrl = URL.createObjectURL(documentUpload.file);

      uploadFreelancerDocument(user.id, {
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
      deleteFreelancerDocument(user.id, documentId);
      toast.success('Document deleted successfully!');
    }
  };

  const myApplications = jobApplications.filter((a: any) => a.freelancerId === user?.id);
  const myPayments = payments.filter((p: any) => p.toUserId === user?.id);
  const myWithdrawals = withdrawals.filter((w: any) => w.freelancerId === user?.id);

  const totalEarnings = myPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalWithdrawn = myWithdrawals.reduce((sum: number, w: any) => sum + w.amount, 0);
  const availableBalance = totalEarnings - totalWithdrawn;

  const availableJobs = jobs.filter((j: any) => j.status === 'open');

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Freelancer Dashboard</h2>
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
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-green-600">{formatRands(totalEarnings)}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Available Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-gray-800">{formatRands(availableBalance)}</div>
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

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-lg sm:text-2xl text-gray-800">{profile?.rating || 0}</span>
                        <span className="text-xs sm:text-sm text-gray-600">({profile?.reviewCount || 0})</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {!profile && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <p className="text-blue-600 mb-2">Complete your freelancer profile to get started!</p>
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
                      <CardTitle className="text-gray-800 text-sm sm:text-base">Recent Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {myApplications.slice(0, 3).map((app: any) => {
                        const job = jobs.find((j: any) => j.id === app.jobId);
                        return (
                          <div key={app.id} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                              <div className="min-w-0 flex-1">
                                <div className="text-gray-800 text-sm sm:text-base truncate">{job?.title}</div>
                                <div className="text-xs sm:text-sm text-gray-600 truncate">{job?.businessName}</div>
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

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-800 text-sm sm:text-base">Available Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {availableJobs.slice(0, 3).map((job: any) => (
                        <div key={job.id} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-gray-800 text-sm sm:text-base truncate">{job.title}</div>
                              <div className="text-xs sm:text-sm text-gray-600 truncate">{job.businessName}</div>
                            </div>
                            <div className="text-blue-600 text-sm sm:text-base ml-2">{formatRands(job.budget)}</div>
                          </div>
                        </div>
                      ))}
                      {availableJobs.length === 0 && (
                        <p className="text-gray-500 text-sm">No jobs available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Freelancer Profile</CardTitle>
                  <CardDescription className="text-gray-600">
                    Showcase your skills and expertise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-gray-700 text-sm">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell clients about yourself and your experience..."
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 min-h-[80px] sm:min-h-[100px] text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="skills" className="text-gray-700 text-sm">Skills (comma separated)</Label>
                        <Input
                          id="skills"
                          placeholder="Web Development, Design, React"
                          value={profileForm.skills}
                          onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                          className="bg-white border-gray-300 text-gray-800 text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-gray-700 text-sm">Category</Label>
                        <Input
                          id="category"
                          placeholder="Design & Development"
                          value={profileForm.category}
                          onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                          className="bg-white border-gray-300 text-gray-800 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate" className="text-gray-700 text-sm">Hourly Rate (ZAR)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          placeholder="350"
                          value={profileForm.hourlyRate}
                          onChange={(e) => setProfileForm({ ...profileForm, hourlyRate: e.target.value })}
                          className="bg-white border-gray-300 text-gray-800 text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="portfolio" className="text-gray-700 text-sm">Portfolio URL</Label>
                        <Input
                          id="portfolio"
                          type="url"
                          placeholder="https://portfolio.example.com"
                          value={profileForm.portfolio}
                          onChange={(e) => setProfileForm({ ...profileForm, portfolio: e.target.value })}
                          className="bg-white border-gray-300 text-gray-800 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="idNumber" className="text-gray-700 text-sm">ID Number</Label>
                        <Input
                          id="idNumber"
                          placeholder="South African ID Number"
                          value={profileForm.idNumber}
                          onChange={(e) => setProfileForm({ ...profileForm, idNumber: e.target.value })}
                          className="bg-white border-gray-300 text-gray-800 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="qualifications" className="text-gray-700 text-sm">Qualifications (comma separated)</Label>
                        <Input
                          id="qualifications"
                          placeholder="Degree, Certificate"
                          value={profileForm.qualifications}
                          onChange={(e) => setProfileForm({ ...profileForm, qualifications: e.target.value })}
                          className="bg-white border-gray-300 text-gray-800 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certifications" className="text-gray-700 text-sm">Certifications (comma separated)</Label>
                      <Input
                        id="certifications"
                        placeholder="AWS Certified, Google Cloud Professional"
                        value={profileForm.certifications}
                        onChange={(e) => setProfileForm({ ...profileForm, certifications: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
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
                                <SelectItem value="id-document" className="text-sm">ID Document</SelectItem>
                                <SelectItem value="qualification" className="text-sm">Qualification</SelectItem>
                                <SelectItem value="certification" className="text-sm">Certification</SelectItem>
                                <SelectItem value="portfolio" className="text-sm">Portfolio</SelectItem>
                                <SelectItem value="other" className="text-sm">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-700 text-sm">Document Name</Label>
                            <Input
                              placeholder="e.g., South African ID"
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
                          onClick={handleDocumentUpload}
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
                            {profile.documents.map((doc: any) => (
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

            {activeTab === 'jobs' && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Available Jobs</CardTitle>
                  <CardDescription className="text-gray-600">
                    Browse and apply for open positions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableJobs.map((job: any) => {
                    const hasApplied = myApplications.some((a: any) => a.jobId === job.id);
                    return (
                      <Card key={job.id} className="bg-gray-50 border-gray-200">
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                            <div className="flex-1">
                              <h3 className="text-base sm:text-lg text-gray-800 mb-1">{job.title}</h3>
                              <p className="text-xs sm:text-sm text-gray-600 mb-2">{job.businessName}</p>
                              <p className="text-gray-700 mb-3 text-sm line-clamp-2">{job.description}</p>
                              <div className="flex gap-2 flex-wrap mb-3">
                                {job.requiredSkills.map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-gray-700 border-gray-300 text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                <span>Duration: {job.duration}</span>
                                <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:items-end gap-2">
                              <div className="text-lg sm:text-xl text-blue-600">{formatRands(job.budget)}</div>
                              {hasApplied ? (
                                <Badge variant="secondary" className="text-xs">Applied</Badge>
                              ) : (
                                <Button
                                  onClick={() => setApplicationModal({
                                    open: true,
                                    jobId: job.id,
                                    jobTitle: job.title,
                                    coverLetter: '',
                                    proposedRate: job.budget.toString(),
                                  })}
                                  className="bg-blue-400 hover:bg-blue-500 text-white text-sm w-full sm:w-auto"
                                >
                                  Apply Now
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {availableJobs.length === 0 && (
                    <p className="text-gray-600 text-center py-8 text-sm">No jobs available at the moment</p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'applications' && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">My Applications</CardTitle>
                  <CardDescription className="text-gray-600">
                    Track the status of your job applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Job Title</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Business</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Proposed Rate</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myApplications.map((app: any) => {
                        const job = jobs.find((j: any) => j.id === app.jobId);
                        return (
                          <TableRow key={app.id} className="border-gray-200">
                            <TableCell className="text-gray-800 text-xs sm:text-sm">{job?.title}</TableCell>
                            <TableCell className="text-gray-800 text-xs sm:text-sm">{job?.businessName}</TableCell>
                            <TableCell className="text-gray-800 text-xs sm:text-sm">{formatRands(app.proposedRate)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                app.status === 'accepted' ? 'default' :
                                app.status === 'rejected' ? 'destructive' :
                                'secondary'
                              } className="text-xs">
                                {app.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs sm:text-sm">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {myApplications.length === 0 && (
                    <p className="text-gray-600 text-center py-4 text-sm">No applications yet</p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'earnings' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-700 border-0">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
                        <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                        Available Balance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl text-white mb-4">{formatRands(availableBalance)}</div>
                      <Button
                        onClick={() => setWithdrawalModal({ open: true, amount: '', momoNumber: '' })}
                        className="bg-white text-blue-600 hover:bg-gray-100 w-full text-sm"
                        disabled={availableBalance < 50}
                      >
                        Withdraw to MOMO
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-700 text-sm sm:text-base">Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl text-green-600">{formatRands(totalEarnings)}</div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">Lifetime earnings</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-700 text-sm sm:text-base">Total Withdrawn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl text-gray-800">{formatRands(totalWithdrawn)}</div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">{myWithdrawals.length} withdrawals</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800 text-sm sm:text-base">Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200">
                          <TableHead className="text-gray-700 text-xs sm:text-sm">Description</TableHead>
                          <TableHead className="text-gray-700 text-xs sm:text-sm">Amount</TableHead>
                          <TableHead className="text-gray-700 text-xs sm:text-sm">Date</TableHead>
                          <TableHead className="text-gray-700 text-xs sm:text-sm">Transaction ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myPayments.map((payment: any) => (
                          <TableRow key={payment.id} className="border-gray-200">
                            <TableCell className="text-gray-800 text-xs sm:text-sm">{payment.description}</TableCell>
                            <TableCell className="text-green-600 text-xs sm:text-sm">{formatRands(payment.amount)}</TableCell>
                            <TableCell className="text-gray-600 text-xs sm:text-sm">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs">{payment.transactionId}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {myPayments.length === 0 && (
                      <p className="text-gray-600 text-center py-4 text-sm">No payments yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800 text-sm sm:text-base">Withdrawal History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200">
                          <TableHead className="text-gray-700 text-xs sm:text-sm">Amount</TableHead>
                          <TableHead className="text-gray-700 text-xs sm:text-sm">MOMO Number</TableHead>
                          <TableHead className="text-gray-700 text-xs sm:text-sm">Status</TableHead>
                          <TableHead className="text-gray-700 text-xs sm:text-sm">Date</TableHead>
                          <TableHead className="text-gray-700 text-xs sm:text-sm">Transaction ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myWithdrawals.map((withdrawal: any) => (
                          <TableRow key={withdrawal.id} className="border-gray-200">
                            <TableCell className="text-gray-800 text-xs sm:text-sm">{formatRands(withdrawal.amount)}</TableCell>
                            <TableCell className="text-gray-600 text-xs sm:text-sm">{withdrawal.momoNumber}</TableCell>
                            <TableCell>
                              <Badge variant="default" className="text-xs">{withdrawal.status}</Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs sm:text-sm">
                              {new Date(withdrawal.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs">{withdrawal.transactionId}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {myWithdrawals.length === 0 && (
                      <p className="text-gray-600 text-center py-4 text-sm">No withdrawals yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'learning' && (
              <div className="space-y-6">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Learning Resources</CardTitle>
                    <CardDescription className="text-gray-600">
                      Enhance your skills with our curated learning materials
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-gray-800 font-semibold text-sm">Web Development</h3>
                              <p className="text-gray-600 text-xs">HTML, CSS, JavaScript</p>
                            </div>
                          </div>
                          <p className="text-gray-700 text-xs mb-4">Learn the fundamentals of web development and build modern websites.</p>
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs w-full">
                            Start Learning
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-gray-800 font-semibold text-sm">React Framework</h3>
                              <p className="text-gray-600 text-xs">Modern JavaScript Library</p>
                            </div>
                          </div>
                          <p className="text-gray-700 text-xs mb-4">Master React and build interactive user interfaces.</p>
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white text-xs w-full">
                            Start Learning
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-gray-800 font-semibold text-sm">UI/UX Design</h3>
                              <p className="text-gray-600 text-xs">User Experience Design</p>
                            </div>
                          </div>
                          <p className="text-gray-700 text-xs mb-4">Learn design principles and create beautiful user experiences.</p>
                          <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white text-xs w-full">
                            Start Learning
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-gray-800 font-semibold text-sm">Business Skills</h3>
                              <p className="text-gray-600 text-xs">Entrepreneurship & Management</p>
                            </div>
                          </div>
                          <p className="text-gray-700 text-xs mb-4">Develop essential business skills for freelancers.</p>
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs w-full">
                            Start Learning
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-gray-800 font-semibold text-sm">Marketing</h3>
                              <p className="text-gray-600 text-xs">Digital Marketing Strategies</p>
                            </div>
                          </div>
                          <p className="text-gray-700 text-xs mb-4">Learn marketing techniques to grow your freelance business.</p>
                          <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white text-xs w-full">
                            Start Learning
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-gray-800 font-semibold text-sm">Project Management</h3>
                              <p className="text-gray-600 text-xs">Agile & Scrum</p>
                            </div>
                          </div>
                          <p className="text-gray-700 text-xs mb-4">Master project management methodologies.</p>
                          <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white text-xs w-full">
                            Start Learning
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg text-gray-800 mb-4">Recommended for You</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-gray-50 border-gray-200">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-gray-800 font-medium text-sm">Advanced React Patterns</h4>
                                <p className="text-gray-600 text-xs mb-2">Learn advanced React concepts and patterns</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full w-1/3"></div>
                                  </div>
                                  <span className="text-xs text-gray-600">33% complete</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-50 border-gray-200">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-gray-800 font-medium text-sm">Freelance Business Basics</h4>
                                <p className="text-gray-600 text-xs mb-2">Essential skills for running a freelance business</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full w-2/3"></div>
                                  </div>
                                  <span className="text-xs text-gray-600">67% complete</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800 text-sm sm:text-base">Notification Settings</CardTitle>
                    <CardDescription className="text-gray-600 text-xs sm:text-sm">
                      Manage your notification preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                        className="text-xs"
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
                        className="text-xs"
                      >
                        {settings.smsNotifications ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Job Alerts</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Get notified about new jobs</p>
                      </div>
                      <Button
                        variant={settings.jobAlerts ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, jobAlerts: !settings.jobAlerts });
                          toast.success('Settings updated');
                        }}
                        className="text-xs"
                      >
                        {settings.jobAlerts ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Payment Notifications</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Receive payment confirmations</p>
                      </div>
                      <Button
                        variant={settings.paymentNotifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, paymentNotifications: !settings.paymentNotifications });
                          toast.success('Settings updated');
                        }}
                        className="text-xs"
                      >
                        {settings.paymentNotifications ? 'On' : 'Off'}
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
                        className="text-xs"
                      >
                        {settings.marketingEmails ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">System Updates</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Platform maintenance notifications</p>
                      </div>
                      <Button
                        variant={settings.systemUpdates ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, systemUpdates: !settings.systemUpdates });
                          toast.success('Settings updated');
                        }}
                        className="text-xs"
                      >
                        {settings.systemUpdates ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Weekly Reports</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Earnings summaries</p>
                      </div>
                      <Button
                        variant={settings.weeklyReports ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, weeklyReports: !settings.weeklyReports });
                          toast.success('Settings updated');
                        }}
                        className="text-xs"
                      >
                        {settings.weeklyReports ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Profile Views</Label>
                        <p className="text-xs sm:text-sm text-gray-600">When businesses view your profile</p>
                      </div>
                      <Button
                        variant={settings.profileViews ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, profileViews: !settings.profileViews });
                          toast.success('Settings updated');
                        }}
                        className="text-xs"
                      >
                        {settings.profileViews ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800 text-sm sm:text-base">Privacy Settings</CardTitle>
                    <CardDescription className="text-gray-600 text-xs sm:text-sm">
                      Control your profile visibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Profile Visibility</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Who can see your profile</p>
                      </div>
                      <Select
                        value={settings.profileVisibility}
                        onValueChange={(value: 'public' | 'private') => {
                          setSettings({ ...settings, profileVisibility: value });
                          toast.success('Settings updated');
                        }}
                      >
                        <SelectTrigger className="w-24 bg-white border-gray-300 text-gray-800 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="public" className="text-gray-800 text-sm">Public</SelectItem>
                          <SelectItem value="private" className="text-gray-800 text-sm">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Language</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Select your preferred language</p>
                      </div>
                      <Select
                        value={settings.language}
                        onValueChange={(value) => {
                          setSettings({ ...settings, language: value });
                          toast.success('Settings updated');
                        }}
                      >
                        <SelectTrigger className="w-20 bg-white border-gray-300 text-gray-800 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="en" className="text-gray-800 text-sm">English</SelectItem>
                          <SelectItem value="af" className="text-gray-800 text-sm">Afrikaans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Timezone</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Select your timezone</p>
                      </div>
                      <Select
                        value={settings.timezone}
                        onValueChange={(value) => {
                          setSettings({ ...settings, timezone: value });
                          toast.success('Settings updated');
                        }}
                      >
                        <SelectTrigger className="w-32 bg-white border-gray-300 text-gray-800 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="Africa/Johannesburg" className="text-gray-800 text-sm">SAST (UTC+2)</SelectItem>
                          <SelectItem value="Africa/Cairo" className="text-gray-800 text-sm">EET (UTC+2)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <SettingsIcon className="w-5 h-5 text-blue-600" />
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
