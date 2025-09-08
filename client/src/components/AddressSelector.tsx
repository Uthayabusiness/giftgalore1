import React, { useState, useMemo } from 'react';
import { useAddressData } from '../hooks/useAddressData';

interface AddressSelectorProps {
  onAddressChange?: (address: {
    state: string;
    district: string;
    area: string;
    pincode: number | null;
  }) => void;
  className?: string;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({ 
  onAddressChange, 
  className = '' 
}) => {
  const {
    isLoading,
    error,
    getAllStates,
    getDistrictsForState,
    getAreasForDistrict,
    getPincodeForArea,
    validateAddress
  } = useAddressData();

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);

  // Get available options
  const states = getAllStates();
  const districts = useMemo(() => 
    selectedState ? getDistrictsForState(selectedState) : [], 
    [selectedState, getDistrictsForState]
  );
  const areas = useMemo(() => 
    selectedState && selectedDistrict ? getAreasForDistrict(selectedState, selectedDistrict) : [], 
    [selectedState, selectedDistrict, getAreasForDistrict]
  );

  // Handle state change
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict('');
    setSelectedArea('');
    setValidationResult(null);
    
    if (onAddressChange) {
      onAddressChange({ state, district: '', area: '', pincode: null });
    }
  };

  // Handle district change
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSelectedArea('');
    setValidationResult(null);
    
    if (onAddressChange) {
      onAddressChange({ 
        state: selectedState, 
        district, 
        area: '', 
        pincode: null 
      });
    }
  };

  // Handle area change
  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
    
    if (area) {
      const pincode = getPincodeForArea(selectedState, selectedDistrict, area);
      const validation = validateAddress(selectedState, selectedDistrict, area, pincode || undefined);
      
      setValidationResult(validation);
      
      if (onAddressChange) {
        onAddressChange({ 
          state: selectedState, 
          district: selectedDistrict, 
          area, 
          pincode 
        });
      }
    } else {
      setValidationResult(null);
      if (onAddressChange) {
        onAddressChange({ 
          state: selectedState, 
          district: selectedDistrict, 
          area: '', 
          pincode: null 
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`address-selector ${className}`}>
        <div className="loading">Loading address data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`address-selector ${className}`}>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`address-selector ${className}`}>
      <div className="form-group">
        <label htmlFor="state">State *</label>
        <select
          id="state"
          value={selectedState}
          onChange={(e) => handleStateChange(e.target.value)}
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

      {selectedState && (
        <div className="form-group">
          <label htmlFor="district">District *</label>
          <select
            id="district"
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            required
            disabled={!selectedState}
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedDistrict && (
        <div className="form-group">
          <label htmlFor="area">Area *</label>
          <select
            id="area"
            value={selectedArea}
            onChange={(e) => handleAreaChange(e.target.value)}
            required
            disabled={!selectedDistrict}
          >
            <option value="">Select Area</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      )}

      {validationResult && (
        <div className={`validation-result ${validationResult.isValid ? 'valid' : 'invalid'}`}>
          {validationResult.isValid ? (
            <div className="success">
              ✓ Address is valid
              {validationResult.pincode && (
                <span> - Pincode: {validationResult.pincode}</span>
              )}
            </div>
          ) : (
            <div className="errors">
              {validationResult.errors.map((error: string, index: number) => (
                <div key={index} className="error">✗ {error}</div>
              ))}
              {validationResult.suggestions && (
                <div className="suggestions">
                  {validationResult.suggestions.states && (
                    <div>Suggestions: {validationResult.suggestions.states.join(', ')}</div>
                  )}
                  {validationResult.suggestions.districts && (
                    <div>Suggestions: {validationResult.suggestions.districts.join(', ')}</div>
                  )}
                  {validationResult.suggestions.areas && (
                    <div>Suggestions: {validationResult.suggestions.areas.join(', ')}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .address-selector {
          max-width: 500px;
          margin: 0 auto;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .form-group select:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
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
        
        .suggestions {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};
