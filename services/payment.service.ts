import crypto from 'crypto';
import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

/**
 * PAYMENT SERVICE
 * Manages Paystack transactions and webhooks
 */
export class PaymentService {
  /**
   * Initializes a transaction with Paystack
   */
  static async initializeTransaction(email: string, amount: number, reference: string) {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Convert to kobo
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  /**
   * Verifies the authenticity of a Paystack Webhook signature
   */
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(payload)
      .digest('hex');
    
    return hash === signature;
  }
}
