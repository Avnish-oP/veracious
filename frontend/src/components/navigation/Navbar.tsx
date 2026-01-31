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
  type?: string;
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
        const cats = (res as { categories?: Category[] }).categories || [];
        
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
              <div className="relative flex items-center justify-center h-14 w-32 overflow-hidden">
                <Image 
                  src="/otticamart1.png" 
                  alt="Logo" 
                  width={130} 
                  height={120} 
                  className="h-24 w-auto object-contain max-w-none"
                />
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
                                 const groupItems = item.children?.filter((child) => child.type === group.type);
                                 
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
                                   const sexItems = item.children?.filter((child) => child.type === "SEX") || [];
                                   const shapeItems = item.children?.filter((child) => child.type === "SHAPE") || [];
                                   const brandItems = item.children?.filter((child) => child.type === "BRAND") || [];
                                   const otherItems = item.children?.filter((child) => !["SEX", "SHAPE", "BRAND", "COLLECTION"].includes(child.type || "")) || [];

                                   return (
                                      <>
                                        {sexItems.length > 0 && (
                                            <div className="flex-1 min-w-[120px]">
                                                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Gender</h4>
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
                                                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Shape</h4>
                                                <div className="space-y-2">
                                                    {shapeItems.map(child => (
                                                        <Link key={child.href} href={child.href} className="block text-sm text-gray-600 hover:text-amber-600 hover:underline">
                                                            {child.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {(() => { 
                                            const collectionItems = item.children?.filter((child) => child.type === "COLLECTION") || [];
                                            return collectionItems.length > 0 ? (
                                                <div className="flex-1 min-w-[120px]">
                                                    <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Collections</h4>
                                                    <div className="space-y-2">
                                                        {collectionItems.map((child) => (
                                                            <Link key={child.href} href={child.href} className="block text-sm text-gray-600 hover:text-amber-600 hover:underline">
                                                                {child.label}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null;
                                        })()}
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
                    className="fixed inset-0 z-[100] bg-white flex flex-col p-4 md:absolute md:inset-x-4 md:top-2 md:bottom-auto md:bg-transparent md:flex-row md:items-center md:justify-center md:z-[60]"
               >
                   <div className="w-full max-w-2xl relative flex items-center gap-3">
                        <SearchBar autoFocus onClose={() => setShowSearch(false)} className="flex-1" />
                        <button 
                            onClick={() => setShowSearch(false)}
                            className="md:hidden text-gray-500 font-medium whitespace-nowrap px-2"
                        >
                            Cancel
                        </button>
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
          <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-[100dvh] w-[85%] max-w-sm bg-white shadow-2xl z-[70] md:hidden overflow-y-auto overscroll-contain"
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <span className="text-lg font-bold text-gray-900">Menu</span>
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 px-4 py-6 space-y-2">
                        {navigation.map((item) => (
                            <div key={item.label} className="border-b border-gray-50 last:border-0 pb-2">
                                {item.children && item.children.length > 0 ? (
                                    <div className="overflow-hidden">
                                        <button
                                            onClick={() => handleDropdownToggle(item.label)}
                                            className="flex items-center justify-between w-full py-3 text-base font-medium text-gray-800"
                                        >
                                            <span className={cn(activeDropdown === item.label && "text-amber-600")}>{item.label}</span>
                                            <ChevronDown
                                                className={cn(
                                                    "w-5 h-5 text-gray-400 transition-transform duration-300",
                                                    activeDropdown === item.label ? "rotate-180 text-amber-600" : ""
                                                )}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {activeDropdown === item.label && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="pl-4 space-y-4 pb-2"
                                                >
                                                   {/* Logic for specialized sub-menus (Sunglasses/Lenses) vs Standard */}
                                                   {item.label === "Contact Lenses" ? (
                                                       <div className="space-y-4 pt-2">
                                                            {/* Group by Manufacturer */}
                                                            <div>
                                                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Brands</h5>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {item.children.filter(c => c.type === "MANUFACTURER").map(child => (
                                                                         <Link 
                                                                            key={child.href} 
                                                                            href={child.href}
                                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                                            className="text-sm text-gray-600 py-1 hover:text-amber-600"
                                                                         >
                                                                            {child.label}
                                                                         </Link>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {/* Group by Type */}
                                                            <div>
                                                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Type</h5>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {item.children.filter(c => c.type === "LENS_TYPE").map(child => (
                                                                         <Link 
                                                                            key={child.href} 
                                                                            href={child.href}
                                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                                            className="text-sm text-gray-600 py-1 hover:text-amber-600"
                                                                         >
                                                                            {child.label}
                                                                         </Link>
                                                                    ))}
                                                                </div>
                                                                </div>

                                                            {/* Group by Disposability */}
                                                            <div>
                                                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Disposability</h5>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {item.children.filter(c => c.type === "DISPOSABILITY").map(child => (
                                                                         <Link 
                                                                            key={child.href} 
                                                                            href={child.href}
                                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                                            className="text-sm text-gray-600 py-1 hover:text-amber-600"
                                                                         >
                                                                            {child.label}
                                                                         </Link>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                       </div>
                                                   ) : item.label === "Sunglasses" ? (
                                                       <div className="space-y-4 pt-2">
                                                            {/* Gender */}
                                                            <div>
                                                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gender</h5>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {["Men", "Women", "Unisex"].map(gender => (
                                                                        <Link 
                                                                            key={gender} 
                                                                            href={`/products?category=sunglasses&gender=${gender.toUpperCase()}`}
                                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                                            className="px-3 py-1 bg-gray-50 text-sm text-gray-600 rounded-full border border-gray-100 hover:border-amber-200 hover:text-amber-600"
                                                                        >
                                                                            {gender}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Shape */}
                                                            {item.children?.some(c => c.type === "SHAPE") && (
                                                                <div>
                                                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Shop By Shape</h5>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {item.children.filter(c => c.type === "SHAPE").map(child => (
                                                                             <Link 
                                                                                key={child.href} 
                                                                                href={child.href}
                                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                                className="text-sm text-gray-600 py-1 hover:text-amber-600 whitespace-nowrap overflow-hidden text-ellipsis"
                                                                             >
                                                                                {child.label}
                                                                             </Link>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Collections */}
                                                            {item.children?.some(c => c.type === "COLLECTION") && (
                                                                <div>
                                                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Collections</h5>
                                                                    <div className="space-y-1">
                                                                        {item.children.filter(c => c.type === "COLLECTION").map(child => (
                                                                             <Link 
                                                                                key={child.href} 
                                                                                href={child.href}
                                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                                className="block text-sm text-gray-600 py-1 hover:text-amber-600"
                                                                             >
                                                                                {child.label}
                                                                             </Link>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Brands */}
                                                            {item.children?.some(c => c.type === "BRAND") && (
                                                                <div>
                                                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Brands</h5>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {item.children.filter(c => c.type === "BRAND").map(child => (
                                                                             <Link 
                                                                                key={child.href} 
                                                                                href={child.href}
                                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                                className="text-sm text-gray-600 py-1 hover:text-amber-600"
                                                                             >
                                                                                {child.label}
                                                                             </Link>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                       </div>
                                                   ) : (
                                                       <div className="space-y-3 pt-1">
                                                            {/* Generic fallback that tries to group if types exist, or just list */}
                                                            {(() => {
                                                                // Group by type if multiple types exist
                                                                const groups: Record<string, NavItem[]> = {};
                                                                let hasTypes = false;
                                                                
                                                                item.children?.forEach(child => {
                                                                    const t = child.type || "Other";
                                                                    if (child.type) hasTypes = true;
                                                                    if (!groups[t]) groups[t] = [];
                                                                    groups[t].push(child);
                                                                });

                                                                if (hasTypes && Object.keys(groups).length > 1) {
                                                                    return Object.entries(groups).map(([type, children]) => (
                                                                        <div key={type}>
                                                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{type === "Other" ? "More" : type}</h5>
                                                                            <div className="grid grid-cols-1 gap-1">
                                                                                {children.map(child => (
                                                                                    <Link 
                                                                                        key={child.href} 
                                                                                        href={child.href}
                                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                                        className="text-sm text-gray-600 py-1 hover:text-amber-600"
                                                                                    >
                                                                                        {child.label}
                                                                                    </Link>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ));
                                                                } else {
                                                                    // Simple list
                                                                    return item.children?.map(child => (
                                                                        <Link 
                                                                            key={child.href} 
                                                                            href={child.href}
                                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                                            className="block text-sm text-gray-600 py-1.5 hover:text-amber-600"
                                                                        >
                                                                            {child.label}
                                                                        </Link>
                                                                    ));
                                                                }
                                                            })()}
                                                       </div>
                                                   )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "block py-3 text-base font-medium transition-colors",
                                            isActivePage(item.href) ? "text-amber-600" : "text-gray-800"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); setShowSearch(true); }}
                                className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-amber-200 transition-colors"
                            >
                                <Search className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Search</span>
                            </button>
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); router.push('/wishlist'); }}
                                className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-red-200 transition-colors"
                            >
                                <Heart className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Wishlist</span>
                            </button>
                        </div>

                        {!user ? (
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/auth/login")}
                                    className="w-full justify-center bg-white"
                                >
                                    Sign In
                                </Button>
                                <Button
                                    onClick={() => router.push("/auth/register")}
                                    className="w-full justify-center bg-gray-900 text-white hover:bg-black"
                                >
                                    Get Started
                                </Button>
                            </div>
                        ) : (
                             <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                    <button onClick={handleLogout} className="text-xs text-red-500 font-medium">Sign Out</button>
                                </div>
                                <button onClick={() => router.push('/profile')} className="p-2 text-gray-400">
                                    <ChevronDown className="-rotate-90 w-5 h-5" />
                                </button>
                             </div>
                        )}
                    </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </motion.nav>
  );
};
