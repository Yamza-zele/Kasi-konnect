import { useState } from 'react';
import { useAuth } from '../src/context/auth-context.tsx';
import { useData } from '../src/context/data-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Settings as SettingsIcon } from 'lucide-react';

import { DollarSign, CheckCircle, XCircle, Send } from 'lucide-react';
import { formatRands } from '../src/utils/currency.ts';
import { toast } from 'sonner';

export function MunicipalDashboard() {
  const { user } = useAuth();
  const { fundingRequests, updateFundingRequest, createPayment, payments } = useData();

  const [activeTab, setActiveTab] = useState('overview');
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    requestId: '',
    businessId: '',
    businessName: '',
    amount: 0,
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    fundingRequestAlerts: true,
    paymentNotifications: true,
    systemUpdates: false,
    weeklyReports: false,
    profileVisibility: 'public' as 'public' | 'private',
    language: 'en',
    timezone: 'Africa/Johannesburg',
  });

  const handleApprove = (requestId: string) => {
    updateFundingRequest(requestId, { status: 'approved' });
    toast.success('Funding request approved!');
  };

  const handleReject = (requestId: string) => {
    updateFundingRequest(requestId, { status: 'rejected' });
    toast.error('Funding request rejected');
  };

  const handlePayment = () => {
    if (user && paymentModal.requestId && paymentModal.businessId) {
      createPayment({
        fromUserId: user.id,
        toUserId: paymentModal.businessId,
        amount: paymentModal.amount,
        type: 'funding',
        status: 'completed',
        description: `Funding payment to ${paymentModal.businessName}`,
      });
      updateFundingRequest(paymentModal.requestId, { status: 'funded' });
      setPaymentModal({ open: false, requestId: '', businessId: '', businessName: '', amount: 0 });
      toast.success(`Payment of ${formatRands(paymentModal.amount)} sent to ${paymentModal.businessName}!`);
    }
  };

  const pendingRequests = fundingRequests.filter((r: any) => r.status === 'pending');
  const approvedRequests = fundingRequests.filter((r: any) => r.status === 'approved');
  const fundedRequests = fundingRequests.filter((r: any) => r.status === 'funded');

  const totalFunded = fundedRequests.reduce((sum: number, r: any) => sum + r.amount, 0);
  const totalApproved = approvedRequests.reduce((sum: number, r: any) => sum + r.amount, 0);
  const totalPending = pendingRequests.reduce((sum: number, r: any) => sum + r.amount, 0);

  // Group funding by industry
  const fundingByIndustry = fundedRequests.reduce((acc: Record<string, number>, request: any) => {
    const industry = request.industry;
    acc[industry] = (acc[industry] || 0) + request.amount;
    return acc;
  }, {} as Record<string, number>);

  const myPayments = payments.filter((p: any) => p.fromUserId === user?.id && p.type === 'funding');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl text-gray-800 mb-2">Municipal Dashboard</h1>
          <p className="text-gray-600">City of Tshwane - Funding Management</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border-gray-200 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 w-full">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-gray-100 text-xs sm:text-sm">
              Funding Requests
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Total Funded</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-green-600">{formatRands(totalFunded)}</div>
                  <p className="text-xs text-gray-600 mt-1">{fundedRequests.length} businesses</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Approved Pending Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-blue-600">{formatRands(totalApproved)}</div>
                  <p className="text-xs text-gray-600 mt-1">{approvedRequests.length} requests</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-yellow-600">{formatRands(totalPending)}</div>
                  <p className="text-xs text-gray-600 mt-1">{pendingRequests.length} requests</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Total Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-gray-800">{myPayments.length}</div>
                  <p className="text-xs text-gray-600 mt-1">Transactions</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Funding by Industry</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(fundingByIndustry).map(([industry, amount]) => (
                    <div key={industry} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                      <div className="flex justify-between items-center">
                        <div className="text-gray-800">{industry}</div>
                        <div className="text-blue-600">{formatRands(amount as number)}</div>
                      </div>
                    </div>
                  ))}
                  {Object.keys(fundingByIndustry).length === 0 && (
                    <p className="text-gray-600 text-sm">No funding distributed yet</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingRequests.slice(0, 5).map((request: any) => (
                    <div key={request.id} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-gray-800">{request.businessName}</div>
                          <div className="text-sm text-gray-600">{request.purpose}</div>
                        </div>
                        <div className="text-blue-600">{formatRands(request.amount)}</div>
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length === 0 && (
                    <p className="text-gray-600 text-sm">No pending requests</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <DollarSign className="w-12 h-12 text-white" />
                  <div>
                    <h3 className="text-xl text-white mb-1">
                      {pendingRequests.length} requests awaiting review
                    </h3>
                    <p className="text-blue-100">
                      Review and approve funding requests to support local businesses
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab('requests')}
                    className="ml-auto bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Review Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Funding Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {/* Pending Requests */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Pending Requests</CardTitle>
                <CardDescription className="text-gray-600">
                  Review and approve or reject funding requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingRequests.map((request: any) => (
                  <Card key={request.id} className="bg-gray-50 border-gray-200">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg text-gray-800 mb-1">{request.businessName}</h3>
                          <div className="flex gap-2 items-center mb-2">
                            <Badge variant="outline" className="text-gray-700 border-gray-300">
                              {request.industry}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mb-3">
                            <div className="text-gray-700 mb-1">Purpose: {request.purpose}</div>
                            <p className="text-sm text-gray-600">{request.description}</p>
                          </div>
                          <div className="text-xl text-blue-600">
                            Requested Amount: {formatRands(request.amount)}
                          </div>
                        </div>
                        <div className="ml-4 flex gap-2">
                          <Button
                            onClick={() => handleApprove(request.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(request.id)}
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pendingRequests.length === 0 && (
                  <p className="text-gray-600 text-center py-8">No pending requests</p>
                )}
              </CardContent>
            </Card>

            {/* Approved Requests */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Approved Requests (Pending Payment)</CardTitle>
                <CardDescription className="text-gray-600">
                  Process payments for approved funding requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-700">Business</TableHead>
                      <TableHead className="text-gray-700">Purpose</TableHead>
                      <TableHead className="text-gray-700">Industry</TableHead>
                      <TableHead className="text-gray-700">Amount</TableHead>
                      <TableHead className="text-gray-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedRequests.map((request: any) => (
                      <TableRow key={request.id} className="border-gray-200">
                        <TableCell className="text-gray-800">{request.businessName}</TableCell>
                        <TableCell className="text-gray-800">{request.purpose}</TableCell>
                        <TableCell className="text-gray-600">{request.industry}</TableCell>
                        <TableCell className="text-blue-600">{formatRands(request.amount)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => setPaymentModal({
                              open: true,
                              requestId: request.id,
                              businessId: request.businessId,
                              businessName: request.businessName,
                              amount: request.amount,
                            })}
                            className="bg-blue-400 hover:bg-blue-500 text-white"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Pay
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {approvedRequests.length === 0 && (
                  <p className="text-gray-600 text-center py-4">No approved requests pending payment</p>
                )}
              </CardContent>
            </Card>

            {/* All Requests */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">All Funding Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-700">Business</TableHead>
                      <TableHead className="text-gray-700">Purpose</TableHead>
                      <TableHead className="text-gray-700">Industry</TableHead>
                      <TableHead className="text-gray-700">Amount</TableHead>
                      <TableHead className="text-gray-700">Status</TableHead>
                      <TableHead className="text-gray-700">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fundingRequests.map((request: any) => (
                      <TableRow key={request.id} className="border-gray-200">
                        <TableCell className="text-gray-800">{request.businessName}</TableCell>
                        <TableCell className="text-gray-800">{request.purpose}</TableCell>
                        <TableCell className="text-gray-600">{request.industry}</TableCell>
                        <TableCell className="text-gray-800">{formatRands(request.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            request.status === 'approved' || request.status === 'funded' ? 'default' :
                            request.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Payment History</CardTitle>
                <CardDescription className="text-gray-600">
                  All funding payments processed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-700 text-xs sm:text-sm">Business</TableHead>
                      <TableHead className="text-gray-700 text-xs sm:text-sm">Description</TableHead>
                      <TableHead className="text-gray-700 text-xs sm:text-sm">Amount</TableHead>
                      <TableHead className="text-gray-700 text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-gray-700 text-xs sm:text-sm">Date</TableHead>
                      <TableHead className="text-gray-700 text-xs sm:text-sm">Transaction ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myPayments.map((payment: any) => (
                      <TableRow key={payment.id} className="border-gray-200">
                        <TableCell className="text-gray-800 text-xs sm:text-sm">
                          {payment.description.replace('Funding payment to ', '')}
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs sm:text-sm">{payment.description}</TableCell>
                        <TableCell className="text-green-600 text-xs sm:text-sm">{formatRands(payment.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="text-xs">{payment.status}</Badge>
                        </TableCell>
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
                      <Label className="text-gray-800 text-sm">Funding Request Alerts</Label>
                      <p className="text-xs sm:text-sm text-gray-600">Get notified of new funding requests</p>
                    </div>
                    <Button
                      variant={settings.fundingRequestAlerts ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSettings({ ...settings, fundingRequestAlerts: !settings.fundingRequestAlerts });
                        toast.success('Settings updated');
                      }}
                      className={`text-xs ${settings.fundingRequestAlerts ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      {settings.fundingRequestAlerts ? 'On' : 'Off'}
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
                      <p className="text-xs sm:text-sm text-gray-600">Receive weekly funding summaries</p>
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
                      Control who can see your municipal profile
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

      {/* Payment Modal */}
      <Dialog open={paymentModal.open} onOpenChange={(open) => setPaymentModal({ ...paymentModal, open })}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Process Funding Payment</DialogTitle>
            <DialogDescription className="text-gray-600">
              Send funding to {paymentModal.businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Payment Details</div>
              <div className="text-lg text-gray-800 mb-2">Business: {paymentModal.businessName}</div>
              <div className="text-2xl text-blue-600">Amount: {formatRands(paymentModal.amount)}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Payment will be processed via MOMO gateway</div>
              <div className="text-sm text-gray-700">
                This payment will be marked as completed and the funding request will be updated to "funded" status.
              </div>
            </div>
            <Button 
              onClick={handlePayment} 
              className="w-full bg-blue-400 hover:bg-blue-500 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Process Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
