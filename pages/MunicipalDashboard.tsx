import { useState } from 'react';
import { useAuth } from '../src/context/auth-context.tsx';
import { useData } from '../src/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
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
import { DollarSign, CheckCircle, XCircle, Send, LayoutDashboard, FileText, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import { formatRands } from '../src/utils/currency.ts';
import { toast } from 'sonner';

export function MunicipalDashboard() {
  const { user } = useAuth();
  const { fundingRequests, updateFundingRequest, createPayment, payments } = useData();

  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'funding-requests', label: 'Funding Requests', icon: DollarSign },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

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
      toast.success('Payment processed successfully!');
    }
  };

  const pendingRequests = fundingRequests.filter((r: any) => r.status === 'pending');
  const approvedRequests = fundingRequests.filter((r: any) => r.status === 'approved');
  const fundedRequests = fundingRequests.filter((r: any) => r.status === 'funded');
  const rejectedRequests = fundingRequests.filter((r: any) => r.status === 'rejected');

  const totalFundingApproved = approvedRequests.reduce((sum: number, r: any) => sum + r.amount, 0);
  const totalFundingPaid = fundedRequests.reduce((sum: number, r: any) => sum + r.amount, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Municipal Dashboard</h2>
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
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Pending Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-gray-800">{pendingRequests.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-green-600">{approvedRequests.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Total Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-blue-600">{formatRands(totalFundingApproved)}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Total Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-green-600">{formatRands(totalFundingPaid)}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-800 text-sm sm:text-base">Recent Funding Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {fundingRequests.slice(0, 5).map((request: any) => (
                        <div key={request.id} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-gray-800 text-sm sm:text-base truncate">{request.businessName}</div>
                              <div className="text-xs sm:text-sm text-gray-600 truncate">{request.purpose}</div>
                            </div>
                            <Badge variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'rejected' ? 'destructive' :
                              request.status === 'funded' ? 'secondary' :
                              'outline'
                            } className="text-xs ml-2">
                              {request.status}
                            </Badge>
                          </div>
                          <div className="text-blue-600 text-sm sm:text-base">{formatRands(request.amount)}</div>
                        </div>
                      ))}
                      {fundingRequests.length === 0 && (
                        <p className="text-gray-500 text-sm">No funding requests yet</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-800 text-sm sm:text-base">Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Total Payments Made</span>
                          <span className="text-gray-800 text-sm">{payments.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Total Amount Paid</span>
                          <span className="text-green-600 text-sm">{formatRands(totalFundingPaid)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Pending Payments</span>
                          <span className="text-orange-600 text-sm">{approvedRequests.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'funding-requests' && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Funding Requests</CardTitle>
                  <CardDescription className="text-gray-600">
                    Review and manage business funding requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Business</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Purpose</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fundingRequests.map((request: any) => (
                        <TableRow key={request.id} className="border-gray-200">
                          <TableCell className="text-gray-800 text-xs sm:text-sm">{request.businessName}</TableCell>
                          <TableCell className="text-gray-800 text-xs sm:text-sm">{formatRands(request.amount)}</TableCell>
                          <TableCell className="text-gray-600 text-xs sm:text-sm">{request.purpose}</TableCell>
                          <TableCell>
                            <Badge variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'rejected' ? 'destructive' :
                              request.status === 'funded' ? 'secondary' :
                              'outline'
                            } className="text-xs">
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 text-xs sm:text-sm">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {request.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(request.id)}
                                    className="bg-green-500 hover:bg-green-600 text-white text-xs"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(request.id)}
                                    className="text-xs"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {request.status === 'approved' && (
                                <Button
                                  size="sm"
                                  onClick={() => setPaymentModal({
                                    open: true,
                                    requestId: request.id,
                                    businessId: request.businessId,
                                    businessName: request.businessName,
                                    amount: request.amount,
                                  })}
                                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  Pay
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {fundingRequests.length === 0 && (
                    <p className="text-gray-600 text-center py-4 text-sm">No funding requests yet</p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'payments' && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Payment History</CardTitle>
                  <CardDescription className="text-gray-600">
                    View all funding payments made
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Business</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Description</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment: any) => (
                        <TableRow key={payment.id} className="border-gray-200">
                          <TableCell className="text-gray-800 text-xs sm:text-sm">
                            {payment.description.split('to ')[1] || 'Business'}
                          </TableCell>
                          <TableCell className="text-gray-800 text-xs sm:text-sm">{formatRands(payment.amount)}</TableCell>
                          <TableCell className="text-gray-600 text-xs sm:text-sm">{payment.description}</TableCell>
                          <TableCell className="text-gray-600 text-xs sm:text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="text-xs">{payment.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {payments.length === 0 && (
                    <p className="text-gray-600 text-center py-4 text-sm">No payments made yet</p>
                  )}
                </CardContent>
              </Card>
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
                        <Label className="text-gray-800 text-sm">Funding Request Alerts</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Get notified about new requests</p>
                      </div>
                      <Button
                        variant={settings.fundingRequestAlerts ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, fundingRequestAlerts: !settings.fundingRequestAlerts });
                          toast.success('Settings updated');
                        }}
                        className="text-xs"
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
                        className="text-xs"
                      >
                        {settings.paymentNotifications ? 'On' : 'Off'}
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
                        <p className="text-xs sm:text-sm text-gray-600">Funding activity summaries</p>
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
                        <SettingsIcon className="w-5 h-5 text-red-500" />
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
