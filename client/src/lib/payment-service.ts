import { apiRequest } from './queryClient';

export interface CreatePaymentOrderRequest {
  orderId: string;
  amount: number;
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  returnUrl: string;
}

export interface CreatePaymentOrderResponse {
  success: boolean;
  order: any;
  paymentSessionId: string;
}

export interface PaymentOrderResponse {
  success: boolean;
  order: any;
}

export class PaymentService {
  async createPaymentOrder(data: CreatePaymentOrderRequest): Promise<CreatePaymentOrderResponse> {
    try {
      const response = await apiRequest('POST', '/api/payments/create-order', data);
      return await response.json();
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  }

  async getPaymentOrder(orderId: string): Promise<PaymentOrderResponse> {
    try {
      const response = await apiRequest('GET', `/api/payments/order/${orderId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment order:', error);
      throw error;
    }
  }

  async capturePayment(orderId: string, amount: number): Promise<any> {
    try {
      const response = await apiRequest('POST', `/api/payments/capture/${orderId}`, { amount });
      return await response.json();
    } catch (error) {
      console.error('Error capturing payment:', error);
      throw error;
    }
  }

  async createRefund(orderId: string, refundAmount: number, refundNote?: string): Promise<any> {
    try {
      const response = await apiRequest('POST', `/api/payments/refund/${orderId}`, {
        refundAmount,
        refundNote,
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
