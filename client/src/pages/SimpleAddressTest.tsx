import React from 'react';
import { AddressTest } from '../components/AddressTest';

export const SimpleAddressTest: React.FC = () => {
  return (
    <div>
      <h1>Address System Debug Test</h1>
      <p>This page will help us debug why the address system is not working.</p>
      <AddressTest />
    </div>
  );
};
