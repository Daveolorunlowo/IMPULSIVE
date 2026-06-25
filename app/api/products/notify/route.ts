import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';
import { isDisposableEmail } from '@/lib/email-validator';

export const POST = withSupabase({ auth: 'none' }, async (request, ctx) => {
  try {
    const { email, productName, notificationType, message } = await request.json();

    if (!email || !productName || !notificationType || !message) {
      return NextResponse.json(
        { error: 'Email, productName, notificationType, and message are required' },
        { status: 400 }
      );
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: 'DISPOSABLE_EMAIL' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log('\n==================================================');
      console.log('📬 [WEARIMPULSIVE NOTIFICATION FALLBACK] (Development Mode)');
      console.log(`To: ${email}`);
      console.log(`Product: ${productName}`);
      console.log(`Type: ${notificationType}`);
      console.log(`Message: ${message}`);
      console.log('To receive actual emails, verify you have RESEND_API_KEY configured.');
      console.log('==================================================\n');

      return NextResponse.json({ 
        success: true, 
        message: 'Mock email logged to server console.' 
      });
    }

    // Build premium, minimal luxury HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>WEARIMPULSIVE - Product Alert</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #0E0E0E;
              color: #F9F9F7;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 500px;
              margin: 60px auto;
              background-color: #070707;
              border: 1px solid #800000;
              padding: 40px;
              text-align: center;
            }
            .logo {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.4em;
              color: #800000;
              font-weight: bold;
              margin-bottom: 40px;
            }
            .title {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 26px;
              color: #F9F9F7;
              margin-bottom: 20px;
              letter-spacing: -0.02em;
            }
            .subtitle {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.25em;
              color: #8E8E8E;
              margin-bottom: 40px;
              font-weight: 500;
            }
            .message-box {
              background-color: #111111;
              border: 1px solid #1A1A1A;
              padding: 24px;
              margin: 30px 0;
              text-align: left;
            }
            .message-text {
              font-size: 13px;
              line-height: 1.8;
              color: #F9F9F7;
              font-weight: 300;
            }
            .product-tag {
              display: inline-block;
              background-color: #800000;
              color: #F9F9F7;
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.2em;
              padding: 6px 12px;
              margin-top: 15px;
            }
            .instructions {
              font-size: 11px;
              line-height: 1.8;
              color: #8E8E8E;
              margin-bottom: 40px;
              font-weight: 300;
            }
            .footer {
              border-top: 1px solid #1A1A1A;
              padding-top: 30px;
              font-size: 8px;
              text-transform: uppercase;
              letter-spacing: 0.3em;
              color: #444444;
              margin-top: 40px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">WEARIMPULSIVE STUDIO</div>
            <div class="title">${productName}</div>
            <div class="subtitle">${notificationType}</div>
            
            <div class="message-box">
              <div class="message-text">
                ${message}
              </div>
              <div class="text-center" style="text-align: center;">
                <span class="product-tag">${notificationType}</span>
              </div>
            </div>

            <div class="instructions">
              You are receiving this update because you are subscribed to notifications for the ${productName} drop or requested styling updates.
            </div>

            <div class="footer">
              ARCHIVAL DESIGN SYSTEMS // ALL RIGHTS RESERVED
            </div>
          </div>
        </body>
      </html>
    `;

    // Fetch call to Resend REST API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'WEARIMPULSIVE <onboarding@resend.dev>',
        to: email,
        subject: `[WEARIMPULSIVE] Alert: ${productName} - ${notificationType}`,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      return NextResponse.json(
        { error: 'Failed to dispatch email via Resend', details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: data.id });
  } catch (error) {
    console.error('Product notification api error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
