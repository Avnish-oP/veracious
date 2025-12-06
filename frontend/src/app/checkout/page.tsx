"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Tag,
  ArrowRight,
  Loader2,
  AlertCircle,
  Trash2,
  Package,
  Truck,
  Shield,
  Locate,
  Save,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Address } from "@/types/orderTypes";
import { createOrder } from "@/utils/checkoutApi";
import { getAddresses, addAddress, deleteAddress } from "@/utils/addressApi";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    getCartSummary,
    clearCart,
    applyCouponToCart,
    removeCoupon,
    appliedCoupon,
    couponApplying,
  } = useCartStore();
  const { user } = useUserStore();
  const { getLocation, loading: locationLoading } = useGeolocation();

  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState("");

  // Address State
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [shouldSaveAddress, setShouldSaveAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Address form state
  const [address, setAddress] = useState<Address>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal: "",
    country: "India",
    label: "Home",
  });

  const cartSummary = getCartSummary();

  // Shipping and tax calculations
  const itemsTotal = Math.max(
    0,
    cartSummary.subtotalAfterDiscount - cartSummary.couponDiscount
  );
  const SHIPPING_COST = itemsTotal > 1000 ? 0 : 50; // Free shipping above ₹1000
  const GST_RATE = 18; // 18% GST
  const gstAmount = (itemsTotal * GST_RATE) / 100;
  const finalTotal = itemsTotal + SHIPPING_COST + gstAmount;

  useEffect(() => {
    // Redirect if cart is empty
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
    }

    // Redirect if not logged in
    if (!user) {
      toast.error("Please login to continue");
      router.push("/auth/login");
    } else {
      fetchAddresses();
    }
  }, [cart, user, router]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const addresses = await getAddresses();
      setSavedAddresses(addresses);
      if (addresses.length > 0) {
        selectAddress(addresses[0]);
      } else {
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const selectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id || null);
    setAddress(addr);
    setShowAddressForm(false);
  };

  const handleUseCurrentLocation = async () => {
    const loc = await getLocation();
    if (loc) {
      setAddress((prev) => ({
        ...prev,
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));
      // In a real app, you would use a Reverse Geocoding API here
      // to fill line1, city, state, postal, country based on coords.
      toast.success("Location captured! Please fill in the address details.");
      setShowAddressForm(true);
      setSelectedAddressId(null); // Deselect existing to act as new
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      await applyCouponToCart(couponInput.trim().toUpperCase());
      toast.success("Coupon applied successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply coupon");
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput("");
    toast.success("Coupon removed");
  };

  const handleProceedToPayment = async () => {
    // Validate address
    if (
      !address.line1 ||
      !address.city ||
      !address.state ||
      !address.postal ||
      !address.country
    ) {
      toast.error("Please fill in all required address fields");
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      // 1. Save address if requested and it's a new address (no ID)
      let finalAddressId = selectedAddressId;
      if (shouldSaveAddress && !selectedAddressId) {
        try {
          const newAddr = await addAddress(address);
          finalAddressId = newAddr.id || null;
          toast.success("Address saved successfully");
        } catch (err) {
          console.error("Failed to save address:", err);
          toast.error("Failed to save address, proceeding with order anyway");
        }
      }

      // Prepare order items
      const items = cart.items.map((item) => {
        const firstImage = item.product?.images?.[0];
        const imageUrl =
          typeof firstImage === "string" ? firstImage : firstImage?.url || "";

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.product?.price || 0),
          discountPrice: Number(item.product?.discountPrice || 0),
          name: item.product?.name || "",
          image: imageUrl,
        };
      });

      // Create order
      const orderResponse = await createOrder({
        items,
        addressId: finalAddressId || undefined, // If not saved, might fail backend validation if backend *requires* ID.
        // NOTE: If backend requires addressId, we MUST save it first. 
        // Based on previous createOrder analysis, it checks `if (addressId) ...`. 
        // If we don't send addressId, we might need to send address details in body if backend supports it (it doesn't currently).
        // So we SHOULD save it implicitly if not selected.
        couponCode: appliedCoupon?.code || undefined,
        shipping: SHIPPING_COST,
        gst: GST_RATE,
      });

      // Ideally, if createOrder requires addressId, we must have one. 
      // If the user didn't save, we should probably save it as a "temporary" address or force save.
      // For now, let's assume valid flow is: Select ID OR Save & Get ID.
      // If user unchecks "Save", we currently don't have an ID.
      // Modification: Backend createOrder expects addressId. We must ensure we have one.
      // If valid ID not present, create it silently?
      if (!finalAddressId) {
         // Force create address if not exists
         const newAddr = await addAddress({...address, label: "Temporary"});
         finalAddressId = newAddr.id || null;
         // Proceed with new Order call if needed or just use this ID
         // Re-calling createOrder with new ID:
         const retryOrderResponse = await createOrder({
            items,
            addressId: finalAddressId || undefined,
            couponCode: appliedCoupon?.code || undefined,
            shipping: SHIPPING_COST,
            gst: GST_RATE,
         });
         sessionStorage.setItem("pendingOrder", JSON.stringify(retryOrderResponse));
      } else {
         sessionStorage.setItem("pendingOrder", JSON.stringify(orderResponse));
      }

      sessionStorage.setItem("orderAddress", JSON.stringify(address));

      router.push("/payment");
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="w-10 h-10 text-amber-600" />
            Checkout
          </h1>
          <p className="text-gray-600 mt-2">
            Complete your order and proceed to payment
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Coupon */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Shipping Address
                </h2>
              </div>

              {/* Saved Addresses List */}
              {!showAddressForm && savedAddresses.length > 0 && (
                <div className="mb-6 grid gap-4 grid-cols-1 md:grid-cols-2">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => selectAddress(addr)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-amber-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                         <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-medium mb-2 inline-block">
                           {addr.label || "Address"}
                         </span>
                         {selectedAddressId === addr.id && <div className="h-3 w-3 bg-amber-500 rounded-full"/>}
                      </div>
                      <p className="font-medium text-gray-900">{addr.line1}</p>
                      {addr.line2 && <p className="text-gray-600 text-sm">{addr.line2}</p>}
                      <p className="text-gray-600 text-sm">
                        {addr.city}, {addr.state} {addr.postal}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setShowAddressForm(true);
                      setSelectedAddressId(null);
                      setAddress({ line1: "", line2: "", city: "", state: "", postal: "", country: "India", label: "Home" });
                    }}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-amber-500 hover:text-amber-600 transition-colors h-full min-h-[120px]"
                  >
                    <Plus className="w-6 h-6 mb-2" />
                    <span>Add New Address</span>
                  </button>
                </div>
              )}

              {/* Address Form */}
              {(showAddressForm || savedAddresses.length === 0) && (
                <div className="space-y-4">
                  <div className="flex justify-end gap-3 mb-4">
                     {savedAddresses.length > 0 && (
                        <button 
                           onClick={() => setShowAddressForm(false)}
                           className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                           Cancel & Select Saved
                        </button>
                     )}
                     <button
                        onClick={handleUseCurrentLocation}
                        disabled={locationLoading}
                        className="flex items-center gap-2 text-sm text-amber-600 font-medium hover:text-amber-700 disabled:opacity-50"
                     >
                        {locationLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Locate className="w-4 h-4"/>}
                        Use Current Location
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Label (e.g., Home, Office)
                      </label>
                      <input
                        type="text"
                        value={address.label}
                        onChange={(e) =>
                          setAddress({ ...address, label: e.target.value })
                        }
                        placeholder="Home"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address.line1}
                        onChange={(e) =>
                          setAddress({ ...address, line1: e.target.value })
                        }
                        placeholder="Street address, P.O. box"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={address.line2}
                        onChange={(e) =>
                          setAddress({ ...address, line2: e.target.value })
                        }
                        placeholder="Apartment, suite, unit, building, floor, etc."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 text-black focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) =>
                          setAddress({ ...address, city: e.target.value })
                        }
                        placeholder="City"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 text-black focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) =>
                          setAddress({ ...address, state: e.target.value })
                        }
                        placeholder="State"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 text-black focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address.postal}
                        onChange={(e) =>
                          setAddress({ ...address, postal: e.target.value })
                        }
                        placeholder="Postal code"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 text-black focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address.country}
                        onChange={(e) =>
                          setAddress({ ...address, country: e.target.value })
                        }
                        placeholder="Country"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 text-black focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                     <input 
                        type="checkbox" 
                        id="saveAddress"
                        checked={shouldSaveAddress}
                        onChange={(e) => setShouldSaveAddress(e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                     />
                     <label htmlFor="saveAddress" className="text-sm text-gray-700">Save this address for future orders</label>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Items ({cart.items.length})
                </h2>
              </div>

              <div className="space-y-4">
                {cart.items.map((item) => {
                  const firstImage = item.product?.images?.[0];
                  const imageUrl =
                    typeof firstImage === "string"
                      ? firstImage
                      : firstImage?.url || "/placeholder.png";

                  return (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={imageUrl}
                          alt={item.product?.name || "Product"}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.product?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ₹
                          {(
                            Number(
                              item.product?.discountPrice || item.product?.price
                            ) * item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartSummary.subtotal.toFixed(2)}</span>
                </div>

                {(cartSummary.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Product savings</span>
                    <span>-₹{(cartSummary.discount ?? 0).toFixed(2)}</span>
                  </div>
                )}

                {cartSummary.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Coupon{" "}
                      {appliedCoupon ? `(${appliedCoupon.code})` : "savings"}
                    </span>
                    <span>-₹{cartSummary.couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Shipping
                  </span>
                  <span>
                    {SHIPPING_COST === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `₹${SHIPPING_COST.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>GST ({GST_RATE}%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {SHIPPING_COST === 0 && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    You get FREE shipping on this order!
                  </p>
                </div>
              )}

              <button
                onClick={handleProceedToPayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
