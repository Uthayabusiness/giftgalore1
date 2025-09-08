import React from 'react';
import { SimpleAddressForm } from '../components/SimpleAddressForm';

export const BasicAddressTest: React.FC = () => {
  return (
    <div>
      <h1>Basic Address System Test</h1>
      <p>This page tests the basic address functionality with a simple form.</p>
      <SimpleAddressForm />
    </div>
  );
};
