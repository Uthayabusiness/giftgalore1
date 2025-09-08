import React, { useState, useEffect } from 'react';

interface AddressData {
  state: string;
  district: string;
  area: string;
  pincode: string;
}

export const WorkingAddressDemo: React.FC = () => {
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
        
        console.log('Attempting to load address data...');
        const response = await fetch('/addressData.json');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Address data loaded successfully:', data);
        console.log('Number of states:', Object.keys(data).length);
        
        setAddressData(data);
        
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
        <h3>🔄 Loading Address Data...</h3>
        <p>Please wait while we load the address data from addressData.json</p>
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #f3f3f3', 
            borderTop: '5px solid #007bff', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', maxWidth: '800px', margin: '0 auto' }}>
        <h3>❌ Error Loading Address Data</h3>
        <p><strong>Error:</strong> {error}</p>
        
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '5px', marginTop: '20px' }}>
          <h4>🔍 Troubleshooting Steps:</h4>
          <ol>
            <li><strong>Check if addressData.json exists:</strong> The file should be in the <code>client/public/</code> folder</li>
            <li><strong>Verify file path:</strong> The file should be accessible at <code>/addressData.json</code></li>
            <li><strong>Check development server:</strong> Make sure your React dev server is running</li>
            <li><strong>Browser console:</strong> Check the browser console for more detailed error messages</li>
            <li><strong>File size:</strong> The file is ~10MB, so it might take a moment to load</li>
          </ol>
        </div>

        <div style={{ background: '#d1ecf1', padding: '15px', borderRadius: '5px', marginTop: '20px' }}>
          <h4>📁 File Information:</h4>
          <p><strong>Expected location:</strong> <code>client/public/addressData.json</code></p>
          <p><strong>Expected URL:</strong> <code>{window.location.origin}/addressData.json</code></p>
          <p><strong>Current page:</strong> {window.location.href}</p>
        </div>

        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            marginTop: '20px', 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          🔄 Retry Loading
        </button>
      </div>
    );
  }

  if (!addressData) {
    return (
      <div style={{ padding: '20px', color: 'orange', textAlign: 'center' }}>
        <h3>⚠️ No Address Data Available</h3>
        <p>The address data could not be loaded.</p>
      </div>
    );
  }

  const states = getStates();
  const districts = getDistricts(formData.state);
  const areas = getAreas(formData.state, formData.district);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>🏠 Working Address System Demo</h1>
        <p style={{ fontSize: '18px', color: '#666' }}>
          This demo shows the address system working with your addressData.json file
        </p>
      </div>
      
      <div style={{ 
        background: '#d4edda', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #c3e6cb'
      }}>
        <h3>✅ Data Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <strong>States loaded:</strong> <span style={{ color: '#155724', fontSize: '18px' }}>{states.length}</span>
          </div>
          <div>
            <strong>Current state:</strong> <span style={{ color: '#155724' }}>{formData.state || 'None selected'}</span>
          </div>
          <div>
            <strong>Districts available:</strong> <span style={{ color: '#155724' }}>{districts.length}</span>
          </div>
          <div>
            <strong>Areas available:</strong> <span style={{ color: '#155724' }}>{areas.length}</span>
          </div>
        </div>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        border: '1px solid #dee2e6' 
      }}>
        <h3>📍 Address Selection Form</h3>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="state" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              State *
            </label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                fontSize: '16px', 
                border: '1px solid #ced4da',
                borderRadius: '5px',
                backgroundColor: 'white'
              }}
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
              <label htmlFor="district" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                District *
              </label>
              <select
                id="district"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  fontSize: '16px', 
                  border: '1px solid #ced4da',
                  borderRadius: '5px',
                  backgroundColor: 'white'
                }}
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
              <label htmlFor="area" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Area *
              </label>
              <select
                id="area"
                value={formData.area}
                onChange={(e) => handleChange('area', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  fontSize: '16px', 
                  border: '1px solid #ced4da',
                  borderRadius: '5px',
                  backgroundColor: 'white'
                }}
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
            <label htmlFor="pincode" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Pincode
            </label>
            <input
              type="text"
              id="pincode"
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              placeholder="Enter pincode (optional)"
              style={{ 
                width: '100%', 
                padding: '12px', 
                fontSize: '16px', 
                border: '1px solid #ced4da',
                borderRadius: '5px'
              }}
              maxLength={6}
            />
          </div>
        </form>
      </div>

      <div style={{ 
        background: '#e3f2fd', 
        padding: '20px', 
        borderRadius: '8px', 
        marginTop: '20px',
        border: '1px solid #bbdefb'
      }}>
        <h3>📋 Selected Address</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div><strong>State:</strong> <span style={{ color: '#1976d2' }}>{formData.state || 'Not selected'}</span></div>
          <div><strong>District:</strong> <span style={{ color: '#1976d2' }}>{formData.district || 'Not selected'}</span></div>
          <div><strong>Area:</strong> <span style={{ color: '#1976d2' }}>{formData.area || 'Not selected'}</span></div>
          <div><strong>Pincode:</strong> <span style={{ color: '#1976d2' }}>{formData.pincode || 'Not entered'}</span></div>
        </div>
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '20px', 
        borderRadius: '8px', 
        marginTop: '20px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>🔧 Debug Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div><strong>Total states in data:</strong> {Object.keys(addressData).length}</div>
          <div><strong>First state key:</strong> {Object.keys(addressData)[0]}</div>
          <div><strong>First state name:</strong> {Object.keys(addressData)[0] ? addressData[Object.keys(addressData)[0]].statename : 'N/A'}</div>
          <div><strong>Data loaded at:</strong> {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginTop: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h3>🎯 Next Steps</h3>
        <p>If this demo is working, you can now:</p>
        <ul>
          <li>Use the <code>EnhancedAddressForm</code> component in your app</li>
          <li>Integrate with <code>ProfileAddressManager</code> for user profiles</li>
          <li>Use <code>CheckoutShippingAddress</code> for e-commerce checkout</li>
        </ul>
      </div>
    </div>
  );
};
