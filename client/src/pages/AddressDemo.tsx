import React, { useState } from 'react';
import { AddressSelector } from '../components/AddressSelector';
import { AddressSearch } from '../components/AddressSearch';

export const AddressDemo: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState<{
    state: string;
    district: string;
    area: string;
    pincode: number | null;
  } | null>(null);

  const handleAddressChange = (address: {
    state: string;
    district: string;
    area: string;
    pincode: number | null;
  }) => {
    setSelectedAddress(address);
  };

  return (
    <div className="address-demo">
      <div className="demo-header">
        <h1>Indian Address Data System Demo</h1>
        <p>
          This demo showcases the comprehensive address data system using the detailed 
          <code>addressData.json</code> file. The system provides:
        </p>
        <ul>
          <li>State, District, and Area selection with cascading dropdowns</li>
          <li>Real-time address validation</li>
          <li>Pincode lookup by area</li>
          <li>Area search by name</li>
          <li>Pincode search functionality</li>
        </ul>
      </div>

      <div className="demo-sections">
        <section className="demo-section">
          <h2>Address Selector</h2>
          <p>
            Select a state, district, and area to get the corresponding pincode and validation.
          </p>
          <AddressSelector onAddressChange={handleAddressChange} />
          
          {selectedAddress && selectedAddress.area && (
            <div className="selected-address">
              <h3>Selected Address:</h3>
              <div className="address-details">
                <p><strong>State:</strong> {selectedAddress.state}</p>
                <p><strong>District:</strong> {selectedAddress.district}</p>
                <p><strong>Area:</strong> {selectedAddress.area}</p>
                <p><strong>Pincode:</strong> {selectedAddress.pincode}</p>
              </div>
            </div>
          )}
        </section>

        <section className="demo-section">
          <h2>Address Search</h2>
          <p>
            Search for addresses by pincode or area name to find detailed location information.
          </p>
          <AddressSearch />
        </section>
      </div>

      <div className="demo-footer">
        <h3>How to Use</h3>
        <div className="usage-instructions">
          <div className="instruction">
            <h4>1. Address Selection</h4>
            <p>
              Use the cascading dropdowns to select State → District → Area. 
              The system will automatically validate the address and show the corresponding pincode.
            </p>
          </div>
          
          <div className="instruction">
            <h4>2. Address Search</h4>
            <p>
              Search by pincode to find all areas with that pincode, or search by area name 
              to find matching locations across India.
            </p>
          </div>
          
          <div className="instruction">
            <h4>3. Data Source</h4>
            <p>
              All data comes from the comprehensive <code>addressData.json</code> file 
              containing detailed area-level information for all Indian states and territories.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .address-demo {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .demo-header {
          text-align: center;
          margin-bottom: 3rem;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .demo-header h1 {
          color: #333;
          margin-bottom: 1rem;
        }
        
        .demo-header p {
          color: #666;
          margin-bottom: 1rem;
        }
        
        .demo-header ul {
          text-align: left;
          max-width: 600px;
          margin: 0 auto;
          color: #666;
        }
        
        .demo-header li {
          margin-bottom: 0.5rem;
        }
        
        .demo-header code {
          background: #e9ecef;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: monospace;
        }
        
        .demo-sections {
          display: grid;
          gap: 3rem;
          margin-bottom: 3rem;
        }
        
        .demo-section {
          padding: 2rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
        }
        
        .demo-section h2 {
          color: #333;
          margin-bottom: 1rem;
          border-bottom: 2px solid #007bff;
          padding-bottom: 0.5rem;
        }
        
        .demo-section p {
          color: #666;
          margin-bottom: 1.5rem;
        }
        
        .selected-address {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 4px;
        }
        
        .selected-address h3 {
          color: #155724;
          margin-bottom: 1rem;
        }
        
        .address-details p {
          margin-bottom: 0.5rem;
          color: #155724;
        }
        
        .demo-footer {
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .demo-footer h3 {
          color: #333;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        
        .usage-instructions {
          display: grid;
          gap: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .instruction {
          padding: 1.5rem;
          background: white;
          border-radius: 4px;
          border-left: 4px solid #007bff;
        }
        
        .instruction h4 {
          color: #007bff;
          margin-bottom: 0.5rem;
        }
        
        .instruction p {
          color: #666;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .address-demo {
            padding: 1rem;
          }
          
          .demo-header {
            padding: 1rem;
          }
          
          .demo-section {
            padding: 1rem;
          }
          
          .usage-instructions {
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};
