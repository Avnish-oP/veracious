// Product details API for cart items

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Fetch product details by ID
 */
export const fetchProductDetails = async (productId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/product/${productId}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch product details");
    }

    return data.product;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
};

/**
 * Fetch multiple product details
 */
export const fetchMultipleProductDetails = async (productIds: string[]) => {
  try {
    const promises = productIds.map((id) => fetchProductDetails(id));
    const products = await Promise.all(promises);

    // Create a map of productId -> product details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productMap: Record<string, any> = {};
    products.forEach((product, index) => {
      if (product) {
        productMap[productIds[index]] = {
          id: productIds[index],
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice,
          image: product.images?.[0]?.url || null,
          brand: product.brand || "",
        };
      }
    });

    return productMap;
  } catch (error) {
    console.error("Error fetching multiple products:", error);
    return {};
  }
};

/**
 * Fetch similar/related products for recommendations
 */
export const fetchSimilarProducts = async (productId: string, limit = 8) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/similar?limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch similar products");
    }

    return data.products || [];
  } catch (error) {
    console.error(`Error fetching similar products for ${productId}:`, error);
    return [];
  }
};
