"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Heart,
  Sparkles,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/form-components";
import { cn } from "@/utils/cn";
// import { useUserStore } from "@/store/useUserStore"; // Keeping for now if needed, but likely removing
// import { useCartStore } from "@/store/useCartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";
import { CartDrawer } from "@/components/cart/CartDrawer";
import Image from "next/image";
import { fetchCategories } from "@/utils/api";
import { Category } from "@/types/productTypes";

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

const navigationBase: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Sunglasses", href: "/products?category=sunglasses" },
  { label: "Contact Lenses", href: "/products?category=contact-lenses" },
  { label: "Eyewear", href: "/products?category=eyewear" },
  { label: "Contact", href: "/contact" },
];

import { SearchBar } from "@/components/ui/SearchBar";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [navigation, setNavigation] = useState<NavItem[]>(navigationBase);
  const [categoriesRaw, setCategoriesRaw] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user, isLoading: loading, logout } = useUser();
  const { getTotalItems } = useCart();
  const { count: wishlistItemCount } = useWishlist();

  const cartItemCount = getTotalItems();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Fetch categories for navigation
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchCategories();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cats = (res as any).categories || [];
        
        if (mounted) {
          setCategoriesRaw(cats);

          // Find specific categories to attach children
          const contactLensCat = cats.find((c: Category) => c.slug === "contact-lenses");
          
          let contactLensChildren: NavItem[] = [];
          
          if (contactLensCat) {
             // Filter categories that are children of Contact Lenses or have specific types
             // Since we populated types (MANUFACTURER, LENS_TYPE, DISPOSABILITY), we can use that.
             // OR check parentId if available in frontend model.
             // Assuming cats contains all categories including sub-categories.
             
             contactLensChildren = cats
                .filter((c: Category) => c.parentId === contactLensCat.id || ["MANUFACTURER", "LENS_TYPE", "DISPOSABILITY"].includes(c.type || ""))
                .map((c: Category) => ({
                   label: c.name,
                   href: `/products?category=${c.id}`,
                   type: c.type 
                }));
          }

          const sunglassesCat = cats.find((c: Category) => c.slug === "sunglasses");
          let sunglassesChildren: NavItem[] = [];
          if (sunglassesCat) {
             sunglassesChildren = cats
                .filter((c: Category) => c.parentId === sunglassesCat.id)
                .map((c: Category) => ({
                   label: c.name,
                   href: `/products?category=${c.id}`,
                   type: c.type 
                }));
          }

          const nav = navigationBase.map((item) => {
            if (item.label === "Contact Lenses") {
               return { ...item, children: contactLensChildren };
            }
            if (item.label === "Sunglasses") {
               return { ...item, children: sunglassesChildren };
            }
            return item;
          });
          
          setNavigation(nav);
        }
      } catch (e) {
        console.error("Failed to load categories for navbar", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    router.push("/");
  };

  const isActivePage = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg"
          : "bg-white"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative flex items-center">
                {/* <ShoppingCart className="w-6 h-6 text-white" /> */}
                <Image src="/otticamart1.png" alt="Logo" width={130} height={120} />
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.label} className="relative">
                {item.children && item.children.length > 0 ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
                        isActivePage(item.href)
                          ? "text-amber-600 bg-amber-50"
                          : "text-gray-700 hover:text-amber-600 hover:bg-amber-50"
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          activeDropdown === item.label ? "rotate-180" : ""
                        )}
                      />
                    </Link>

                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-4 z-40 min-w-[500px]"
                        >
                          {/* Contact Lenses Specific Menu */}
                          {item.label === "Contact Lenses" ? (
                            <div className="flex justify-between gap-6 p-2 w-full">
                              {[
                                { title: "Brands", type: "MANUFACTURER" },
                                { title: "Type", type: "LENS_TYPE" },
                                { title: "Disposability", type: "DISPOSABILITY" }
                              ].map((group) => {
                                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                 const groupItems = item.children?.filter((child: any) => child.type === group.type);
                                 
                                 if (!groupItems || groupItems.length === 0) return null;

                                 return (
                                    <div key={group.title} className="flex-1">
                                       <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">{group.title}</h4>
                                       <div className="space-y-1">
                                          {groupItems.map((child) => (
                                             <Link
                                                key={child.href}
                                                href={child.href}
                                                className="block px-2 py-1.5 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                             >
                                                {child.label}
                                             </Link>
                                          ))}
                                       </div>
                                    </div>
                                 );
                              })}
                            </div>
                          ) : item.label === "Sunglasses" ? (
                            <div className="flex gap-8 p-4 w-full min-w-[600px]">
                               {/* Group 1: Gender/Sex - Manually split for better UI if type is SEX */}
                               {(() => {
                                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                   const sexItems = item.children?.filter((child: any) => child.type === "SEX") || [];
                                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                   const shapeItems = item.children?.filter((child: any) => child.type === "SHAPE") || [];
                                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                   const brandItems = item.children?.filter((child: any) => child.type === "BRAND") || [];
                                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                   const otherItems = item.children?.filter((child: any) => !["SEX", "SHAPE", "BRAND"].includes(child.type)) || [];

                                   return (
                                      <>
                                        {sexItems.length > 0 && (
                                            <div className="flex-1 min-w-[120px]">
                                                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Shop By Sex</h4>
                                                <div className="space-y-2">
                                                    {sexItems.map(child => (
                                                        <Link key={child.href} href={child.href} className="block text-sm text-gray-600 hover:text-amber-600 hover:underline">
                                                            {child.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {shapeItems.length > 0 && (
                                            <div className="flex-1 min-w-[120px]">
                                                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Shop By Shape</h4>
                                                <div className="space-y-2">
                                                    {shapeItems.map(child => (
                                                        <Link key={child.href} href={child.href} className="block text-sm text-gray-600 hover:text-amber-600 hover:underline">
                                                            {child.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {brandItems.length > 0 && (
                                            <div className="flex-1 min-w-[120px]">
                                                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Brands</h4>
                                                <div className="space-y-2">
                                                    {brandItems.map(child => (
                                                        <Link key={child.href} href={child.href} className="block text-sm text-gray-600 hover:text-amber-600 hover:underline">
                                                            {child.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {otherItems.length > 0 && (
                                            <div className="flex-1 min-w-[120px]">
                                                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">More</h4>
                                                <div className="space-y-2">
                                                    {otherItems.map(child => (
                                                        <Link key={child.href} href={child.href} className="block text-sm text-gray-600 hover:text-amber-600 hover:underline">
                                                            {child.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                      </>
                                   );
                               })()}
                            </div>
                          ) : (
                            <div className="py-2">
                              {item.children?.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-150"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
                      isActivePage(item.href)
                        ? "text-amber-600 bg-amber-50"
                        : "text-gray-700 hover:text-amber-600 hover:bg-amber-50"
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            {/* Search */}
            {showSearch ? (
               <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-x-4 top-2 md:inset-y-0 md:left-20 md:right-20 flex items-center justify-center z-[60]"
               >
                    <div className="w-full max-w-2xl relative">
                        <SearchBar autoFocus onClose={() => setShowSearch(false)} />
                    </div>
               </motion.div>
            ) : (
                <motion.button
                    className="p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200 rounded-lg hover:bg-amber-50"
                    onClick={() => setShowSearch(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Search className="w-5 h-5" />
                </motion.button>
            )}

            {/* Wishlist */}
            <motion.button
              onClick={() => router.push("/wishlist")}
              className="relative p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200 rounded-lg hover:bg-amber-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-5 h-5" />
              {wishlistItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                >
                  {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                </motion.span>
              )}
            </motion.button>

            {/* Cart */}
            <motion.button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200 rounded-lg hover:bg-amber-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                >
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </motion.span>
              )}
            </motion.button>

            {/* User Menu */}
            {loading ? (
              <div className="hidden md:flex items-center space-x-2">
                <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ) : !user ? (
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/auth/login")}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push("/auth/register")}
                  className="bg-orange-500 text-white hover:bg-white hover:text-orange-500 border-amber-200  "
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="relative">
                <motion.button
                  className="hidden md:flex items-center space-x-2 p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200 rounded-lg hover:bg-amber-50"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </motion.button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => {
                            router.push("/profile");
                            setUserDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profile
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-gray-600 hover:text-amber-600 transition-colors duration-200 rounded-lg hover:bg-amber-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => handleDropdownToggle(item.label)}
                        className="flex items-center justify-between w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            activeDropdown === item.label ? "rotate-180" : ""
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 mt-2 space-y-2"
                          >
                            {item.label === "Categories"
                              ? (() => {
                                  const order = [
                                    "SEX",
                                    "SHAPE",
                                    "COLLECTION",
                                    "BRAND",
                                    "MATERIAL",
                                    "OTHER",
                                  ];
                                  const typeNames: Record<string, string> = {
                                    SEX: "By Sex",
                                    SHAPE: "Shape",
                                    COLLECTION: "Collections",
                                    BRAND: "Brands",
                                    MATERIAL: "Material",
                                    OTHER: "Other",
                                  };
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  const grouped: Record<string, any[]> = {};
                                  categoriesRaw.forEach((c) => {
                                    const t = c.type || "OTHER";
                                    if (!grouped[t]) grouped[t] = [];
                                    grouped[t].push(c);
                                  });

                                  return order.map((t) => {
                                    const list = grouped[t];
                                    if (!list || list.length === 0) return null;
                                    return (
                                      <div key={t} className="mb-3">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                          {typeNames[t] || t}
                                        </h4>
                                        <div className="space-y-1">
                                          {list.map((c) => (
                                            <Link
                                              key={c.id}
                                              href={`/products?category=${c.id}`}
                                              className="block px-3 py-2 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                                            >
                                              {c.name}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  });
                                })()
                              : item.children.map((child) => (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    className="block px-3 py-2 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                                  >
                                    {child.label}
                                  </Link>
                                ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200",
                        isActivePage(item.href)
                          ? "text-amber-600 bg-amber-50"
                          : "text-gray-700 hover:text-amber-600 hover:bg-amber-50"
                      )}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile Quick Actions */}
              <div className="pt-4 border-t border-gray-200 grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowSearch(true);
                  }}
                  className="flex flex-col items-center justify-center p-4 text-gray-600 hover:text-amber-600 bg-gray-50 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5 mb-1" />
                  <span className="text-xs">Search</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    // Add wishlist functionality later
                  }}
                  className="flex flex-col items-center justify-center p-4 text-gray-600 hover:text-amber-600 bg-gray-50 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <Heart className="w-5 h-5 mb-1" />
                  <span className="text-xs">Wishlist</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="relative flex flex-col items-center justify-center p-4 text-gray-600 hover:text-amber-600 bg-gray-50 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 mb-1" />
                  <span className="text-xs">Cart</span>
                  {cartItemCount > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                ) : !user ? (
                  <>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => router.push("/auth/login")}
                      className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                    <Button
                      size="md"
                      onClick={() => router.push("/auth/register")}
                      className="w-full bg-amber-500 hover:bg-amber-600"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        router.push("/profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </motion.nav>
  );
};
