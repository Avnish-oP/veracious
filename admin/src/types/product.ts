export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: string;
  discountPrice?: string | null; // Added based on controller
  stock: number; // Note: Controller doesn't SELECT stock, need to fix controller or accept it might be missing
  sku: string; // Controller doesn't SELECT sku? Need to check.
  isActive: boolean; // Controller doesn't SELECT isActive
  image: string | null; // Changed from images[]
  createdAt: string; 
  // Add other fields that are actually returned if needed
}

export interface ProductsResponse {
  success: boolean;
  count?: number; // Backend sends 'total'
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  products: Product[];
}
