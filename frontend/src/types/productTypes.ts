// Product related types for the application

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sku: string;
  frameShape: string;
  frameMaterial: string;
  frameColor: string;
  lensType: string;
  lensColor: string;
  gender: "MALE" | "FEMALE" | "UNISEX";
  isFeatured: boolean;
  isActive: boolean;
  image?: string; // Main image URL
  images?: ProductImage[];
  reviews?: Review[];
  categories?: Category[];
  tags?: string[];
  specifications?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

// API Response types
export interface ProductsResponse {
  products: Product[];
  total: number;
}

export interface FeaturedProductsResponse {
  products: Product[];
}

// Filter and search types
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  gender?: "MALE" | "FEMALE" | "UNISEX";
  frameShape?: string;
  frameMaterial?: string;
  lensType?: string;
  isFeatured?: boolean;
  sortBy?: "price" | "name" | "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
}

// Cart and Wishlist types
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

// Face shape and preference types
export enum FaceShape {
  ROUND = "ROUND",
  OVAL = "OVAL",
  SQUARE = "SQUARE",
  RECTANGLE = "RECTANGLE",
  HEART = "HEART",
  DIAMOND = "DIAMOND",
  TRIANGLE = "TRIANGLE",
  OBLONG = "OBLONG",
}

export enum FrameShape {
  ROUND = "ROUND",
  SQUARE = "SQUARE",
  OVAL = "OVAL",
  RECTANGLE = "RECTANGLE",
  CAT_EYE = "CAT_EYE",
  AVIATOR = "AVIATOR",
  WAYFARER = "WAYFARER",
  BROWLINE = "BROWLINE",
  RIMLESS = "RIMLESS",
  GEOMETRIC = "GEOMETRIC",
  OTHER = "OTHER",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  UNISEX = "UNISEX",
}

// Quick View and Modal types
export interface QuickViewProduct extends Omit<Product, "reviews"> {
  reviewCount?: number;
  averageRating?: number;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Search and suggestion types
export interface ProductSuggestion {
  id: string;
  name: string;
  brand: string;
  image?: string;
  price: number;
}

export interface SearchFilters extends ProductFilters {
  faceShape?: FaceShape;
  preferredStyles?: string[];
}

// Component prop types
export interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  className?: string;
  showBadges?: boolean;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string;
  onLoadMore?: () => void;
  onProductClick?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  viewMode?: "grid" | "list";
  showPagination?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  categories: Category[];
  brands: string[];
  loading?: boolean;
}
