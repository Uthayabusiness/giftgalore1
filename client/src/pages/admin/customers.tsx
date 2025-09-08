import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Users, Calendar, Mail, Phone, User, Eye, Filter, SortAsc, SortDesc, MapPin, Home, Building, Globe, Clock, Shield, UserCheck, UserX } from 'lucide-react';

interface Customer {
  _id: string;
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  profileImageUrl?: string;
  role: string;
  isActive: boolean;
  address?: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    apartment?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
    country?: string;
    phoneNumber?: string;
    alternativeNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function CustomersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/admin/customers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    },
    retry: false,
  });

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsDialogOpen(true);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredCustomers = customers
    .filter((customer: Customer) => {
      const matchesSearch = !searchQuery || 
        customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.mobileNumber.includes(searchQuery) ||
        (customer.userId && customer.userId.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesRole = !roleFilter || roleFilter === 'all' || customer.role === roleFilter;
      const matchesStatus = !statusFilter || statusFilter === 'all' || 
        (statusFilter === 'active' && customer.isActive) ||
        (statusFilter === 'inactive' && !customer.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a: Customer, b: Customer) => {
      let aValue: any = a[sortBy as keyof Customer];
      let bValue: any = b[sortBy as keyof Customer];
      
      if (sortBy === 'firstName' || sortBy === 'lastName') {
        aValue = `${a.firstName} ${a.lastName}`;
        bValue = `${b.firstName} ${b.lastName}`;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-3xl font-bold">Customers Management</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{filteredCustomers.length} of {customers.length} customers</span>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, mobile, or customer ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-customers"
                  />
                </div>
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40" data-testid="select-filter-role">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-filter-status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Registration Date</SelectItem>
                  <SelectItem value="firstName">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                data-testid="button-sort-order"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer: Customer) => (
                  <TableRow key={customer._id} data-testid={`customer-row-${customer._id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium" data-testid={`customer-name-${customer._id}`}>
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Customer ID: {customer.userId || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span data-testid={`customer-email-${customer._id}`}>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span data-testid={`customer-mobile-${customer._id}`}>{customer.mobileNumber}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={customer.role === 'admin' ? 'default' : 'secondary'}
                        data-testid={`customer-role-${customer._id}`}
                      >
                        {customer.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={customer.isActive ? 'default' : 'destructive'}
                        data-testid={`customer-status-${customer._id}`}
                      >
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`customer-date-${customer._id}`}>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewCustomer(customer)}
                        data-testid={`button-view-${customer._id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Details
              </DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-6">
                {/* Customer Header */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    {selectedCustomer.profileImageUrl ? (
                      <img
                        src={selectedCustomer.profileImageUrl}
                        alt={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h3>
                    <p className="text-muted-foreground">Customer ID: {selectedCustomer.userId || selectedCustomer._id}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={selectedCustomer.isActive ? "default" : "destructive"}>
                        {selectedCustomer.isActive ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        {selectedCustomer.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Email Address</p>
                            <p className="text-sm text-muted-foreground">{selectedCustomer.email || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Mobile Number</p>
                            <p className="text-sm text-muted-foreground">{selectedCustomer.mobileNumber || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Registration Date</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(selectedCustomer.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Last Updated</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(selectedCustomer.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                {selectedCustomer.address && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Address Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Address Name</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCustomer.address.firstName} {selectedCustomer.address.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Address Line 1</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCustomer.address.addressLine1 || 'Not provided'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Address Line 2</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCustomer.address.addressLine2 || 'Not provided'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Area/Apartment</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCustomer.address.apartment || 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">City</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCustomer.address.city || 'Not provided'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">District</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCustomer.address.district || 'Not provided'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">State</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCustomer.address.state || 'Not provided'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Pincode</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCustomer.address.pincode || 'Not provided'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Country</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCustomer.address.country || 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact Numbers */}
                      <div className="mt-6 pt-4 border-t">
                        <h4 className="text-sm font-medium mb-3">Contact Numbers</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Primary Phone</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCustomer.address.phoneNumber || 'Not provided'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Alternative Phone</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCustomer.address.alternativeNumber || 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Account Status</p>
                        <Badge variant={selectedCustomer.isActive ? "default" : "destructive"} className="mt-2">
                          {selectedCustomer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">User Role</p>
                        <Badge variant="secondary" className="mt-2">
                          {selectedCustomer.role}
                        </Badge>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
