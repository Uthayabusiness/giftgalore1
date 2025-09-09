import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import AdminLayout from '@/components/admin/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Gift,
  History,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Truck,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Mutation to clear all orders
  const clearAllOrdersMutation = useMutation({
    mutationFn: async () => {
      console.log('🚀 Attempting to clear all orders...');
      console.log('👤 Current user:', user);
      console.log('👤 User role:', user?.role);
      console.log('🔐 Is authenticated:', isAuthenticated);
      
      const response = await fetch('/api/orders/clear-all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to clear orders: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Success response:', result);
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Orders Cleared",
        description: `Successfully deleted ${data.deletedCount} orders`,
      });
      // Refetch stats to update the dashboard
      window.location.reload();
    },
    onError: (error) => {
      console.error('❌ Clear orders error:', error);
      toast({
        title: "Error",
        description: `Failed to clear orders: ${error.message}`,
        variant: "destructive",
      });
    },
  });

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

  const { data: stats, isLoading: statsLoading, error } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      // Mock data for dashboard - in real app this would be an API call
      return {
        totalOrders: 156,
        totalRevenue: 45600,
        totalProducts: 89,
        totalUsers: 234,
        recentOrders: [
          { id: '1', orderNumber: 'ORD-001', total: 1299, status: 'confirmed', date: '2024-01-15' },
          { id: '2', orderNumber: 'ORD-002', total: 2450, status: 'shipped', date: '2024-01-14' },
          { id: '3', orderNumber: 'ORD-003', total: 899, status: 'delivered', date: '2024-01-13' },
          { id: '4', orderNumber: 'ORD-004', total: 3200, status: 'processing', date: '2024-01-12' },
          { id: '5', orderNumber: 'ORD-005', total: 1650, status: 'pending', date: '2024-01-11' },
        ],
        monthlyRevenue: [
          { month: 'Jan', revenue: 45600, orders: 156 },
          { month: 'Dec', revenue: 38200, orders: 134 },
          { month: 'Nov', revenue: 42100, orders: 145 },
          { month: 'Oct', revenue: 39800, orders: 128 },
          { month: 'Sep', revenue: 44300, orders: 152 },
          { month: 'Aug', revenue: 41200, orders: 139 },
        ],
        categoryDistribution: [
          { name: 'Birthday', value: 35, color: '#8B5CF6' },
          { name: 'Anniversary', value: 25, color: '#F59E0B' },
          { name: 'Wedding', value: 20, color: '#EF4444' },
          { name: 'Corporate', value: 15, color: '#10B981' },
          { name: 'Others', value: 5, color: '#6B7280' },
        ],
        topProducts: [
          { name: 'Diamond Necklace', sales: 45, revenue: 58500 },
          { name: 'Premium Watch', sales: 32, revenue: 79800 },
          { name: 'Photo Frame', sales: 67, revenue: 12030 },
          { name: 'Gift Hamper', sales: 23, revenue: 34500 },
        ],
      };
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const { data: recentUpdates = [], isLoading: updatesLoading } = useQuery({
    queryKey: ['/api/orders/tracking/recent'],
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

  if (authLoading || statsLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-muted rounded-lg"></div>
            <div className="h-80 bg-muted rounded-lg"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'processing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'shipped':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="card-total-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">
                ₹{stats?.totalRevenue?.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% from last month
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-orders">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-orders">
                {stats?.totalOrders}
              </div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2% from last month
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-products">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-products">
                {stats?.totalProducts}
              </div>
              <div className="flex items-center text-xs text-red-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2.1% from last month
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-users">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-users">
                {stats?.totalUsers}
              </div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15.3% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Order Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Order Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {updatesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading updates...</p>
              </div>
            ) : (recentUpdates as any[])?.length > 0 ? (
              <div className="space-y-3">
                {(recentUpdates as any[]).slice(0, 5).map((update: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      update.status === 'delivered' ? 'bg-green-100 text-green-600' :
                      update.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      update.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                      update.status === 'processing' ? 'bg-purple-100 text-purple-600' :
                      update.status === 'confirmed' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {update.status === 'delivered' ? <CheckCircle className="h-4 w-4" /> :
                       update.status === 'cancelled' ? <XCircle className="h-4 w-4" /> :
                       update.status === 'shipped' ? <Truck className="h-4 w-4" /> :
                       update.status === 'processing' ? <Package className="h-4 w-4" /> :
                       <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {update.orderNumber}
                        </Badge>
                        <Badge className={`text-xs ${
                          update.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          update.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          update.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          update.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                          update.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                        </Badge>
                        {update.previousStatus && (
                          <span className="text-xs text-muted-foreground">
                            from {update.previousStatus.charAt(0).toUpperCase() + update.previousStatus.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {update.updatedByName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(update.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {update.notes && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {update.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recent updates</h3>
                <p className="text-muted-foreground">No order status updates have been made recently.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {stats?.categoryDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentOrders?.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`recent-order-${order.id}`}>
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{order.total.toLocaleString()}</p>
                      <Badge className={getStatusColor(order.status)} data-testid={`order-status-${order.id}`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Top Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topProducts?.map((product: any, index: number) => (
                  <div key={index} className="space-y-2" data-testid={`top-product-${index}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {product.sales} sales
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Progress 
                        value={(product.sales / 70) * 100} 
                        className="flex-1 mr-4" 
                      />
                      <span className="font-bold text-sm">
                        ₹{product.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Manage Products</h3>
                <p className="text-sm text-muted-foreground mb-3">Add, edit, or remove products</p>
                <a 
                  href="/admin/products" 
                  className="text-primary hover:underline text-sm"
                  data-testid="link-manage-products"
                >
                  Go to Products
                </a>
              </div>
              
              <div className="p-4 border rounded-lg text-center">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Process Orders</h3>
                <p className="text-sm text-muted-foreground mb-3">View and update order status</p>
                <a 
                  href="/admin/orders" 
                  className="text-primary hover:underline text-sm"
                  data-testid="link-process-orders"
                >
                  Go to Orders
                </a>
              </div>
              
              <div className="p-4 border rounded-lg text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">View Analytics</h3>
                <p className="text-sm text-muted-foreground mb-3">Detailed sales reports</p>
                <span className="text-muted-foreground text-sm">Coming Soon</span>
              </div>

              <div className="p-4 border rounded-lg text-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete ALL orders? This action cannot be undone.')) {
                      clearAllOrdersMutation.mutate();
                    }
                  }}
                  disabled={clearAllOrdersMutation.isPending}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {clearAllOrdersMutation.isPending ? 'Deleting...' : 'Clear All Orders'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
