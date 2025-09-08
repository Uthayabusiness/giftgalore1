import { Link, useLocation } from 'wouter';
import { XCircle, AlertTriangle, RefreshCw, Home, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

export default function OrderFailed() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const errorMessage = searchParams.get('error') || 'Order creation failed';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Failure Header */}
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-red-600 mb-4">❌ Order Failed</h1>
            <p className="text-xl text-muted-foreground">
              We couldn't process your order. Please try again.
            </p>
          </div>

          {/* Error Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Error Message</p>
                  <p className="text-lg font-semibold text-red-600">{errorMessage}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="destructive">Failed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Happened */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">What Happened?</h2>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">1</span>
                </div>
                <span className="text-sm">Order creation failed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">2</span>
                </div>
                <span className="text-sm">Your cart items are still available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">3</span>
                </div>
                <span className="text-sm">No charges were made</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/checkout">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/cart">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Back to Cart
              </Link>
            </Button>
          </div>

          {/* Demo Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> This is a simulated order failure page for testing purposes.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
