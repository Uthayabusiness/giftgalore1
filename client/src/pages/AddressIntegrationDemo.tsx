import React, { useState } from 'react';
import { ProfileAddressManager } from '../components/ProfileAddressManager';
import { CheckoutShippingAddress } from '../components/CheckoutShippingAddress';
import { EnhancedAddressForm } from '../components/EnhancedAddressForm';

export const AddressIntegrationDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'checkout' | 'standalone'>('profile');
  const [profileAddresses, setProfileAddresses] = useState<any[]>([]);
  const [checkoutAddress, setCheckoutAddress] = useState<any>({});
  const [standaloneAddress, setStandaloneAddress] = useState<any>({});

  const handleProfileAddressesChange = (addresses: any[]) => {
    setProfileAddresses(addresses);
    console.log('Profile addresses updated:', addresses);
  };

  const handleCheckoutAddressChange = (address: any) => {
    setCheckoutAddress(address);
    console.log('Checkout address updated:', address);
  };

  const handleStandaloneAddressChange = (address: any) => {
    setStandaloneAddress(address);
    console.log('Standalone address updated:', address);
  };

  return (
    <div className="address-integration-demo">
      <div className="demo-header">
        <h1>Address System Integration Demo</h1>
        <p>
          This demo showcases the comprehensive address system integration using 
          <code>addressData.json</code> for both profile management and checkout processes.
        </p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          🏠 Profile Address Management
        </button>
        <button
          className={`tab-button ${activeTab === 'checkout' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkout')}
        >
          🛒 Checkout Shipping Address
        </button>
        <button
          className={`tab-button ${activeTab === 'standalone' ? 'active' : ''}`}
          onClick={() => setActiveTab('standalone')}
        >
          📝 Standalone Address Form
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="tab-description">
              <h2>Profile Address Management</h2>
              <p>
                Manage multiple addresses with different types (Home, Work, Other). 
                Each address includes comprehensive validation and landmark suggestions.
              </p>
              <ul>
                <li>Add, edit, and delete multiple addresses</li>
                <li>Set default delivery address</li>
                <li>Real-time validation with suggestions</li>
                <li>Landmark suggestions for better delivery</li>
              </ul>
            </div>
            
            <ProfileAddressManager onAddressesChange={handleProfileAddressesChange} />
            
            {profileAddresses.length > 0 && (
              <div className="data-preview">
                <h3>Current Addresses Data:</h3>
                <pre>{JSON.stringify(profileAddresses, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'checkout' && (
          <div className="checkout-tab">
            <div className="tab-description">
              <h2>Checkout Shipping Address</h2>
              <p>
                Streamlined checkout process with address validation, delivery options, 
                and estimated delivery times.
              </p>
              <ul>
                <li>Recipient information collection</li>
                <li>Multiple delivery options (Standard, Express, Same-day)</li>
                <li>Real-time delivery cost calculation</li>
                <li>Delivery instructions and special requests</li>
              </ul>
            </div>
            
            <CheckoutShippingAddress 
              onAddressChange={handleCheckoutAddressChange}
              showDeliveryOptions={true}
            />
            
            {Object.keys(checkoutAddress).length > 0 && (
              <div className="data-preview">
                <h3>Current Checkout Data:</h3>
                <pre>{JSON.stringify(checkoutAddress, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'standalone' && (
          <div className="standalone-tab">
            <div className="tab-description">
              <h2>Standalone Address Form</h2>
              <p>
                Use the enhanced address form independently in any part of your application.
                Perfect for forms, modals, or custom implementations.
              </p>
              <ul>
                <li>Complete address validation</li>
                <li>Pincode-based address suggestions</li>
                <li>Landmark suggestions</li>
                <li>Real-time form validation</li>
              </ul>
            </div>
            
            <div className="standalone-form-container">
              <EnhancedAddressForm
                onAddressChange={handleStandaloneAddressChange}
                onValidationChange={(isValid, errors) => {
                  console.log('Form validation:', { isValid, errors });
                }}
                mode="profile"
              />
            </div>
            
            {Object.keys(standaloneAddress).length > 0 && (
              <div className="data-preview">
                <h3>Current Form Data:</h3>
                <pre>{JSON.stringify(standaloneAddress, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="demo-footer">
        <h3>Key Features of the Address System</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>🌍 Comprehensive Data</h4>
            <p>Access to all Indian states, districts, and areas with exact pincodes from addressData.json</p>
          </div>
          
          <div className="feature-card">
            <h4>✅ Real-time Validation</h4>
            <p>Instant validation of state-district-area combinations with helpful error suggestions</p>
          </div>
          
          <div className="feature-card">
            <h4>🔍 Smart Suggestions</h4>
            <p>Pincode-based address suggestions and landmark recommendations for better delivery</p>
          </div>
          
          <div className="feature-card">
            <h4>🎯 Multiple Use Cases</h4>
            <p>Ready-to-use components for profile management, checkout, and standalone forms</p>
          </div>
          
          <div className="feature-card">
            <h4>📱 Responsive Design</h4>
            <p>Mobile-friendly interface with cascading dropdowns and intuitive user experience</p>
          </div>
          
          <div className="feature-card">
            <h4>⚡ Performance Optimized</h4>
            <p>Async data loading with caching, efficient search, and optimized rendering</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .address-integration-demo {
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
        
        .demo-header code {
          background: #e9ecef;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: monospace;
        }
        
        .tab-navigation {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .tab-button {
          padding: 1rem 1.5rem;
          border: 2px solid #ddd;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
          min-width: 200px;
        }
        
        .tab-button:hover {
          border-color: #007bff;
          background: #f8f9fa;
        }
        
        .tab-button.active {
          border-color: #007bff;
          background: #007bff;
          color: white;
        }
        
        .tab-content {
          margin-bottom: 3rem;
        }
        
        .tab-description {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #e3f2fd;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }
        
        .tab-description h2 {
          color: #007bff;
          margin-bottom: 1rem;
        }
        
        .tab-description p {
          color: #333;
          margin-bottom: 1rem;
        }
        
        .tab-description ul {
          color: #666;
          margin: 0;
          padding-left: 1.5rem;
        }
        
        .tab-description li {
          margin-bottom: 0.5rem;
        }
        
        .standalone-form-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .data-preview {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        
        .data-preview h3 {
          color: #333;
          margin-bottom: 1rem;
        }
        
        .data-preview pre {
          background: #2d3748;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.85rem;
          line-height: 1.4;
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
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .feature-card {
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #ddd;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .feature-card h4 {
          color: #007bff;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        
        .feature-card p {
          color: #666;
          margin: 0;
          line-height: 1.5;
        }
        
        @media (max-width: 768px) {
          .address-integration-demo {
            padding: 1rem;
          }
          
          .tab-navigation {
            flex-direction: column;
            align-items: center;
          }
          
          .tab-button {
            min-width: 250px;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
