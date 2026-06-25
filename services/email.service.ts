export class EmailService {
  /**
   * Sends an order confirmation receipt to the customer.
   */
  static async sendOrderConfirmation(email: string, orderData: any) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('[EmailService] Missing RESEND_API_KEY. Skipping order confirmation email.');
      return;
    }

    const { id, total_price, order_items } = orderData;

    // Generate items HTML list
    const itemsHtml = order_items && order_items.length > 0
      ? order_items.map((item: any) => {
          const product = item.variants?.products;
          const name = product?.name || 'WEARIMPULSIVE Item';
          const size = item.variants?.size || 'N/A';
          const color = item.variants?.color || 'N/A';
          const price = item.unit_price;
          
          return `
            <div style="border-bottom: 1px solid #1A1A1A; padding-bottom: 15px; margin-bottom: 15px;">
              <div style="color: #F9F9F7; font-size: 14px; font-weight: bold; margin-bottom: 5px;">${name}</div>
              <div style="color: #8E8E8E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; display: flex; justify-content: space-between;">
                <span>SIZE: ${size} | COLOR: ${color} | QTY: ${item.quantity}</span>
                <span style="color: #F9F9F7;">NGN ${price.toLocaleString()}</span>
              </div>
            </div>
          `;
        }).join('')
      : '<div style="color: #8E8E8E; font-size: 11px; text-transform: uppercase;">Order items processing...</div>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>WEARIMPULSIVE Receipt</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0E0E0E; color: #F9F9F7; margin: 0; padding: 0;">
          <div style="max-width: 500px; margin: 60px auto; background-color: #070707; border: 1px solid #800000; padding: 40px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.4em; color: #800000; font-weight: bold; margin-bottom: 30px;">WEARIMPULSIVE</div>
              <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; color: #F9F9F7; margin-bottom: 15px; letter-spacing: -0.02em;">Order Confirmed</div>
              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.25em; color: #8E8E8E; font-weight: 500;">Thank you for your purchase</div>
            </div>
            
            <div style="background-color: #111111; border: 1px solid #1A1A1A; padding: 30px; margin: 30px 0;">
              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; color: #8E8E8E; margin-bottom: 20px; border-bottom: 1px solid #1A1A1A; padding-bottom: 10px;">Order Details</div>
              
              <div style="margin-bottom: 25px;">
                <div style="font-size: 10px; color: #8E8E8E; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 5px;">Order ID</div>
                <div style="font-size: 13px; font-family: monospace; color: #F9F9F7;">${id}</div>
              </div>

              <div style="margin-bottom: 30px;">
                ${itemsHtml}
              </div>

              <div style="border-top: 1px solid #1A1A1A; padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 10px; color: #8E8E8E; text-transform: uppercase; letter-spacing: 0.1em;">Total Paid</div>
                <div style="font-size: 18px; color: #F9F9F7; font-weight: bold;">NGN ${total_price.toLocaleString()}</div>
              </div>
            </div>

            <div style="font-size: 11px; line-height: 1.8; color: #8E8E8E; text-align: center; margin-bottom: 40px; font-weight: 300;">
              Your order is currently being processed. You will receive another email once your package has been shipped.
            </div>

            <div style="border-top: 1px solid #1A1A1A; padding-top: 30px; font-size: 8px; text-transform: uppercase; letter-spacing: 0.3em; color: #444444; text-align: center;">
              WEARIMPULSIVE // ALL RIGHTS RESERVED
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WEARIMPULSIVE <orders@wearimpulsive.site>',
          to: email,
          subject: 'WEARIMPULSIVE - Order Confirmation',
          html: htmlContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[EmailService] Resend API Error:', data);
      } else {
        console.log(`[EmailService] Order confirmation sent to ${email} (ID: ${data.id})`);
      }
    } catch (error) {
      console.error('[EmailService] Failed to send order confirmation email:', error);
    }
  }
}
