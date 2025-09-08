import React, { useState, useEffect } from 'react';

export const SimpleWorkingDemo: React.FC = () => {
  const [addressData, setAddressData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeSuggestions, setPincodeSuggestions] = useState<any[]>([]);
  const [showPincodeSuggestions, setShowPincodeSuggestions] = useState(false);
  const [isManualArea, setIsManualArea] = useState(false);
  const [manualAreaInput, setManualAreaInput] = useState('');

  // Load address data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/addressData.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setAddressData(data);
        console.log('Data loaded:', Object.keys(data).length, 'states');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Load error:', err);
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
      addressData[key].statename === state
    );
    if (!stateKey) return [];
    return addressData[stateKey].districts.map((d: any) => d.districtname);
  };

  // Get areas for a district
  const getAreas = (state: string, district: string) => {
    if (!addressData || !state || !district) return [];
    const stateKey = Object.keys(addressData).find(key => 
      addressData[key].statename === state
    );
    if (!stateKey) return [];
    
    const districtData = addressData[stateKey].districts.find((d: any) => 
      d.districtname === district
    );
    if (!districtData) return [];
    
    return districtData.areas.map((a: any) => a.areaname);
  };

  // Search by pincode
  const searchByPincode = (pincodeNum: number) => {
    if (!addressData) return [];
    
    const results: any[] = [];
    
    Object.keys(addressData).forEach(stateKey => {
      const state = addressData[stateKey];
      state.districts.forEach((district: any) => {
        district.areas.forEach((area: any) => {
          if (area.pincode === pincodeNum) {
            results.push({
              state: state.statename,
              district: district.districtname,
              area: area.areaname,
              pincode: area.pincode
            });
          }
        });
      });
    });
    
    return results;
  };

  // Handle pincode input
  const handlePincodeChange = (value: string) => {
    setPincode(value);
    
    // Reset suggestions when pincode changes
    setPincodeSuggestions([]);
    setShowPincodeSuggestions(false);
    
    // If pincode is 6 digits, search for matches
    if (value.length === 6) {
      const pincodeNum = parseInt(value);
      if (!isNaN(pincodeNum)) {
        const results = searchByPincode(pincodeNum);
        if (results.length > 0) {
          setPincodeSuggestions(results);
          setShowPincodeSuggestions(true);
        } else {
          // No matches found, enable manual area input
          setIsManualArea(true);
          setManualAreaInput('');
        }
      }
    } else {
      setIsManualArea(false);
      setManualAreaInput('');
    }
  };

  // Handle pincode suggestion selection
  const handlePincodeSuggestionClick = (suggestion: any) => {
    setSelectedState(suggestion.state);
    setSelectedDistrict(suggestion.district);
    setSelectedArea(suggestion.area);
    setPincode(suggestion.pincode.toString());
    setShowPincodeSuggestions(false);
    setPincodeSuggestions([]);
    setIsManualArea(false);
    setManualAreaInput('');
  };

  // Handle manual area input
  const handleManualAreaChange = (value: string) => {
    setManualAreaInput(value);
    setSelectedArea(value);
  };

  // Handle form changes
  const handleChange = (field: string, value: string) => {
    if (field === 'state') {
      setSelectedState(value);
      setSelectedDistrict('');
      setSelectedArea('');
      setPincode('');
      setIsManualArea(false);
      setManualAreaInput('');
    } else if (field === 'district') {
      setSelectedDistrict(value);
      setSelectedArea('');
      setPincode('');
      setIsManualArea(false);
      setManualAreaInput('');
    } else if (field === 'area') {
      setSelectedArea(value);
      setPincode('');
      setIsManualArea(false);
      setManualAreaInput('');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!addressData) return <div>No data</div>;

  const states = getStates();
  const districts = getDistricts(selectedState);
  const areas = getAreas(selectedState, selectedDistrict);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Working Address Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Data Status</h3>
        <p>States: {states.length}</p>
        <p>Current: {selectedState || 'None'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Address Selection</h3>
        
        {/* State Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            State *
          </label>
          <select 
            value={selectedState} 
            onChange={(e) => handleChange('state', e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">Select State</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* District Selection */}
        {selectedState && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              District *
            </label>
            <select 
              value={selectedDistrict} 
              onChange={(e) => handleChange('district', e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        )}

        {/* Area Selection */}
        {selectedDistrict && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Area *
            </label>
            {!isManualArea ? (
              <select 
                value={selectedArea} 
                onChange={(e) => handleChange('area', e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">Select Area</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={manualAreaInput}
                onChange={(e) => handleManualAreaChange(e.target.value)}
                placeholder="Type area name manually"
                style={{ width: '100%', padding: '8px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            )}
          </div>
        )}

        {/* Pincode Input */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Pincode
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              placeholder="Enter 6-digit pincode to auto-fill address"
              maxLength={6}
              style={{ width: '100%', padding: '8px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            
            {/* Pincode Suggestions */}
            {showPincodeSuggestions && pincodeSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #ddd',
                borderTop: 'none',
                borderRadius: '0 0 4px 4px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {pincodeSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handlePincodeSuggestionClick(suggestion)}
                    style={{
                      padding: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div style={{ fontWeight: 'bold' }}>{suggestion.area}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {suggestion.district}, {suggestion.state} - {suggestion.pincode}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Manual Area Toggle */}
          {selectedDistrict && (
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isManualArea}
                  onChange={(e) => {
                    setIsManualArea(e.target.checked);
                    if (e.target.checked) {
                      setManualAreaInput('');
                      setSelectedArea('');
                    }
                  }}
                />
                <span style={{ fontSize: '14px', color: '#666' }}>
                  Type area name manually
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Selection Display */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '4px' }}>
        <h3>Selection</h3>
        <p><strong>State:</strong> {selectedState || 'Not selected'}</p>
        <p><strong>District:</strong> {selectedDistrict || 'Not selected'}</p>
        <p><strong>Area:</strong> {selectedArea || 'Not selected'}</p>
        <p><strong>Pincode:</strong> {pincode || 'Not entered'}</p>
        {isManualArea && (
          <p style={{ color: '#007bff', fontStyle: 'italic' }}>
            <strong>Note:</strong> Area entered manually
          </p>
        )}
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e8', borderRadius: '4px' }}>
        <h3>How to Use</h3>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>Method 1:</strong> Select State → District → Area manually</li>
          <li><strong>Method 2:</strong> Enter a 6-digit pincode to auto-fill the address</li>
          <li><strong>Method 3:</strong> Check "Type area name manually" to enter custom area names</li>
        </ul>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
          <strong>Tip:</strong> Pincode search works best when you know the exact pincode. If no matches are found, you can manually type the area name.
        </p>
      </div>
    </div>
  );
};
