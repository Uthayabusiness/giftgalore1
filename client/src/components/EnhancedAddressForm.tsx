import React, { useState, useMemo, useEffect } from 'react';
import { useAddressData } from '../hooks/useAddressData';

interface AddressFormData {
  state: string;
  district: string;
  area: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
}

interface EnhancedAddressFormProps {
  initialData?: Partial<AddressFormData>;
  onAddressChange: (address: AddressFormData) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  className?: string;
  showLandmarkSuggestions?: boolean;
  mode?: 'profile' | 'checkout';
}

export const EnhancedAddressForm: React.FC<EnhancedAddressFormProps> = ({
  initialData = {},
  onAddressChange,
  onValidationChange,
  className = '',
  showLandmarkSuggestions = true,
  mode = 'profile'
}) => {
  const {
    isLoading,
    error,
    getAllStates,
    getDistrictsForState,
    getAreasForDistrict,
    getPincodeForArea,
    validateAddress,
    searchByPincode
  } = useAddressData();

  const [formData, setFormData] = useState<AddressFormData>({
    state: '',
    district: '',
    area: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    ...initialData
  });

  const [validationResult, setValidationResult] = useState<any>(null);
  const [pincodeSuggestions, setPincodeSuggestions] = useState<string[]>([]);
  const [landmarkSuggestions, setLandmarkSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get available options
  const states = getAllStates();
  const districts = useMemo(() => 
    formData.state ? getDistrictsForState(formData.state) : [], 
    [formData.state, getDistrictsForState]
  );
  const areas = useMemo(() => 
    formData.state && formData.district ? getAreasForDistrict(formData.state, formData.district) : [], 
    [formData.state, formData.district, getAreasForDistrict]
  );

  // Handle form field changes
  const handleFieldChange = (field: keyof AddressFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    // Reset dependent fields
    if (field === 'state') {
      newData.district = '';
      newData.area = '';
      newData.pincode = '';
      newData.city = '';
    } else if (field === 'district') {
      newData.area = '';
      newData.pincode = '';
      newData.city = '';
    } else if (field === 'area') {
      newData.pincode = '';
      newData.city = '';
    }

    // Auto-fill pincode when area is selected
    if (field === 'area' && value) {
      const pincode = getPincodeForArea(formData.state, formData.district, value);
      if (pincode) {
        newData.pincode = pincode.toString();
      }
    }

    // Auto-fill city when area is selected
    if (field === 'area' && value) {
      newData.city = value;
    }

    setFormData(newData);
    onAddressChange(newData);
    validateForm(newData);
  };

  // Handle pincode input
  const handlePincodeChange = (value: string) => {
    setFormData(prev => ({ ...prev, pincode: value }));
    
    if (value.length === 6) {
      const pincodeNum = parseInt(value);
      if (!isNaN(pincodeNum)) {
        const results = searchByPincode(pincodeNum);
        if (results.length > 0) {
          const suggestions = results.map(r => `${r.area}, ${r.district}, ${r.state}`);
          setPincodeSuggestions(suggestions);
          setShowSuggestions(true);
        }
      }
    } else {
      setPincodeSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle landmark input with suggestions
  const handleLandmarkChange = (value: string) => {
    setFormData(prev => ({ ...prev, landmark: value }));
    
    if (value.length > 2 && formData.area) {
      // Generate landmark suggestions based on area
      const suggestions = generateLandmarkSuggestions(value, formData.area);
      setLandmarkSuggestions(suggestions);
    } else {
      setLandmarkSuggestions([]);
    }
  };

  // Generate landmark suggestions
  const generateLandmarkSuggestions = (query: string, area: string): string[] => {
    const commonLandmarks = [
      'Near Railway Station',
      'Near Bus Stand',
      'Near Hospital',
      'Near School',
      'Near Market',
      'Near Temple',
      'Near Mosque',
      'Near Church',
      'Near Bank',
      'Near Post Office',
      'Near Police Station',
      'Near Fire Station',
      'Near Government Office',
      'Near Shopping Mall',
      'Near Cinema Hall',
      'Near Park',
      'Near Lake',
      'Near Bridge',
      'Near Highway',
      'Near Metro Station'
    ];

    const queryLower = query.toLowerCase();
    return commonLandmarks
      .filter(landmark => landmark.toLowerCase().includes(queryLower))
      .slice(0, 5);
  };

  // Validate the entire form
  const validateForm = (data: AddressFormData) => {
    const errors: string[] = [];

    if (!data.state) errors.push('State is required');
    if (!data.district) errors.push('District is required');
    if (!data.area) errors.push('Area is required');
    if (!data.pincode) errors.push('Pincode is required');
    if (!data.addressLine1) errors.push('Address Line 1 is required');
    if (!data.city) errors.push('City is required');

    // Validate pincode format
    if (data.pincode && data.pincode.length !== 6) {
      errors.push('Pincode must be 6 digits');
    }

    // Validate address combination
    if (data.state && data.district && data.area) {
      const validation = validateAddress(data.state, data.district, data.area, parseInt(data.pincode) || undefined);
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }
    }

    const isValid = errors.length === 0;
    setValidationResult({ isValid, errors });
    
    if (onValidationChange) {
      onValidationChange(isValid, errors);
    }

    return isValid;
  };

  // Auto-fill address from pincode suggestion
  const handlePincodeSuggestionClick = (suggestion: string) => {
    const parts = suggestion.split(', ');
    if (parts.length >= 3) {
      const [area, district, state] = parts;
      const newData = {
        ...formData,
        state: state.trim(),
        district: district.trim(),
        area: area.trim(),
        city: area.trim()
      };
      setFormData(newData);
      onAddressChange(newData);
      setShowSuggestions(false);
      setPincodeSuggestions([]);
    }
  };

  // Auto-fill landmark from suggestion
  const handleLandmarkSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, landmark: suggestion }));
    setLandmarkSuggestions([]);
  };

  // Validate form on mount and when dependencies change
  useEffect(() => {
    validateForm(formData);
  }, [formData.state, formData.district, formData.area]);

  if (isLoading) {
    return (
      <div className={`enhanced-address-form ${className}`}>
        <div className="loading">Loading address data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`enhanced-address-form ${className}`}>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`enhanced-address-form ${className}`}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="state">State *</label>
          <select
            id="state"
            value={formData.state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            required
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="district">District *</label>
          <select
            id="district"
            value={formData.district}
            onChange={(e) => handleFieldChange('district', e.target.value)}
            required
            disabled={!formData.state}
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="area">Area *</label>
          <select
            id="area"
            value={formData.area}
            onChange={(e) => handleFieldChange('area', e.target.value)}
            required
            disabled={!formData.district}
          >
            <option value="">Select Area</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="pincode">Pincode *</label>
          <div className="pincode-input-container">
            <input
              type="text"
              id="pincode"
              value={formData.pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />
            {showSuggestions && pincodeSuggestions.length > 0 && (
              <div className="pincode-suggestions">
                {pincodeSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handlePincodeSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="addressLine1">Address Line 1 *</label>
        <input
          type="text"
          id="addressLine1"
          value={formData.addressLine1}
          onChange={(e) => handleFieldChange('addressLine1', e.target.value)}
          placeholder="House/Flat No., Street Name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="addressLine2">Address Line 2</label>
        <input
          type="text"
          id="addressLine2"
          value={formData.addressLine2}
          onChange={(e) => handleFieldChange('addressLine2', e.target.value)}
          placeholder="Apartment, suite, etc. (optional)"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            placeholder="City name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="landmark">Landmark</label>
          <div className="landmark-input-container">
            <input
              type="text"
              id="landmark"
              value={formData.landmark}
              onChange={(e) => handleLandmarkChange(e.target.value)}
              placeholder="Nearby landmark (optional)"
            />
            {landmarkSuggestions.length > 0 && (
              <div className="landmark-suggestions">
                {landmarkSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleLandmarkSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {validationResult && (
        <div className={`validation-result ${validationResult.isValid ? 'valid' : 'invalid'}`}>
          {validationResult.isValid ? (
            <div className="success">
              ✓ Address is valid
            </div>
          ) : (
            <div className="errors">
              {validationResult.errors.map((error: string, index: number) => (
                <div key={index} className="error">✗ {error}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .enhanced-address-form {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        .form-group select:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
        
        .pincode-input-container,
        .landmark-input-container {
          position: relative;
        }
        
        .pincode-suggestions,
        .landmark-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 4px 4px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .suggestion-item {
          padding: 0.75rem;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        }
        
        .suggestion-item:hover {
          background-color: #f8f9fa;
        }
        
        .suggestion-item:last-child {
          border-bottom: none;
        }
        
        .validation-result {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 4px;
        }
        
        .validation-result.valid {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }
        
        .validation-result.invalid {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
        
        .loading, .error {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        
        .error {
          color: #dc3545;
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
