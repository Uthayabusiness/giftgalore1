import React, { useState, useEffect } from 'react';
import { EnhancedAddressForm } from './EnhancedAddressForm';

interface ShippingAddressData {
  state: string;
  district: string;
  area: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  recipientName: string;
  phoneNumber: string;
  email: string;
}

interface CheckoutShippingAddressProps {
  className?: string;
  onAddressChange: (address: ShippingAddressData) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  initialData?: Partial<ShippingAddressData>;
  showDeliveryOptions?: boolean;
}

export const CheckoutShippingAddress: React.FC<CheckoutShippingAddressProps> = ({
  className = '',
  onAddressChange,
  onValidationChange,
  initialData = {},
  showDeliveryOptions = true
}) => {
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressData>({
    state: '',
    district: '',
    area: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    recipientName: '',
    phoneNumber: '',
    email: '',
    ...initialData
  });

  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express' | 'same-day'>('standard');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // Handle address form changes
  const handleAddressFormChange = (addressData: any) => {
    const newAddress = {
      ...shippingAddress,
      ...addressData
    };
    setShippingAddress(newAddress);
    onAddressChange(newAddress);
  };

  // Handle validation changes
  const handleValidationChange = (isValid: boolean, errors: string[]) => {
    setIsFormValid(isValid);
    if (onValidationChange) {
      onValidationChange(isValid, errors);
    }
  };

  // Handle delivery option change
  const handleDeliveryOptionChange = (option: 'standard' | 'express' | 'same-day') => {
    setDeliveryOption(option);
  };

  // Get delivery time estimate
  const getDeliveryTime = (option: 'standard' | 'express' | 'same-day') => {
    switch (option) {
      case 'standard':
        return '3-5 business days';
      case 'express':
        return '1-2 business days';
      case 'same-day':
        return 'Same day (if ordered before 2 PM)';
      default:
        return '3-5 business days';
    }
  };

  // Get delivery cost
  const getDeliveryCost = (option: 'standard' | 'express' | 'same-day') => {
    switch (option) {
      case 'standard':
        return '₹50';
      case 'express':
        return '₹150';
      case 'same-day':
        return '₹300';
      default:
        return '₹50';
    }
  };

  // Calculate estimated delivery date
  const getEstimatedDeliveryDate = (option: 'standard' | 'express' | 'same-day') => {
    const today = new Date();
    let deliveryDate = new Date(today);
    
    switch (option) {
      case 'standard':
        deliveryDate.setDate(today.getDate() + 5);
        break;
      case 'express':
        deliveryDate.setDate(today.getDate() + 2);
        break;
      case 'same-day':
        deliveryDate = today;
        break;
    }
    
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`checkout-shipping-address ${className}`}>
      <div className="section-header">
        <h3>Shipping Address</h3>
        <p>Enter your delivery address details</p>
      </div>

      <div className="form-section">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="recipientName">Recipient Name *</label>
            <input
              type="text"
              id="recipientName"
              value={shippingAddress.recipientName}
              onChange={(e) => handleAddressFormChange({ recipientName: e.target.value })}
              placeholder="Full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number *</label>
            <input
              type="tel"
              id="phoneNumber"
              value={shippingAddress.phoneNumber}
              onChange={(e) => handleAddressFormChange({ phoneNumber: e.target.value })}
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              maxLength={10}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={shippingAddress.email}
            onChange={(e) => handleAddressFormChange({ email: e.target.value })}
            placeholder="Email for delivery updates"
          />
        </div>
      </div>

      <div className="address-form-section">
        <EnhancedAddressForm
          initialData={shippingAddress}
          onAddressChange={handleAddressFormChange}
          onValidationChange={handleValidationChange}
          mode="checkout"
        />
      </div>

      {showDeliveryOptions && (
        <div className="delivery-options-section">
          <h4>Delivery Options</h4>
          
          <div className="delivery-options">
            <label className="delivery-option">
              <input
                type="radio"
                name="deliveryOption"
                value="standard"
                checked={deliveryOption === 'standard'}
                onChange={(e) => handleDeliveryOptionChange(e.target.value as 'standard' | 'express' | 'same-day')}
              />
              <div className="option-content">
                <div className="option-header">
                  <span className="option-name">Standard Delivery</span>
                  <span className="option-cost">{getDeliveryCost('standard')}</span>
                </div>
                <div className="option-details">
                  <span className="delivery-time">{getDeliveryTime('standard')}</span>
                  <span className="estimated-date">Estimated: {getEstimatedDeliveryDate('standard')}</span>
                </div>
              </div>
            </label>

            <label className="delivery-option">
              <input
                type="radio"
                name="deliveryOption"
                value="express"
                checked={deliveryOption === 'express'}
                onChange={(e) => handleDeliveryOptionChange(e.target.value as 'standard' | 'express' | 'same-day')}
              />
              <div className="option-content">
                <div className="option-header">
                  <span className="option-name">Express Delivery</span>
                  <span className="option-cost">{getDeliveryCost('express')}</span>
                </div>
                <div className="option-details">
                  <span className="delivery-time">{getDeliveryTime('express')}</span>
                  <span className="estimated-date">Estimated: {getEstimatedDeliveryDate('express')}</span>
                </div>
              </div>
            </label>

            <label className="delivery-option">
              <input
                type="radio"
                name="deliveryOption"
                value="same-day"
                checked={deliveryOption === 'same-day'}
                onChange={(e) => handleDeliveryOptionChange(e.target.value as 'standard' | 'express' | 'same-day')}
              />
              <div className="option-content">
                <div className="option-header">
                  <span className="option-name">Same Day Delivery</span>
                  <span className="option-cost">{getDeliveryCost('same-day')}</span>
                </div>
                <div className="option-details">
                  <span className="delivery-time">{getDeliveryTime('same-day')}</span>
                  <span className="estimated-date">Estimated: {getEstimatedDeliveryDate('same-day')}</span>
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      <div className="delivery-instructions-section">
        <label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</label>
        <textarea
          id="deliveryInstructions"
          value={deliveryInstructions}
          onChange={(e) => setDeliveryInstructions(e.target.value)}
          placeholder="Any special instructions for delivery? (e.g., 'Call before delivery', 'Leave at security desk')"
          rows={3}
        />
      </div>

      <div className="delivery-summary">
        <div className="summary-item">
          <span>Delivery Option:</span>
          <span className="summary-value">{deliveryOption.charAt(0).toUpperCase() + deliveryOption.slice(1)}</span>
        </div>
        <div className="summary-item">
          <span>Delivery Cost:</span>
          <span className="summary-value">{getDeliveryCost(deliveryOption)}</span>
        </div>
        <div className="summary-item">
          <span>Estimated Delivery:</span>
          <span className="summary-value">{getEstimatedDeliveryDate(deliveryOption)}</span>
        </div>
      </div>

      <style jsx>{`
        .checkout-shipping-address {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .section-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #007bff;
        }
        
        .section-header h3 {
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        .section-header p {
          color: #666;
          margin: 0;
        }
        
        .form-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        .address-form-section {
          margin-bottom: 2rem;
        }
        
        .delivery-options-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .delivery-options-section h4 {
          color: #333;
          margin-bottom: 1rem;
        }
        
        .delivery-options {
          display: grid;
          gap: 1rem;
        }
        
        .delivery-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .delivery-option:hover {
          border-color: #007bff;
          box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
        }
        
        .delivery-option input[type="radio"] {
          margin: 0;
        }
        
        .option-content {
          flex: 1;
        }
        
        .option-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .option-name {
          font-weight: 500;
          color: #333;
        }
        
        .option-cost {
          font-weight: bold;
          color: #007bff;
        }
        
        .option-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .delivery-time {
          color: #666;
          font-size: 0.9rem;
        }
        
        .estimated-date {
          color: #28a745;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .delivery-instructions-section {
          margin-bottom: 2rem;
        }
        
        .delivery-summary {
          padding: 1.5rem;
          background: #e3f2fd;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .summary-item:last-child {
          margin-bottom: 0;
        }
        
        .summary-value {
          font-weight: 500;
          color: #007bff;
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .option-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};
