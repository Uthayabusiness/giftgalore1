import { Link, useLocation } from 'wouter';
import { XCircle, AlertTriangle, RefreshCw, Home, CreditCard, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

export default function PaymentFailure() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const orderId = searchParams.get('orderId') || 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const amount = searchParams.get('amount') || '₹0';
  const errorCode = searchParams.get('errorCode') || 'PAYMENT_DECLINED';
  const errorMessage = searchParams.get('errorMessage') || 'Payment was declined by the bank';

  const getErrorMessage = (code: string) => {
    const errorMessages: { [key: string]: string } = {
      'PAYMENT_DECLINED': 'Your payment was declined by the bank. Please check your card details or try a different payment method.',
      'INSUFFICIENT_FUNDS': 'Insufficient funds in your account. Please try with a different card or add funds to your account.',
      'CARD_EXPIRED': 'Your card has expired. Please use a different card with a valid expiry date.',
      'INVALID_CARD': 'The card details provided are invalid. Please check and try again.',
      'NETWORK_ERROR': 'A network error occurred during payment processing. Please try again.',
      'TIMEOUT': 'Payment request timed out. Please try again.',
      'DEFAULT': 'An unexpected error occurred during payment processing. Please try again or contact support.'
    };
    return errorMessages[code] || errorMessages['DEFAULT'];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Failure Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-red-600 mb-4">❌ Payment Failed</h1>
            <p className="text-xl text-muted-foreground">
              Your transaction could not be completed. Please try again.
            </p>
          </div>

          {/* Error Details Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-semibold">{orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">{amount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Error Code</p>
                  <Badge variant="destructive">{errorCode}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="destructive">Failed</Badge>
                </div>
              </div>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {getErrorMessage(errorCode)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Common Solutions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Common Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-semibold">Check Card Details</p>
                    <p className="text-sm text-muted-foreground">
                      Verify that your card number, expiry date, and CVV are correct.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-semibold">Ensure Sufficient Funds</p>
                    <p className="text-sm text-muted-foreground">
                      Make sure your account has enough balance to complete the transaction.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-semibold">Try Different Payment Method</p>
                    <p className="text-sm text-muted-foreground">
                      Use a different card, UPI, or digital wallet if available.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-blue-600">4</span>
                  </div>
                  <div>
                    <p className="font-semibold">Contact Your Bank</p>
                    <p className="text-sm text-muted-foreground">
                      Some banks block online transactions. Contact your bank to enable them.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you continue to experience issues, our customer support team is here to help.
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:uthayabusiness@gmail.com" className="text-primary hover:underline">
                    uthayabusiness@gmail.com
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
              <Link href="/checkout">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/cart">
                <Home className="mr-2 h-4 w-4" />
                Back to Cart
              </Link>
            </Button>
          </div>

          {/* Important Note */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a demo payment failure page for testing purposes. 
              In production, this would be the actual payment failure response from Razorpay.
              <br />
              <strong>For PayU/Razorpay:</strong> This demonstrates the complete error handling flow for verification.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
