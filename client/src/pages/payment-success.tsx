import { Link, useLocation } from 'wouter';
import { CheckCircle, Mail, Package, ArrowRight, Home, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

export default function PaymentSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const orderId = searchParams.get('orderId') || 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const amount = searchParams.get('amount') || '₹0';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-green-600 mb-4">🎉 Payment Successful!</h1>
            <p className="text-xl text-muted-foreground">
              Thank you for your order. Your payment has been received.
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-semibold">{orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="font-semibold text-green-600">{amount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-semibold">Credit/Debit Card</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Confirmed
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-semibold">Order Confirmation Email</p>
                  <p className="text-sm text-muted-foreground">
                    We'll send you a confirmation email shortly with your order details.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-semibold">Order Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Your order will be processed and prepared for shipping within 24 hours.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-semibold">Shipping Updates</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive tracking information once your order ships.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have any questions about your order, our customer support team is here to help.
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:support@giftgalore.com" className="text-primary hover:underline">
                    support@giftgalore.com
                  </a>
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong> +91 9626804123
                </p>
                <p className="text-sm">
                  <strong>Business Hours:</strong> Mon-Sat, 9:00 AM - 6:00 PM IST
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/orders">
                <Receipt className="mr-2 h-4 w-4" />
                View My Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Important Note */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a demo payment success page for testing purposes. 
              In production, this would be the actual payment confirmation from Razorpay.
              <br />
              <strong>For PayU/Razorpay:</strong> This demonstrates the complete payment flow for verification.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
