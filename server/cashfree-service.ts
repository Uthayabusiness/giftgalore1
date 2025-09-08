import { CASHFREE_CONFIG, CASHFREE_ENDPOINTS } from './cashfree-config';

export interface CreateOrderRequest {
  order_id: string;
  order_amount: number;
  order_currency: string;
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  order_meta: {
    return_url: string;
    notify_url?: string;
  };
  order_note?: string;
}

export interface CreateOrderResponse {
  cf_order_id: number;
  created_at: string;
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  entity: string;
  order_amount: number;
  order_currency: string;
  order_expiry_time: string;
  order_id: string;
  order_meta: {
    return_url: string;
    notify_url?: string;
  };
  order_note?: string;
  order_status: string;
  order_tags?: any;
  payment_session_id: string;
}

export interface PaymentSessionResponse {
  payment_session_id: string;
  order_token: string;
  url: string;
}

export class CashfreeService {
  private baseUrl: string;
  private appId: string;
  private secretKey: string;

  constructor() {
    // Safety check for environment variables
    if (!CASHFREE_CONFIG.appId || CASHFREE_CONFIG.appId === 'not-set') {
      console.warn('⚠️ Cashfree APP_ID not set - payment features will be disabled');
    }
    if (!CASHFREE_CONFIG.secretKey || CASHFREE_CONFIG.secretKey === 'not-set') {
      console.warn('⚠️ Cashfree SECRET_KEY not set - payment features will be disabled');
    }
    
    this.baseUrl = CASHFREE_CONFIG.baseUrl;
    this.appId = CASHFREE_CONFIG.appId;
    this.secretKey = CASHFREE_CONFIG.secretKey;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': this.appId,
      'x-client-secret': this.secretKey,
    };
  }

  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${CASHFREE_ENDPOINTS.createOrder}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cashfree API Error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating Cashfree order:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<CreateOrderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${CASHFREE_ENDPOINTS.getOrder}/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cashfree API Error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Cashfree order:', error);
      throw error;
    }
  }

  async capturePayment(orderId: string, amount: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${CASHFREE_ENDPOINTS.capturePayment}/${orderId}/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          order_amount: amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cashfree API Error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error capturing Cashfree payment:', error);
      throw error;
    }
  }

  async createRefund(orderId: string, refundAmount: number, refundNote?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${CASHFREE_ENDPOINTS.refundPayment}/${orderId}/refunds`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          refund_amount: refundAmount,
          refund_note: refundNote || 'Refund for order',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cashfree API Error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating Cashfree refund:', error);
      throw error;
    }
  }
}

export const cashfreeService = new CashfreeService();
