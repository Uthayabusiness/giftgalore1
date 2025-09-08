# Indian Address Data System

This system provides comprehensive access to detailed Indian address data using the `addressData.json` file. It offers much more granular information than the previous system, including specific area names and exact pincodes.

## Features

- **Detailed Area Data**: Access to specific area names and exact pincodes
- **Cascading Dropdowns**: State → District → Area selection
- **Real-time Validation**: Instant address validation with suggestions
- **Search Functionality**: Search by pincode or area name
- **TypeScript Support**: Full type safety and interfaces
- **React Hooks**: Easy integration with React components
- **Error Handling**: Comprehensive error handling and loading states
- **Profile Integration**: Complete address management for user profiles
- **Checkout Integration**: Streamlined shipping address for e-commerce
- **Landmark Suggestions**: Smart suggestions for better delivery

## File Structure

```
client/src/
├── lib/
│   ├── comprehensiveAddressData.ts     # Original high-level data
│   └── detailedAddressData.ts         # New detailed data system
├── hooks/
│   └── useAddressData.ts              # React hook for address data
└── components/
    ├── AddressSelector.tsx            # Basic cascading dropdown component
    ├── AddressSearch.tsx              # Search functionality component
    ├── EnhancedAddressForm.tsx        # Comprehensive address form
    ├── ProfileAddressManager.tsx      # Profile address management
    ├── CheckoutShippingAddress.tsx    # Checkout shipping address
    ├── AddressDemo.tsx                # Basic demo page
    └── AddressIntegrationDemo.tsx     # Integration demo page
```

## Data Structure

The `addressData.json` file contains:

```json
{
  "BIHAR": {
    "statename": "BIHAR",
    "districts": [
      {
        "districtname": "NALANDA",
        "areas": [
          {
            "areaname": "Mighi Nagma BO",
            "pincode": 803111
          }
        ]
      }
    ]
  }
}
```

## Usage

### 1. Basic Usage with React Hook

```tsx
import { useAddressData } from './hooks/useAddressData';

function MyComponent() {
  const {
    isLoading,
    error,
    getAllStates,
    getDistrictsForState,
    getAreasForDistrict,
    getPincodeForArea
  } = useAddressData();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const states = getAllStates();
  const districts = getDistrictsForState('BIHAR');
  const areas = getAreasForDistrict('BIHAR', 'NALANDA');
  const pincode = getPincodeForArea('BIHAR', 'NALANDA', 'Mighi Nagma BO');

  return (
    <div>
      <h2>States: {states.join(', ')}</h2>
      <h3>Districts in Bihar: {districts.join(', ')}</h3>
      <h4>Areas in Nalanda: {areas.join(', ')}</h4>
      <p>Pincode: {pincode}</p>
    </div>
  );
}
```

### 2. Enhanced Address Form (Recommended)

```tsx
import { EnhancedAddressForm } from './components/EnhancedAddressForm';

function AddressForm() {
  const handleAddressChange = (address) => {
    console.log('Complete address:', address);
    // address includes: state, district, area, pincode, addressLine1, addressLine2, landmark, city
  };

  return (
    <EnhancedAddressForm
      onAddressChange={handleAddressChange}
      onValidationChange={(isValid, errors) => {
        console.log('Form validation:', { isValid, errors });
      }}
      mode="profile"
    />
  );
}
```

### 3. Profile Address Management

```tsx
import { ProfileAddressManager } from './components/ProfileAddressManager';

function ProfilePage() {
  const handleAddressesChange = (addresses) => {
    console.log('All addresses:', addresses);
    // Save to backend, update state, etc.
  };

  return (
    <ProfileAddressManager onAddressesChange={handleAddressesChange} />
  );
}
```

### 4. Checkout Shipping Address

```tsx
import { CheckoutShippingAddress } from './components/CheckoutShippingAddress';

function CheckoutPage() {
  const handleAddressChange = (address) => {
    console.log('Shipping address:', address);
    // Update checkout state, calculate shipping, etc.
  };

  return (
    <CheckoutShippingAddress 
      onAddressChange={handleAddressChange}
      showDeliveryOptions={true}
    />
  );
}
```

### 5. Address Validation

```tsx
const { validateAddress } = useAddressData();

const result = validateAddress('BIHAR', 'NALANDA', 'Mighi Nagma BO', 803111);

if (result.isValid) {
  console.log('Address is valid!');
} else {
  console.log('Validation errors:', result.errors);
  console.log('Suggestions:', result.suggestions);
}
```

### 6. Search Functionality

```tsx
const { searchByPincode, searchByAreaName } = useAddressData();

// Search by pincode
const pincodeResults = searchByPincode(803111);

// Search by area name
const areaResults = searchByAreaName('Mumbai', 20);
```

## Component Features

### EnhancedAddressForm
- **Cascading Dropdowns**: State → District → Area selection
- **Auto-fill**: Pincode and city auto-population
- **Pincode Validation**: Real-time pincode format and validity checking
- **Landmark Suggestions**: Smart suggestions for nearby landmarks
- **Real-time Validation**: Instant feedback on form validity
- **Responsive Design**: Mobile-friendly interface

### ProfileAddressManager
- **Multiple Addresses**: Support for home, work, and other addresses
- **Address Types**: Categorize addresses by purpose
- **Default Address**: Set primary delivery address
- **CRUD Operations**: Add, edit, delete addresses
- **Bulk Management**: Manage all addresses in one interface

### CheckoutShippingAddress
- **Recipient Information**: Name, phone, email collection
- **Delivery Options**: Standard, Express, Same-day delivery
- **Cost Calculation**: Real-time delivery cost updates
- **Delivery Estimates**: Estimated delivery dates
- **Special Instructions**: Delivery notes and requests
- **Form Validation**: Complete address validation

## API Reference

### useAddressData Hook

Returns an object with:

- **Data**: `addressData` - The loaded address data
- **Loading States**: `isLoading`, `error`
- **Utility Functions**: All the functions below
- **Refresh**: `refresh()` - Reload the data

### Core Functions

#### `getAllStates(data)`
Returns array of all state names.

#### `getDistrictsForState(data, state)`
Returns array of district names for a given state.

#### `getAreasForDistrict(data, state, district)`
Returns array of area names for a given district.

#### `getPincodeForArea(data, state, district, area)`
Returns pincode for a specific area, or null if not found.

#### `searchByPincode(data, pincode)`
Returns array of all areas with the given pincode.

#### `searchByAreaName(data, query, limit)`
Returns array of areas matching the query (case-insensitive).

#### `validateAddress(data, state, district, area, pincode?)`
Returns validation result with errors and suggestions.

#### `getPincodesForDistrict(data, state, district)`
Returns array of all pincodes for a district.

#### `getAddressStatistics(data)`
Returns total counts of states, districts, areas, and pincodes.

## Integration Scenarios

### 1. User Profile Management
- **Address Book**: Store multiple addresses
- **Address Types**: Home, work, other locations
- **Default Address**: Primary delivery location
- **Edit/Delete**: Full CRUD operations

### 2. E-commerce Checkout
- **Shipping Address**: Complete delivery information
- **Delivery Options**: Multiple shipping speeds
- **Cost Calculation**: Real-time shipping costs
- **Validation**: Address verification before checkout

### 3. Form Integration
- **Standalone Forms**: Use in any application context
- **Modal Forms**: Address selection in popups
- **Wizard Forms**: Multi-step address collection
- **API Integration**: Backend data synchronization

## Setup Requirements

1. **File Access**: Ensure `addressData.json` is accessible via fetch at `/addressData.json`
2. **Build System**: Your build system should handle JSON imports or fetch requests
3. **TypeScript**: The system is written in TypeScript for type safety
4. **React**: Components require React 16.8+ for hooks support

## Migration from Old System

If you're currently using `comprehensiveAddressData.ts`:

1. **Keep both systems**: The old system still works for high-level validation
2. **Gradual migration**: Start using the new system for detailed operations
3. **Hybrid approach**: Use old system for quick validation, new system for detailed data
4. **Component replacement**: Replace basic address inputs with `EnhancedAddressForm`

## Performance Considerations

- **Large Data**: The JSON file is ~16MB, so it's loaded asynchronously
- **Caching**: Data is cached after first load
- **Search Limits**: Area search has configurable result limits
- **Lazy Loading**: Consider lazy loading for production use
- **Component Optimization**: Use React.memo for performance-critical components

## Error Handling

The system provides comprehensive error handling:

- **Loading Errors**: Network or file access issues
- **Validation Errors**: Invalid state/district/area combinations
- **Search Errors**: No results found
- **Suggestions**: Helpful suggestions for corrections
- **Form Validation**: Real-time validation feedback

## Examples

- **AddressDemo.tsx**: Basic address functionality demonstration
- **AddressIntegrationDemo.tsx**: Complete integration showcase
- **ProfileAddressManager**: Multi-address management example
- **CheckoutShippingAddress**: E-commerce integration example

## Support

For issues or questions about the address data system, check:
1. The `addressData.json` file structure
2. Network access to the JSON file
3. TypeScript compilation errors
4. React component integration issues
5. Component prop validation
6. Form submission handling

## Best Practices

1. **Use EnhancedAddressForm**: For most address input scenarios
2. **Implement Validation**: Always validate addresses before submission
3. **Handle Loading States**: Show appropriate loading indicators
4. **Error Boundaries**: Wrap address components in error boundaries
5. **Accessibility**: Ensure form labels and ARIA attributes are properly set
6. **Mobile First**: Test on mobile devices for responsive behavior
