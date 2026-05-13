import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

interface CartItem {
  productId: string;
  claimedPrice: number;
}

/**
 * POST /api/cart/validate
 * Cross-references frontend cart prices against ground-truth DB prices.
 * Rejects the request if any price drift is detected.
 */
export async function POST(req: Request) {
  try {
    const { items }: { items: CartItem[] } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: 'EMPTY_CART' }, { status: 400 });
    }

    const productIds = items.map((i) => i.productId);

    const { data: currentProducts, error } = await getSupabaseAdmin()
      .from('products')
      .select('id, price')
      .in('id', productIds);

    if (error || !currentProducts) {
      return NextResponse.json({ error: 'PRODUCT_FETCH_FAILED' }, { status: 500 });
    }

    const mismatches: { productId: string; expected: number; received: number }[] = [];

    for (const item of items) {
      const dbProduct = currentProducts.find((p) => p.id === item.productId);

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
}
