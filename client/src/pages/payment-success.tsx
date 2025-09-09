import { Link, useLocation } from 'wouter';
import { CheckCircle, Mail, Package, ArrowRight, Home, Receipt, Sparkles, Gift, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// Animated Background Component
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-300 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-gradient-to-r from-teal-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
    </div>
  );
}

// Confetti Animation Component
function ConfettiAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

// Simple fallback component that always works
function SimplePaymentSuccess() {
  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-24 w-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
            <CheckCircle className="h-12 w-12 text-white animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            🎉 Payment Successful!
          </h1>
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in-delay">
            Thank you for your order. Your payment has been received.
          </p>
          <div className="space-y-4 animate-slide-up">
            <Button asChild className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Link href="/orders">
                <Receipt className="mr-2 h-4 w-4" />
                View My Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-2 hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function PaymentSuccess() {
  // Try to render the full component, fallback to simple version if anything fails
  try {
    const [location] = useLocation();
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const orderId = searchParams.get('order_id') || searchParams.get('orderId');
    const [orderData, setOrderData] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [hasProcessed, setHasProcessed] = useState(false);

  // Debug logging
  console.log('🔍 Payment Success Page Debug:');
  console.log('  - Location:', location);
  console.log('  - Search Params:', searchParams.toString());
  console.log('  - Order ID:', orderId);
  console.log('  - Order ID starts with ORD-:', orderId.startsWith('ORD-'));

  // Mutation to handle payment success
  const paymentSuccessMutation = useMutation({
    mutationFn: async (data: { orderNumber: string; paymentMethod?: string }) => {
      console.log('🚀 Calling payment success endpoint with data:', data);
      
      const response = await fetch('/api/payment/success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      console.log('📡 Payment success response status:', response.status);
      console.log('📡 Payment success response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Payment success error response:', errorText);
        
        // Handle specific error cases
        if (response.status === 0 || response.status === 500) {
          throw new Error('Network error: Unable to connect to server. Please check your internet connection and try again.');
        }
        
        throw new Error(`Failed to process payment success: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Payment success response data:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('✅ Payment success processed:', data);
      setOrderData(data.order);
      setIsProcessing(false);
      toast({
        title: "Order Confirmed!",
        description: "Your order has been successfully created and cart has been cleared.",
      });
    },
    onError: (error) => {
      console.error('❌ Error processing payment success:', error);
      setIsProcessing(false);
      
      // Check if it's a network error and suggest retry
      const isNetworkError = error.message.includes('Network error') || error.message.includes('ERR_INSUFFICIENT_RESOURCES');
      
      toast({
        title: "Error",
        description: isNetworkError 
          ? "Network error occurred. Please refresh the page to retry."
          : "Failed to process payment success. Please contact support.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Process payment success when component mounts - only once
    if (orderId && typeof orderId === 'string' && orderId.startsWith('ORD-') && !hasProcessed) {
      console.log('🎉 Processing payment success for order:', orderId);
      setHasProcessed(true);
      paymentSuccessMutation.mutate({
        orderNumber: orderId,
        paymentMethod: 'Credit/Debit Card'
      });
    } else if (!orderId) {
      console.log('⚠️ No valid order ID found, skipping payment processing');
      setIsProcessing(false);
    }
  }, [orderId, hasProcessed]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      {orderData && <ConfettiAnimation />}
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="h-32 w-32 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                  <CheckCircle className="h-16 w-16 text-white animate-bounce" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20 animate-ping"></div>
                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-spin" style={{animationDuration: '3s'}} />
              </div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 animate-fade-in-delay">
              🎉 Payment Successful!
            </h1>
            <p className="text-2xl text-muted-foreground animate-fade-in-delay-2">
              {orderId ? 'Thank you for your order. Your payment has been received.' : 'Payment completed successfully. Processing your order...'}
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="mb-8 bg-white/80 backdrop-blur-lg border-0 shadow-2xl animate-slide-up hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              {isProcessing ? (
                <div className="text-center py-12">
                  <div className="relative mx-auto w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-lg text-muted-foreground animate-pulse">Processing your order...</p>
                </div>
              ) : orderData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <p className="text-sm font-medium text-green-700">Order ID</p>
                    <p className="font-bold text-lg text-green-800">{orderData.orderNumber}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                    <p className="text-sm font-medium text-emerald-700">Amount Paid</p>
                    <p className="font-bold text-2xl text-emerald-800">₹{orderData.total}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-100">
                    <p className="text-sm font-medium text-teal-700">Payment Method</p>
                    <p className="font-semibold text-lg text-teal-800">{orderData.paymentMethod || 'Credit/Debit Card'}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <p className="text-sm font-medium text-green-700">Status</p>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm font-semibold">
                      {orderData.status || 'Confirmed'}
                    </Badge>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-blue-700">Items Ordered</p>
                    <p className="font-bold text-xl text-blue-800">{orderData.items?.length || 0} item(s)</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-blue-700">Order ID</p>
                    <p className="font-bold text-lg text-blue-800">{orderId || 'Processing...'}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                    <p className="text-sm font-medium text-emerald-700">Amount Paid</p>
                    <p className="font-bold text-2xl text-emerald-800 animate-pulse">Processing...</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-100">
                    <p className="text-sm font-medium text-teal-700">Payment Method</p>
                    <p className="font-semibold text-lg text-teal-800">Credit/Debit Card</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-blue-700">Status</p>
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm font-semibold animate-pulse">
                      Processing
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8 bg-white/80 backdrop-blur-lg border-0 shadow-2xl animate-slide-up-delay hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mt-1 shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-blue-800 mb-2">Order Confirmation Email</p>
                  <p className="text-blue-600">
                    We'll send you a confirmation email shortly with your order details and tracking information.
                  </p>
                </div>
                <div className="text-2xl">📧</div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="h-12 w-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mt-1 shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-emerald-800 mb-2">Order Processing</p>
                  <p className="text-emerald-600">
                    Your order will be processed and prepared for shipping within 24 hours by our expert team.
                  </p>
                </div>
                <div className="text-2xl">⏰</div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mt-1 shadow-lg">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-purple-800 mb-2">Shipping Updates</p>
                  <p className="text-purple-600">
                    You'll receive tracking information and real-time updates once your order ships.
                  </p>
                </div>
                <div className="text-2xl">🚚</div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-8 bg-white/80 backdrop-blur-lg border-0 shadow-2xl animate-slide-up-delay-2 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground mb-6 text-center">
                If you have any questions about your order, our customer support team is here to help.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="text-3xl mb-2">📧</div>
                  <p className="font-semibold text-blue-800 mb-1">Email Support</p>
                  <a href="mailto:support@giftgalore.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                    support@giftgalore.com
                  </a>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div className="text-3xl mb-2">📞</div>
                  <p className="font-semibold text-green-800 mb-1">Phone Support</p>
                  <p className="text-green-600">+91 9626804123</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <div className="text-3xl mb-2">🕒</div>
                  <p className="font-semibold text-purple-800 mb-1">Business Hours</p>
                  <p className="text-purple-600">Mon-Sat, 9:00 AM - 6:00 PM IST</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 animate-slide-up-delay-3">
            {orderData ? (
              <>
                <Button asChild className="flex-1 h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-lg font-semibold">
                  <Link href="/orders">
                    <Receipt className="mr-3 h-5 w-5" />
                    View My Orders
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 h-14 border-2 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300 transform hover:scale-105 text-lg font-semibold">
                  <Link href="/">
                    <Home className="mr-3 h-5 w-5" />
                    Continue Shopping
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-lg font-semibold"
                  disabled={isProcessing}
                >
                  <Receipt className="mr-3 h-5 w-5" />
                  {isProcessing ? 'Processing...' : 'Retry Processing'}
                </Button>
                <Button asChild variant="outline" className="flex-1 h-14 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 text-lg font-semibold">
                  <Link href="/">
                    <Home className="mr-3 h-5 w-5" />
                    Continue Shopping
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Debug Information */}
          {!orderId && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Debug Info:</strong> No order ID found in URL. 
                <br />
                <strong>Current URL:</strong> {location}
                <br />
                <strong>Search Params:</strong> {searchParams.toString()}
                <br />
                <strong>Order ID:</strong> {orderId || 'null'}
              </p>
            </div>
          )}

          {/* Important Note */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a demo payment success page for testing purposes. 
              In production, this would be the actual payment confirmation from Cashfree.
              <br />
              <strong>For Cashfree:</strong> This demonstrates the complete payment flow for verification.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
  } catch (error) {
    console.error('❌ Error in PaymentSuccess component:', error);
    // Return simple fallback if anything goes wrong
    return <SimplePaymentSuccess />;
  }
}
