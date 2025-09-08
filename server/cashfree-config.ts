export const CASHFREE_CONFIG = {
  appId: '1043398c92ed29e38d9877354cc8933401',
  secretKey: 'cfsk_ma_prod_8de40e9a96a52710aea7ee932b0ad788_441dbba8',
  environment: 'PRODUCTION', // Use 'TEST' for sandbox, 'PRODUCTION' for live
  baseUrl: 'https://api.cashfree.com', // Production URL
  // baseUrl: 'https://sandbox.cashfree.com', // Use this for testing
};

export const CASHFREE_ENDPOINTS = {
  createOrder: '/pg/orders',
  getOrder: '/pg/orders',
  capturePayment: '/pg/orders',
  refundPayment: '/pg/orders',
  getRefund: '/pg/orders',
};
