import React, { useState, useEffect } from 'react';

export const SimpleWorkingDemo: React.FC = () => {
  const [addressData, setAddressData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

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

  const getStates = () => {
    if (!addressData) return [];
    return Object.keys(addressData).map(key => addressData[key].statename);
  };

  const getDistricts = (state: string) => {
    if (!addressData || !state) return [];
    const stateKey = Object.keys(addressData).find(key => 
      addressData[key].statename === state
    );
    if (!stateKey) return [];
    return addressData[stateKey].districts.map((d: any) => d.districtname);
  };

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!addressData) return <div>No data</div>;

  const states = getStates();
  const districts = getDistricts(selectedState);
  const areas = getAreas(selectedState, selectedDistrict);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Working Address Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Data Status</h3>
        <p>States: {states.length}</p>
        <p>Current: {selectedState || 'None'}</p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>State: </label>
        <select 
          value={selectedState} 
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedDistrict('');
            setSelectedArea('');
          }}
        >
          <option value="">Select State</option>
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      {selectedState && (
        <div style={{ marginBottom: '15px' }}>
          <label>District: </label>
          <select 
            value={selectedDistrict} 
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedArea('');
            }}
          >
            <option value="">Select District</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      )}

      {selectedDistrict && (
        <div style={{ marginBottom: '15px' }}>
          <label>Area: </label>
          <select 
            value={selectedArea} 
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            <option value="">Select Area</option>
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0' }}>
        <h3>Selection</h3>
        <p>State: {selectedState || 'None'}</p>
        <p>District: {selectedDistrict || 'None'}</p>
        <p>Area: {selectedArea || 'None'}</p>
      </div>
    </div>
  );
};
