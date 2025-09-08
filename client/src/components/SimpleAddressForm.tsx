import React, { useState, useEffect } from 'react';

interface AddressData {
  state: string;
  district: string;
  area: string;
  pincode: string;
}

export const SimpleAddressForm: React.FC = () => {
  const [addressData, setAddressData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressData>({
    state: '',
    district: '',
    area: '',
    pincode: ''
  });

  // Load address data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to fetch the address data
        const response = await fetch('/addressData.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setAddressData(data);
        console.log('Address data loaded:', data);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load address data';
        setError(errorMessage);
        console.error('Error loading address data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get available states
  const getStates = () => {
    if (!addressData) return [];
    return Object.keys(addressData).map(key => addressData[key].statename);
  };

  // Get districts for a state
  const getDistricts = (state: string) => {
    if (!addressData || !state) return [];
    const stateKey = Object.keys(addressData).find(key => 
      addressData[key].statename.toUpperCase() === state.toUpperCase()
    );
    if (!stateKey) return [];
    return addressData[stateKey].districts.map((d: any) => d.districtname);
  };

  // Get areas for a district
  const getAreas = (state: string, district: string) => {
    if (!addressData || !state || !district) return [];
    const stateKey = Object.keys(addressData).find(key => 
      addressData[key].statename.toUpperCase() === state.toUpperCase()
    );
    if (!stateKey) return [];
    
    const districtData = addressData[stateKey].districts.find((d: any) => 
      d.districtname.toUpperCase() === district.toUpperCase()
    );
    if (!districtData) return [];
    
    return districtData.areas.map((a: any) => a.areaname);
  };

  // Handle form changes
  const handleChange = (field: keyof AddressData, value: string) => {
    const newData = { ...formData, [field]: value };
    
    // Reset dependent fields
    if (field === 'state') {
      newData.district = '';
      newData.area = '';
      newData.pincode = '';
    } else if (field === 'district') {
      newData.area = '';
      newData.pincode = '';
    } else if (field === 'area') {
      newData.pincode = '';
    }
    
    setFormData(newData);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Loading Address Data...</h3>
        <p>Please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h3>Error Loading Address Data</h3>
        <p><strong>Error:</strong> {error}</p>
        <p>Please check:</p>
        <ul>
          <li>Is addressData.json in the public folder?</li>
          <li>Is the development server running?</li>
          <li>Check browser console for more details</li>
        </ul>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!addressData) {
    return (
      <div style={{ padding: '20px', color: 'orange' }}>
        <h3>No Address Data Available</h3>
        <p>The address data could not be loaded.</p>
      </div>
    );
  }

  const states = getStates();
  const districts = getDistricts(formData.state);
  const areas = getAreas(formData.state, formData.district);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Simple Address Form</h2>
      <p>This is a basic working version to test the address data loading.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Data Status</h3>
        <p><strong>States loaded:</strong> {states.length}</p>
        <p><strong>Current state:</strong> {formData.state || 'None selected'}</p>
        <p><strong>Districts available:</strong> {districts.length}</p>
        <p><strong>Areas available:</strong> {areas.length}</p>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="state" style={{ display: 'block', marginBottom: '5px' }}>
            State *
          </label>
          <select
            id="state"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
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

        {formData.state && (
          <div>
            <label htmlFor="district" style={{ display: 'block', marginBottom: '5px' }}>
              District *
            </label>
            <select
              id="district"
              value={formData.district}
              onChange={(e) => handleChange('district', e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              required
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

        {formData.district && (
          <div>
            <label htmlFor="area" style={{ display: 'block', marginBottom: '5px' }}>
              Area *
            </label>
            <select
              id="area"
              value={formData.area}
              onChange={(e) => handleChange('area', e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              required
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

        <div>
          <label htmlFor="pincode" style={{ display: 'block', marginBottom: '5px' }}>
            Pincode
          </label>
          <input
            type="text"
            id="pincode"
            value={formData.pincode}
            onChange={(e) => handleChange('pincode', e.target.value)}
            placeholder="Enter pincode"
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            maxLength={6}
          />
        </div>
      </form>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
        <h3>Selected Address</h3>
        <p><strong>State:</strong> {formData.state || 'Not selected'}</p>
        <p><strong>District:</strong> {formData.district || 'Not selected'}</p>
        <p><strong>Area:</strong> {formData.area || 'Not selected'}</p>
        <p><strong>Pincode:</strong> {formData.pincode || 'Not entered'}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e8', borderRadius: '5px' }}>
        <h3>Debug Info</h3>
        <p><strong>Total states in data:</strong> {Object.keys(addressData).length}</p>
        <p><strong>First state key:</strong> {Object.keys(addressData)[0]}</p>
        <p><strong>First state name:</strong> {Object.keys(addressData)[0] ? addressData[Object.keys(addressData)[0]].statename : 'N/A'}</p>
      </div>
    </div>
  );
};
