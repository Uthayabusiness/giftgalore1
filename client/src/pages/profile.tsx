import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { validateIndianPhoneNumber } from '@/lib/addressUtils';
import { validatePincodeForState, getPincodeRange, INDIAN_STATES_DATA, getDistrictsForState, INDIAN_STATES } from '@/lib/addressValidation';
import { validateComprehensivePincode, getComprehensivePincodeRange, COMPREHENSIVE_INDIAN_STATES_DATA, getComprehensiveDistrictsForState, COMPREHENSIVE_INDIAN_STATES } from '@/lib/comprehensiveAddressData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X, 
  Camera,
  Copy,
  Check,
  RefreshCw,
  MapPin,
  Home,
  Building,
  AlertCircle,
  Info
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobileNumber: z.string().min(10, 'Mobile number must be at least 10 characters'),
  address: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().optional(),
    apartment: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    district: z.string().min(1, 'District is required'),
    state: z.string().min(1, 'State is required'),
    // Allow any 6-digit pincode; do not block saves based on state/district match
    pincode: z.string().regex(/^\d{6}$/g, 'Pincode must be 6 digits'),
    country: z.string().min(1, 'Country is required'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
    alternativeNumber: z.string().optional(),
  }).refine((data) => {
    // Validate phone number for India
    if (data.country === 'India' && data.phoneNumber) {
      const validation = validateIndianPhoneNumber(data.phoneNumber);
      return validation.isValid;
    }
    return true;
  }, {
    message: "Invalid phone number format",
    path: ["phoneNumber"]
  }).refine((data) => {
    // Validate alternative number if provided
    if (data.country === 'India' && data.alternativeNumber && data.alternativeNumber.length > 0) {
      const validation = validateIndianPhoneNumber(data.alternativeNumber);
      return validation.isValid;
    }
    return true;
  }, {
    message: "Invalid alternative phone number format",
    path: ["alternativeNumber"]
  }),
});

type ProfileForm = z.infer<typeof profileSchema>;

// Custom hook to force re-renders
function useForceUpdate() {
  const [, forceUpdate] = useState({});
  return () => forceUpdate({});
}

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [localUser, setLocalUser] = useState(user);
  const [forceRefresh, setForceRefresh] = useState(0);
  const forceUpdate = useForceUpdate();
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [addressValidation, setAddressValidation] = useState<{
    pincode: { isValid: boolean; suggestions: string[] };
  }>({
    pincode: { isValid: true, suggestions: [] }
  });
  const [pincodeSuggestions, setPincodeSuggestions] = useState<any[]>([]);
  const [showPincodeSuggestions, setShowPincodeSuggestions] = useState(false);
  // Add a flag to prevent automatic clearing during programmatic updates
  const [isProgrammaticUpdate, setIsProgrammaticUpdate] = useState(false);
  // State to hold loaded address data (same as checkout)
  const [addressData, setAddressData] = useState<any>({});

  // Load address data from addressData.json (same as checkout)
  useEffect(() => {
    const loadAddressData = async () => {
      try {
        const response = await fetch('/addressData.json');
        const data = await response.json();
        setAddressData(data);
        console.log('✅ Profile: Loaded address data with states:', Object.keys(data).map(stateKey => data[stateKey].statename));
      } catch (error) {
        console.error('❌ Profile: Error loading address data:', error);
      }
    };
    
    loadAddressData();
  }, []);

  // Helper function to get districts for a selected state (same as checkout)
  const getDistrictsForSelectedState = (state: string) => {
    if (!addressData || !state) return [];
    
    console.log('🔍 Profile: getDistrictsForSelectedState called with state:', state);
    
    const stateKey = Object.keys(addressData).find(key => addressData[key].statename === state);
    console.log('🔍 Profile: Found stateKey:', stateKey);
    
    if (!stateKey) {
      console.log('❌ Profile: No stateKey found for state:', state);
      return [];
    }
    
    const stateData = addressData[stateKey];
    const districts = stateData.districts.map((district: any) => district.districtname);
    console.log('🔍 Profile: Extracted district names:', districts);
    
    return districts;
  };

  // Update currentUser when user changes
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      console.log('User data loaded:', user);
    }
  }, [user]);

  // Debug log to see user data changes
  useEffect(() => {
    console.log('User data updated:', user);
    setLocalUser(user);
  }, [user]);

  // Force refresh when localUser changes
  useEffect(() => {
    if (localUser) {
      setForceRefresh(prev => prev + 1);
      console.log('Local user updated, forcing refresh');
    }
  }, [localUser]);

  // Force refresh when address specifically changes
  useEffect(() => {
    if (localUser?.address) {
      console.log('Address changed, forcing refresh:', localUser.address);
      setForceRefresh(prev => prev + 1);
      forceUpdate();
    }
  }, [localUser?.address, forceUpdate]);

  // Auto-refresh user data if userId is missing
  useEffect(() => {
    if (user && !user.userId && !isLoading) {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    }
  }, [user?.userId, isLoading]);

  // Address validation functions (same as checkout)
  const validatePincode = (pincode: string) => {
    if (!pincode) return;

    // Use addressData.json for validation (same as checkout)
    if (addressData && form.watch('address.state') && form.watch('address.district')) {
      const state = form.watch('address.state');
      const district = form.watch('address.district');
      
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
    if (form.watch('address.state') && form.watch('address.district')) {
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
    form.setValue(`address.${field}`, value);
    
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
          title: "Pincode Not Found",
          description: "This pincode was not found in our database. Please enter your address manually.",
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
    // Set flag to prevent automatic clearing
    setIsProgrammaticUpdate(true);
    
    // Fill all address fields
    form.setValue('address.state', suggestion.state);
    
    // Allow one render tick so state-dependent district options populate
    // before we programmatically set the district. This avoids the first-click
    // issue where the Select clears because options are not ready yet.
    await new Promise((resolve) => setTimeout(resolve, 0));
    
    form.setValue('address.district', suggestion.district);
    form.setValue('address.apartment', suggestion.area);
    form.setValue('address.pincode', suggestion.pincode.toString());
    form.setValue('address.country', 'India'); // Always set country to India
    
    // Reset the flag
    setIsProgrammaticUpdate(false);
    
    // Hide suggestions after selection
    setShowPincodeSuggestions(false);
    setPincodeSuggestions([]);
    
    // Reset address validation to clear any previous errors
    setAddressValidation(prev => ({
      ...prev,
      pincode: { isValid: true, suggestions: [] }
    }));
    
    // Show success message
    toast({
      title: "Address Filled!",
      description: `Selected: ${suggestion.area}, ${suggestion.district}, ${suggestion.state}`,
    });
    
    // Wait a bit for form values to update, then validate
    setTimeout(() => {
      validatePincode(suggestion.pincode.toString());
    }, 100);
  };


  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      mobileNumber: user?.mobileNumber || '',
              address: {
          firstName: user?.address?.firstName || user?.firstName || '',
          lastName: user?.address?.lastName || user?.lastName || '',
          addressLine1: user?.address?.addressLine1 || '',
          addressLine2: user?.address?.addressLine2 || '',
          apartment: user?.address?.apartment || '',
          city: user?.address?.city || '',
          district: user?.address?.district || '',
          state: user?.address?.state || '',
          pincode: user?.address?.pincode || '',
          country: user?.address?.country || 'India',
          phoneNumber: user?.address?.phoneNumber || user?.mobileNumber || '',
          alternativeNumber: user?.address?.alternativeNumber || '',
        },
    },
  });

  // Update form values when user data loads
  useEffect(() => {
    if (user && !isEditing) {
      const formData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        address: {
          firstName: user.address?.firstName || user.firstName || '',
          lastName: user.address?.lastName || user.lastName || '',
          addressLine1: user.address?.addressLine1 || '',
          addressLine2: user.address?.addressLine2 || '',
          apartment: user.address?.apartment || '',
          city: user.address?.city || '',
          district: user.address?.district || '',
          state: user.address?.state || '',
          pincode: user.address?.pincode || '',
          country: user.address?.country || 'India',
          phoneNumber: user.address?.phoneNumber || user.mobileNumber || '',
          alternativeNumber: user.address?.alternativeNumber || '',
        },
      };
      
      form.reset(formData);
    }
  }, [user, isEditing, form]);

  // Additional effect to ensure district is set when switching to edit mode
  useEffect(() => {
    if (isEditing && user?.address?.state && user?.address?.district) {
      // Set state first, then wait for district options to populate
      form.setValue('address.state', user.address.state);
      
      // Use setTimeout to ensure district options are loaded
      setTimeout(() => {
        form.setValue('address.district', user.address.district);
      }, 100);
    }
  }, [isEditing, user?.address?.state, user?.address?.district, form]);

  // Update available districts when state changes
  useEffect(() => {
    const selectedState = form.watch('address.state');
    if (selectedState) {
      const districts = getDistrictsForSelectedState(selectedState);
      setAvailableDistricts(districts);
      // Clear district if it's not valid for the new state
      const currentDistrict = form.watch('address.district');
      if (currentDistrict && !districts.includes(currentDistrict)) {
        form.setValue('address.district', '');
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [form.watch('address.state')]);

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);
        
        // Create the updated user object with the new address data
        const updatedUser = {
          ...result.user,
          address: {
            firstName: data.address.firstName,
            lastName: data.address.lastName,
            addressLine1: data.address.addressLine1,
            addressLine2: data.address.addressLine2 || '',
            apartment: data.address.apartment || '',
            city: data.address.city,
            district: data.address.district,
            state: data.address.state,
            pincode: data.address.pincode,
            country: data.address.country,
            phoneNumber: data.address.phoneNumber,
            alternativeNumber: data.address.alternativeNumber || '',
          }
        };
        
        // Update ALL state variables immediately
        setCurrentUser(updatedUser);
        setLocalUser(updatedUser);
        
        // Update React Query cache
        queryClient.setQueryData(['/api/auth/user'], updatedUser);
        
        // Force refresh
        setRefreshKey(prev => prev + 1);
        setUpdateTrigger(prev => prev + 1);
        setForceRefresh(prev => prev + 1);
        forceUpdate();
        
        // Log for debugging
        console.log('Updated user data:', updatedUser);
        console.log('Address data:', updatedUser.address);
        
        // Update form with new data
        setTimeout(() => {
          form.reset({
            firstName: updatedUser.firstName || data.firstName,
            lastName: updatedUser.lastName || data.lastName,
            email: updatedUser.email || data.email,
            mobileNumber: updatedUser.mobileNumber || data.mobileNumber,
            address: updatedUser.address,
          });
        }, 100);
      } else {
        const error = await response.json();
        toast({
          title: "Update failed",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyUserId = async () => {
    if (currentUser?.userId && currentUser.userId !== 'N/A') {
      await navigator.clipboard.writeText(currentUser.userId);
      setCopied(true);
      toast({
        title: "Customer ID copied",
        description: "Your customer ID has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: "Customer ID not available",
        description: "Your customer ID is being generated. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

                     {/* Overview Tab */}
           <TabsContent 
             key={`overview-${currentUser?.id}-${refreshKey}-${updateTrigger}-${forceRefresh}-${JSON.stringify(currentUser?.address)}`}
             value="overview" 
             className="space-y-6"
           >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Debug Info - Remove this later */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-xs">
                    <p><strong>Debug Info:</strong></p>
                    <p>Current User Address: {JSON.stringify(currentUser?.address)}</p>
                    <p>Local User Address: {JSON.stringify(localUser?.address)}</p>
                    <p>Refresh Key: {refreshKey}</p>
                    <p>Update Trigger: {updateTrigger}</p>
                    <p>Force Refresh: {forceRefresh}</p>
                    <p>Has Address: {currentUser?.address ? 'Yes' : 'No'}</p>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setRefreshKey(prev => prev + 1);
                        setForceRefresh(prev => prev + 1);
                        forceUpdate();
                        console.log('Manual refresh triggered');
                      }}
                      className="mt-2"
                    >
                      Force Refresh Overview
                    </Button>
                  </div>
                )}
                
                {/* Profile Header */}
                                 <div className="flex items-center gap-6">
                   <Avatar className="h-24 w-24">
                     <AvatarImage src={currentUser?.profileImageUrl} />
                     <AvatarFallback className="text-2xl">
                       {getInitials(currentUser?.firstName, currentUser?.lastName)}
                     </AvatarFallback>
                   </Avatar>
                   <div className="space-y-2">
                     <h3 className="text-2xl font-semibold">
                       {currentUser?.firstName} {currentUser?.lastName}
                     </h3>
                     <div className="flex items-center gap-2">
                       <Badge variant={currentUser?.role === 'admin' ? 'default' : 'secondary'}>
                         {currentUser?.role === 'admin' ? 'Administrator' : 'Customer'}
                       </Badge>
                       <Badge variant="outline">
                         {currentUser?.isActive ? 'Active' : 'Inactive'}
                       </Badge>
                     </div>
                   </div>
                 </div>

                <Separator />

                                 {/* Customer ID Section */}
                                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Customer ID</Label>
                    <div className="flex items-center gap-2">
                                           <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm">
                       {currentUser?.userId || 'N/A'}
                     </div>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={copyUserId}
                       disabled={!currentUser?.userId || currentUser?.userId === 'N/A'}
                     >
                       {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                     </Button>
                     {(!currentUser?.userId || currentUser?.userId === 'N/A') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              // Force refresh user data
                              await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
                              await queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });
                              toast({
                                title: "Refreshing user data",
                                description: "Please wait while we update your information.",
                              });
                            } catch (error) {
                              toast({
                                title: "Refresh failed",
                                description: "Please try logging out and back in.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This is your customer identifier. You can copy it to share with support.
                    </p>
                  </div>

                <Separator />

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                                         <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                   </div>

                   <div className="space-y-2">
                     <Label className="text-sm font-medium flex items-center gap-2">
                       <Phone className="h-4 w-4" />
                       Mobile Number
                     </Label>
                     <p className="text-sm text-muted-foreground">
                       {currentUser?.mobileNumber || 'Not provided'}
                     </p>
                  </div>
                </div>

                <Separator />

                                {/* Address Information */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Address Information
                  </Label>
                                     {currentUser?.address && Object.keys(currentUser.address).length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label className="text-sm font-medium flex items-center gap-2">
                           <User className="h-4 w-4" />
                           Contact Person
                         </Label>
                         <p className="text-sm text-muted-foreground">
                           {currentUser.address.firstName && currentUser.address.lastName 
                             ? `${currentUser.address.firstName} ${currentUser.address.lastName}`
                             : 'Not provided'
                           }
                         </p>
                       </div>

                       <div className="space-y-2">
                         <Label className="text-sm font-medium flex items-center gap-2">
                           <Phone className="h-4 w-4" />
                           Phone Number
                         </Label>
                         <p className="text-sm text-muted-foreground">
                           {currentUser.address.phoneNumber || 'Not provided'}
                         </p>
                       </div>

                       <div className="space-y-2">
                         <Label className="text-sm font-medium flex items-center gap-2">
                           <MapPin className="h-4 w-4" />
                           Address Line 1
                         </Label>
                         <p className="text-sm text-muted-foreground">
                           {currentUser.address.addressLine1 || 'Not provided'}
                         </p>
                       </div>

                       <div className="space-y-2">
                         <Label className="text-sm font-medium">Address Line 2</Label>
                         <p className="text-sm text-muted-foreground">
                           {currentUser.address.addressLine2 || 'Not provided'}
                         </p>
                       </div>

                       <div className="space-y-2">
                         <Label className="text-sm font-medium flex items-center gap-2">
                           <Building className="h-4 w-4" />
                           Area
                         </Label>
                         <p className="text-sm text-muted-foreground">
                           {currentUser.address.apartment || 'Not provided'}
                         </p>
                       </div>

                       <div className="space-y-2">
                         <Label className="text-sm font-medium">City</Label>
                         <p className="text-sm text-muted-foreground">
                           {currentUser.address.city || 'Not provided'}
                         </p>
                       </div>

                       <div className="space-y-2">
                         <Label className="text-sm font-medium">District</Label>
                         <p className="text-sm text-muted-foreground">
                           {currentUser.address.district || 'Not provided'}
                         </p>
                       </div>

                       <div className="space-y-2">
                         <Label className="text-sm font-medium">State</Label>
                         <p className="text-sm text-muted-foreground">
                           {currentUser.address.state || 'Not provided'}
                         </p>
                       </div>

                       <div className="space-y-2">
                         <Label className="text-sm font-medium">Pincode</Label>
                         <p className="text-sm text-muted-foreground">
                           {currentUser.address.pincode || 'Not provided'}
                         </p>
                       </div>

                       <div className="space-y-2">
                         <Label className="text-sm font-medium">Country</Label>
                         <p className="text-sm text-muted-foreground">
                           {currentUser.address.country || 'India'}
                         </p>
                       </div>

                                                {currentUser.address.alternativeNumber && (
                         <div className="space-y-2">
                           <Label className="text-sm font-medium">Alternative Number</Label>
                           <p className="text-sm text-muted-foreground">
                             {currentUser.address.alternativeNumber}
                           </p>
                         </div>
                       )}
                     </div>
                   ) : (
                    <p className="text-sm text-muted-foreground">
                      No address information provided. You can add your address in the Edit Profile section.
                    </p>
                  )}
                </div>

                <Separator />

                {/* Account Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </Label>
                                         <p className="text-sm text-muted-foreground">
                       {new Date(currentUser?.createdAt || '').toLocaleDateString()}
                     </p>
                   </div>

                   <div className="space-y-2">
                     <Label className="text-sm font-medium flex items-center gap-2">
                       <Shield className="h-4 w-4" />
                       Account Status
                     </Label>
                     <p className="text-sm text-muted-foreground">
                       {currentUser?.isActive ? 'Active' : 'Inactive'}
                     </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="edit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Edit Profile
                </CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
                             <CardContent>
                 <form 
                   key={`profile-form-${user?.id}-${isEditing}`}
                   onSubmit={form.handleSubmit(onSubmit)} 
                   className="space-y-4"
                 >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...form.register('firstName')}
                        disabled={!isEditing}
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        {...form.register('lastName')}
                        disabled={!isEditing}
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      disabled={!isEditing}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input
                      id="mobileNumber"
                      type="tel"
                      {...form.register('mobileNumber')}
                      disabled={!isEditing}
                    />
                    {form.formState.errors.mobileNumber && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.mobileNumber.message}
                      </p>
                    )}
                  </div>

                  {/* Address Section */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Address Information
                    </Label>
                    
                    {/* Contact Person */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="addressFirstName">First Name *</Label>
                        <Input
                          id="addressFirstName"
                          {...form.register('address.firstName')}
                          disabled={!isEditing}
                          placeholder="Enter first name"
                        />
                        {form.formState.errors.address?.firstName && (
                          <p className="text-sm text-red-600">
                            {form.formState.errors.address.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressLastName">Last Name *</Label>
                        <Input
                          id="addressLastName"
                          {...form.register('address.lastName')}
                          disabled={!isEditing}
                          placeholder="Enter last name"
                        />
                        {form.formState.errors.address?.lastName && (
                          <p className="text-sm text-red-600">
                            {form.formState.errors.address.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address Lines */}
                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Textarea
                        id="addressLine1"
                        {...form.register('address.addressLine1')}
                        disabled={!isEditing}
                        placeholder="Enter your street address, building name, etc."
                        rows={2}
                      />
                      {form.formState.errors.address?.addressLine1 && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.address.addressLine1.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Textarea
                        id="addressLine2"
                        {...form.register('address.addressLine2')}
                        disabled={!isEditing}
                        placeholder="Apartment, suite, unit, etc. (optional)"
                        rows={2}
                      />
                    </div>





                                         {/* City, State, District, Pincode */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label htmlFor="city">City *</Label>
                         <Input
                           id="city"
                           {...form.register('address.city')}
                           disabled={!isEditing}
                           placeholder="Enter city name"
                         />
                         {form.formState.errors.address?.city && (
                           <p className="text-sm text-red-600">
                             {form.formState.errors.address.city.message}
                           </p>
                         )}
                       </div>

                       {/* Area (moved from above, previously Apartment/Suite/Landmark) */}
                       <div className="space-y-2">
                         <Label htmlFor="area">Area</Label>
                         <Input
                           id="area"
                           {...form.register('address.apartment')}
                           disabled={!isEditing}
                           placeholder="Enter area or locality"
                         />
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label htmlFor="state">State *</Label>
                         <Select
                           disabled={!isEditing}
                           value={form.watch('address.state')}
                           onValueChange={(value) => {
                             form.setValue('address.state', value);
                             // Only clear district if this is not a programmatic update
                             if (!isProgrammaticUpdate) {
                               form.setValue('address.district', '');
                             }
                             // Re-validate pincode when state changes
                             if (form.watch('address.pincode')) validatePincodeRealTime(form.watch('address.pincode'));
                           }}
                         >
                           <SelectTrigger>
                             <SelectValue placeholder="Select State" />
                           </SelectTrigger>
                           <SelectContent>
                             {addressData ? (
                               Object.keys(addressData).map(stateKey => {
                                 const state = addressData[stateKey].statename;
                                 return (
                                   <SelectItem key={state} value={state}>
                                     {state}
                                   </SelectItem>
                                 );
                               })
                             ) : (
                               <SelectItem value="loading" disabled>
                                 Loading states...
                               </SelectItem>
                             )}
                           </SelectContent>
                         </Select>
                         {form.formState.errors.address?.state && (
                           <p className="text-sm text-red-600">
                             {form.formState.errors.address.state.message}
                           </p>
                         )}
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label htmlFor="district">District *</Label>
                         <Select
                           disabled={!isEditing || !form.watch('address.state')}
                           value={form.watch('address.district') || ''}
                           onValueChange={(value) => {
                             handleFieldChange('district', value);
                             // Re-validate pincode when district changes
                             if (form.watch('address.pincode')) validatePincodeRealTime(form.watch('address.pincode'));
                           }}
                         >
                           <SelectTrigger>
                             <SelectValue placeholder="Select district" />
                           </SelectTrigger>
                                                        <SelectContent>
                               {form.watch('address.state') && addressData ? (
                                 getDistrictsForSelectedState(form.watch('address.state')).map((district: string) => (
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
                         {form.formState.errors.address?.district && (
                           <p className="text-sm text-red-600">
                             {form.formState.errors.address.district.message}
                           </p>
                         )}
                         {!form.watch('address.state') && (
                           <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                             <Info className="h-3 w-3" />
                             <span>Please select a state to see available districts</span>
                           </div>
                         )}
                       </div>

                       <div className="space-y-2">
                         <Label htmlFor="pincode">Pincode *</Label>
                         <div className="relative">
                           <Input
                             id="pincode"
                             value={form.watch('address.pincode') || ''}
                             onChange={(e) => {
                               const value = e.target.value;
                               handleFieldChange('pincode', value);
                             }}
                             className="pr-20"
                             disabled={!isEditing}
                             placeholder="6-digit pincode"
                             maxLength={6}
                           />
                           {isEditing && (
                             <button
                               type="button"
                               onClick={() => {
                                 const pincode = form.watch('address.pincode');
                                 if (pincode && pincode.length === 6) {
                                   searchAndFillAddressByPincode(pincode);
                                 }
                               }}
                               disabled={!form.watch('address.pincode') || form.watch('address.pincode').length !== 6}
                               className="absolute right-1 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                             >
                               Search
                             </button>
                           )}
                         </div>
                         {form.formState.errors.address?.pincode && (
                           <p className="text-sm text-red-600">
                             {form.formState.errors.address.pincode.message}
                           </p>
                         )}


                    {isEditing && (
                                              <div className="mt-2 text-xs text-muted-foreground">
                          💡 <strong>Pro tip:</strong> Enter a 6-digit pincode and click "Search" to auto-fill your address!
                        </div>
                    )}
                    
                    {/* Pincode Suggestions */}
                    {showPincodeSuggestions && pincodeSuggestions.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="font-medium text-blue-800 mb-2">
                          📍 Found {pincodeSuggestions.length} address{pincodeSuggestions.length > 1 ? 'es' : ''} for pincode {form.watch('address.pincode')}:
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
                     </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <Label htmlFor="country">Country/Region *</Label>
                      <Select
                        disabled={!isEditing}
                        value={form.watch('address.country')}
                        onValueChange={(value) => form.setValue('address.country', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="India">India</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.address?.country && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.address.country.message}
                        </p>
                      )}
                    </div>

                    {/* Phone Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          {...form.register('address.phoneNumber')}
                          disabled={!isEditing}
                          placeholder="10-digit mobile number"
                          maxLength={10}
                        />
                        {form.formState.errors.address?.phoneNumber && (
                          <p className="text-sm text-red-600">
                            {form.formState.errors.address.phoneNumber.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="alternativeNumber">Alternative Number</Label>
                        <Input
                          id="alternativeNumber"
                          type="tel"
                          {...form.register('address.alternativeNumber')}
                          disabled={!isEditing}
                          placeholder="Alternative number (optional)"
                          maxLength={10}
                        />
                        {form.formState.errors.address?.alternativeNumber && (
                          <p className="text-sm text-red-600">
                            {form.formState.errors.address.alternativeNumber.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                                                 <Button
                           type="submit"
                           disabled={isSaving}
                           className="flex items-center gap-2"
                         >
                           {isSaving ? (
                             <>
                               <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                               Saving...
                             </>
                           ) : (
                             <>
                               <Save className="h-4 w-4" />
                               Save Changes
                             </>
                           )}
                         </Button>
                                                 <Button
                           type="button"
                           variant="outline"
                           disabled={isSaving}
                           onClick={() => {
                             setIsEditing(false);
                             form.reset();
                           }}
                           className="flex items-center gap-2"
                         >
                           <X className="h-4 w-4" />
                           Cancel
                         </Button>
                      </>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {user.role === 'admin' ? 'Administrator Account' : 'Customer Account'}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Last Login</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.updatedAt).toLocaleString()}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {user.isActive ? 'Your account is active and secure' : 'Your account is currently inactive'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
