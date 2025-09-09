export const CASHFREE_CONFIG = {
  appId: process.env.CASHFREE_APP_ID || 'not-set',
  secretKey: process.env.CASHFREE_SECRET_KEY || 'not-set',
  environment: process.env.CASHFREE_ENVIRONMENT || 'TEST', // Use 'TEST' for sandbox, 'PRODUCTION' for live
  baseUrl: process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION' 
    ? 'https://api.cashfree.com' 
    : 'https://sandbox.cashfree.com',
};

// Debug logging
console.log('🔧 Cashfree Configuration:');
console.log('  - Environment Variable:', process.env.CASHFREE_ENVIRONMENT);
console.log('  - App ID:', process.env.CASHFREE_APP_ID ? 'SET' : 'NOT SET');
console.log('  - Secret Key:', process.env.CASHFREE_SECRET_KEY ? 'SET' : 'NOT SET');
console.log('  - Final Environment:', CASHFREE_CONFIG.environment);
console.log('  - Final Base URL:', CASHFREE_CONFIG.baseUrl);

export const CASHFREE_ENDPOINTS = {
  createOrder: '/pg/orders',
  getOrder: '/pg/orders',
  capturePayment: '/pg/orders',
  refundPayment: '/pg/orders',
  getRefund: '/pg/orders',
};
