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
    // Check if Cashfree SDK is already loaded
    if (window.cashfree) {
      console.log('📦 Cashfree SDK already loaded');
      initializeCashfree();
      return;
    }

    // Load Cashfree SDK from CDN
    console.log('📦 Loading Cashfree SDK from CDN...');
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('📦 Cashfree SDK loaded from CDN');
      console.log('🌐 window.cashfree after load:', !!window.cashfree);
      // Wait a bit for the SDK to fully initialize
      setTimeout(() => {
        initializeCashfree();
      }, 1000);
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Cashfree SDK:', error);
      console.error('❌ Script src:', script.src);
      onFailure(new Error('Failed to load Cashfree SDK from CDN'));
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [paymentSessionId, orderId]); // Re-run when paymentSessionId or orderId changes

  const initializeCashfree = () => {
    console.log('🔧 Initializing Cashfree from CDN...');
    console.log('📋 Payment Session ID:', paymentSessionId);
    console.log('🆔 Order ID:', orderId);
    console.log('🌐 window.cashfree available:', !!window.cashfree);
    
    if (!window.cashfree) {
      console.error('❌ Cashfree SDK not available');
      onFailure(new Error('Cashfree SDK not loaded'));
      return;
    }
    
    try {
      // Initialize Cashfree using CDN
      const cashfree = window.cashfree({
        mode: 'production', // Use 'sandbox' for testing
      });

      cashfreeRef.current = cashfree;

      // Initialize payment session
      console.log('🚀 Initializing payment session...');
      cashfree.initialize({
        paymentSessionId: paymentSessionId,
        returnUrl: `https://giftgalore-jfnb.onrender.com/payment-success?order_id=${orderId}`,
      });

      // Handle payment events
      cashfree.on('PAYMENT_SUCCESS', (data: any) => {
        console.log('✅ Payment successful:', data);
        onSuccess(data);
      });

      cashfree.on('PAYMENT_FAILED', (data: any) => {
        console.log('❌ Payment failed:', data);
        onFailure(data);
      });

      cashfree.on('PAYMENT_USER_DROPPED', (data: any) => {
        console.log('👤 Payment user dropped:', data);
        onClose();
      });
      
      console.log('✅ Cashfree initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Cashfree:', error);
      onFailure(error);
    }
  };

  const handlePayment = () => {
    console.log('💳 Payment button clicked');
    console.log('🔧 Cashfree ref:', cashfreeRef.current);
    
    if (cashfreeRef.current) {
      console.log('🚀 Redirecting to payment...');
      try {
        cashfreeRef.current.redirect();
      } catch (error) {
        console.error('❌ Payment redirect error:', error);
        onFailure(error);
      }
    } else {
      console.error('❌ Cashfree not initialized');
      onFailure(new Error('Payment system not ready'));
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
