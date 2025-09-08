export const CASHFREE_CONFIG = {
  appId: process.env.CASHFREE_APP_ID || '',
  secretKey: process.env.CASHFREE_SECRET_KEY || '',
  environment: process.env.CASHFREE_ENVIRONMENT || 'PRODUCTION', // Use 'TEST' for sandbox, 'PRODUCTION' for live
  baseUrl: process.env.CASHFREE_ENVIRONMENT === 'TEST' 
    ? 'https://sandbox.cashfree.com' 
    : 'https://api.cashfree.com',
};

export const CASHFREE_ENDPOINTS = {
  createOrder: '/pg/orders',
  getOrder: '/pg/orders',
  capturePayment: '/pg/orders',
  refundPayment: '/pg/orders',
  getRefund: '/pg/orders',
};
