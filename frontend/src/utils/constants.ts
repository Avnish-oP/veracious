// Shared constants used across the frontend application

/**
 * Free shipping threshold in INR.
 * Orders above this amount qualify for free shipping.
 */
export const FREE_SHIPPING_THRESHOLD = 999;

/**
 * Flat shipping cost in INR when order is below the free shipping threshold.
 */
export const SHIPPING_COST_FLAT = 50;

/**
 * Calculate shipping cost based on order total.
 * Returns 0 (free) if total exceeds FREE_SHIPPING_THRESHOLD, otherwise SHIPPING_COST_FLAT.
 */
export const calculateShipping = (orderTotal: number): number => {
  return orderTotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST_FLAT;
};
