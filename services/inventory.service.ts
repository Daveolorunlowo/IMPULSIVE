import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * INVENTORY SERVICE
 * Handles atomic stock operations and validation.
 * All Supabase access is deferred to request time via getSupabaseAdmin().
 */
export class InventoryService {
  /**
   * Atomically decrements stock for a specific variant.
   * Uses a Postgres RPC function to guarantee consistency under race conditions.
   * Throws if stock is insufficient.
   */
  static async decrementStock(variantId: string, quantity: number): Promise<void> {
    const { error } = await getSupabaseAdmin().rpc('decrement_stock', {
      variant_uuid: variantId,
      qty: quantity,
    });

    if (error) {
      throw new Error(`INSUFFICIENT_STOCK: ${error.message}`);
    }
  }

  /**
   * Validates that every item in the cart has sufficient stock before
   * the payment gateway is initialised.
   */
  static async validateCartStock(
    items: { variantId: string; quantity: number }[]
  ): Promise<boolean> {
    const variantIds = items.map((i) => i.variantId);

    const { data: variants, error } = await getSupabaseAdmin()
      .from('variants')
      .select('id, stock_quantity')
      .in('id', variantIds);

    if (error || !variants) return false;

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant || variant.stock_quantity < item.quantity) return false;
    }

    return true;
  }
}
