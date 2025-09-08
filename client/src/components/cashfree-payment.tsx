import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Shield, CheckCircle } from 'lucide-react';

interface CashfreePaymentProps {
  paymentSessionId: string;
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentData: any) => void;
  onFailure: (error: any) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    cashfree: any;
  }
}

export default function CashfreePayment({
  paymentSessionId,
  orderId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
  onClose,
}: CashfreePaymentProps) {
  const cashfreeRef = useRef<any>(null);

  useEffect(() => {
    // Load Cashfree SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      initializeCashfree();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializeCashfree = () => {
    if (window.cashfree) {
      const cashfree = window.cashfree({
        mode: 'production', // Use 'sandbox' for testing
      });

      cashfreeRef.current = cashfree;

      // Initialize payment session
      cashfree.initialize({
        paymentSessionId: paymentSessionId,
        returnUrl: `https://giftgalore-jfnb.onrender.com/payment-success?order_id=${orderId}`,
      });

      // Handle payment events
      cashfree.on('PAYMENT_SUCCESS', (data: any) => {
        console.log('Payment successful:', data);
        onSuccess(data);
      });

      cashfree.on('PAYMENT_FAILED', (data: any) => {
        console.log('Payment failed:', data);
        onFailure(data);
      });

      cashfree.on('PAYMENT_USER_DROPPED', (data: any) => {
        console.log('Payment user dropped:', data);
        onClose();
      });
    }
  };

  const handlePayment = () => {
    if (cashfreeRef.current) {
      cashfreeRef.current.redirect();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="h-6 w-6" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Order ID:</span>
            <span className="text-sm font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="text-sm font-medium">₹{amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Customer:</span>
            <span className="text-sm font-medium">{customerName}</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Shield className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">Secure Payment</p>
            <p className="text-xs text-green-700">
              Your payment is processed securely by Cashfree. We never store your payment details.
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Available Payment Methods:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Credit/Debit Cards
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              UPI
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Net Banking
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Wallets
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            className="w-full gift-gradient hover:opacity-90"
            size="lg"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ₹{amount.toLocaleString()}
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </div>

        {/* Powered by Cashfree */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Powered by{' '}
            <a
              href="https://www.cashfree.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Cashfree
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
