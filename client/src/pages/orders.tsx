import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { apiRequest } from '@/lib/queryClient';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Calendar, MapPin, CreditCard, Eye, Gift, ArrowLeft, Search, Filter, Download, Truck, Clock, CheckCircle, XCircle, AlertCircle, Star, Shield, Clock3, PackageCheck, Phone, Mail, Home, Building, Globe, FileText, User, ChevronRight, TrendingUp, Copy, Info } from 'lucide-react';

export default function Orders() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const { data: orders = [], isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      console.log('🔄 Cancelling order with ID:', orderId);
      console.log('🔄 API URL:', `/api/orders/${orderId}/cancel`);
      return await apiRequest('DELETE', `/api/orders/${orderId}/cancel`);
    },
    onSuccess: (data: any) => {
      const { restoredItems = 0, skippedItems = 0 } = data;
      let description = "Your order has been cancelled successfully.";
      
      if (restoredItems > 0) {
        description += ` ${restoredItems} item(s) have been restored to your cart.`;
      }
      
      if (skippedItems > 0) {
        description += ` ${skippedItems} item(s) could not be restored (products no longer available).`;
      }
      
      toast({
        title: "Order Cancelled",
        description: description,
        variant: "default",
      });
      // Refresh orders and cart data
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: any) => {
      console.log('🚨 Cancellation error details:', {
        error,
        status: error.status,
        response: error.response,
        message: error.message
      });
      
      let errorMessage = "Failed to cancel order. Please try again.";
      
      // Check for 403 status in different possible locations
      if (error.status === 403 || error.response?.status === 403) {
        errorMessage = "Access denied. This order belongs to a different user account. Please log in with the correct account.";
      } else if (error.status === 404 || error.response?.status === 404) {
        errorMessage = "Order not found. It may have been already cancelled or deleted.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Cancellation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Initiate payment mutation
  const initiatePaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      console.log('💳 Initiating payment for order ID:', orderId);
      console.log('💳 API URL:', `/api/orders/${orderId}/initiate-payment`);
      return await apiRequest('POST', `/api/orders/${orderId}/initiate-payment`);
    },
    onSuccess: (data: any) => {
      console.log('✅ Payment initiated successfully:', data);
      
      // Redirect to Cashfree payment page
      if (data.paymentSessionId) {
        toast({
          title: "Payment Initiated",
          description: "Redirecting to payment gateway...",
          variant: "default",
        });
        
        // Use Cashfree JavaScript SDK for payment initiation (required for v3)
        const sessionId = data.paymentSessionId;

        console.log('🔗 Payment Session ID:', sessionId);
        console.log('📝 Using Cashfree JavaScript SDK for payment initiation...');

        const initiatePayment = () => {
          try {
            console.log('🚀 Initializing Cashfree payment with SDK...');
            
            // Initialize Cashfree with PRODUCTION mode
            const cashfree = new window.Cashfree({
              mode: 'PRODUCTION'
            });

            // Initiate payment using the SDK with correct callback-based method signature
            cashfree.pay({
              paymentSessionId: sessionId,
              onSuccess: function(data) {
                console.log('✅ Payment success:', data);
                toast({
                  title: "Payment Successful",
                  description: "Your payment has been processed successfully!",
                });
                // Redirect to orders page
                window.location.href = '/orders';
              },
              onFailure: function(err) {
                console.error('❌ Payment failed:', err);
                toast({
                  title: "Payment Failed",
                  description: "Payment could not be completed. Please try again.",
                  variant: "destructive",
                });
              }
            });

          } catch (error) {
            console.error('❌ Error initializing payment:', error);
            toast({
              title: "Payment Error",
              description: "Failed to initialize payment. Please try again.",
              variant: "destructive",
            });
          }
        };

        // Load Cashfree SDK if not already loaded
        if (!window.Cashfree) {
          console.log('📦 Loading Cashfree SDK...');
          const script = document.createElement('script');
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          script.onload = () => {
            console.log('✅ Cashfree SDK loaded successfully');
            initiatePayment();
          };
          script.onerror = () => {
            console.error('❌ Failed to load Cashfree SDK');
            toast({
              title: "Payment Error",
              description: "Failed to load payment system. Please try again.",
              variant: "destructive",
            });
          };
          document.head.appendChild(script);
        } else {
          initiatePayment();
        }
      } else {
        toast({
          title: "Payment Initiation Failed",
          description: "No payment session ID received",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.log('🚨 Payment initiation error details:', {
        error,
        status: error.status,
        response: error.response,
        message: error.message
      });
      
      let errorMessage = "Failed to initiate payment. Please try again.";
      
      if (error.status === 404 || error.response?.status === 404) {
        errorMessage = "Order not found. It may have been already processed.";
      } else if (error.status === 400 || error.response?.status === 400) {
        if (error.response?.data?.expired) {
          errorMessage = "Payment session has expired. Order has been automatically cancelled.";
          // Refresh orders to show updated status
          queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        } else {
          errorMessage = error.response?.data?.message || "Order cannot be processed. Please check the order status.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Payment Initiation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Countdown timer for pending orders
  useEffect(() => {
    const pendingOrder = orders.find(order => order.status === 'pending');
    
    if (pendingOrder && pendingOrder.paymentInitiatedAt) {
      const startTime = new Date(pendingOrder.paymentInitiatedAt).getTime();
      const timeoutMinutes = 30;
      const endTime = startTime + (timeoutMinutes * 60 * 1000);
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        
        setTimeRemaining(remaining);
        setIsExpired(remaining <= 0);
        
        if (remaining <= 0) {
          // Order expired, refresh orders
          queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        }
      };
      
      updateTimer(); // Initial update
      const interval = setInterval(updateTimer, 1000); // Update every second
      
      return () => clearInterval(interval);
    } else {
      setTimeRemaining(0);
      setIsExpired(false);
    }
  }, [orders, queryClient]);

  // Format time remaining for display
  const formatTimeRemaining = (milliseconds: number) => {
    if (milliseconds <= 0) return '00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Debug logging to see what orders data we're receiving
  useEffect(() => {
    if (orders && orders.length > 0) {
      console.log('📦 Orders received:', orders);
      orders.forEach((order, index) => {
        console.log(`Order ${index + 1}:`, {
          orderNumber: order.orderNumber,
          total: order.total,
          hasItems: !!order.items,
          itemsCount: order.items?.length || 0,
          items: order.items
        });
      });
    }
  }, [orders]);

  // Check for orders requiring attention and show notification
  useEffect(() => {
    const ordersNeedingAttention = orders.filter((order: any) => 
      ['pending', 'confirmed', 'processing'].includes(order.status)
    );
    if (ordersNeedingAttention.length > 0) {
      toast({
        title: "Orders Require Attention",
        description: `You have ${ordersNeedingAttention.length} order(s) that need attention. Please complete payment or cancel to place new orders.`,
        variant: "default",
        duration: 8000,
      });
    }
  }, [orders, toast]);

  // Get orders that need attention (pending, confirmed, processing) - exclude draft orders
  const pendingOrders = orders.filter((order: any) => 
    ['pending', 'confirmed', 'processing'].includes(order.status)
  );

  // Handle unauthorized errors at page level
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  // Handle query errors
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <PackageCheck className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'In Progress';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Tracking helper functions
  const getTrackingSteps = (status: string) => {
    const steps = [
      {
        title: 'Order Placed',
        description: 'Your order has been successfully placed',
        completed: true,
        date: 'Order Date'
      },
      {
        title: 'Order Confirmed',
        description: 'Payment received and order confirmed',
        completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(status),
        date: status === 'confirmed' ? 'Just now' : undefined
      },
      {
        title: 'Processing',
        description: 'Your order is being prepared for shipment',
        completed: ['processing', 'shipped', 'delivered'].includes(status),
        date: status === 'processing' ? 'In progress' : undefined
      },
      {
        title: 'Shipped',
        description: 'Your order is on its way to you',
        completed: ['shipped', 'delivered'].includes(status),
        date: status === 'shipped' ? 'On the way' : undefined
      },
      {
        title: 'Delivered',
        description: 'Your order has been successfully delivered',
        completed: status === 'delivered',
        date: status === 'delivered' ? 'Delivered' : undefined
      }
    ];

    if (status === 'cancelled') {
      return [
        {
          title: 'Order Cancelled',
          description: 'This order has been cancelled',
          completed: true,
          date: 'Cancelled'
        }
      ];
    }

    return steps;
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending':
        return 20;
      case 'confirmed':
        return 40;
      case 'processing':
        return 60;
      case 'shipped':
        return 80;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  

  const handleDownloadInvoice = (order: any) => {
    // TODO: Implement invoice download
    toast({
      title: "Download Invoice",
      description: "Invoice download will be available soon!",
    });
  };

  // Filter and sort orders
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = searchQuery === '' || 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item: any) => 
        item.productName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a: any, b: any) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'total':
        return parseFloat(b.total) - parseFloat(a.total);
      case 'total-asc':
        return parseFloat(a.total) - parseFloat(b.total);
      default:
        return 0;
    }
  });

  // Enhanced Order Card Component with Full Product Details
  const OrderCard = ({ order, onViewDetails }: any) => (
    <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-white to-gray-50/30">
      <CardContent className="p-6">
        {/* Order Header with Enhanced Status */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Badge className={`${getStatusColor(order.status)} text-sm px-4 py-2 shadow-md`}>
                {getStatusIcon(order.status)}
                <span className="ml-2 font-semibold">{getStatusText(order.status)}</span>
              </Badge>
              {/* Status indicator dot */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                order.status === 'delivered' ? 'bg-green-400' :
                order.status === 'cancelled' ? 'bg-red-400' :
                'bg-blue-400 animate-pulse'
              }`}></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Order Date</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ₹{parseFloat(order.total).toLocaleString()}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <Package className="h-4 w-4" />
              <span>{order.items?.length || 0} items</span>
            </div>
          </div>
        </div>
        
        {/* Order Number with Copy Button */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-xl">
            Order #{order.orderNumber}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(order.orderNumber);
              toast({
                title: "Order number copied!",
                description: "Order number copied to clipboard",
              });
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Product Details Section */}
        {order.items && order.items.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Products Ordered</h4>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="grid gap-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="group/item flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 relative">
                  {/* Clickable overlay for the entire product item */}
                  <Link 
                    href={`/product/${item.productId}`}
                    className="absolute inset-0 z-10 opacity-0 hover:opacity-100 transition-opacity duration-200"
                    aria-label={`View ${item.productName} product details`}
                  />
                  {/* Clickable Product Image */}
                  <div className="relative">
                    <Link 
                      href={`/product/${item.productId}`}
                      className="block cursor-pointer group/image"
                    >
                      <img
                        src={item.productImage || '/placeholder-image.jpg'}
                        alt={item.productName}
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm group-hover/item:scale-105 group-hover/image:scale-110 transition-transform duration-200"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-10 rounded-xl transition-all duration-200 flex items-center justify-center">
                        <div className="bg-white bg-opacity-90 rounded-full p-2 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200">
                          <Eye className="h-4 w-4 text-gray-700" />
                        </div>
                        {/* Tooltip */}
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                          View Product
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      </div>
                    </Link>
                    {item.isReconstructed && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium shadow-md">
                        ⚡
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Clickable Product Name */}
                    <Link 
                      href={`/product/${item.productId}`}
                      className="block cursor-pointer group/name"
                    >
                      <h5 className="font-bold text-gray-900 mb-3 text-lg group-hover/item:text-blue-600 group-hover/name:text-blue-700 transition-colors hover:underline flex items-center gap-2">
                        {item.productName}
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover/name:text-blue-500 transition-colors" />
                      </h5>
                    </Link>
                                          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-gray-600 mb-1 text-xs uppercase tracking-wide">Quantity</p>
                          <p className="font-bold text-gray-900 text-lg">{item.quantity}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-gray-600 mb-1 text-xs uppercase tracking-wide">Price</p>
                          <p className="font-bold text-gray-900 text-lg">₹{parseFloat(item.price).toLocaleString()}</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-blue-600 mb-1 text-xs uppercase tracking-wide">Total</p>
                          <p className="font-bold text-blue-900 text-lg">₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {/* View Product Button */}
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/product/${item.productId}`}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View Product Details
                        </Link>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">Click image or name to view</span>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg">Loading order details...</p>
            <p className="text-sm text-gray-500 mt-2">
              Please wait while we load your order information
            </p>
          </div>
        )}
        
        {/* Enhanced Action Buttons */}
        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
          <Button
            onClick={onViewDetails}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details & Track
          </Button>
          <Button
            variant="outline"
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <Truck className="h-4 w-4 mr-2" />
            Track Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Modern Header with Breadcrumbs */}
        <div className="mb-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span>/</span>
            <Link href="/account" className="hover:text-gray-700">My Account</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">My Orders</span>
          </nav>
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track your order history and manage your purchases</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Mumbai, India</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Currency:</span>
                <select className="border-none bg-transparent font-medium text-gray-900">
                  <option>INR ₹</option>
                  <option>USD $</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Pending Orders Alert Section */}
          {pendingOrders.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 mb-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500 rounded-full shadow-lg">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-orange-900 mb-2">
                    ⚠️ Orders Require Attention
                  </h3>
                  <p className="text-orange-800 mb-4">
                    You have <strong>{pendingOrders.length} order(s)</strong> that need to be completed or cancelled before you can place new orders.
                  </p>
                  
                  <div className="space-y-3">
                    {pendingOrders.map((order: any) => (
                      <div key={order._id} className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                              <p className="text-sm text-gray-600">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')} • 
                                Total: ₹{parseFloat(order.total).toLocaleString()}
                              </p>
                              {order.status === 'pending' && timeRemaining > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-orange-600" />
                                  <span className="text-sm font-medium text-orange-600">
                                    Time remaining: {formatTimeRemaining(timeRemaining)}
                                  </span>
                                </div>
                              )}
                              {order.status === 'pending' && isExpired && (
                                <div className="mt-2 flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  <span className="text-sm font-medium text-red-600">
                                    Payment session expired
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsDialogOpen(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {order.status === 'pending' && (
                              <Button
                                onClick={() => {
                                  if (confirm(`Initiate payment for order #${order.orderNumber}? This will redirect you to the payment gateway.`)) {
                                    initiatePaymentMutation.mutate(order._id);
                                  }
                                }}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={initiatePaymentMutation.isPending || isExpired}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                {initiatePaymentMutation.isPending ? 'Initiating...' : isExpired ? 'Expired' : 'Complete Payment'}
                              </Button>
                            )}
                            <Button
                              onClick={() => {
                                console.log('🔄 Order data for cancellation:', {
                                  _id: order._id,
                                  orderNumber: order.orderNumber,
                                  status: order.status
                                });
                                if (confirm(`Are you sure you want to cancel order #${order.orderNumber}? This will restore the items to your cart.`)) {
                                  cancelOrderMutation.mutate(order._id);
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-600 hover:bg-red-50"
                              disabled={cancelOrderMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Clear instructions */}
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-orange-800">
                              <p className="font-medium mb-1">What you need to do:</p>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                <li><strong>Complete Payment:</strong> If you want to keep this order, complete the payment process</li>
                                <li><strong>Cancel Order:</strong> If you no longer want this order, cancel it to restore items to your cart</li>
                                <li><strong>New Orders:</strong> You cannot place new orders until this pending order is resolved</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 text-orange-800">
                      <Shield className="h-5 w-5" />
                      <span className="font-medium">Need Help?</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      If you're having trouble with payment or need assistance, please contact our support team.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button asChild variant="outline" size="sm" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                        <Link href="/contact">
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Support
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                        <Link href="/checkout">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Go to Checkout
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Search and Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Section */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="Search by order number, product name..." 
                    className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    className="px-4 py-2 h-10"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    All ({orders.length})
                  </Button>
                  <Button 
                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                    className="px-4 py-2 h-10"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    In Progress ({orders.filter((order: any) => ['pending', 'confirmed', 'processing'].includes(order.status)).length})
                  </Button>
                  <Button 
                    variant={statusFilter === 'delivered' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('delivered')}
                    className="px-4 py-2 h-10"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Delivered ({orders.filter((order: any) => order.status === 'delivered').length})
                  </Button>
                  <Button 
                    variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('cancelled')}
                    className="px-4 py-2 h-10"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelled ({orders.filter((order: any) => order.status === 'cancelled').length})
                  </Button>
                </div>
              </div>

              {/* Sort Section */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort Orders</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 h-10">
                    <SelectValue placeholder="Select sorting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Latest first
                      </div>
                    </SelectItem>
                    <SelectItem value="date-asc">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Oldest first
                      </div>
                    </SelectItem>
                    <SelectItem value="total">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Highest amount
                      </div>
                    </SelectItem>
                    <SelectItem value="total-asc">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Lowest amount
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>



        {/* Order Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
              <div className="p-3 bg-blue-400/20 rounded-full">
                <Package className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-blue-100 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>All time orders</span>
            </div>
          </div>

          {/* In Progress Orders */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold">
                  {orders.filter((order: any) => ['pending', 'confirmed', 'processing'].includes(order.status)).length}
                </p>
              </div>
              <div className="p-3 bg-orange-400/20 rounded-full">
                <Clock className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-orange-100 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>Being processed</span>
            </div>
          </div>

          {/* Delivered Orders */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Delivered</p>
                <p className="text-3xl font-bold">
                  {orders.filter((order: any) => order.status === 'delivered').length}
                </p>
              </div>
              <div className="p-3 bg-green-400/20 rounded-full">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-100 text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Successfully delivered</span>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Spent</p>
                <p className="text-3xl font-bold">
                  ₹{orders.reduce((total: number, order: any) => total + parseFloat(order.total), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-400/20 rounded-full">
                <CreditCard className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-purple-100 text-sm">
              <CreditCard className="h-4 w-4 mr-1" />
              <span>Lifetime value</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <Link href="/products">
                <Gift className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
              <Link href="/track-order">
                <Truck className="h-4 w-4 mr-2" />
                Track Order
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <Link href="/contact">
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
              <Link href="/about#faq">
                <FileText className="h-4 w-4 mr-2" />
                View FAQ
              </Link>
            </Button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start shopping to see your orders here'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium text-gray-900">{filteredOrders.length}</span> of{' '}
                  <span className="font-medium text-gray-900">{orders.length}</span> orders
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Filter className="h-4 w-4" />
                  <span>Filtered by: {statusFilter === 'all' ? 'All Statuses' : statusFilter}</span>
                </div>
              </div>

              {/* Orders Grid */}
              <div className="grid gap-4">
                {filteredOrders.map((order: any) => (
                  <OrderCard 
                    key={order._id} 
                    order={order} 
                    onViewDetails={() => {
                      setSelectedOrder(order);
                      setIsDetailsDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Enhanced Help Section */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-blue-500 rounded-full shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Need Help with Your Orders?</h3>
            </div>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              Our dedicated customer support team is here to help you with any questions about your orders, 
              returns, or general inquiries. We're committed to providing excellent service and ensuring 
              your shopping experience is smooth and enjoyable.
            </p>
            
            {/* Help Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">24/7 Support</h4>
                <p className="text-gray-600 text-sm">Get help anytime with our round-the-clock customer service</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Track Orders</h4>
                <p className="text-gray-600 text-sm">Real-time updates on your order status and delivery</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">FAQ & Guides</h4>
                <p className="text-gray-600 text-sm">Find answers to common questions and helpful guides</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all">
                <Link href="/contact">
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Support
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
                <Link href="/about#faq">
                  <FileText className="h-5 w-5 mr-2" />
                  View FAQ
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3">
                <Link href="/track-order">
                  <Truck className="h-5 w-5 mr-2" />
                  Track Order
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Order Details & Tracking Modal */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-6 w-6 text-blue-600" />
              Order Details & Tracking - #{selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
          <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Status</p>
                    <Badge className={`${getStatusColor(selectedOrder.status)} mt-1`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1">{getStatusText(selectedOrder.status)}</span>
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold text-gray-900 text-lg">₹{parseFloat(selectedOrder.total).toLocaleString()}</p>
                  </div>
                </div>
              </div>

                            {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Order Items ({selectedOrder.items?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <img
                        src={item.productImage || '/placeholder-image.jpg'}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded border border-gray-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {item.productName}
                          {item.isReconstructed && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Reconstructed
                            </span>
                          )}
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Quantity</p>
                            <p className="font-medium text-gray-900">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Price per item</p>
                            <p className="font-medium text-gray-900">₹{parseFloat(item.price).toLocaleString()}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-600">Total</p>
                            <p className="font-semibold text-gray-900">₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Tracking Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  Order Tracking
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="relative">
                    {/* Tracking Timeline */}
                    <div className="space-y-6">
                      {getTrackingSteps(selectedOrder.status).map((step, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {step.completed ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium ${step.completed ? 'text-green-900' : 'text-gray-900'}`}>
                              {step.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            {step.date && (
                              <p className="text-xs text-gray-500 mt-1">{step.date}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Order Progress</span>
                        <span>{getProgressPercentage(selectedOrder.status)}% Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${getProgressPercentage(selectedOrder.status)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Shipping Address
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-gray-500" />
                  <div>
                            <p className="text-sm text-gray-600">Recipient Name</p>
                            <p className="font-medium text-gray-900">
                              {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Home className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium text-gray-900">
                              {selectedOrder.shippingAddress.addressLine1}
                              {selectedOrder.shippingAddress.addressLine2 && (
                                <span><br />{selectedOrder.shippingAddress.addressLine2}</span>
                              )}
                              {selectedOrder.shippingAddress.apartment && (
                                <span><br />{selectedOrder.shippingAddress.apartment}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Building className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">City & State</p>
                            <p className="font-medium text-gray-900">
                              {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                              {selectedOrder.shippingAddress.district && `, ${selectedOrder.shippingAddress.district}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Pincode & Country</p>
                            <p className="font-medium text-gray-900">
                              {selectedOrder.shippingAddress.pincode}, {selectedOrder.shippingAddress.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedOrder.shippingAddress.specialInstructions && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Special Instructions</p>
                            <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.specialInstructions}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedOrder.status === 'draft' ? (
                  <Button
                    onClick={() => {
                      setIsDetailsDialogOpen(false);
                      window.location.href = '/checkout';
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Payment
                  </Button>
                ) : selectedOrder.status === 'pending' ? (
                  <>
                    <Button
                      onClick={() => {
                        if (confirm(`Initiate payment for order #${selectedOrder.orderNumber}? This will redirect you to the payment gateway.`)) {
                          initiatePaymentMutation.mutate(selectedOrder._id);
                          setIsDetailsDialogOpen(false);
                        }
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={initiatePaymentMutation.isPending || isExpired}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {initiatePaymentMutation.isPending ? 'Initiating...' : isExpired ? 'Expired' : 'Complete Payment'}
                    </Button>
                    <Button
                      onClick={() => {
                        console.log('🔄 Order data for cancellation (modal):', {
                          _id: selectedOrder._id,
                          orderNumber: selectedOrder.orderNumber,
                          status: selectedOrder.status
                        });
                        if (confirm(`Are you sure you want to cancel order #${selectedOrder.orderNumber}? This will restore the items to your cart.`)) {
                          cancelOrderMutation.mutate(selectedOrder._id);
                          setIsDetailsDialogOpen(false);
                        }
                      }}
                      variant="outline"
                      className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                      disabled={cancelOrderMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleDownloadInvoice(selectedOrder)}
                      variant="outline"
                      className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                    <Button
                      onClick={() => window.open(`/track-order?order=${selectedOrder.orderNumber}`, '_blank')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Track Order
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => setIsDetailsDialogOpen(false)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
