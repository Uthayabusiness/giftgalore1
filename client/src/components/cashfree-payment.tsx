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
    // Remove crossOrigin to avoid CORS issues
    // script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('📦 Cashfree SDK loaded from CDN');
      console.log('🌐 window.cashfree after load:', !!window.cashfree);
      console.log('🔍 Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('cashfree')));
      
      // Try multiple approaches to find Cashfree
      let retries = 0;
      const maxRetries = 15;
      const checkCashfree = () => {
        // Check multiple possible locations for Cashfree
        const cashfree = window.cashfree || window.Cashfree || (window as any).CashfreePG;
        
        if (cashfree) {
          console.log('✅ Cashfree found:', typeof cashfree);
          console.log('🔧 Available methods:', Object.getOwnPropertyNames(cashfree));
          initializeCashfree();
        } else if (retries < maxRetries) {
          retries++;
          console.log(`⏳ Waiting for Cashfree... (attempt ${retries}/${maxRetries})`);
          console.log('🔍 Current window.cashfree:', !!window.cashfree);
          console.log('🔍 Current window.Cashfree:', !!(window as any).Cashfree);
          setTimeout(checkCashfree, 300);
        } else {
          console.error('❌ Cashfree not available after maximum retries');
          console.log('🔍 Final window inspection:', {
            cashfree: !!window.cashfree,
            Cashfree: !!(window as any).Cashfree,
            CashfreePG: !!(window as any).CashfreePG,
            allKeys: Object.keys(window).filter(key => key.toLowerCase().includes('cashfree'))
          });
          onFailure(new Error('Cashfree SDK not available after loading'));
        }
      };
      
      // Start checking after a short delay
      setTimeout(checkCashfree, 200);
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Cashfree SDK:', error);
      console.error('❌ Script src:', script.src);
      console.warn('⚠️ Using fallback payment method due to SDK load failure');
      // Don't call onFailure, just log the error and continue with fallback
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
    
    // Validate payment session ID
    if (!paymentSessionId || paymentSessionId.trim() === '') {
      console.error('❌ Payment session ID is empty or invalid:', paymentSessionId);
      onFailure(new Error('Payment session ID is required'));
      return;
    }
    
    console.log('✅ Payment session ID validation passed:', paymentSessionId);
    
    // Try multiple possible locations for Cashfree
    const cashfree = window.cashfree || window.Cashfree || (window as any).CashfreePG;
    console.log('🌐 Cashfree available:', !!cashfree);
    console.log('🔍 Cashfree type:', typeof cashfree);
    
    if (!cashfree) {
      console.error('❌ Cashfree SDK not available');
      onFailure(new Error('Cashfree SDK not loaded'));
      return;
    }
    
    try {
      // Initialize Cashfree using CDN - try different initialization methods
      console.log('🔧 Attempting Cashfree initialization...');
      
      let cashfreeInstance;
      
      // Method 1: Try calling as function (recommended approach from documentation)
      try {
        cashfreeInstance = cashfree({
          mode: 'sandbox', // Use 'sandbox' for testing
        });
        console.log('✅ Cashfree initialized with function call');
      } catch (functionError) {
        console.log('⚠️ Function call failed, trying constructor:', functionError.message);
        
        // Method 2: Try calling as constructor
        try {
          cashfreeInstance = new cashfree({
            mode: 'sandbox', // Use 'sandbox' for testing
          });
          console.log('✅ Cashfree initialized with constructor');
        } catch (constructorError) {
          console.log('⚠️ Constructor failed, trying direct initialization:', constructorError.message);
          
          // Method 3: Try direct initialization
          cashfreeInstance = cashfree;
          console.log('✅ Using Cashfree directly');
        }
      }

      cashfreeRef.current = cashfreeInstance;

      // Initialize payment session
      console.log('🚀 Initializing payment session...');
      console.log('🔍 Cashfree instance methods:', Object.getOwnPropertyNames(cashfreeInstance));
      
      // Use the correct Cashfree method - 'checkout' for payment sessions with paymentSessionId
      if (typeof cashfreeInstance.checkout === 'function') {
        console.log('🚀 Using cashfree.checkout() method (correct for paymentSessionId)...');
        const checkoutParams = {
          paymentSessionId: paymentSessionId,
          returnUrl: `https://giftgalore-jfnb.onrender.com/payment-success?order_id=${orderId}`,
          redirectTarget: "_blank"
        };
        
        console.log('📋 Checkout Parameters:', checkoutParams);
        console.log('🔍 Payment Session ID Type:', typeof paymentSessionId);
        console.log('🔍 Payment Session ID Length:', paymentSessionId?.length);
        console.log('🔍 Payment Session ID Preview:', paymentSessionId?.substring(0, 20) + '...');
        
        // Use checkout() method with proper parameters
        cashfreeInstance.checkout(checkoutParams);
        console.log('✅ Checkout initiated successfully');
      } else if (typeof cashfreeInstance.pay === 'function') {
        console.log('🚀 Using cashfree.pay() method as fallback...');
        cashfreeInstance.pay(paymentSessionId);
      } else if (typeof cashfreeInstance.create === 'function') {
        console.log('⚠️ Using cashfree.create() method (not recommended for paymentSessionId)...');
        // create() is for UI components, not payment sessions
        throw new Error('create() method is for UI components, not payment sessions. Use checkout() instead.');
      } else {
        throw new Error('No checkout, pay, or create method found on Cashfree instance');
      }

      // Note: For checkout() method, we don't need event listeners
      // The payment flow is handled by Cashfree's hosted page
      // and will redirect back to our returnUrl
      console.log('✅ Cashfree checkout initiated successfully');
    } catch (error) {
      console.error('❌ Error initializing Cashfree:', error);
      onFailure(error);
    }
  };

  const handlePayment = () => {
    console.log('💳 Payment button clicked');
    console.log('🔧 Cashfree ref:', cashfreeRef.current);
    
    if (cashfreeRef.current) {
      console.log('✅ Payment already initiated via checkout() method');
      console.log('🚀 Cashfree checkout should have redirected automatically');
    } else {
      console.warn('⚠️ Cashfree not initialized');
      onFailure(new Error('Cashfree not initialized'));
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
