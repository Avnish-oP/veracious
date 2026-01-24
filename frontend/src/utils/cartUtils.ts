import { Cart, CartSummary, ItemConfiguration } from "@/types/cartTypes";

/**
 * Calculate cart summary including totals, discounts, and coupon savings
 * Shared between useCartStore and useCart to ensure consistent calculations
 */
export function calculateCartSummary(
  cart: Cart | null,
  couponDiscount: number = 0
): CartSummary {
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      totalItems: 0,
      subtotal: 0,
      subtotalAfterDiscount: 0,
      discount: 0,
      couponDiscount: 0,
      total: 0,
    };
  }

  // Total number of items
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate subtotal using original prices + lens prices
  const subtotal = cart.items.reduce((sum, item) => {
    const price = Number(item.product?.price) || 0;
    const config = item.configuration as ItemConfiguration | undefined;
    const lensPrice = Number(config?.lensPrice) || 0;
    return sum + (price + lensPrice) * item.quantity;
  }, 0);

  // Calculate discount (difference between original price and discount price)
  const discount = cart.items.reduce((sum, item) => {
    if (item.product?.discountPrice && item.product?.price) {
      const savings =
        (Number(item.product.price) - Number(item.product.discountPrice)) *
        item.quantity;
      return sum + savings;
    }
    return sum;
  }, 0);

  // Calculate actual amount after discount (using discount prices where available)
  const subtotalAfterDiscount = cart.items.reduce((sum, item) => {
    const price =
      Number(item.product?.discountPrice) || Number(item.product?.price) || 0;
    const config = item.configuration as ItemConfiguration | undefined;
    const lensPrice = Number(config?.lensPrice) || 0;
    return sum + (price + lensPrice) * item.quantity;
  }, 0);

  // Ensure coupon discount doesn't exceed subtotal
  const normalizedCouponDiscount = Math.min(
    couponDiscount || 0,
    subtotalAfterDiscount
  );

  // Final total
  const total = Math.max(0, subtotalAfterDiscount - normalizedCouponDiscount);

  return {
    totalItems,
    subtotal,
    discount,
    subtotalAfterDiscount,
    couponDiscount: normalizedCouponDiscount,
    total,
  };
}

/**
 * Calculate discounted subtotal for coupon validation
 */
export function calculateDiscountedSubtotal(cart: Cart | null): number {
  if (!cart || !cart.items) {
    return 0;
  }

  return cart.items.reduce((sum, item) => {
    const price = Number(
      item.product?.discountPrice ?? item.product?.price ?? 0
    );
    const config = item.configuration as ItemConfiguration | undefined;
    const lensPrice = Number(config?.lensPrice) || 0;
    return sum + (price + lensPrice) * item.quantity;
  }, 0);
}
