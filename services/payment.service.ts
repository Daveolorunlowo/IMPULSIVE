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
  static async initializeTransaction(email: string, amount: number, reference: string, currency: string = 'USD', callbackUrl?: string) {
    const url = callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success`;
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo/cents
        reference,
        currency: currency.toUpperCase(),
        callback_url: url
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
   * Verifies a transaction with Paystack
   */
  static async verifyTransaction(reference: string) {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
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
    
    try {
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    } catch {
      return false; // Length mismatch
    }
  }
}
