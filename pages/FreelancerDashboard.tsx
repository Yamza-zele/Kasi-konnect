import { useState, useEffect } from 'react';
import { useAuth } from '../src/context/auth-context.tsx';
import { useData } from '../src/context/data-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Wallet, Star, Send, Upload, FileText, Trash2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl text-gray-800 mb-2">Freelancer Dashboard</h1>
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
            <TabsTrigger value="jobs" className="data-[state=active]:bg-gray-100 text-xs sm:text-sm">
              Browse Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-gray-100 text-xs sm:text-sm">
              Applications
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-gray-100 text-xs sm:text-sm">
              Earnings
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-100 text-xs sm:text-sm">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
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
          </TabsContent>

          {/* Browse Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
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
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
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
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4 sm:space-y-6">
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
                      <Label className="text-gray-800 text-sm">Job Alerts</Label>
                      <p className="text-xs sm:text-sm text-gray-600">Get notified of new job opportunities</p>
                    </div>
                    <Button
                      variant={settings.jobAlerts ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSettings({ ...settings, jobAlerts: !settings.jobAlerts });
                        toast.success('Settings updated');
                      }}
                      className={`text-xs ${settings.jobAlerts ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
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
                      className={`text-xs ${settings.paymentNotifications ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
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
                      className={`text-xs ${settings.marketingEmails ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      {settings.marketingEmails ? 'On' : 'Off'}
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
                      <p className="text-xs sm:text-sm text-gray-600">Receive weekly earnings summaries</p>
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

                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <Label className="text-gray-800 text-sm">Profile Views</Label>
                      <p className="text-xs sm:text-sm text-gray-600">Get notified when businesses view your profile</p>
                    </div>
                    <Button
                      variant={settings.profileViews ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSettings({ ...settings, profileViews: !settings.profileViews });
                        toast.success('Settings updated');
                      }}
                      className={`text-xs ${settings.profileViews ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      {settings.profileViews ? 'On' : 'Off'}
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
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-800 text-sm">Profile Visibility</Label>
                    <Select
                      value={settings.profileVisibility}
                      onValueChange={(value: 'public' | 'private') => {
                        setSettings({ ...settings, profileVisibility: value });
                        toast.success('Profile visibility updated');
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-800 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public" className="text-sm">Public</SelectItem>
                        <SelectItem value="private" className="text-sm">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Control who can see your freelancer profile
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-800 text-sm">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => {
                        setSettings({ ...settings, language: value });
                        toast.success('Language updated');
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-800 text-sm">
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

                  <div className="space-y-2">
                    <Label className="text-gray-800 text-sm">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => {
                        setSettings({ ...settings, timezone: value });
                        toast.success('Timezone updated');
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-800 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Johannesburg" className="text-sm">South Africa (SAST)</SelectItem>
                        <SelectItem value="Africa/Cairo" className="text-sm">Egypt (EET)</SelectItem>
                        <SelectItem value="Africa/Lagos" className="text-sm">Nigeria (WAT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 text-sm">
                      Change Password
                    </Button>
                  </div>

                  <div>
                    <Button variant="destructive" className="w-full text-sm">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Modal */}
      <Dialog open={applicationModal.open} onOpenChange={(open) => setApplicationModal({ ...applicationModal, open })}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Apply for Job</DialogTitle>
            <DialogDescription className="text-gray-600">
              {applicationModal.jobTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Cover Letter</Label>
              <Textarea
                placeholder="Explain why you're a good fit for this job..."
                value={applicationModal.coverLetter}
                onChange={(e) => setApplicationModal({ ...applicationModal, coverLetter: e.target.value })}
                className="bg-white border-gray-300 text-gray-800 min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Proposed Rate (ZAR)</Label>
              <Input
                type="number"
                value={applicationModal.proposedRate}
                onChange={(e) => setApplicationModal({ ...applicationModal, proposedRate: e.target.value })}
                className="bg-white border-gray-300 text-gray-800"
              />
            </div>
            <Button 
              onClick={handleApplyForJob} 
              className="w-full bg-blue-400 hover:bg-blue-500 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Modal */}
      <Dialog open={withdrawalModal.open} onOpenChange={(open) => setWithdrawalModal({ ...withdrawalModal, open })}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Withdraw to MOMO</DialogTitle>
            <DialogDescription className="text-gray-600">
              Withdraw your earnings to your MOMO mobile wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Available Balance</div>
              <div className="text-2xl text-gray-800">{formatRands(availableBalance)}</div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">MOMO Number</Label>
              <Input
                placeholder="27XXXXXXXXX"
                value={withdrawalModal.momoNumber}
                onChange={(e) => setWithdrawalModal({ ...withdrawalModal, momoNumber: e.target.value })}
                className="bg-white border-gray-300 text-gray-800"
              />
              <p className="text-xs text-gray-600">Format: 27 followed by 9 digits</p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Amount (ZAR)</Label>
              <Input
                type="number"
                placeholder="Minimum: 50.00"
                value={withdrawalModal.amount}
                onChange={(e) => setWithdrawalModal({ ...withdrawalModal, amount: e.target.value })}
                className="bg-white border-gray-300 text-gray-800"
              />
              <p className="text-xs text-gray-600">Minimum withdrawal: R 50.00</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Processing Fee: Free</div>
              <div className="text-lg text-gray-800">
                You will receive: {formatRands(parseFloat(withdrawalModal.amount || '0'))}
              </div>
            </div>

            <Button 
              onClick={handleWithdrawal} 
              className="w-full bg-blue-400 hover:bg-blue-500 text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Withdraw Funds
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
