import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Truck,
  RefreshCw,
  Shield,
  Tag,
  Check,
  Copy,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/form-components";
import { cn } from "@/utils/cn";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useProductCoupons } from "@/hooks/useCoupons";
import { Product } from "@/types/productTypes";

interface ProductInfoProps {
  product: Product;
  discountPercentage: number;
  avgRating: number;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  discountPercentage,
  avgRating,
}) => {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, isUserLoading } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();

  // Track view
  React.useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product, addToRecentlyViewed]);

  const [mainImage, setMainImage] = useState(product.image);
  const {
    data: couponsData,
    isLoading: couponsLoading,
    isError: couponsError,
  } = useProductCoupons(product.id);

  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  const fallbackCoupons = product.applicableCoupons ?? [];
  const coupons = couponsData?.coupons ?? fallbackCoupons;
  const hasCoupons = coupons.length > 0;
  const visibleCoupons = showAllCoupons ? coupons : coupons.slice(0, 3);
  const couponErrorMessage = couponsError
    ? "Unable to load coupons right now."
    : null;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      router.push("/cart");
    } catch (error) {
      toast.error("Failed to add to cart");
      setIsAddingToCart(false);
    }
  };

  const handleCopyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCouponCode(code);
      toast.success("Coupon code copied!");
      setTimeout(() => setCopiedCouponCode(null), 2000);
    } catch (copyError) {
      console.error("Failed to copy coupon code", copyError);
      toast.error("Could not copy coupon code");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-8"
    >
      {/* Brand & Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-amber-600 font-bold uppercase tracking-wider">
            {product.brand}
          </p>
          {product.stock > 0 && product.stock < 10 && (
            <span className="text-xs font-bold text-red-500 animate-pulse">
              Only {product.stock} items left!
            </span>
          )}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {product.name}
        </h1>

        {/* Categories & Rating */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {product.categories && product.categories.length > 0 && (
            <div className="flex gap-2">
              {product.categories.map((category) => (
                <span
                  key={category.id}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors cursor-default"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
          <div className="h-4 w-px bg-gray-300 mx-2 hidden sm:block" />
          {product.reviews && product.reviews.length > 0 && (
            <div className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="ml-1 font-bold text-gray-900">
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-4 group-hover:decoration-amber-400 transition-all">
                {product.reviews.length} reviews
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Price Section */}
      <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100/60 backdrop-blur-sm">
        <div className="flex items-baseline gap-4 mb-4">
          {product.discountPrice ? (
            <>
              <span className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                ₹{Number(product.discountPrice).toFixed(2)}
              </span>
              <span className="text-xl sm:text-2xl text-gray-400 line-through font-medium">
                ₹{Number(product.price).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              ₹{Number(product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Coupons */}
        <div className="pt-4 border-t border-amber-200/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-600" />
              Available Offers
            </p>
            {hasCoupons && coupons.length > 3 && (
              <button
                onClick={() => setShowAllCoupons((prev) => !prev)}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                {showAllCoupons ? "Show less" : `View all ${coupons.length}`}
                <ChevronRight
                  className={cn(
                    "w-3 h-3 transition-transform",
                    showAllCoupons && "rotate-90"
                  )}
                />
              </button>
            )}
          </div>

          {couponsLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading offers...
            </div>
          ) : hasCoupons ? (
            <div className="space-y-3">
              <AnimatePresence>
                {visibleCoupons.map((coupon) => (
                  <motion.div
                    key={coupon.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between gap-3 bg-white border border-amber-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          {coupon.code}
                        </span>
                        <span className="text-xs text-green-600 font-semibold truncate">
                          {coupon.discountType === "PERCENTAGE"
                            ? `${
                                coupon.discountValue ?? coupon.discount ?? 0
                              }% OFF`
                            : `₹${
                                coupon.discountValue ?? coupon.discount ?? 0
                              } OFF`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {coupon.description || "Apply code at checkout"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyCoupon(coupon.code)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Copy Code"
                    >
                      {copiedCouponCode === coupon.code ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No active coupons for this product.
            </p>
          )}
        </div>
      </div>

      {/* Stock & Quantity */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Quantity
          </label>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl w-fit">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 rounded-l-xl"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center text-lg font-bold text-gray-900 tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
              className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 rounded-r-xl"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Availability
          </label>
          {product.stock > 0 ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl border border-green-100">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="font-semibold text-sm">
                In Stock & Ready to Ship
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100">
              <div className="h-3 w-3 bg-red-500 rounded-full" />
              <span className="font-semibold text-sm">
                Currently Out of Stock
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <div className="flex gap-3 h-14">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart || isUserLoading}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-md"
          >
            {isAddingToCart || isUserLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
            {isUserLoading ? "Loading..." : "Add to Cart"}
          </Button>
          <button
            onClick={() => toggleWishlist(product.id)}
            className={cn(
              "w-14 h-14 border-2 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 active:translate-y-0",
              isInWishlist(product.id)
                ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300"
                : "border-amber-200 text-amber-500 hover:bg-amber-50 hover:border-amber-300"
            )}
            aria-label={
              isInWishlist(product.id)
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >
            <Heart
              className={cn(
                "w-6 h-6",
                isInWishlist(product.id) && "fill-current"
              )}
            />
          </button>
        </div>

        <Button
          onClick={handleBuyNow}
          disabled={product.stock === 0 || isAddingToCart || isUserLoading}
          className="w-full bg-gray-900 hover:bg-black text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          {isUserLoading ? "Loading..." : "Buy Now - Fast Checkout"}
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
        <div className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-full mb-2">
            <Truck className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-gray-900">Free Delivery</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Orders over ₹4175</p>
        </div>
        <div className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-full mb-2">
            <RefreshCw className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-gray-900">Easy Returns</p>
          <p className="text-[10px] text-gray-500 mt-0.5">30 Days Policy</p>
        </div>
        <div className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-full mb-2">
            <Shield className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-gray-900">Secure Payment</p>
          <p className="text-[10px] text-gray-500 mt-0.5">100% Protected</p>
        </div>
      </div>
    </motion.div>
  );
};
