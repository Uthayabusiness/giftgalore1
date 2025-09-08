import React, { useState } from 'react';
import { EnhancedAddressForm } from './EnhancedAddressForm';

interface AddressData {
  id: string;
  type: 'home' | 'work' | 'other';
  state: string;
  district: string;
  area: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  isDefault: boolean;
}

interface ProfileAddressManagerProps {
  className?: string;
  onAddressesChange?: (addresses: AddressData[]) => void;
}

export const ProfileAddressManager: React.FC<ProfileAddressManagerProps> = ({
  className = '',
  onAddressesChange
}) => {
  const [addresses, setAddresses] = useState<AddressData[]>([
    {
      id: '1',
      type: 'home',
      state: '',
      district: '',
      area: '',
      pincode: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      isDefault: true
    }
  ]);

  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Handle address changes
  const handleAddressChange = (addressId: string, data: Partial<AddressData>) => {
    const updatedAddresses = addresses.map(addr => 
      addr.id === addressId ? { ...addr, ...data } : addr
    );
    setAddresses(updatedAddresses);
    
    if (onAddressesChange) {
      onAddressesChange(updatedAddresses);
    }
  };

  // Add new address
  const handleAddAddress = () => {
    const newAddress: AddressData = {
      id: Date.now().toString(),
      type: 'home',
      state: '',
      district: '',
      area: '',
      pincode: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      isDefault: false
    };
    
    setAddresses(prev => [...prev, newAddress]);
    setEditingAddress(newAddress.id);
    setShowAddForm(false);
  };

  // Edit address
  const handleEditAddress = (addressId: string) => {
    setEditingAddress(addressId);
  };

  // Save address
  const handleSaveAddress = (addressId: string) => {
    setEditingAddress(null);
  };

  // Cancel editing
  const handleCancelEdit = (addressId: string) => {
    setEditingAddress(null);
  };

  // Delete address
  const handleDeleteAddress = (addressId: string) => {
    if (addresses.length > 1) {
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      setAddresses(updatedAddresses);
      
      if (onAddressesChange) {
        onAddressesChange(updatedAddresses);
      }
    }
  };

  // Set default address
  const handleSetDefault = (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    setAddresses(updatedAddresses);
    
    if (onAddressesChange) {
      onAddressesChange(updatedAddresses);
    }
  };

  // Change address type
  const handleTypeChange = (addressId: string, type: 'home' | 'work' | 'other') => {
    handleAddressChange(addressId, { type });
  };

  return (
    <div className={`profile-address-manager ${className}`}>
      <div className="header">
        <h2>Manage Addresses</h2>
        <p>Add, edit, and manage your delivery addresses</p>
      </div>

      <div className="addresses-list">
        {addresses.map((address) => (
          <div key={address.id} className="address-card">
            <div className="address-header">
              <div className="address-type">
                <select
                  value={address.type}
                  onChange={(e) => handleTypeChange(address.id, e.target.value as 'home' | 'work' | 'other')}
                  disabled={editingAddress === address.id}
                >
                  <option value="home">🏠 Home</option>
                  <option value="work">🏢 Work</option>
                  <option value="other">📍 Other</option>
                </select>
                {address.isDefault && <span className="default-badge">Default</span>}
              </div>
              
              <div className="address-actions">
                {editingAddress === address.id ? (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleSaveAddress(address.id)}
                    >
                      Save
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleCancelEdit(address.id)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleEditAddress(address.id)}
                    >
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set Default
                      </button>
                    )}
                    {addresses.length > 1 && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {editingAddress === address.id ? (
              <div className="edit-form">
                <EnhancedAddressForm
                  initialData={address}
                  onAddressChange={(data) => handleAddressChange(address.id, data)}
                  mode="profile"
                />
              </div>
            ) : (
              <div className="address-display">
                <div className="address-content">
                  <p className="address-lines">
                    {address.addressLine1}
                    {address.addressLine2 && <br />}
                    {address.addressLine2}
                  </p>
                  <p className="address-location">
                    {address.area}, {address.district}, {address.state} - {address.pincode}
                  </p>
                  {address.landmark && (
                    <p className="landmark">Landmark: {address.landmark}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!showAddForm && (
        <div className="add-address-section">
          <button 
            className="btn btn-primary btn-large"
            onClick={handleAddAddress}
          >
            + Add New Address
          </button>
        </div>
      )}

      <style jsx>{`
        .profile-address-manager {
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .header h2 {
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        .header p {
          color: #666;
          margin: 0;
        }
        
        .addresses-list {
          display: grid;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .address-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
          overflow: hidden;
        }
        
        .address-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #ddd;
        }
        
        .address-type {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .address-type select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          font-size: 0.9rem;
        }
        
        .default-badge {
          background: #28a745;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .address-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: #007bff;
          color: white;
        }
        
        .btn-primary:hover {
          background: #0056b3;
        }
        
        .btn-success {
          background: #28a745;
          color: white;
        }
        
        .btn-success:hover {
          background: #1e7e34;
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #545b62;
        }
        
        .btn-outline {
          background: transparent;
          color: #007bff;
          border: 1px solid #007bff;
        }
        
        .btn-outline:hover {
          background: #007bff;
          color: white;
        }
        
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        
        .btn-danger:hover {
          background: #c82333;
        }
        
        .btn-large {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
        }
        
        .edit-form {
          padding: 1.5rem;
        }
        
        .address-display {
          padding: 1.5rem;
        }
        
        .address-content p {
          margin: 0.5rem 0;
          color: #333;
        }
        
        .address-lines {
          font-weight: 500;
          line-height: 1.4;
        }
        
        .address-location {
          color: #666;
          font-size: 0.9rem;
        }
        
        .landmark {
          color: #007bff;
          font-size: 0.9rem;
          font-style: italic;
        }
        
        .add-address-section {
          text-align: center;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #ddd;
        }
        
        @media (max-width: 768px) {
          .address-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .address-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
