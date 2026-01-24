// Local storage utilities for guest cart management

import { LocalStorageCart, ItemConfiguration } from "@/types/cartTypes";

const CART_STORAGE_KEY = "guestCart";

/**
 * Get guest cart from localStorage
 */
export const getGuestCart = (): LocalStorageCart => {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) {
      return { items: [] };
    }
    return JSON.parse(cartData);
  } catch (error) {
    console.error("Error reading guest cart from localStorage:", error);
    return { items: [] };
  }
};

/**
 * Save guest cart to localStorage
 */
export const saveGuestCart = (cart: LocalStorageCart): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving guest cart to localStorage:", error);
  }
};

/**
 * Add item to guest cart
 */
export const addToGuestCart = (
  productId: string,
  quantity: number,
  configuration?: ItemConfiguration
): LocalStorageCart => {
  const cart = getGuestCart();

  const existingItemIndex = cart.items.findIndex(
    (item) => 
      item.productId === productId && 
      JSON.stringify(item.configuration) === JSON.stringify(configuration)
  );

  if (existingItemIndex !== -1) {
    // Update existing item quantity
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({ productId, quantity, configuration });
  }

  saveGuestCart(cart);
  return cart;
};

/**
 * Remove item from guest cart
 */
export const removeFromGuestCart = (productId: string): LocalStorageCart => {
  const cart = getGuestCart();
  cart.items = cart.items.filter((item) => item.productId !== productId);
  saveGuestCart(cart);
  return cart;
};

/**
 * Update item quantity in guest cart
 */
export const updateGuestCartItem = (
  productId: string,
  quantity: number
): LocalStorageCart => {
  const cart = getGuestCart();

  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId === productId
  );

  if (existingItemIndex !== -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(existingItemIndex, 1);
    } else {
      // Update quantity
      cart.items[existingItemIndex].quantity = quantity;
    }
  }

  saveGuestCart(cart);
  return cart;
};

/**
 * Clear guest cart
 */
export const clearGuestCart = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing guest cart from localStorage:", error);
  }
};

/**
 * Get total number of items in guest cart
 */
export const getGuestCartItemCount = (): number => {
  const cart = getGuestCart();
  return cart.items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Check if guest cart has items
 */
export const hasGuestCartItems = (): boolean => {
  const cart = getGuestCart();
  return cart.items.length > 0;
};

/**
 * Get item quantity from guest cart
 */
export const getGuestCartItemQuantity = (productId: string): number => {
  const cart = getGuestCart();
  const item = cart.items.find((item) => item.productId === productId);
  return item?.quantity || 0;
};
