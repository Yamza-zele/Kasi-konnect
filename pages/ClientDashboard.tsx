import { useState, useEffect } from 'react';
import { useAuth } from '../src/context/auth-context.tsx';
import { useData } from '../src/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

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
import { Plus, Settings as SettingsIcon, Search, Star, LayoutDashboard, Briefcase, Users, FileText, User } from 'lucide-react';
import { formatRands } from '../src/utils/currency.ts';
import { ClientProfile, ServiceOrder, FreelancerProfile } from '../lib/types.ts';
import { toast } from 'sonner';

export function ClientDashboard() {
  const { user } = useAuth();
  const {
    clientProfiles,
    getClientProfile,
    updateClientProfile,
    createClientProfile,
    freelancerProfiles,
    serviceOrders,
    createServiceOrder,
    updateServiceOrder,
  } = useData();

  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal state
  const [freelancerModal, setFreelancerModal] = useState({
    open: false,
    freelancer: null as any,
  });
  const [orderModal, setOrderModal] = useState({
    open: false,
    order: null as any,
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    location: '',
    phone: '',
    preferences: '',
    budgetRange: '',
  });

  // Service order form state
  const [orderForm, setOrderForm] = useState({
    freelancerId: '',
    serviceType: '',
    description: '',
    budget: '',
    deadline: '',
    requirements: '',
  });



  // Search and filter state
  const [freelancerSearch, setFreelancerSearch] = useState('');
  const [freelancerFilter, setFreelancerFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    freelancerMessages: true,
    marketingEmails: true,
    paymentNotifications: true,
    systemUpdates: false,
    weeklyReports: false,
    profileVisibility: 'public' as 'public' | 'private',
    language: 'en',
    timezone: 'Africa/Johannesburg',
  });



  useEffect(() => {
    if (user) {
      const userProfile = getClientProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        setProfileForm({
          fullName: userProfile.fullName,
          location: userProfile.location,
          phone: userProfile.phone,
          preferences: userProfile.preferences.join(', '),
          budgetRange: userProfile.budgetRange,
        });
      }
    }
  }, [user, clientProfiles]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      if (profile) {
        updateClientProfile(user.id, {
          ...profileForm,
          preferences: profileForm.preferences.split(',').map(p => p.trim()),
        });
        toast.success('Profile updated successfully!');
      } else {
        createClientProfile({
          userId: user.id,
          ...profileForm,
          preferences: profileForm.preferences.split(',').map(p => p.trim()),
        });
        toast.success('Profile created successfully!');
      }
    }
  };

  const handleCreateServiceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && orderForm.freelancerId) {
      const freelancer = freelancerProfiles.find(f => f.userId === orderForm.freelancerId);
      if (freelancer) {
        createServiceOrder({
          clientId: user.id,
          freelancerId: orderForm.freelancerId,
          freelancerName: freelancer.userId, // Using userId as name for now
          serviceType: orderForm.serviceType,
          description: orderForm.description,
          budget: parseFloat(orderForm.budget),
          status: 'pending',
          requirements: orderForm.requirements.split(',').map(r => r.trim()),
          deadline: orderForm.deadline,
        });
        setOrderForm({
          freelancerId: '',
          serviceType: '',
          description: '',
          budget: '',
          deadline: '',
          requirements: '',
        });
        toast.success('Service order created successfully!');
      }
    }
  };

  const handleViewFreelancerProfile = (freelancerId: string) => {
    const freelancer = freelancerProfiles.find(f => f.userId === freelancerId);
    if (freelancer) {
      setFreelancerModal({ open: true, freelancer });
    }
  };

  const handleViewOrderDetails = (orderId: string) => {
    const order = serviceOrders.find(o => o.id === orderId);
    if (order) {
      setOrderModal({ open: true, order });
    }
  };

  const handleCancelOrder = (orderId: string) => {
    updateServiceOrder(orderId, { status: 'cancelled' });
    toast.success('Order cancelled successfully!');
  };

  // Filter freelancers based on search and category
  const filteredFreelancers = freelancerProfiles.filter((freelancer: FreelancerProfile) => {
    const matchesSearch = freelancer.bio.toLowerCase().includes(freelancerSearch.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(freelancerSearch.toLowerCase())) ||
                         freelancer.category.toLowerCase().includes(freelancerSearch.toLowerCase());
    const matchesFilter = freelancerFilter === 'all' || freelancer.category === freelancerFilter;
    return matchesSearch && matchesFilter;
  });

  // Get client's orders
  const myOrders = serviceOrders.filter((order: ServiceOrder) => order.clientId === user?.id);

  // Filter orders
  const filteredOrders = myOrders.filter((order: ServiceOrder) => {
    if (orderFilter === 'all') return true;
    return order.status === orderFilter;
  });

  // Calculate stats
  const activeOrders = myOrders.filter(o => o.status === 'in-progress' || o.status === 'pending').length;
  const completedOrders = myOrders.filter(o => o.status === 'completed').length;
  const totalSpent = myOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.budget, 0);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'freelancers', label: 'Freelancers', icon: Users },
    { id: 'orders', label: 'Orders', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Client Dashboard</h2>
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
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Active Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-gray-800">{activeOrders}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Completed Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-green-500">{completedOrders}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Total Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-blue-500">{formatRands(totalSpent)}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm text-gray-600">Available Freelancers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl text-gray-800">{freelancerProfiles.length}</div>
                    </CardContent>
                  </Card>
                </div>

                {!profile && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <p className="text-blue-600 mb-2">Complete your client profile to get started!</p>
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
                      <CardTitle className="text-gray-800 text-sm sm:text-base">Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {myOrders.slice(0, 3).map((order: ServiceOrder) => (
                        <div key={order.id} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-gray-800 text-sm sm:text-base truncate">{order.serviceType}</div>
                              <div className="text-xs sm:text-sm text-gray-600">{order.freelancerName}</div>
                            </div>
                            <Badge variant={
                              order.status === 'completed' ? 'default' :
                              order.status === 'in-progress' ? 'default' :
                              order.status === 'cancelled' ? 'destructive' :
                              'secondary'
                            } className="text-xs ml-2">
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-xs sm:text-sm text-blue-500">{formatRands(order.budget)}</div>
                        </div>
                      ))}
                      {myOrders.length === 0 && (
                        <p className="text-gray-500 text-sm">No orders yet</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-800 text-sm sm:text-base">Top Rated Freelancers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {freelancerProfiles
                        .sort((a, b) => b.rating - a.rating)
                        .slice(0, 3)
                        .map((freelancer: FreelancerProfile) => (
                        <div key={freelancer.userId} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-gray-800 text-sm sm:text-base truncate">{freelancer.userId}</div>
                              <div className="text-xs sm:text-sm text-gray-600">{freelancer.category}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-600">{freelancer.rating}</span>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-blue-500">{formatRands(freelancer.hourlyRate)}/hr</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Browse Services</CardTitle>
                  <CardDescription className="text-gray-600">
                    Find and hire freelancers for your projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 text-sm">Search Freelancers</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search by skills, category, or description..."
                          value={freelancerSearch}
                          onChange={(e) => setFreelancerSearch(e.target.value)}
                          className="pl-10 bg-white border-gray-300 text-gray-800 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 text-sm">Filter by Category</Label>
                      <Select value={freelancerFilter} onValueChange={setFreelancerFilter}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Design & Development">Design & Development</SelectItem>
                          <SelectItem value="Writing & Content">Writing & Content</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Photography & Video">Photography & Video</SelectItem>
                          <SelectItem value="Software Development">Software Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFreelancers.map((freelancer: FreelancerProfile) => (
                      <Card key={freelancer.userId} className="bg-gray-50 border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold text-lg">
                                {freelancer.bio.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-gray-800 font-semibold text-sm truncate">{freelancer.userId}</h3>
                              <p className="text-gray-600 text-xs">{freelancer.category}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{freelancer.rating} ({freelancer.reviewCount} reviews)</span>
                          </div>

                          <p className="text-gray-600 text-xs mb-3 line-clamp-2">{freelancer.bio}</p>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {freelancer.skills.slice(0, 3).map((skill: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs text-gray-700 border-gray-300">
                                {skill}
                              </Badge>
                            ))}
                            {freelancer.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                                +{freelancer.skills.length - 3}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="text-blue-600 font-bold text-sm">{formatRands(freelancer.hourlyRate)}/hr</div>
                            <Button
                              size="sm"
                              onClick={() => handleViewFreelancerProfile(freelancer.userId)}
                              className="bg-blue-400 hover:bg-blue-500 text-white text-xs"
                            >
                              View Profile
                            </Button>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => {
                              setOrderForm({ ...orderForm, freelancerId: freelancer.userId });
                              setActiveTab('orders');
                            }}
                            className="w-full bg-green-500 hover:bg-green-600 text-white text-xs"
                          >
                            Hire Now
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredFreelancers.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No freelancers found matching your criteria.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'freelancers' && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Freelancer Directory</CardTitle>
                  <CardDescription className="text-gray-600">
                    Detailed view of all available freelancers
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Freelancer</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Category</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Rating</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Rate</TableHead>
                        <TableHead className="text-gray-700 text-xs sm:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {freelancerProfiles.map((freelancer: FreelancerProfile) => (
                        <TableRow key={freelancer.userId} className="border-gray-200">
                          <TableCell className="text-gray-800 text-xs sm:text-sm">
                            <div>
                              <div className="font-medium">{freelancer.userId}</div>
                              <div className="text-gray-600 text-xs">{freelancer.bio.substring(0, 50)}...</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-800 text-xs sm:text-sm">{freelancer.category}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs">{freelancer.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-800 text-xs sm:text-sm">{formatRands(freelancer.hourlyRate)}/hr</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewFreelancerProfile(freelancer.userId)}
                                className="text-xs"
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setOrderForm({ ...orderForm, freelancerId: freelancer.userId });
                                  setActiveTab('orders');
                                }}
                                className="bg-blue-400 hover:bg-blue-500 text-white text-xs"
                              >
                                Hire
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Create Service Order</CardTitle>
                    <CardDescription className="text-gray-600">
                      Hire a freelancer for your project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <form onSubmit={handleCreateServiceOrder} className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="freelancer" className="text-gray-700 text-sm">Select Freelancer</Label>
                          <Select
                            value={orderForm.freelancerId}
                            onValueChange={(value) => setOrderForm({ ...orderForm, freelancerId: value })}
                          >
                            <SelectTrigger className="bg-white border-gray-300 text-gray-800 text-sm">
                              <SelectValue placeholder="Choose a freelancer" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
                              {freelancerProfiles.map((freelancer: FreelancerProfile) => (
                                <SelectItem key={freelancer.userId} value={freelancer.userId} className="text-gray-800 text-sm">
                                  {freelancer.userId} - {freelancer.category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="serviceType" className="text-gray-700 text-sm">Service Type</Label>
                          <Input
                            id="serviceType"
                            placeholder="e.g., Logo Design, Website Development"
                            value={orderForm.serviceType}
                            onChange={(e) => setOrderForm({ ...orderForm, serviceType: e.target.value })}
                            className="bg-white border-gray-300 text-gray-800 text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="orderDescription" className="text-gray-700 text-sm">Project Description</Label>
                        <Textarea
                          id="orderDescription"
                          placeholder="Describe your project requirements..."
                          value={orderForm.description}
                          onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                          className="bg-white border-gray-300 text-gray-800 min-h-[100px] sm:min-h-[120px] text-sm"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="budget" className="text-gray-700 text-sm">Budget (ZAR)</Label>
                          <Input
                            id="budget"
                            type="number"
                            placeholder="5000"
                            value={orderForm.budget}
                            onChange={(e) => setOrderForm({ ...orderForm, budget: e.target.value })}
                            className="bg-white border-gray-300 text-gray-800 text-sm"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="deadline" className="text-gray-700 text-sm">Deadline</Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={orderForm.deadline}
                            onChange={(e) => setOrderForm({ ...orderForm, deadline: e.target.value })}
                            className="bg-white border-gray-300 text-gray-800 text-sm"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="requirements" className="text-gray-700 text-sm">Requirements (comma separated)</Label>
                          <Input
                            id="requirements"
                            placeholder="Responsive design, SEO optimized"
                            value={orderForm.requirements}
                            onChange={(e) => setOrderForm({ ...orderForm, requirements: e.target.value })}
                            className="bg-white border-gray-300 text-gray-800 text-sm"
                          />
                        </div>
                      </div>

                      <Button type="submit" className="bg-blue-400 hover:bg-blue-500 text-white text-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Order
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800">My Service Orders</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={orderFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOrderFilter('all')}
                        className="text-xs"
                      >
                        All
                      </Button>
                      <Button
                        variant={orderFilter === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOrderFilter('pending')}
                        className="text-xs"
                      >
                        Pending
                      </Button>
                      <Button
                        variant={orderFilter === 'in-progress' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOrderFilter('in-progress')}
                        className="text-xs"
                      >
                        In Progress
                      </Button>
                      <Button
                        variant={orderFilter === 'completed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOrderFilter('completed')}
                        className="text-xs"
                      >
                        Completed
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {filteredOrders.map((order: ServiceOrder) => (
                      <Card key={order.id} className="bg-gray-50 border-gray-200">
                        <CardContent className="pt-4 sm:pt-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg text-gray-800 mb-1">{order.serviceType}</h3>
                              <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{order.description}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-gray-600 text-xs">Freelancer:</span>
                                <span className="text-gray-800 text-sm font-medium">{order.freelancerName}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:gap-4 text-xs sm:text-sm text-gray-600 gap-1">
                                <span>Deadline: {new Date(order.deadline).toLocaleDateString()}</span>
                                <span>Created: {new Date(order.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="text-right sm:ml-4 flex-shrink-0">
                              <div className="text-base sm:text-lg text-blue-500 mb-1">{formatRands(order.budget)}</div>
                              <Badge variant={
                                order.status === 'completed' ? 'default' :
                                order.status === 'in-progress' ? 'default' :
                                order.status === 'cancelled' ? 'destructive' :
                                'secondary'
                              } className="text-xs">
                                {order.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewOrderDetails(order.id)}
                              className="text-xs"
                            >
                              View Details
                            </Button>
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelOrder(order.id)}
                                className="border-red-500 text-red-500 hover:bg-red-50 text-xs"
                              >
                                Cancel Order
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewFreelancerProfile(order.freelancerId)}
                              className="text-xs"
                            >
                              View Freelancer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredOrders.length === 0 && (
                      <p className="text-slate-400 text-center py-4">
                        {orderFilter === 'all' ? 'No service orders yet' : `No ${orderFilter} orders`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'profile' && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-800">Client Profile</CardTitle>
                  <CardDescription className="text-gray-600">
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-700 text-sm">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          className="bg-white border-gray-300 text-gray-800 text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 text-sm">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="bg-white border-gray-300 text-gray-800 text-sm"
                          required
                        />
                      </div>
                    </div>

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
                      <Label htmlFor="preferences" className="text-gray-700 text-sm">Service Preferences (comma separated)</Label>
                      <Input
                        id="preferences"
                        placeholder="Design & Development, Marketing, Writing & Content"
                        value={profileForm.preferences}
                        onChange={(e) => setProfileForm({ ...profileForm, preferences: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budgetRange" className="text-gray-700 text-sm">Budget Range</Label>
                      <Select
                        value={profileForm.budgetRange}
                        onValueChange={(value) => setProfileForm({ ...profileForm, budgetRange: value })}
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800 text-sm">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="1000-5000" className="text-gray-800 text-sm">R1,000 - R5,000</SelectItem>
                          <SelectItem value="5000-10000" className="text-gray-800 text-sm">R5,000 - R10,000</SelectItem>
                          <SelectItem value="10000-25000" className="text-gray-800 text-sm">R10,000 - R25,000</SelectItem>
                          <SelectItem value="25000-50000" className="text-gray-800 text-sm">R25,000 - R50,000</SelectItem>
                          <SelectItem value="50000+" className="text-gray-800 text-sm">R50,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="bg-blue-400 hover:bg-blue-500 text-white text-sm">
                      Save Profile
                    </Button>
                  </form>
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
                        <Label className="text-gray-800 text-sm">SMS Notifications</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Receive updates via SMS</p>
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
                        <Label className="text-gray-800 text-sm">Order Updates</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Get notified about order status changes</p>
                      </div>
                      <Button
                        variant={settings.orderUpdates ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, orderUpdates: !settings.orderUpdates });
                          toast.success('Settings updated');
                        }}
                        className={`text-xs ${settings.orderUpdates ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        {settings.orderUpdates ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Freelancer Messages</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Receive messages from freelancers</p>
                      </div>
                      <Button
                        variant={settings.freelancerMessages ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSettings({ ...settings, freelancerMessages: !settings.freelancerMessages });
                          toast.success('Settings updated');
                        }}
                        className={`text-xs ${settings.freelancerMessages ? 'bg-blue-500 hover:bg-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      >
                        {settings.freelancerMessages ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Marketing Emails</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Receive promotional emails</p>
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
                        <p className="text-xs sm:text-sm text-gray-600">Get notified about payments</p>
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
                        <p className="text-xs sm:text-sm text-gray-600">Receive system maintenance notifications</p>
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
                        <p className="text-xs sm:text-sm text-gray-600">Receive weekly activity reports</p>
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

                {/* Profile Settings */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800 text-sm sm:text-base">Profile Settings</CardTitle>
                    <CardDescription className="text-gray-600 text-xs sm:text-sm">
                      Manage your profile visibility and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Label className="text-gray-800 text-sm">Profile Visibility</Label>
                        <p className="text-xs sm:text-sm text-gray-600">Control who can see your profile</p>
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
