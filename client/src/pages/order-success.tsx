import { Link, useLocation } from 'wouter';
import { CheckCircle, Package, Home, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

export default function OrderSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const orderId = searchParams.get('orderId') || 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Header */}
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-green-600 mb-4">🎉 Order Placed Successfully!</h1>
            <p className="text-xl text-muted-foreground">
              Your order has been confirmed and is being processed.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-2xl font-bold text-primary">{orderId}</p>
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
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <span className="text-sm">Order confirmation email sent</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <span className="text-sm">Processing and packaging</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <span className="text-sm">Shipping and tracking</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/orders">
                <Receipt className="mr-2 h-4 w-4" />
                View My Orders
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Demo Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> This is a simulated order success page for testing purposes.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
