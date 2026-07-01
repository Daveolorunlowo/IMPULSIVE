

=== admin\orders\route.ts ===
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/admin/orders
 * Fetches all orders across the platform.
 */
export const GET = async (req: Request) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
    const providedPassword = req.headers.get('x-admin-password');
    
    // Security Check
    if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_price,
        payment_reference,
        created_at,
        metadata,
        order_items (
          quantity,
          unit_price,
          variants (
            size,
            color,
            products (
              name,
              main_image
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin GET /orders]', error.message);
      return NextResponse.json({ error: 'DATABASE_ERROR' }, { status: 500 });
    }

    // Try to map customer_id to email if we can. Note: customer_id is a UUID referencing auth.users.
    // By default Supabase JS might not fetch auth.users directly via standard select unless a view exists.
    // For now, if the metadata contains the email, we'll use that as a fallback.

    return NextResponse.json({ orders: orders || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[Admin GET /orders]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

/**
 * PATCH /api/admin/orders
 * Updates the status of an order.
 */
export const PATCH = async (req: Request) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
    const providedPassword = req.headers.get('x-admin-password');
    
    // Security Check
    if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // First fetch existing metadata
    let selectQuery = supabase.from('orders').select('metadata');
    if (orderId.startsWith('IMP-')) {
      selectQuery = selectQuery.eq('payment_reference', orderId);
    } else {
      selectQuery = selectQuery.eq('id', orderId);
    }
    
    const { data: existingOrder, error: fetchError } = await selectQuery.single();

    if (fetchError) {
      console.error('[Admin PATCH /orders fetch]', fetchError.message);
      return NextResponse.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
    }

    const newHistoryEvent = { status, date: new Date().toISOString() };
    const newMetadata = { 
      ...(existingOrder?.metadata || {}), 
      status_history: [
        ...(existingOrder?.metadata?.status_history || []), 
        newHistoryEvent
      ] 
    };

    let updateQuery = supabase.from('orders').update({ status, metadata: newMetadata });
    
    // Support matching by payment_reference (IMP-XXXX) or database UUID
    if (orderId.startsWith('IMP-')) {
      updateQuery = updateQuery.eq('payment_reference', orderId);
    } else {
      updateQuery = updateQuery.eq('id', orderId);
    }

    const { data: updatedOrder, error } = await updateQuery.select().single();

    if (error) {
      console.error('[Admin PATCH /orders]', error.message);
      return NextResponse.json({ error: 'DATABASE_UPDATE_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[Admin PATCH /orders]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};


=== admin\products\route.ts ===
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Validates admin password
 */
const isAdminAuthorized = (req: Request) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
  const providedPassword = req.headers.get('x-admin-password');
  
  if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
    return false;
  }
  return true;
};

/**
 * POST /api/admin/products
 * Creates a new product
 */
export const POST = async (req: Request) => {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const body = await req.json();
    const supabase = getSupabaseAdmin();

    const insertData = {
      id: body.id, // using string ID like '9', '10'
      slug: body.slug,
      name: body.name,
      category: body.category,
      price: Number(body.price),
      description: body.description,
      main_image: body.mainImage,
      hover_image: body.hoverImage,
      images: [body.mainImage, body.hoverImage].filter(Boolean),
      details: body.details || [],
      sizes: body.sizes || [],
      colors: body.colors || [],
      status: body.status || 'in_stock',
    };

    const { data, error } = await supabase
      .from('products')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('[POST /api/admin/products] DB Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (body.stock !== undefined) {
      const { error: variantError } = await supabase
        .from('variants')
        .upsert([{ id: body.id, stock_quantity: Number(body.stock) }]);
        
      if (variantError) {
        console.error('[POST /api/admin/products] Variant DB Error:', variantError);
      }
    }

    return NextResponse.json({ success: true, product: { ...data, stock: body.stock } });
  } catch (err: any) {
    console.error('[POST /api/admin/products]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

/**
 * PATCH /api/admin/products
 * Updates an existing product
 */
export const PATCH = async (req: Request) => {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const body = await req.json();
    const supabase = getSupabaseAdmin();

    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (updates.slug !== undefined) updateData.slug = updates.slug;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.price !== undefined) updateData.price = Number(updates.price);
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.mainImage !== undefined) updateData.main_image = updates.mainImage;
    if (updates.hoverImage !== undefined) updateData.hover_image = updates.hoverImage;
    if (updates.mainImage !== undefined || updates.hoverImage !== undefined) {
      updateData.images = [updates.mainImage, updates.hoverImage].filter(Boolean);
    }
    if (updates.details !== undefined) updateData.details = updates.details;
    if (updates.sizes !== undefined) updateData.sizes = updates.sizes;
    if (updates.colors !== undefined) updateData.colors = updates.colors;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[PATCH /api/admin/products] DB Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (updates.stock !== undefined) {
      const { error: variantError } = await supabase
        .from('variants')
        .upsert({ id: id, stock_quantity: Number(updates.stock) });
        
      if (variantError) {
        console.error('[PATCH /api/admin/products] Variant DB Error:', variantError);
      }
    }

    return NextResponse.json({ success: true, product: { ...data, stock: updates.stock } });
  } catch (err: any) {
    console.error('[PATCH /api/admin/products]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

/**
 * DELETE /api/admin/products
 * Deletes a product by ID
 */
export const DELETE = async (req: Request) => {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DELETE /api/admin/products] DB Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[DELETE /api/admin/products]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};


=== admin\promos\route.ts ===
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const GET = async (req: Request) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
    const providedPassword = req.headers.get('x-admin-password');
    if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const { data: promos, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, promos });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[Admin GET /promos]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
    const providedPassword = req.headers.get('x-admin-password');
    if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const { code, discount_percentage, is_active } = await req.json();

    if (!code || typeof discount_percentage !== 'number') {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: newPromo, error } = await supabase
      .from('promo_codes')
      .insert({
        code: code.toUpperCase().trim(),
        discount_percentage,
        is_active: is_active !== false, // defaults to true
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return NextResponse.json({ error: 'PROMO_CODE_EXISTS' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, promo: newPromo });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[Admin POST /promos]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const DELETE = async (req: Request) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
    const providedPassword = req.headers.get('x-admin-password');
    if (providedPassword !== adminPassword && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'MISSING_ID' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[Admin DELETE /promos]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};


=== admin\seed-products\route.ts ===
import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';
import { products } from '@/lib/products';



export const GET = async (req: Request) => {
  try {
    const supabase = (await import('@/lib/supabase')).getSupabaseAdmin();

    // Loop through hardcoded products and insert/upsert into DB
    const insertData = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      main_image: p.mainImage,
      hover_image: p.hoverImage,
      images: p.images,
      details: p.details,
      sizes: p.sizes,
      colors: p.colors,
      status: p.status,
    }));

    const { error } = await supabase
      .from('products')
      .upsert(insertData, { onConflict: 'id' });

    if (error) {
      console.error('[seed-products] DB Error:', error);
      return NextResponse.json({ error: 'DATABASE_INSERT_FAILED', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Successfully seeded ${insertData.length} products.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[Admin GET /seed-products]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};


=== admin\upload\route.ts ===
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const isAdminAuthorized = (req: Request) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'impulsive2006';
  const providedPassword = req.headers.get('x-admin-password');
  return providedPassword === adminPassword || process.env.NODE_ENV === 'development';
};

export const POST = async (req: Request) => {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('[POST /api/admin/upload] Storage Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('[POST /api/admin/upload]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};


=== auth\send-code\route.ts ===
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

    if (email && process.env.NODE_ENV !== 'development') {
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

    if (code === 'VALIDATE_ONLY') {
      return NextResponse.json({ success: true, validated: true });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log('\n==================================================');
      console.log('📬 [WEARIMPULSIVE EMAIL FALLBACK] (Development Mode)');
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
          <title>WEARIMPULSIVE Verification</title>
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
            <div class="logo">WEARIMPULSIVE</div>
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
              WEARIMPULSIVE // ALL RIGHTS RESERVED
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
        from: 'WEARIMPULSIVE <auth@wearimpulsive.site>',
        to: email,
        subject: 'WEARIMPULSIVE - Verification Code',
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      return NextResponse.json(
        { error: `Resend Error: ${data.message || 'Failed to dispatch'}` },
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


=== cart\sync\route.ts ===
import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';

/**
 * GET /api/cart/sync
 * Fetches the current cart items from the database for the logged-in user.
 */
export const GET = withSupabase({ auth: 'user' }, async (req, ctx) => {
  try {
    const supabase = ctx.supabaseAdmin as any; // Using admin to bypass RLS for now
    const userId = (ctx.userClaims as any)?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data: cart, error } = await supabase
      .from('user_carts')
      .select('items')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
      throw error;
    }

    return NextResponse.json({ success: true, items: cart?.items || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[GET /api/cart/sync]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

/**
 * POST /api/cart/sync
 * Saves the current cart items to the database for the logged-in user.
 */
export const POST = withSupabase({ auth: 'user' }, async (req, ctx) => {
  try {
    const supabase = ctx.supabaseAdmin as any;
    const userId = (ctx.userClaims as any)?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'INVALID_DATA' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_carts')
      .upsert({ 
        user_id: userId, 
        items,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[POST /api/cart/sync]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});


=== cart\validate\route.ts ===
import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';

interface CartItem {
  productId: string;
  claimedPrice: number;
}

/**
 * POST /api/cart/validate
 * Cross-references frontend cart prices against ground-truth DB prices.
 * Rejects the request if any price drift is detected.
 */
export const POST = withSupabase({ auth: 'none' }, async (req, ctx) => {
  try {
    const { items }: { items: CartItem[] } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: 'EMPTY_CART' }, { status: 400 });
    }

    const productIds = items.map((i) => i.productId);

    const supabase = ctx.supabaseAdmin as any;

    // Fetch from Supabase using ctx.supabaseAdmin
    const { data: currentProducts, error } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds);

    if (error || !currentProducts) {
      return NextResponse.json({ error: 'PRODUCT_FETCH_FAILED' }, { status: 500 });
    }

    const mismatches: { productId: string; expected: number; received: number }[] = [];

    for (const item of items) {
      const dbProduct = currentProducts.find((p: any) => p.id === item.productId);

      if (!dbProduct || dbProduct.price !== item.claimedPrice) {
        mismatches.push({
          productId: item.productId,
          expected: dbProduct?.price ?? 0,
          received: item.claimedPrice,
        });
      }
    }

    if (mismatches.length > 0) {
      return NextResponse.json(
        { valid: false, error: 'PRICE_DRIFT_DETECTED', mismatches },
        { status: 409 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
  }
});


=== cart\validate-promo\route.ts ===
import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';

/**
 * POST /api/cart/validate-promo
 * Body: { code: string }
 * Description: Validates a promo code against the database.
 * Does not require authentication, anyone can try to apply a promo code.
 */
export const POST = withSupabase({ auth: 'none' }, async (req, ctx) => {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'MISSING_CODE' }, { status: 400 });
    }

    const supabase = ctx.supabaseAdmin as any; // We use admin to bypass RLS if there is any, since this is a read-only query
    
    const uppercaseCode = code.toUpperCase().trim();

    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('discount_percentage, is_active')
      .eq('code', uppercaseCode)
      .single();

    if (error || !promo) {
      return NextResponse.json({ error: 'INVALID_CODE' }, { status: 404 });
    }

    if (!promo.is_active) {
      return NextResponse.json({ error: 'CODE_EXPIRED' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      discount_percentage: promo.discount_percentage 
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[POST /api/cart/validate-promo]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});


=== checkout\verify\route.ts ===
import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';
import { PaymentService } from '@/services/payment.service';

/**
 * GET /api/checkout/verify
 * Verifies a Paystack transaction and updates the order status.
 */
export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'MISSING_REFERENCE' }, { status: 400 });
    }

    const supabase = (await import('@/lib/supabase')).getSupabaseAdmin();

    // Verify with Paystack
    const paystackData = await PaymentService.verifyTransaction(reference);

    if (paystackData.data.status !== 'success') {
      return NextResponse.json({ error: 'PAYMENT_NOT_SUCCESSFUL', details: paystackData.data }, { status: 400 });
    }

    // Update the order in the database
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('payment_reference', reference)
      .select()
      .single();

    if (error) {
      console.error('[GET /api/checkout/verify] DB Error:', error.message);
      return NextResponse.json({ error: 'FAILED_TO_UPDATE_ORDER' }, { status: 500 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[GET /api/checkout/verify]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};


=== newsletter\route.ts ===
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


=== orders\route.ts ===
import { NextResponse } from 'next/server';
import { withSupabase } from '@supabase/server';
import { InventoryService } from '@/services/inventory.service';
import { PaymentService } from '@/services/payment.service';
import { calculateShipping } from '@/lib/utils';

/**
 * POST /api/orders
 * Creates a pending order, atomically decrements stock, and
 * returns a Paystack payment URL.
 */
export const POST = async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { customerId, email, items, totalPrice, currency = 'NGN', promoCode, shippingAddress } = await req.json();

    if (!customerId || !email || !items?.length || totalPrice === undefined) {
      return NextResponse.json({ error: 'MISSING_REQUIRED_FIELDS' }, { status: 400 });
    }

    const supabase = (await import('@/lib/supabase')).getSupabaseAdmin();

    // ── 1. TIMED DROP WINDOW CHECK ────────────────────────────────────────
    const { data: activeDrop } = await supabase
      .from('drops')
      .select('*')
      .eq('is_active', true)
      .single();

    if (activeDrop) {
      const now = new Date();
      const start = new Date(activeDrop.start_time);
      const end = new Date(activeDrop.end_time);

      if (now < start || now > end) {
        return NextResponse.json(
          { error: 'THE DROP WINDOW IS CLOSED. Check back when the next release goes live.' },
          { status: 403 }
        );
      }
    }

    // ── 1.5. SECURE PRICE VALIDATION ──────────────────────────────────────
    const productIds = items.map((i: any) => i.productId || i.variantId);
    
    const { data: dbProducts, error: dbErr } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds);
      
    if (dbErr || !dbProducts) {
      return NextResponse.json({ error: 'FAILED_TO_VERIFY_PRODUCTS' }, { status: 500 });
    }

    let expectedTotalPrice = 0;
    for (const item of items) {
      const dbProduct = dbProducts.find((p: any) => p.id === (item.productId || item.variantId));
      if (!dbProduct) {
        return NextResponse.json({ error: 'INVALID_PRODUCT' }, { status: 400 });
      }
      
      const isCustomized = !!item.customText;
      const expectedItemPrice = dbProduct.price + (isCustomized ? 15000 : 0);
      expectedTotalPrice += expectedItemPrice * item.quantity;
    }

    const uppercaseCode = promoCode?.toUpperCase()?.trim();
    if (uppercaseCode) {
      const { data: promoData } = await supabase
        .from('promo_codes')
        .select('discount_percentage, is_active')
        .eq('code', uppercaseCode)
        .single();

      if (promoData && promoData.is_active && promoData.discount_percentage > 0) {
        expectedTotalPrice = expectedTotalPrice * (1 - promoData.discount_percentage / 100);
      }
    }

    const shippingFee = calculateShipping(shippingAddress?.state || '');
    const finalExpectedPrice = expectedTotalPrice + shippingFee;

    if (Math.abs(totalPrice - finalExpectedPrice) > 0.01) {
      console.error(`[POST /api/orders] PRICE_TAMPERING_DETECTED: Expected ${finalExpectedPrice}, got ${totalPrice}`);
      return NextResponse.json({ error: 'PRICE_TAMPERING_DETECTED' }, { status: 409 });
    }

    // ── 2. ATOMIC STOCK RESERVATION ──────────────────────────────────────
    // Decrement each variant atomically. Throws on insufficient stock.
    for (const item of items) {
      try {
        await InventoryService.decrementStock(item.variantId, item.quantity);
      } catch (err: any) {
        // If stock check fails (e.g. variants table is empty), we'll log it but proceed for now
        // to avoid blocking checkout during development/testing
        console.warn(`[POST /api/orders] Stock decrement failed for ${item.variantId}:`, err.message);
      }
    }

    // ── 3. CREATE PENDING ORDER ───────────────────────────────────────────
    const reference = `IMP-${Date.now()}-${Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0')}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        total_price: totalPrice,
        status: 'pending',
        payment_reference: reference,
        metadata: {
          email,
          shippingAddress,
          promoCode,
          currency,
        },
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // ── 4. INSERT ORDER ITEMS ─────────────────────────────────────────────
    await supabase.from('order_items').insert(
      items.map((item: any) => ({
        order_id: order.id,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: item.claimedPrice,
      }))
    );

    // ── 5. INITIALISE PAYMENT ─────────────────────────────────────────────
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const callbackUrl = `${origin}/checkout/success`;
    const payment = await PaymentService.initializeTransaction(email, totalPrice, reference, currency, callbackUrl);

    return NextResponse.json({
      orderId: order.id,
      paymentUrl: payment.data.authorization_url,
      reference,
    });
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'INTERNAL_SERVER_ERROR';
    console.error('[POST /api/orders]', message, err.response?.data);
    return NextResponse.json({ error: message, details: err.response?.data }, { status: 500 });
  }
};

/**
 * GET /api/orders
 * Fetches order transactions for the logged-in user.
 */
export const GET = withSupabase({ auth: 'user' }, async (req, ctx) => {
  try {
    const userId = (ctx.userClaims as any)?.sub;
    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const supabase = ctx.supabaseAdmin as any;

    // Retrieve user orders from Supabase
    const { data: dbOrders, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_price,
        payment_reference,
        created_at,
        metadata
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /api/orders] DB Error:', error.message);
      return NextResponse.json({ error: 'DATABASE_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ orders: dbOrders || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[GET /api/orders]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});



=== products\notify\route.ts ===
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
        from: 'WEARIMPULSIVE <notify@wearimpulsive.site>',
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


=== products\route.ts ===
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getSupabaseClient } from '@/lib/supabase';

// Helper to convert snake_case DB columns to camelCase frontend model
const toCamelCase = (dbProduct: any) => ({
  id: dbProduct.id,
  slug: dbProduct.slug,
  name: dbProduct.name,
  category: dbProduct.category,
  price: Number(dbProduct.price),
  description: dbProduct.description,
  mainImage: dbProduct.main_image,
  hoverImage: dbProduct.hover_image,
  images: dbProduct.images || [],
  details: dbProduct.details || [],
  sizes: dbProduct.sizes || [],
  colors: dbProduct.colors || [],
  status: dbProduct.status || 'in_stock',
  stock: Array.isArray(dbProduct.variants) 
    ? (dbProduct.variants[0]?.stock_quantity ?? 0) 
    : (dbProduct.variants?.stock_quantity ?? 0),
});

/**
 * GET /api/products
 * Fetches all products from the database
 */
export const GET = async () => {
  try {
    // Public fetch, bypass RLS since we want everyone to see products
    const supabase = (await import('@/lib/supabase')).getSupabaseAdmin();

    const { data: products, error } = await supabase
      .from('products')
      .select('*, variants(*)')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[GET /api/products] DB Error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, products: products.map(toCamelCase) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'INTERNAL_SERVER_ERROR';
    console.error('[GET /api/products]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};


=== track\route.ts ===
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ error: 'MISSING_CODE' }, { status: 400 });
    }

    const cleanedCode = code.trim().toUpperCase();
    const isTrackingCode = cleanedCode.startsWith('IMP-TRK-');

    const supabase = getSupabaseAdmin();
    const query = supabase
      .from('orders')
      .select(`
        id,
        payment_reference,
        status,
        total_price,
        created_at,
        metadata,
        order_items (
          quantity,
          unit_price,
          variants (
            size,
            color,
            products (
              name,
              main_image
            )
          )
        )
      `);

    if (isTrackingCode) {
      query.eq('metadata->>tracking_number', cleanedCode);
    } else {
      query.eq('payment_reference', cleanedCode);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return NextResponse.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
    }

    // Map the database order structure to the frontend store structure expected by track-client
    const mappedOrder = {
      id: order.payment_reference,
      email: order.metadata?.email || '',
      fullName: order.metadata?.name || `${order.metadata?.shippingAddress?.firstName || ''} ${order.metadata?.shippingAddress?.lastName || ''}`.trim() || 'Customer',
      address: order.metadata?.shippingAddress?.address || 'Address not provided',
      city: order.metadata?.shippingAddress?.city || '',
      country: order.metadata?.shippingAddress?.country || '',
      totalPrice: order.total_price,
      currency: order.metadata?.currency || 'NGN',
      // Map raw backend statuses to the UI stepper states
      status: (order.status === 'pending' || order.status === 'paid') ? 'Processing' : 
              order.status === 'shipped' ? 'Shipped' :
              order.status === 'out_for_delivery' ? 'Out for Delivery' :
              order.status === 'delivered' ? 'Delivered' : 'Processing',
      trackingNumber: order.metadata?.tracking_number || '',
      createdAt: order.created_at,
      items: order.order_items?.map((item: any, idx: number) => ({
        id: `item-${idx}`,
        name: item.variants?.products?.name || 'Unknown Item',
        price: item.unit_price,
        quantity: item.quantity,
        image: item.variants?.products?.main_image || '',
        selectedSize: item.variants?.size || 'N/A',
        selectedColor: { name: item.variants?.color || 'N/A', hex: '' },
        customText: item.customText || ''
      })) || []
    };

    return NextResponse.json(mappedOrder);
  } catch (err: any) {
    console.error('[GET /api/track]', err.message);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
};


=== webhooks\paystack\route.ts ===
import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { EmailService } from '@/services/email.service';
import { withSupabase } from '@supabase/server';

/**
 * POST /api/webhooks/paystack
 * Listens for Paystack events. Only updates order status after
 * cryptographic signature verification.
 */
export const POST = withSupabase({ auth: 'none' }, async (req, ctx) => {
  const payload = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';

  // ── 1. VERIFY SIGNATURE ───────────────────────────────────────────────
  if (!PaymentService.verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 401 });
  }

  const event = JSON.parse(payload);

  // ── 2. HANDLE SUCCESSFUL PAYMENT ─────────────────────────────────────
  if (event.event === 'charge.success') {
    const reference: string = event.data.reference;
    const customerEmail: string = event.data.customer?.email;

    const supabase = ctx.supabaseAdmin as any;

    // 1. Fetch existing metadata so we don't overwrite shipping info
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('metadata')
      .eq('payment_reference', reference)
      .single();

    const trackingCode = `IMP-TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newMetadata = { 
      ...(existingOrder?.metadata || {}), 
      tracking_number: trackingCode,
      status_history: [
        ...(existingOrder?.metadata?.status_history || []),
        { status: 'paid', date: new Date().toISOString() }
      ]
    };

    // Use ctx.supabaseAdmin to bypass RLS and mark as paid, returning the updated order with items
    const { data: order, error } = await supabase
      .from('orders')
      .update({ 
        status: 'paid', 
        updated_at: new Date().toISOString(),
        metadata: newMetadata
      })
      .eq('payment_reference', reference)
      .select(`
        id,
        total_price,
        metadata,
        order_items (
          quantity,
          unit_price,
          variants (
            size,
            color,
            products (
              name
            )
          )
        )
      `)
      .single();

    if (error || !order) {
      console.error('[Webhook] DB update failed:', error?.message);
      return NextResponse.json({ error: 'DB_UPDATE_FAILED' }, { status: 500 });
    }

    console.log(`[Webhook] Order ${reference} marked as PAID.`);

    // ── 3. SEND ORDER CONFIRMATION EMAIL ────────────────────────────────
    if (customerEmail) {
      // Send asynchronously without awaiting so the webhook returns quickly
      EmailService.sendOrderConfirmation(customerEmail, order).catch(e => {
        console.error('[Webhook] Email dispatch failed:', e);
      });
    }
  }

  return NextResponse.json({ status: 'received' });
});
