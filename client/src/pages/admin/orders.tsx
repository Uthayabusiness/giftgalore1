import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Search, Filter, Eye, Edit, Calendar, MapPin, Phone, Mail, History, User, Clock, CheckCircle, XCircle, Package, Truck, Loader2, Database } from 'lucide-react';

export default function AdminOrders() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState<any[]>([]);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [statusUpdateNotes, setStatusUpdateNotes] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, authLoading, user, toast]);

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }) => {
      console.log('🔧 Client: Making API request:', { orderId, status, notes });
      const response = await apiRequest('PUT', `/api/orders/${orderId}/status`, { status, notes });
      console.log('🔧 Client: Raw response:', response);
      console.log('🔧 Client: Response status:', response.status);
      console.log('🔧 Client: Response headers:', response.headers);
      const jsonData = await response.json();
      console.log('🔧 Client: Parsed JSON:', jsonData);
      return jsonData;
    },
    onSuccess: (updatedOrder: any) => {
      console.log('🔧 Client: Status update success, server response:', updatedOrder);
      console.log('🔧 Client: Updated order status:', updatedOrder.status, 'Type:', typeof updatedOrder.status);
      console.log('🔧 Client: Full response keys:', Object.keys(updatedOrder));
      
      // Update the selectedOrder state with the updated order data immediately
      if (selectedOrder && updatedOrder) {
        setSelectedOrder((prevOrder: any) => ({
          ...prevOrder,
          status: updatedOrder.status,
          updatedAt: updatedOrder.updatedAt,
          additionalInfo: updatedOrder.additionalInfo
        }));
      }
      
      // Clear the notes field
      setStatusUpdateNotes('');
      
      // Invalidate queries but don't refetch immediately to avoid race conditions
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
      // Note: Tracking history will be refreshed when the dialog is reopened
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  const updateAdditionalInfoMutation = useMutation({
    mutationFn: async ({ orderId, additionalInfo }: { orderId: string; additionalInfo: string }) => {
      const response = await apiRequest('PUT', `/api/orders/${orderId}/additional-info`, { additionalInfo });
      return await response.json();
    },
    onSuccess: (updatedOrder: any) => {
      // Update the selectedOrder state with the updated order data immediately
      if (selectedOrder && updatedOrder) {
        setSelectedOrder((prevOrder: any) => ({
          ...prevOrder,
          additionalInfo: updatedOrder.additionalInfo,
          updatedAt: updatedOrder.updatedAt
        }));
      }
      
      // Clear the additional info field
      setAdditionalInfo('');
      
      // Invalidate queries but don't refetch immediately to avoid race conditions
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      toast({
        title: "Additional Information Updated",
        description: "Order additional information has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update additional information.",
        variant: "destructive",
      });
    },
  });

  const clearAdditionalInfoMutation = useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      console.log('🔧 clearAdditionalInfoMutation: Making DELETE request to:', `/api/orders/${orderId}/additional-info`);
      const response = await apiRequest('DELETE', `/api/orders/${orderId}/additional-info`);
      console.log('🔧 clearAdditionalInfoMutation: Response received:', response);
      const jsonData = await response.json();
      console.log('🔧 clearAdditionalInfoMutation: Parsed JSON:', jsonData);
      return jsonData;
    },
    onSuccess: (updatedOrder: any) => {
      // Update the selectedOrder state with the updated order data immediately
      if (selectedOrder && updatedOrder) {
        setSelectedOrder((prevOrder: any) => ({
          ...prevOrder,
          additionalInfo: undefined,
          updatedAt: updatedOrder.updatedAt
        }));
      }
      
      // Clear the additional info field
      setAdditionalInfo('');
      
      // Invalidate queries but don't refetch immediately to avoid race conditions
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      toast({
        title: "Additional Information Cleared",
        description: "Order additional information has been cleared successfully.",
      });
      
      // Close the reset dialog
      setIsResetDialogOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to clear additional information.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    // Handle numeric status codes that might have been stored incorrectly
    if (status === '200') {
      status = 'confirmed';
    }
    
    switch (status) {
      case 'order_placed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'processing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'shipped':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleViewOrder = (order: any) => {
    console.log('handleViewOrder called with order:', order);
    console.log('Order ID fields:', { id: order.id, _id: order._id });
    console.log('Order status:', order.status, 'Type:', typeof order.status);
    console.log('Order total:', order.total, 'Type:', typeof order.total);
    console.log('Order createdAt:', order.createdAt, 'Type:', typeof order.createdAt);
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (orderId: string, status: string) => {
    console.log('handleUpdateStatus called with:', { orderId, status, selectedOrder });
    console.log('Status type:', typeof status, 'Status value:', status);
    
    // Prevent multiple rapid updates
    if (updateOrderStatusMutation.isPending) {
      console.log('Update already in progress, ignoring request');
      return;
    }
    
    if (!orderId || orderId === 'undefined') {
      console.error('Invalid orderId:', orderId);
      toast({
        title: "Error",
        description: "Invalid order ID. Please try again.",
        variant: "destructive",
      });
      return;
    }
    updateOrderStatusMutation.mutate({ orderId, status, notes: statusUpdateNotes });
  };

  const handleUpdateAdditionalInfo = (orderId: string) => {
    console.log('handleUpdateAdditionalInfo called with:', { orderId, selectedOrder });
    
    // Prevent multiple rapid updates
    if (updateAdditionalInfoMutation.isPending) {
      console.log('Additional info update already in progress, ignoring request');
      return;
    }
    
    if (!orderId || orderId === 'undefined') {
      console.error('Invalid orderId:', orderId);
      toast({
        title: "Error",
        description: "Invalid order ID. Please try again.",
        variant: "destructive",
      });
      return;
    }
    if (additionalInfo.trim()) {
      updateAdditionalInfoMutation.mutate({ orderId, additionalInfo: additionalInfo.trim() });
    }
  };

  const handleClearAdditionalInfo = (orderId: string) => {
    console.log('🔧 handleClearAdditionalInfo called with:', { orderId, selectedOrder });
    console.log('🔧 Order ID type:', typeof orderId, 'Value:', orderId);
    console.log('🔧 Selected order:', selectedOrder);
    
    // Prevent multiple rapid updates
    if (clearAdditionalInfoMutation.isPending) {
      console.log('🔧 Clear additional info already in progress, ignoring request');
      return;
    }
    
    if (!orderId || orderId === 'undefined') {
      console.error('❌ Invalid orderId:', orderId);
      toast({
        title: "Error",
        description: "Invalid order ID. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('🔧 Calling clearAdditionalInfoMutation with orderId:', orderId);
    clearAdditionalInfoMutation.mutate({ orderId });
  };

  const handleViewTrackingHistory = async (orderId: string) => {
    try {
      console.log('Fetching tracking history for order:', orderId);
      console.log('Current cookies:', document.cookie);
      
      // Use fetch directly with credentials to ensure authentication
      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is HTML (authentication redirect)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('Received HTML response instead of JSON - likely authentication issue');
        throw new Error('Authentication required. Please log in again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const history = await response.json();
      console.log('Tracking history received:', history);
      setTrackingHistory(history);
      setIsTrackingDialogOpen(true);
    } catch (error) {
      console.error('Error fetching tracking history:', error);
      
      // Handle authentication errors specifically
      if ((error as Error).message.includes('Authentication required') || (error as Error).message.includes('Unexpected token')) {
        // Try to get the current order data to show real tracking history
        console.log('Authentication failed, trying to get order data for tracking history');
        
        // Find the current order in the orders list
        const currentOrder = (orders as any[]).find((order: any) => order.id === orderId || order._id === orderId);
        
        if (currentOrder) {
          // Create tracking history based on current order status
          const trackingHistory = [
            {
              status: 'pending',
              previousStatus: undefined,
              updatedByName: 'System',
              timestamp: new Date(currentOrder.createdAt).toISOString(),
              notes: 'Order created and pending confirmation',
              additionalInfo: currentOrder.additionalInfo
            }
          ];
          
          // Add current status if it's not pending
          if (currentOrder.status !== 'pending') {
            trackingHistory.push({
              status: currentOrder.status,
              previousStatus: 'pending',
              updatedByName: 'Admin',
              timestamp: new Date(currentOrder.updatedAt || currentOrder.createdAt).toISOString(),
              notes: `Order status updated to ${currentOrder.status}`,
              additionalInfo: currentOrder.additionalInfo
            } as any);
          }
          
          setTrackingHistory(trackingHistory);
          setIsTrackingDialogOpen(true);
          
          toast({
            title: "Tracking History",
            description: "Showing current order status (authentication issue detected)",
            variant: "default",
          });
        } else {
          toast({
            title: "Error",
            description: "Could not find order data for tracking history",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to fetch tracking history: ${(error as Error).message}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleMigrateOrders = async () => {
    try {
      toast({
        title: "Migration Started",
        description: "Populating existing orders with item details...",
      });
      
      const response = await fetch('/api/orders/migrate-items', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Migration Complete",
          description: `Successfully populated ${data.migratedCount} orders with item details.`,
        });
        // Refresh the orders data
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      } else {
        throw new Error(data.message || 'Migration failed');
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Migration Failed",
        description: "Failed to populate order items. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = (orders as any[]).filter((order: any) => {
    const matchesSearch = !searchQuery || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-3xl font-bold">Orders Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleMigrateOrders} 
              variant="outline" 
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              <Database className="h-4 w-4 mr-2" />
              Populate Order Items
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{filteredOrders.length} of {(orders as any[]).length} orders</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order number or customer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-orders"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48" data-testid="select-filter-status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="order_placed">Order Placed</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order: any) => (
                  <TableRow key={order.id || order._id} data-testid={`order-row-${order.id || order._id || 'unknown'}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium" data-testid={`order-number-${order.id || order._id || 'unknown'}`}>
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {order.id ? order.id.slice(0, 8) : order._id ? order._id.slice(0, 8) : 'N/A'}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium" data-testid={`customer-name-${order.id || order._id || 'unknown'}`}>
                          {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.shippingAddress?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`order-items-count-${order.id || order._id || 'unknown'}`}>
                      {order.items?.length || 0} items
                    </TableCell>
                    <TableCell>
                                              <span className="font-semibold" data-testid={`order-total-${order.id || order._id || 'unknown'}`}>
                          ₹{parseFloat(order.total).toLocaleString()}
                        </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(status) => handleUpdateStatus(order.id || order._id, status)}
                        disabled={updateOrderStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-32" data-testid={`select-status-${order.id || order._id || 'unknown'}`}>
                          <SelectValue>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="order_placed">Order Placed</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell data-testid={`order-date-${order.id || order._id || 'unknown'}`}>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                                              <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          data-testid={`button-view-order-${order.id || order._id || 'unknown'}`}
                        >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTrackingHistory(order.id || order._id)}
                          data-testid={`button-tracking-${order.id || order._id || 'unknown'}`}
                        >
                          <History className="h-4 w-4 mr-2" />
                          Track
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {(orders as any[]).length === 0 ? 'No orders found' : 'No orders match your filters'}
                </h3>
                <p className="text-muted-foreground">
                  {(orders as any[]).length === 0 
                    ? 'Orders will appear here when customers place them'
                    : 'Try adjusting your search criteria'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Details - {selectedOrder?.orderNumber}
              </DialogTitle>
              <DialogDescription>
                Complete order information and customer details
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Status</div>
                      <Badge className={getStatusColor(selectedOrder.status)} data-testid="dialog-order-status">
                        {(() => {
                          let status = String(selectedOrder.status || '');
                          console.log('Displaying status:', status, 'Original:', selectedOrder.status);
                          
                          // Handle numeric status codes that might have been stored incorrectly
                          if (status === '200') {
                            status = 'confirmed'; // Default to confirmed for 200 status code
                          }
                          
                          return status.charAt(0).toUpperCase() + status.slice(1);
                        })()}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="text-lg font-semibold" data-testid="dialog-order-total">
                        ₹{parseFloat(selectedOrder.total).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Order Date</div>
                      <div className="font-medium" data-testid="dialog-order-date">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Status Update Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Update Order Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="status-select">New Status</Label>
                        <Select
                          value={selectedOrder.status}
                          onValueChange={(status) => handleUpdateStatus(selectedOrder.id || selectedOrder._id, status)}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue>
                              <Badge className={getStatusColor(selectedOrder.status)}>
                                {(() => {
                                  let status = String(selectedOrder.status || '');
                                  
                                  // Handle numeric status codes that might have been stored incorrectly
                                  if (status === '200') {
                                    status = 'confirmed'; // Default to confirmed for 200 status code
                                  }
                                  
                                  return status.charAt(0).toUpperCase() + status.slice(1);
                                })()}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="order_placed">Order Placed</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status-notes">Notes (Optional)</Label>
                        <Textarea
                          id="status-notes"
                          value={statusUpdateNotes}
                          onChange={(e) => setStatusUpdateNotes(e.target.value)}
                          placeholder="Add notes about this status update..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTrackingHistory(selectedOrder.id || selectedOrder._id)}
                        >
                          <History className="h-4 w-4 mr-2" />
                          View Tracking History
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Additional Information (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="additional-info">Customer Communication</Label>
                        <Textarea
                          id="additional-info"
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                          placeholder="Send additional information to customer (e.g., 'We are packing, will ship tomorrow due to huge orders')"
                          className="mt-1"
                          rows={3}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          This message will be shown to customers when they track their order
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateAdditionalInfo(selectedOrder.id || selectedOrder._id)}
                          disabled={updateAdditionalInfoMutation.isPending || !additionalInfo.trim()}
                          size="sm"
                        >
                          {updateAdditionalInfoMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            'Update Additional Info'
                          )}
                        </Button>
                        {selectedOrder.additionalInfo && (
                          <Button
                            variant="outline"
                            onClick={() => setIsResetDialogOpen(true)}
                            disabled={clearAdditionalInfoMutation.isPending}
                            size="sm"
                          >
                            {clearAdditionalInfoMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Clearing...
                              </>
                            ) : (
                              'Reset'
                            )}
                          </Button>
                        )}
                      </div>
                      {selectedOrder.additionalInfo && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium mb-1">Current Additional Information:</div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {selectedOrder.additionalInfo.message}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last updated: {new Date(selectedOrder.additionalInfo.updatedAt).toLocaleString()} by {selectedOrder.additionalInfo.updatedBy}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="font-medium" data-testid="dialog-customer-name">
                        {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}
                      </div>
                      
                      {/* Complete Address Display */}
                      {selectedOrder.shippingAddress?.addressLine1 && (
                        <div className="text-sm text-muted-foreground">
                          {selectedOrder.shippingAddress.addressLine1}
                        </div>
                      )}
                      
                      {selectedOrder.shippingAddress?.addressLine2 && (
                        <div className="text-sm text-muted-foreground">
                          {selectedOrder.shippingAddress.addressLine2}
                        </div>
                      )}
                      
                      {selectedOrder.shippingAddress?.apartment && (
                        <div className="text-sm text-muted-foreground">
                          {selectedOrder.shippingAddress.apartment}
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        {selectedOrder.shippingAddress?.city}
                        {selectedOrder.shippingAddress?.district && `, ${selectedOrder.shippingAddress.district}`}
                        {selectedOrder.shippingAddress?.state && `, ${selectedOrder.shippingAddress.state}`}
                        {selectedOrder.shippingAddress?.pincode && ` ${selectedOrder.shippingAddress.pincode}`}
                      </div>
                      
                      {selectedOrder.shippingAddress?.country && (
                        <div className="text-sm text-muted-foreground">
                          {selectedOrder.shippingAddress.country}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3" />
                        {selectedOrder.shippingAddress?.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        {selectedOrder.shippingAddress?.email}
                      </div>
                      
                      {selectedOrder.shippingAddress?.specialInstructions && (
                        <div className="mt-3 p-2 bg-muted rounded text-sm">
                          <strong>Special Instructions:</strong> {selectedOrder.shippingAddress.specialInstructions}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Items ({selectedOrder.items?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedOrder.items?.map((item: any, index: number) => (
                          <div key={index} className="flex gap-3 p-3 border rounded-lg" data-testid={`dialog-item-${index}`}>
                            <img
                              src={item.productImage || '/placeholder-image.jpg'}
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium" data-testid={`dialog-item-name-${index}`}>
                                {item.productName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                              <p className="text-sm font-semibold" data-testid={`dialog-item-price-${index}`}>
                                ₹{parseFloat(item.price).toLocaleString()} each
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold" data-testid={`dialog-item-total-${index}`}>
                                ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Services */}
                {(selectedOrder.shippingAddress?.giftWrap || selectedOrder.shippingAddress?.expressDelivery) && (
                  <>
                    <Separator />
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Additional Services</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-4">
                          {selectedOrder.shippingAddress?.giftWrap && (
                            <Badge variant="secondary">Gift Wrap</Badge>
                          )}
                          {selectedOrder.shippingAddress?.expressDelivery && (
                            <Badge variant="secondary">Express Delivery</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Payment Information */}
                <Separator />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Payment ID</div>
                        <div className="font-mono text-sm" data-testid="dialog-payment-id">
                          {selectedOrder.paymentId || 'Pending'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Payment Status</div>
                        <Badge variant={selectedOrder.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                          {selectedOrder.paymentStatus || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailsDialogOpen(false)}
                data-testid="button-close-dialog"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Order Tracking History Dialog */}
        <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Order Tracking History
              </DialogTitle>
              <DialogDescription>
                Complete tracking history and status updates for this order
              </DialogDescription>
            </DialogHeader>

            {trackingHistory.length > 0 ? (
              <div className="space-y-4">
                {trackingHistory.map((entry, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            entry.status === 'delivered' ? 'bg-green-100 text-green-600' :
                            entry.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                            entry.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                            entry.status === 'processing' ? 'bg-purple-100 text-purple-600' :
                            entry.status === 'confirmed' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {entry.status === 'delivered' ? <CheckCircle className="h-4 w-4" /> :
                             entry.status === 'cancelled' ? <XCircle className="h-4 w-4" /> :
                             entry.status === 'shipped' ? <Truck className="h-4 w-4" /> :
                             entry.status === 'processing' ? <Package className="h-4 w-4" /> :
                             <Clock className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getStatusColor(entry.status)}>
                                {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                              </Badge>
                              {entry.previousStatus && (
                                <span className="text-sm text-muted-foreground">
                                  from {entry.previousStatus.charAt(0).toUpperCase() + entry.previousStatus.slice(1)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {entry.updatedByName}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(entry.timestamp).toLocaleString()}
                              </div>
                            </div>
                            {entry.notes && (
                              <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                                <strong>Notes:</strong> {entry.notes}
                              </div>
                            )}
                            {entry.additionalInfo && entry.additionalInfo.message && (
                              <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <strong className="text-blue-800">Additional Information:</strong>
                                </div>
                                <div className="text-blue-700 mb-1">
                                  {entry.additionalInfo.message}
                                </div>
                                <div className="text-xs text-blue-600">
                                  Updated: {new Date(entry.additionalInfo.updatedAt).toLocaleString()} by {entry.additionalInfo.updatedBy}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tracking history</h3>
                <p className="text-muted-foreground">This order doesn't have any tracking history yet.</p>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsTrackingDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Additional Information Confirmation Dialog */}
        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Reset Additional Information
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to clear the additional information for this order? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">Current Information:</span>
                </div>
                <p className="text-yellow-700 mt-2 text-sm">
                  {selectedOrder?.additionalInfo?.message || 'No additional information'}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsResetDialogOpen(false)}
                disabled={clearAdditionalInfoMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedOrder?._id) {
                    handleClearAdditionalInfo(selectedOrder._id);
                  }
                }}
                disabled={clearAdditionalInfoMutation.isPending}
              >
                {clearAdditionalInfoMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  'Clear Information'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
