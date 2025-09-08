import React, { useState, useEffect } from 'react';
import { useAddressData } from '../hooks/useAddressData';

export const AddressTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const { 
    isLoading, 
    error, 
    addressData,
    getAllStates,
    getDistrictsForState,
    getAreasForDistrict,
    getPincodeForArea,
    searchByPincode,
    searchByAreaName,
    validateAddress,
    getPincodesForDistrict,
    getAddressStatistics
  } = useAddressData();

  useEffect(() => {
    const runTests = async () => {
      const results: string[] = [];
      
      try {
        // Test 1: Check if data is loading
        results.push(`Loading state: ${isLoading}`);
        results.push(`Error state: ${error || 'None'}`);
        
        if (addressData) {
          results.push(`✅ Address data loaded successfully`);
          results.push(`Data keys: ${Object.keys(addressData).slice(0, 5).join(', ')}...`);
          
          // Test 2: Get states
          const states = getAllStates();
          results.push(`✅ States found: ${states.length}`);
          results.push(`First 3 states: ${states.slice(0, 3).join(', ')}`);
          
          if (states.length > 0) {
            const firstState = states[0];
            
            // Test 3: Get districts for first state
            const districts = getDistrictsForState(firstState);
            results.push(`✅ Districts for ${firstState}: ${districts.length}`);
            results.push(`First 3 districts: ${districts.slice(0, 3).join(', ')}`);
            
            if (districts.length > 0) {
              const firstDistrict = districts[0];
              
              // Test 4: Get areas for first district
              const areas = getAreasForDistrict(firstState, firstDistrict);
              results.push(`✅ Areas for ${firstDistrict}, ${firstState}: ${areas.length}`);
              results.push(`First 3 areas: ${areas.slice(0, 3).join(', ')}`);
              
              if (areas.length > 0) {
                const firstArea = areas[0];
                
                // Test 5: Get pincode for first area
                const pincode = getPincodeForArea(firstState, firstDistrict, firstArea);
                results.push(`✅ Pincode for ${firstArea}: ${pincode || 'Not found'}`);
                
                // Test 6: Search by pincode
                if (pincode) {
                  const pincodeResults = searchByPincode(pincode);
                  results.push(`✅ Pincode search results: ${pincodeResults.length}`);
                }
              }
            }
          }
          
          // Test 7: Get statistics
          const stats = getAddressStatistics();
          results.push(`✅ Statistics: ${stats.totalStates} states, ${stats.totalDistricts} districts, ${stats.totalAreas} areas, ${stats.totalPincodes} pincodes`);
          
        } else {
          results.push(`❌ No address data available`);
        }
        
      } catch (err) {
        results.push(`❌ Error during testing: ${err}`);
      }
      
      setTestResults(results);
    };

    if (!isLoading && !error) {
      runTests();
    }
  }, [isLoading, error, addressData, getAllStates, getDistrictsForState, getAreasForDistrict, getPincodeForArea, searchByPincode, getAddressStatistics]);

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Loading Address Data...</h3>
        <p>Please wait while we load the address data from addressData.json</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h3>Error Loading Address Data</h3>
        <p><strong>Error:</strong> {error}</p>
        <p>This usually means:</p>
        <ul>
          <li>The addressData.json file is not in the public directory</li>
          <li>The file path is incorrect</li>
          <li>There's a CORS issue</li>
          <li>The JSON file is malformed</li>
        </ul>
        <p><strong>Current working directory:</strong> {window.location.origin}</p>
        <p><strong>Expected file path:</strong> {window.location.origin}/addressData.json</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Address System Test Results</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Status</h3>
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Data Loaded:</strong> {addressData ? 'Yes' : 'No'}</p>
        {addressData && (
          <p><strong>Data Size:</strong> {Object.keys(addressData).length} states</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Results</h3>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {result}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Raw Data Preview</h3>
        {addressData && (
          <div style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            fontFamily: 'monospace',
            fontSize: '12px',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            <pre>{JSON.stringify(addressData, null, 2).substring(0, 1000)}...</pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Debug Information</h3>
        <p><strong>Current URL:</strong> {window.location.href}</p>
        <p><strong>Origin:</strong> {window.location.origin}</p>
        <p><strong>Public Path:</strong> {window.location.origin}/addressData.json</p>
        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
      </div>
    </div>
  );
};
