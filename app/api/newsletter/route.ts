import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';
import { isDisposableEmail } from '@/lib/email-validator';

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 2;

export const POST = withSupabase({ auth: 'none' }, async (req, ctx) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json({ error: 'DISPOSABLE_EMAIL' }, { status: 400 });
    }

    // Rate Limiting by IP or Email (Using Email for simplicity in edge)
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

    const supabase = ctx.supabaseAdmin as any;

    // Insert into 'subscribers' table using the context admin client
    const { error } = await supabase
      .from('subscribers')
      .insert({ email });

    // If the table doesn't exist, Supabase returns a specific error code (42P01)
    if (error) {
      if (error.code === '42P01') {
        console.error('[Newsletter] The "subscribers" table does not exist in Supabase.');
        // We'll still return success to the frontend to not break UX during development, 
        // but log the error for the admin.
        return NextResponse.json({ 
          success: true, 
          message: 'Table missing. Development mode fallback.' 
        });
      }
      // Handle unique constraint violation (already subscribed)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'ALREADY_SUBSCRIBED' }, { status: 400 });
      }

      console.error('[Newsletter] DB Error:', error.message);
      return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[POST /api/newsletter]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
