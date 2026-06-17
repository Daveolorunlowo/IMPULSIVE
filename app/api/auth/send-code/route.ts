import { NextResponse } from 'next/server';
import { isDisposableEmail } from '@/lib/email-validator';

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: 'DISPOSABLE_EMAIL' },
        { status: 400 }
      );
    }

    if (email) {
      const now = Date.now();
      const userLimit = rateLimitMap.get(email);
      
      if (userLimit && now - userLimit.timestamp < RATE_LIMIT_WINDOW_MS) {
        if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
          return NextResponse.json({ error: 'TOO_MANY_REQUESTS' }, { status: 429 });
        }
        userLimit.count += 1;
      } else {
        rateLimitMap.set(email, { count: 1, timestamp: now });
      }
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log('\n==================================================');
      console.log('📬 [IMPULSIVE EMAIL FALLBACK] (Development Mode)');
      console.log(`To: ${email}`);
      console.log(`Code: ${code}`);
      console.log('To receive actual emails, add the following to your .env.local:');
      console.log('RESEND_API_KEY=re_yourApiKeyHere');
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
          <title>IMPULSIVE Verification</title>
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
            .code-box {
              background-color: #111111;
              border: 1px solid #1A1A1A;
              padding: 24px;
              margin: 30px 0;
            }
            .code {
              font-size: 32px;
              font-family: monospace;
              letter-spacing: 0.4em;
              color: #F9F9F7;
              font-weight: bold;
              margin-left: 0.4em; /* Align center due to letter-spacing */
            }
            .instructions {
              font-size: 11px;
              line-height: 1.8;
              color: #8E8E8E;
              margin-bottom: 40px;
              font-weight: 300;
            }
            .footer {
              border-t: 1px solid #1A1A1A;
              padding-top: 30px;
              font-size: 8px;
              text-transform: uppercase;
              letter-spacing: 0.3em;
              color: #444444;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">IMPULSIVE</div>
            <div class="title">Log In</div>
            <div class="subtitle">Verification Code</div>
            
            <div class="instructions">
              Please enter the 6-digit verification code below to log into your account.
            </div>

            <div class="code-box">
              <div class="code">${code}</div>
            </div>

            <div class="instructions" style="margin-top: 30px;">
              This code will expire soon. If you did not request this, you can ignore this email.
            </div>

            <div class="footer">
              IMPULSIVE // ALL RIGHTS RESERVED
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
        from: 'IMPULSIVE <onboarding@resend.dev>',
        to: email,
        subject: 'IMPULSIVE - Verification Code',
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      return NextResponse.json(
        { error: 'Failed to dispatch email via Resend' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: data.id });
  } catch (error) {
    console.error('Email send api error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
