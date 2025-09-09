import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Lock, MapPin, User, Phone, Mail, Gift, ArrowLeft, AlertCircle, Info, CheckCircle, Clock } from 'lucide-react';
import { validatePincodeForState, getPincodeRange, INDIAN_STATES_DATA, getDistrictsForState, INDIAN_STATES } from '@/lib/addressValidation';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CashfreePayment from '@/components/cashfree-payment';
import { paymentService } from '@/lib/payment-service';

// Declare Cashfree global type
declare global {
  interface Window {
    Cashfree: any;
  }
}

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode is required'),
  country: z.string().min(1, 'Country is required'),
  specialInstructions: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Refresh cart data to get latest product information
  useEffect(() => {
    if (items.length > 0) {
      console.log('Cart items in checkout:', items);
      console.log('Refreshing cart data to get latest product information...');
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  }, [items.length, queryClient]);

  // Check for pending orders
  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
    retry: false,
  });

  // No longer need to filter pending orders since we don't create them
  const [isProcessing, setIsProcessing] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [expressDelivery, setExpressDelivery] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState('');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);
  const [profileAddressLoaded, setProfileAddressLoaded] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [addressValidation, setAddressValidation] = useState<{
    pincode: { isValid: boolean; suggestions: string[] };
  }>({
    pincode: { isValid: true, suggestions: [] }
  });
  const [pincodeSuggestions, setPincodeSuggestions] = useState<any[]>([]);
  const [showPincodeSuggestions, setShowPincodeSuggestions] = useState(false);
  // Add a flag to prevent automatic clearing during programmatic updates
  const [isProgrammaticUpdate, setIsProgrammaticUpdate] = useState(false);
  // State to hold loaded address data
  const [addressData, setAddressData] = useState<any>({});
  // State to hold available states for the Select component
  const [availableStates, setAvailableStates] = useState<string[]>([]);


  const {
    register,
    handleSubmit,
    setValue: originalSetValue,
    watch,
    formState: { errors },
    reset,
    trigger,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.mobileNumber || '',
      country: 'India',
      state: '',
      district: '',
      city: '',
      pincode: '',
    },
  });

  // Create a wrapper around setValue to track all calls
  const setValue = (name: keyof CheckoutForm, value: any, options?: any) => {
    console.log(`🔍 setValue called for "${name}" with value:`, value, 'Options:', options);
    console.trace('Stack trace for setValue call');
    return originalSetValue(name, value, options);
  };

  // Redirect if not authenticated or cart is empty
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

    if (!authLoading && items.length === 0) {
      setLocation('/cart');
    }
  }, [isAuthenticated, authLoading, items.length, toast, setLocation]);

  // Set user data when available
  useEffect(() => {
    if (user) {
      originalSetValue('firstName', user.firstName || '');
      originalSetValue('lastName', user.lastName || '');
      originalSetValue('email', user.email || '');
      originalSetValue('phone', user.mobileNumber || '');
      originalSetValue('country', 'India'); // Default country
    }
  }, [user]);

  // Load address data from addressData.json
  useEffect(() => {
    const loadAddressData = async () => {
      try {
        const response = await fetch('/addressData.json');
        const data = await response.json();
        setAddressData(data);
        
        // Extract all available states
        const states = Object.keys(data).map(stateKey => data[stateKey].statename);
        setAvailableStates(states);
        console.log('✅ Loaded address data with states:', states);
      } catch (error) {
        console.error('❌ Error loading address data:', error);
      }
    };
    
    loadAddressData();
  }, []);

  // Helper function to get districts for a selected state
  const getDistrictsForSelectedState = (state: string) => {
    if (!addressData || !state) return [];
    
    console.log('🔍 getDistrictsForSelectedState called with state:', state);
    console.log('🔍 addressData keys:', Object.keys(addressData));
    
    const stateKey = Object.keys(addressData).find(key => addressData[key].statename === state);
    console.log('🔍 Found stateKey:', stateKey);
    
    if (!stateKey) {
      console.log('❌ No stateKey found for state:', state);
      return [];
    }
    
    const stateData = addressData[stateKey];
    console.log('🔍 State data:', stateData);
    console.log('🔍 Districts:', stateData.districts);
    
    const districts = stateData.districts.map((district: any) => district.districtname);
    console.log('🔍 Extracted district names:', districts);
    
    return districts;
  };

  // Address validation functions
  const validatePincode = (pincode: string) => {
    if (!pincode) return;

    // Use addressData.json for validation
    if (addressData && watch('state') && watch('district')) {
      const state = watch('state');
      const district = watch('district');
      
      // Find the state key
      const stateKey = Object.keys(addressData).find(key => addressData[key].statename === state);
      if (stateKey) {
        const stateData = addressData[stateKey];
        const districtData = stateData.districts.find((d: any) => d.districtname === district);
        
        if (districtData) {
          // Check if pincode exists in the selected district
          const foundArea = districtData.areas.find((area: any) => area.pincode.toString() === pincode);
          
          if (foundArea) {
            setAddressValidation(prev => ({
              ...prev,
              pincode: { isValid: true, suggestions: [] }
            }));
            return;
          }
        }
      }
    }

    // If no match found, mark as invalid
    setAddressValidation(prev => ({
      ...prev,
      pincode: { isValid: false, suggestions: [] }
    }));
  };

  // Enhanced pincode validation with real-time feedback
  const validatePincodeRealTime = (pincode: string) => {
    if (!pincode) {
      setAddressValidation(prev => ({
        ...prev,
        pincode: { isValid: true, suggestions: [] }
      }));
      return;
    }

    // Basic format validation first
    if (pincode.length !== 6 || isNaN(parseInt(pincode))) {
      setAddressValidation(prev => ({
        ...prev,
        pincode: { isValid: false, suggestions: [] }
      }));
      return;
    }

    // If we have both state and district, do full validation
    if (watch('state') && watch('district')) {
      validatePincode(pincode);
    } else {
      // No state/district selected, just mark as valid for now
      setAddressValidation(prev => ({
        ...prev,
        pincode: { isValid: true, suggestions: [] }
      }));
    }
  };

  const handleFieldChange = (field: 'district' | 'city' | 'pincode', value: string) => {
    setValue(field, value);
    
    if (field === 'pincode') {
      validatePincodeRealTime(value);
    }
  };

  // Pincode search and auto-fill functionality
  const searchAndFillAddressByPincode = async (pincode: string) => {
    try {
      // Load address data
      const response = await fetch('/addressData.json');
      const addressData = await response.json();
      
      const pincodeNum = parseInt(pincode);
      if (isNaN(pincodeNum)) return;
      
      // Search for the pincode in the data
      const foundAddresses: any[] = [];
      
      Object.keys(addressData).forEach(stateKey => {
        const state = addressData[stateKey];
        state.districts.forEach((district: any) => {
          district.areas.forEach((area: any) => {
            if (area.pincode === pincodeNum) {
              foundAddresses.push({
                state: state.statename,
                district: district.districtname,
                area: area.areaname,
                pincode: area.pincode
              });
            }
          });
        });
      });
      
      if (foundAddresses.length > 0) {
        // Store the found addresses for suggestions
        setPincodeSuggestions(foundAddresses);
        setShowPincodeSuggestions(true);
        
        // If only one result, auto-fill it
        if (foundAddresses.length === 1) {
          const foundAddress = foundAddresses[0];
          fillAddressFromSuggestion(foundAddress);
        } else {
          // Show success message with multiple options
          toast({
            title: "Multiple Addresses Found!",
            description: `Found ${foundAddresses.length} addresses for pincode ${pincode}. Please select one from the suggestions below.`,
          });
        }
      } else {
        toast({
          title: "Pincode Not Found In Database",
          description: "Please enter your pincode manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching pincode:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search for this pincode. Please try again or enter your address manually.",
        variant: "destructive",
      });
    }
  };

  // Function to fill address from a selected suggestion
  const fillAddressFromSuggestion = async (suggestion: any) => {
    console.log('🚀 fillAddressFromSuggestion STARTED with suggestion:', suggestion);
    console.log('🔍 Suggestion data:', JSON.stringify(suggestion, null, 2));
    
    try {
      // Set flag to prevent automatic clearing
      console.log('📝 Setting isProgrammaticUpdate to true');
      setIsProgrammaticUpdate(true);
      
      // First, hide suggestions
      console.log('👁️ Hiding suggestions');
      setShowPincodeSuggestions(false);
      setPincodeSuggestions([]);
      
      // Reset validation immediately
      console.log('✅ Resetting validation');
      setAddressValidation(prev => ({
        ...prev,
        pincode: { isValid: true, suggestions: [] }
      }));
      
      // Use setValue for each field individually with trigger
      console.log('🌍 Setting country to India...');
      setValue('country', 'India', { shouldValidate: false, shouldDirty: true });
      console.log('✅ Country setValue completed');
      
      console.log('🏛️ Setting state to:', suggestion.state);
      setValue('state', suggestion.state, { shouldValidate: false, shouldDirty: true });
      console.log('✅ State setValue completed');
      
      // Allow one render tick so state-dependent district options populate
      // before we programmatically set the district. This avoids the first-click
      // issue where the Select clears because options are not ready yet.
      await new Promise((resolve) => setTimeout(resolve, 0));
      
      console.log('🏘️ Setting district to:', suggestion.district);
      setValue('district', suggestion.district, { shouldValidate: false, shouldDirty: true });
      console.log('✅ District setValue completed');
      
      console.log('🏢 Setting area to:', suggestion.area);
      setValue('apartment', suggestion.area, { shouldValidate: false, shouldDirty: true });
      console.log('✅ Area setValue completed');
      
      console.log('📮 Setting pincode to:', suggestion.pincode.toString());
      setValue('pincode', suggestion.pincode.toString(), { shouldValidate: false, shouldDirty: true });
      console.log('✅ Pincode setValue completed');
      
      // Update the selectedCountry state for the Select component
      console.log('🇮🇳 Updating selectedCountry state');
      setSelectedCountry('India');
      
      // Show success message
      console.log('🎉 Showing success toast');
      toast({
        title: "Address Filled!",
        description: `Selected: ${suggestion.area}, ${suggestion.district}, ${suggestion.state}`,
      });
      
      // Check form values immediately
      console.log('🔍 Checking form values immediately after setValue');
      const immediateValues = {
        country: watch('country'),
        state: watch('state'),
        district: watch('district'),
        city: watch('city'),
        pincode: watch('pincode')
      };
      console.log('📊 Form values immediately after setValue:', immediateValues);
      
      // Check form values multiple times to track when they get cleared
      setTimeout(() => {
        console.log('⏰ Form values after 50ms:', {
          country: watch('country'),
          state: watch('state'),
          district: watch('district'),
          city: watch('city'),
          pincode: watch('pincode')
        });
      }, 50);
      
      setTimeout(() => {
        console.log('⏰ Form values after 100ms:', {
          country: watch('country'),
          state: watch('state'),
          district: watch('district'),
          city: watch('city'),
          pincode: watch('pincode')
        });
      }, 100);
      
      setTimeout(() => {
        console.log('⏰ Form values after 200ms:', {
          country: watch('country'),
          state: watch('state'),
          district: watch('district'),
          city: watch('city'),
          pincode: watch('pincode')
        });
        
        // Reset the flag
        console.log('📝 Resetting isProgrammaticUpdate to false');
        setIsProgrammaticUpdate(false);
        
        // Now validate the pincode
        console.log('🔍 Calling validatePincode');
        validatePincode(suggestion.pincode.toString());
        
        console.log('🏁 fillAddressFromSuggestion COMPLETED');
      }, 200);
      
    } catch (error) {
      console.error('❌ ERROR in fillAddressFromSuggestion:', error);
      if (error instanceof Error) {
        console.error('❌ Error stack:', error.stack);
      }
    }
  };

  const initiatePaymentFromCartMutation = useMutation({
    mutationFn: async (shippingAddress: any) => {
      const response = await apiRequest('POST', '/api/payments/initiate-from-cart', { shippingAddress });
      return await response.json();
    },
    onError: (error) => {
      setIsProcessing(false);
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Payment Initiation Failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest('POST', `/api/orders/${orderId}/initiate-payment`);
      return await response.json();
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Payment Initiation Failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePaymentConfirmation = async () => {
    if (!pendingOrderData) return;
    
    setIsProcessing(true);
    setShowConfirmationDialog(false);
    
    try {
      console.log('💳 Initiating payment for order:', pendingOrderData.order._id);
      
      // First, initiate payment (this changes status from draft to pending)
      await initiatePaymentMutation.mutateAsync(pendingOrderData.order._id);
      
      // Then create payment order with Cashfree
      const paymentOrder = await paymentService.createPaymentOrder({
        orderId: pendingOrderData.order.orderNumber,
        amount: pendingOrderData.total,
        customerDetails: {
          customerId: user?.id || '',
          customerName: `${pendingOrderData.formData.firstName} ${pendingOrderData.formData.lastName}`,
          customerEmail: pendingOrderData.formData.email,
          customerPhone: pendingOrderData.formData.phone,
        },
        returnUrl: `https://giftgalore-jfnb.onrender.com/payment/success?order_id=${pendingOrderData.order.orderNumber}`,
      });

      if (paymentOrder.success) {
        setPaymentSessionId(paymentOrder.paymentSessionId);
        setShowPaymentModal(true);
      } else {
        throw new Error('Failed to create payment order');
      }
    } catch (error) {
      console.error('❌ Payment initiation error:', error);
      toast({
        title: "Payment Failed",
        description: `There was an error initiating payment: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    // Check if country is India
    if (data.country !== 'India') {
      toast({
        title: "Service Not Available",
        description: "We currently only provide shipping services to India. Please select India as your country.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('🛒 Starting payment process...');
      console.log('👤 User:', user);
      console.log('🛍️ Cart items:', items);
      console.log('💰 Total:', totalWithExtras);
      
      // Prepare shipping address
      const shippingAddress = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      apartment: data.apartment,
      country: data.country,
      state: data.state,
      district: data.district,
      city: data.city,
      pincode: data.pincode,
      specialInstructions: data.specialInstructions,
      giftWrap,
      expressDelivery,
      };

      // Initiate payment directly from cart
      console.log('💳 Initiating payment from cart...');
      const paymentResponse = await initiatePaymentFromCartMutation.mutateAsync(shippingAddress);
      
      console.log('✅ Payment initiated successfully:', paymentResponse);

      if (paymentResponse.success && paymentResponse.paymentSessionId) {
        // Store payment data for potential return
        localStorage.setItem('pendingPayment', JSON.stringify({
          orderNumber: paymentResponse.orderNumber,
          total: paymentResponse.total,
          formData: data
        }));
        
      // Use Cashfree JavaScript SDK for payment initiation (required for v3)
      const sessionId = paymentResponse.paymentSessionId;

      console.log('🔗 Payment Session ID:', sessionId);
      console.log('📝 Using Cashfree JavaScript SDK for payment initiation...');

      const initiatePayment = () => {
        try {
          console.log('🚀 Initializing Cashfree v3 SDK...');
          console.log('🔍 window.Cashfree type:', typeof window.Cashfree);
          console.log('🔍 window.Cashfree available:', !!window.Cashfree);

          // Check if Cashfree v3 SDK is available
          if (!window.Cashfree) {
            throw new Error('Cashfree v3 SDK not loaded');
          }

          // Use Cashfree v3 SDK properly
          console.log('🚀 Using Cashfree v3 SDK for payment...');
          
          // Show loading message
          toast({
            title: "Initializing Payment",
            description: "Setting up payment gateway...",
          });
          
          // Use the payment session ID with Cashfree v3 SDK
          const sessionId = paymentResponse.paymentSessionId;
          console.log('🔑 Using Payment Session ID:', sessionId);
          
          // Initialize Cashfree with correct environment
          const environment = paymentResponse.environment === 'PRODUCTION' ? 'production' : 'sandbox';
          console.log('🌍 Cashfree Environment:', environment);
          
          // Create Cashfree instance
          const cashfree = window.Cashfree({
            mode: environment
          });
          
          console.log('✅ Cashfree instance created');
          
          // Define checkout options
          const checkoutOptions = {
            paymentSessionId: sessionId,
            redirectTarget: '_self' // Use '_self' for same window redirect
          };
          
          console.log('🔍 Checkout options:', checkoutOptions);
          
          // Trigger the payment UI and handle success/failure
          cashfree.checkout(checkoutOptions)
            .then((result) => {
              console.log("✅ Payment result: ", result);
              if (result.error) {
                console.error('❌ Payment Error:', result.error.message);
                toast({
                  title: "Payment Failed",
                  description: result.error.message || "Payment could not be completed. Please try again.",
                  variant: "destructive",
                });
              }
              if (result.redirect) {
                console.log('✅ Payment gateway redirecting to payment page...');
                toast({
                  title: "Redirecting to Payment",
                  description: "Please complete your payment on the next page...",
                });
                // Don't redirect immediately - let Cashfree handle the payment flow
                // The user will be redirected to the payment page, then back to returnUrl after payment
              }
            })
            .catch((error) => {
              console.error("❌ Payment error: ", error);
              toast({
                title: "Payment Failed",
                description: "Payment could not be completed. Please try again.",
                variant: "destructive",
              });
            });

        } catch (error) {
          console.error('❌ Error initializing payment:', error);
          console.error('❌ Error stack:', error.stack);
          
          // Fallback: Try direct payment URL redirect
          console.log('🔄 Attempting direct payment URL redirect...');
          toast({
            title: "Payment Redirect",
            description: "Redirecting to payment gateway...",
          });
          
          // Try to redirect to Cashfree payment URL directly
          const paymentUrl = `https://api.cashfree.com/pg/orders/${paymentResponse.orderNumber}/payments`;
          console.log('🔗 Payment URL:', paymentUrl);
          
          // Open payment URL in new tab
          const paymentWindow = window.open(paymentUrl, '_blank');
          
          if (paymentWindow) {
            console.log('✅ Payment window opened successfully');
            // Monitor the payment window
            const checkClosed = setInterval(() => {
              if (paymentWindow.closed) {
                clearInterval(checkClosed);
                console.log('🔄 Payment window closed, checking payment status...');
                // Redirect to success page (in real implementation, you'd check payment status)
                setTimeout(() => {
                  window.location.href = `/payment/success?order_id=${paymentResponse.orderNumber}`;
                }, 1000);
              }
            }, 1000);
          } else {
            console.log('❌ Failed to open payment window, trying direct redirect...');
            // If popup blocked, try direct redirect
            window.location.href = paymentUrl;
          }
        }
      };

      // Load Cashfree v3 SDK if not already loaded
      if (!window.Cashfree) {
        console.log('📦 Loading Cashfree v3 SDK...');
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.async = true;
        script.onload = () => {
          console.log('✅ Cashfree v3 SDK loaded successfully');
          console.log('🔍 Checking window.Cashfree availability:', !!window.Cashfree);
          // Wait a bit for the SDK to fully initialize
          setTimeout(() => {
            console.log('🔍 After timeout - window.Cashfree available:', !!window.Cashfree);
            if (window.Cashfree) {
              initiatePayment();
            } else {
              console.error('❌ Cashfree v3 SDK still not available after timeout');
              toast({
                title: "Payment Error",
                description: "Cashfree v3 SDK failed to initialize. Please try again.",
                variant: "destructive",
              });
            }
          }, 1000);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Cashfree v3 SDK');
          toast({
            title: "Payment Error",
            description: "Failed to load payment system. Please try again.",
            variant: "destructive",
          });
        };
        document.head.appendChild(script);
      } else {
        console.log('✅ Cashfree v3 SDK already loaded');
        initiatePayment();
      }
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('❌ Payment initiation error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      toast({
        title: "Payment Failed",
        description: `There was an error initiating payment: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-muted rounded"></div>
              </div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate delivery charges based on individual products
  const deliveryFee = items.reduce((total, item) => {
    console.log('Cart item delivery charge check:', {
      productName: item.product.name,
      hasDeliveryCharge: item.product.hasDeliveryCharge,
      deliveryCharge: item.product.deliveryCharge
    });
    // Only add delivery charge if both hasDeliveryCharge is true AND deliveryCharge exists
    if (item.product.hasDeliveryCharge && item.product.deliveryCharge) {
      return total + parseFloat(item.product.deliveryCharge.toString());
    }
    return total;
  }, 0);
  
  console.log('Total delivery fee calculated:', deliveryFee);
  
  const shippingFee = deliveryFee;
  const giftWrapFee = giftWrap ? 50 : 0;
  const expressDeliveryFee = expressDelivery ? 199 : 0;
  const totalWithExtras = totalPrice + shippingFee + giftWrapFee + expressDeliveryFee;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Pending Orders Alert */}
      {/* Pending orders warning removed - orders are now created only after payment success */}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
                      <Button variant="ghost" size="icon" onClick={() => setLocation('/cart')} data-testid="button-back-to-cart">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Lock className="h-6 w-6 text-primary" />
          <h1 className="font-serif text-3xl font-bold">Secure Checkout</h1>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-sm font-medium">Cart</span>
            </div>
            <div className="w-16 h-0.5 bg-primary"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium">Checkout</span>
            </div>
            <div className="w-16 h-0.5 bg-muted"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Demo Mode:</strong> This is a payment simulation for testing purposes. 
            Click "Place Order" to simulate payment processing (90% success rate).
            <br />
            <strong>Note:</strong> This is for PayU/Razorpay verification - payment gateway not yet integrated.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        className={errors.firstName ? 'border-destructive' : ''}
                        data-testid="input-first-name"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        className={errors.lastName ? 'border-destructive' : ''}
                        data-testid="input-last-name"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                        {...register('email')}
                        data-testid="input-email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                        {...register('phone')}
                        data-testid="input-phone"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                    <strong>✅ Service Available:</strong> We provide shipping services to all locations within India.
                  </div>
                                                          {watch('state') && addressData && getDistrictsForSelectedState(watch('state')).length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                        <strong>🔍 Address Validation:</strong> Enhanced validation enabled for {watch('state')}. Districts and pincodes are validated against official data.
                      </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                                                      {/* Use Profile Address Checkbox */}
                  {user?.address ? (
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="useProfileAddress"
                                                  onCheckedChange={async (checked) => {
                          if (checked) {
                            // Set flag to prevent automatic clearing during programmatic update
                            setIsProgrammaticUpdate(true);
                            
                            // Populate all address fields from user profile
                            setValue('firstName', user.address.firstName || user.firstName || '');
                            setValue('lastName', user.address.lastName || user.lastName || '');
                            setValue('phone', user.address.phoneNumber || user.mobileNumber || '');
                            setValue('addressLine1', user.address.addressLine1 || '');
                            setValue('addressLine2', user.address.addressLine2 || '');
                            setValue('apartment', user.address.apartment || '');
                            setValue('city', user.address.city || '');
                            
                            // Set state first, then wait for district options to populate
                            setValue('state', user.address.state || '');
                            
                            // Allow one render tick so state-dependent district options populate
                            await new Promise((resolve) => setTimeout(resolve, 0));
                            
                            setValue('district', user.address.district || '');
                            setValue('pincode', user.address.pincode || '');
                            setValue('country', 'India');
                            setSelectedCountry('India');
                            
                            // Reset the flag
                            setIsProgrammaticUpdate(false);
                            setProfileAddressLoaded(true);
                            
                            // Validate the loaded address
                            setTimeout(() => {
                              if (user.address.state && user.address.pincode) {
                                validatePincode(user.address.pincode);
                              }
                            }, 100);
                            
                            // Show success toast
                            toast({
                              title: "Address Loaded",
                              description: "Your profile address has been loaded successfully. You can edit any field if needed.",
                            });
                          } else {
                            // Clear address fields when unchecked, but keep basic user info
                            setValue('addressLine1', '');
                            setValue('addressLine2', '');
                            setValue('apartment', '');
                            setValue('city', '');
                            setValue('district', '');
                            setValue('state', '');
                            setValue('pincode', '');
                            setValue('country', 'India');
                            setSelectedCountry('India');
                            setProfileAddressLoaded(false);
                            
                            // Clear validation state
                            setAddressValidation({
                              pincode: { isValid: true, suggestions: [] }
                            });
                          }
                        }}
                          data-testid="checkbox-use-profile-address"
                        />
                        <Label htmlFor="useProfileAddress" className="text-sm font-medium cursor-pointer">
                          Use address from my profile
                        </Label>
                        {profileAddressLoaded && (
                          <Badge variant="secondary" className="ml-2">
                            ✓ Loaded
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        Check this box to automatically fill in your shipping address using the information from your profile. 
                        You can still edit any field after auto-filling.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Tip:</strong> You can save time by adding your address to your profile. 
                        This will allow you to quickly fill in shipping details during checkout.
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="addressLine1" className="flex items-center gap-2">
                      Address Line 1 *
                      {profileAddressLoaded && (
                        <Badge variant="outline" className="text-xs">
                          From Profile
                        </Badge>
                      )}
                    </Label>
                    <Textarea
                      id="addressLine1"
                      {...register('addressLine1')}
                      className={errors.addressLine1 ? 'border-destructive' : ''}
                      placeholder="Enter your street address, building number, etc."
                      data-testid="input-address-line1"
                    />
                    {errors.addressLine1 && (
                      <p className="text-sm text-destructive mt-1">{errors.addressLine1.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="addressLine2">
                      Address Line 2 (Optional)
                    </Label>
                    <Textarea
                      id="addressLine2"
                      {...register('addressLine2')}
                      placeholder="Apartment, suite, unit, etc. (optional)"
                      data-testid="input-address-line2"
                    />
                  </div>

                  

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                      <strong>Note:</strong> Currently, we only provide shipping services to India. Other countries are not supported.
                    </div>
                    <Select 
                      value={watch('country') || ''}
                      onValueChange={(value) => {
                        setValue('country', value);
                        setSelectedCountry(value);
                      }}
                    >
                      <SelectTrigger className={errors.country ? 'border-destructive' : ''} data-testid="select-country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India" className="text-green-600 font-medium">
                          🇮🇳 India - Service Available
                        </SelectItem>
                        <SelectItem value="United States" className="text-muted-foreground opacity-60 cursor-not-allowed" disabled>
                          🇺🇸 United States - Service Not Available
                        </SelectItem>
                        <SelectItem value="United Kingdom" className="text-muted-foreground opacity-60 cursor-not-allowed" disabled>
                          🇬🇧 United Kingdom - Service Not Available
                        </SelectItem>
                        <SelectItem value="Canada" className="text-muted-foreground opacity-60 cursor-not-allowed" disabled>
                          🇨🇦 Canada - Service Not Available
                        </SelectItem>
                        <SelectItem value="Australia" className="text-muted-foreground opacity-60 cursor-not-allowed" disabled>
                          🇦🇺 Australia - Service Not Available
                        </SelectItem>
                        <SelectItem value="Germany" className="text-muted-foreground opacity-60 cursor-not-allowed" disabled>
                          🇩🇪 Germany - Service Not Available
                        </SelectItem>
                        <SelectItem value="France" className="text-muted-foreground opacity-60 cursor-not-allowed" disabled>
                          🇫🇷 France - Service Not Available
                        </SelectItem>
                        <SelectItem value="Japan" className="text-muted-foreground opacity-60 cursor-not-allowed" disabled>
                          🇯🇵 Japan - Service Not Available
                        </SelectItem>
                        <SelectItem value="China" className="text-muted-foreground opacity-60 cursor-not-allowed" disabled>
                          🇨🇳 China - Service Not Available
                        </SelectItem>
                        <SelectItem value="Other" className="text-muted-foreground opacity-60 cursor-not-allowed" disabled>
                          🌍 Other Countries - Service Not Available
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
                    )}
                    {selectedCountry !== 'India' && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                        <strong>⚠️ Warning:</strong> Shipping to {selectedCountry} is not currently supported. Please select India to continue with your order.
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Currently, we only provide shipping services to India. Other countries are not supported at this time.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select 
                      value={watch('state') || ''}
                      onValueChange={(value) => {
                        setValue('state', value);
                        // Only clear district if this is not a programmatic update
                        if (!isProgrammaticUpdate) {
                          setValue('district', '');
                        }
                        // Re-validate pincode when state changes
                        if (watch('pincode')) validatePincodeRealTime(watch('pincode'));
                      }}
                    >
                      <SelectTrigger className={errors.state ? 'border-destructive' : ''} data-testid="select-state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                                              <SelectContent>
                          {availableStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
                    )}

                  </div>

                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Select
                      value={watch('district') || ''}
                      onValueChange={(value) => {
                        setValue('district', value);
                        // Re-validate pincode when district changes
                        if (watch('pincode')) validatePincodeRealTime(watch('pincode'));
                      }}
                      disabled={!watch('state')}
                    >
                      <SelectTrigger className={errors.district ? 'border-destructive' : ''} data-testid="select-district">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {watch('state') && addressData ? (
                          getDistrictsForSelectedState(watch('state')).map((district: string) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-state" disabled>
                            Please select a state first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.district && (
                      <p className="text-sm text-destructive mt-1">{errors.district.message}</p>
                    )}
                    {!watch('state') && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Info className="h-3 w-3" />
                        <span>Please select a state to see available districts</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city" className="flex items-center gap-2">
                      City *
                      {profileAddressLoaded && (
                        <Badge variant="outline" className="text-xs">
                          From Profile
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id="city"
                      value={watch('city') || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setValue('city', value);
                      }}
                      className=""
                      data-testid="input-city"
                      placeholder="Enter city name"
                    />
                    {errors.city && !watch('city') && (
                      <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  
                  {/* Area (moved from above, previously Apartment/Suite/Landmark) */}
                  <div>
                    <Label htmlFor="area">
                      Area
                    </Label>
                    <Input
                      id="area"
                      {...register('apartment')}
                      placeholder="Enter area or locality"
                      data-testid="input-area"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pincode">PIN Code *</Label>
                    <div className="relative">
                      <Input
                        id="pincode"
                        value={watch('pincode') || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleFieldChange('pincode', value);
                        }}
                        className="pr-20"
                        placeholder="e.g., 400001"
                        data-testid="input-pincode"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const pincode = watch('pincode');
                          if (pincode && pincode.length === 6) {
                            searchAndFillAddressByPincode(pincode);
                          }
                        }}
                        disabled={!watch('pincode') || watch('pincode').length !== 6}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Search
                      </button>
                    </div>




                    <div className="mt-2 text-xs text-muted-foreground">
                      💡 <strong>Pro tip:</strong> Enter a 6-digit pincode and click "Search" to auto-fill your address!
                    </div>
                    
                    {/* Pincode Suggestions */}
                    {showPincodeSuggestions && pincodeSuggestions.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="font-medium text-blue-800 mb-2">
                          📍 Found {pincodeSuggestions.length} address{pincodeSuggestions.length > 1 ? 'es' : ''} for pincode {watch('pincode')}:
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {pincodeSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              onClick={() => fillAddressFromSuggestion(suggestion)}
                              className="p-2 bg-white border border-blue-200 rounded cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                              <div className="font-medium text-gray-900">{suggestion.area}</div>
                              <div className="text-sm text-gray-600">
                                {suggestion.district}, {suggestion.state} - {suggestion.pincode}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-blue-600">
                          💡 Click on any address above to auto-fill your form
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="specialInstructions"
                      {...register('specialInstructions')}
                      placeholder="Any special delivery instructions..."
                      data-testid="input-special-instructions"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Additional Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="giftWrap"
                      checked={giftWrap}
                      onCheckedChange={(checked) => setGiftWrap(checked === true)}
                      data-testid="checkbox-gift-wrap"
                    />
                    <Label htmlFor="giftWrap" className="flex items-center gap-2">
                      Gift Wrap <Badge variant="secondary">+₹50</Badge>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="expressDelivery"
                      checked={expressDelivery}
                      onCheckedChange={(checked) => setExpressDelivery(checked === true)}
                      data-testid="checkbox-express-delivery"
                    />
                    <Label htmlFor="expressDelivery" className="flex items-center gap-2">
                      Express Delivery (1-2 days) <Badge variant="secondary">+₹199</Badge>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3" data-testid={`order-item-${item.productId}`}>
                        <img
                          src={item.product.images?.[0] || '/placeholder-image.jpg'}
                          alt={item.product.name}
                          className="w-12 h-12 object-contain bg-white rounded border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium">
                          ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span data-testid="text-checkout-subtotal">₹{totalPrice.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span data-testid="text-checkout-shipping">
                        {shippingFee === 0 ? 'Free' : `₹${shippingFee}`}
                      </span>
                    </div>
                    
                    {giftWrap && (
                      <div className="flex justify-between">
                        <span>Gift Wrap</span>
                        <span data-testid="text-gift-wrap-fee">₹{giftWrapFee}</span>
                      </div>
                    )}
                    
                    {expressDelivery && (
                      <div className="flex justify-between">
                        <span>Express Delivery</span>
                        <span data-testid="text-express-delivery-fee">₹{expressDeliveryFee}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span data-testid="text-checkout-total">₹{totalWithExtras.toLocaleString()}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gift-gradient hover:opacity-90"
                    size="lg"
                    disabled={isProcessing}
                    data-testid="button-place-order"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Place Order
                      </>
                    )}
                  </Button>

                  {/* Security Features */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      <span>Secure SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CreditCard className="h-3 w-3" />
                      <span>Demo Payment Simulation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      {/* Order Confirmation Dialog */}
      {showConfirmationDialog && pendingOrderData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Confirm Your Order</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Order Number:</span>
                      <span className="font-medium">{pendingOrderData.order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-bold text-lg">₹{pendingOrderData.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span>{items.length} item(s)</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-blue-500 rounded-full mt-0.5">
                      <CreditCard className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Payment Information</h4>
                      <p className="text-sm text-blue-800">
                        You will be redirected to our secure payment gateway to complete your purchase. 
                        Your order will be confirmed only after successful payment.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-yellow-500 rounded-full mt-0.5">
                      <Clock className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">Payment Timeout</h4>
                      <p className="text-sm text-yellow-800">
                        You have 30 minutes to complete payment. If payment is not completed within this time, 
                        your order will be automatically cancelled.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowConfirmationDialog(false);
                    setPendingOrderData(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePaymentConfirmation}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Pay
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cashfree Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <CashfreePayment
              paymentSessionId={paymentSessionId}
              orderId={watch('firstName') + '_' + Date.now()}
              amount={totalWithExtras}
              customerName={`${watch('firstName')} ${watch('lastName')}`}
              customerEmail={watch('email')}
              customerPhone={watch('phone')}
              onSuccess={(paymentData) => {
                console.log('Payment successful:', paymentData);
                setShowPaymentModal(false);
                clearCart();
                toast({
                  title: "Payment Successful!",
                  description: "Your order has been placed successfully.",
                });
                setLocation('/payment/success');
              }}
              onFailure={(error) => {
                console.error('Payment failed:', error);
                setShowPaymentModal(false);
                toast({
                  title: "Payment Failed",
                  description: "There was an error processing your payment. Please try again.",
                  variant: "destructive",
                });
              }}
              onClose={() => {
                setShowPaymentModal(false);
              }}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
