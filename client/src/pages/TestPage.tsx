import React, { useState, useEffect } from 'react';
import { SimpleWorkingDemo } from '../components/SimpleWorkingDemo';

export const TestPage: React.FC = () => {
  const [addressData, setAddressData] = useState<any>(null);
  const [testPincode, setTestPincode] = useState('');
  const [pincodeResults, setPincodeResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Load address data for testing
    fetch('/addressData.json')
      .then(response => response.json())
      .then(data => {
        setAddressData(data);
        console.log('Address data loaded:', data);
      })
      .catch(error => {
        console.error('Failed to load address data:', error);
      });
  }, []);

  const testPincodeSearch = () => {
    if (!addressData || !testPincode || testPincode.length !== 6) return;
    
    setIsLoading(true);
    setHasSearched(true);
    const pincodeNum = parseInt(testPincode);
    
    if (isNaN(pincodeNum)) {
      setPincodeResults([]);
      setIsLoading(false);
      return;
    }

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
    
    setPincodeResults(results);
    setIsLoading(false);
    console.log('Pincode search results:', results);
  };

  // Reset search state when pincode changes
  const handlePincodeChange = (value: string) => {
    setTestPincode(value);
    if (hasSearched) {
      setHasSearched(false);
      setPincodeResults([]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Address System Test Page</h1>
      <p>This page tests if the address system is working with your addressData.json file.</p>
      
      {/* Pincode Test Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Pincode Search Test</h2>
        <p>Test the pincode search functionality directly:</p>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            value={testPincode}
            onChange={(e) => handlePincodeChange(e.target.value)}
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            style={{ padding: '8px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', width: '200px' }}
          />
          <button
            onClick={testPincodeSearch}
            disabled={!testPincode || testPincode.length !== 6 || isLoading}
            style={{ padding: '8px 16px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {isLoading ? 'Searching...' : 'Search Pincode'}
          </button>
        </div>

        {pincodeResults.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <h3>Search Results for Pincode {testPincode}:</h3>
            {pincodeResults.map((result, index) => (
              <div key={index} style={{ padding: '10px', margin: '5px 0', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
                <strong>{result.area}</strong><br />
                {result.district}, {result.state} - {result.pincode}
              </div>
            ))}
          </div>
        )}

        {pincodeResults.length === 0 && hasSearched && testPincode.length === 6 && !isLoading && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', border: '1px solid #f5c6cb' }}>
            No results found for pincode {testPincode}
          </div>
        )}

        {!hasSearched && testPincode.length === 6 && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e7f3ff', color: '#0056b3', borderRadius: '4px', border: '1px solid #b3d9ff' }}>
            Pincode {testPincode} entered. Click "Search Pincode" to find matching addresses.
          </div>
        )}

        <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          <strong>Debug Info:</strong><br />
          Address data loaded: {addressData ? 'Yes' : 'No'}<br />
          Test pincode: {testPincode}<br />
          Results count: {pincodeResults.length}<br />
          Has searched: {hasSearched ? 'Yes' : 'No'}
        </div>
      </div>

      {/* Original Demo */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Address Demo</h2>
        <SimpleWorkingDemo />
      </div>
    </div>
  );
};
