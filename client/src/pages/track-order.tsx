import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Search, Package, Truck, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface TrackingInfo {
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  total: number;
  shippingAddress: {
    city?: string;
    state?: string;
    pincode?: string;
  };
  additionalInfo?: {
    message: string;
    updatedAt: string;
    updatedBy: string;
  };
}

export default function TrackOrder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTimelineStatus = (currentStatus: string, stepKey: string) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);
    
    return stepIndex <= currentIndex;
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'PENDING';
      case 'confirmed':
        return 'CONFIRMED';
      case 'processing':
        return 'PROCESSING';
      case 'shipped':
        return 'SHIPPED';
      case 'delivered':
        return 'DELIVERED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status.toUpperCase();
    }
  };

  const generateTimeline = (order: TrackingInfo) => {
    const timeline = [];
    const orderDate = new Date(order.createdAt);
    const updateDate = new Date(order.updatedAt);
    
    // Pending
    timeline.push({
      status: 'Pending',
      description: 'Your order is pending confirmation',
      timestamp: orderDate.toLocaleString(),
      completed: order.status !== 'pending'
    });

    // Always generate all timeline items for proper status matching
    timeline.push({
      status: 'Order Confirmed',
      description: 'Order confirmed and payment received',
      timestamp: new Date(orderDate.getTime() + 30 * 60 * 1000).toLocaleString(), // 30 minutes later
      completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
    });

    timeline.push({
      status: 'Processing',
      description: 'Your order is being prepared for shipment',
      timestamp: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000).toLocaleString(), // 2 hours later
      completed: ['processing', 'shipped', 'delivered'].includes(order.status)
    });

    timeline.push({
      status: 'Shipped',
      description: 'Your order has been shipped',
      timestamp: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toLocaleString(), // 1 day later
      completed: ['shipped', 'delivered'].includes(order.status)
    });

    timeline.push({
      status: 'Delivered',
      description: 'Order delivered successfully',
      timestamp: updateDate.toLocaleString(),
      completed: order.status === 'delivered'
    });

    return timeline;
  };

  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) {
      toast({
        title: "Order number required",
        description: "Please enter your order number to track your order.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the real API endpoint
      const response = await apiRequest('GET', `/api/orders/track/${orderNumber.trim()}`);
      const orderData = await response.json();
      
      console.log('Track order response:', orderData);
      console.log('Additional info in response:', orderData.additionalInfo);
      setTrackingInfo(orderData);
        
      toast({
        title: "Order found",
        description: `Tracking information for order ${orderNumber}`,
      });
      
    } catch (error) {
      console.error('Error tracking order:', error);
      toast({
        title: "Order not found",
        description: "Please check your order number and try again.",
        variant: "destructive",
      });
      setTrackingInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Track Your Order</h1>
          <p className="text-muted-foreground">
            Enter your order number to get real-time tracking information
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track Order
            </CardTitle>
            <CardDescription>
              Enter your order number to view the current status and delivery timeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your order number (e.g., ORD123456)"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleTrackOrder}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Track Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {trackingInfo && (
          <div className="space-y-6">
            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order #{trackingInfo.orderNumber}
                    </CardTitle>
                                         <CardDescription>
                       Current Status: {getStatusDisplayName(trackingInfo.status)}
                     </CardDescription>
                   </div>
                   <Badge className={`${getStatusColor(trackingInfo.status)} flex items-center gap-1`}>
                     {getStatusIcon(trackingInfo.status)}
                     {getStatusDisplayName(trackingInfo.status)}
                   </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Order Date</Label>
                     <p className="text-sm text-muted-foreground">{new Date(trackingInfo.createdAt).toLocaleDateString()}</p>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Last Updated</Label>
                     <p className="text-sm text-muted-foreground">{new Date(trackingInfo.updatedAt).toLocaleDateString()}</p>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Total Amount</Label>
                     <p className="text-sm text-muted-foreground">₹{trackingInfo.total}</p>
                   </div>
                   {trackingInfo.shippingAddress && (
                     <div className="space-y-2">
                       <Label className="text-sm font-medium">Delivery Address</Label>
                       <p className="text-sm text-muted-foreground flex items-center gap-1">
                         <MapPin className="h-3 w-3" />
                         {trackingInfo.shippingAddress.city}, {trackingInfo.shippingAddress.state} - {trackingInfo.shippingAddress.pincode}
                       </p>
                     </div>
                   )}
                 </div>
              </CardContent>
            </Card>



            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Order Progress
                </CardTitle>
                <CardDescription>
                  Track your order's journey from placement to delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between relative">
                  {/* Timeline Steps */}
                  {[
                    { number: 1, status: 'Pending', key: 'pending' },
                    { number: 2, status: 'Order Confirmed', key: 'confirmed' },
                    { number: 3, status: 'Processing', key: 'processing' },
                    { number: 4, status: 'Shipped', key: 'shipped' },
                    { number: 5, status: 'Delivered', key: 'delivered' }
                  ].map((step, index) => {
                    const isCompleted = getTimelineStatus(trackingInfo.status, step.key);
                    const isCurrent = trackingInfo.status === step.key;
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center relative">
                        {/* Step Circle */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium relative z-10 ${
                          isCompleted || isCurrent
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {step.number}
                        </div>
                        
                        {/* Step Label */}
                        <div className={`text-xs mt-2 text-center max-w-20 ${
                          isCompleted || isCurrent
                            ? 'text-green-600 font-medium'
                            : 'text-gray-500'
                        }`}>
                          {step.status}
                        </div>
                        
                        {/* Connecting Line */}
                        {index < 4 && (
                          <div className={`absolute top-4 left-8 w-full h-0.5 ${
                            isCompleted
                              ? 'bg-green-500'
                              : 'bg-gray-200'
                          }`} style={{ width: 'calc(100% - 2rem)' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Additional Timeline Details */}
                <div className="mt-6 space-y-3">
                  {generateTimeline(trackingInfo).map((item, index) => {
                    // Better status matching logic
                    const isCurrentStatus = 
                      (trackingInfo.status === 'pending' && item.status === 'Pending') ||
                      (trackingInfo.status === 'confirmed' && item.status === 'Order Confirmed') ||
                      (trackingInfo.status === 'processing' && item.status === 'Processing') ||
                      (trackingInfo.status === 'shipped' && item.status === 'Shipped') ||
                      (trackingInfo.status === 'delivered' && item.status === 'Delivered');
                    

                    
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          item.completed 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {item.completed ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              item.completed ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {item.status}
                            </h4>
                            {item.timestamp && (
                              <span className="text-xs text-muted-foreground">
                                {item.timestamp}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${
                            item.completed ? 'text-muted-foreground' : 'text-muted-foreground/70'
                          }`}>
                            {item.description}
                          </p>
                          
                          {/* Show Additional Information below Order Confirmed status */}
                          {(() => {
                            if (item.status === 'Order Confirmed' && trackingInfo.additionalInfo && trackingInfo.additionalInfo.message) {
                              console.log('Rendering additional info for Order Confirmed:', trackingInfo.additionalInfo);
                              return true;
                            }
                            return false;
                          })() && (
                            <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <strong className="text-blue-800 text-sm">Additional Information:</strong>
                              </div>
                              <div className="text-blue-700 text-sm mb-1">
                                {trackingInfo.additionalInfo?.message}
                              </div>
                              <div className="text-xs text-blue-600">
                                Updated: {new Date(trackingInfo.additionalInfo?.updatedAt || '').toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Having trouble tracking your order? We're here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Can't find your order?</h4>
                  <p className="text-sm text-muted-foreground">
                    Make sure you're entering the correct order number. You can find it in your order confirmation email.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Order delayed?</h4>
                  <p className="text-sm text-muted-foreground">
                    Delivery times may vary due to weather conditions or high order volumes. We'll keep you updated.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Still need assistance? Contact our support team at{' '}
                  <a href="uthayabusiness@gmail.com" className="text-primary hover:underline">
                  uthayabusiness@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
