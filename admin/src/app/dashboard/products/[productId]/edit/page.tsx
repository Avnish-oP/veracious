'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ProductForm, ProductFormValues } from '@/components/dashboard/products/ProductForm';
import { useQuery } from '@tanstack/react-query';

interface EditProductPageProps {
    params: Promise<{ productId: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch product
  const { data: productData, isLoading, isError } = useQuery({
      queryKey: ['product', productId],
      queryFn: async () => {
          // We can use the admin list endpoint filtered by ID or a specific admin ID endpoint.
          // Since getAdminProducts returns a list, using public endpoint is riskier if fields are hidden.
          // But our current public endpoint returns almost everything via prisma include.
          // Better: GET /products/:id (Public)
          const res = await api.get(`/products/${productId}`); 
          return res.data.product;
      },
      enabled: !!productId
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading product</div>;

  // Prepare initial values
  // Transform specifications JSON -> Array
  const specificationsArray = productData.specifications 
      ? Object.entries(productData.specifications).map(([key, value]) => ({ key, value: String(value) }))
      : [];

  const initialValues: ProductFormValues = {
      name: productData.name,
      brand: productData.brand,
      price: String(productData.price),
      discountPrice: productData.discountPrice ? String(productData.discountPrice) : '',
      stock: String(productData.stock),
      sku: productData.sku,
      description: productData.description || '',
      frameShape: productData.frameShape,

      frameMaterial: productData.frameMaterial || 'PLASTIC',
      frameColor: productData.frameColor || 'Black',
      lensType: productData.lensType || 'Demo',
      lensColor: productData.lensColor || 'Transparent',
      gender: productData.gender,
      isFeatured: productData.isFeatured || false,
      images: productData.images.map((img: any) => ({
          url: img.url,
          isMain: img.isMain
      })),
      tags: productData.tags.join(', '),
      categoryIds: productData.categories ? productData.categories.map((c: any) => c.id) : [], 
      specifications: specificationsArray.length > 0 ? specificationsArray : []
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const specificationsObject = data.specifications?.reduce((acc: any, curr) => {
          if (curr.key) acc[curr.key] = curr.value;
          return acc;
      }, {}) || {};

      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        slug: data.name.toLowerCase().replace(/ /g, '-') + '-' + data.sku, 
        specifications: specificationsObject, 
      };

      const res = await api.put(`/admin/products/${productId}`, payload);
      
      if (res.data.success) {
        router.push('/dashboard/products');
      }
    } catch (error: any) {
        console.error("Update Error", error);
        alert(error.response?.data?.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
        <p className="text-muted-foreground">Update product details</p>
      </div>

      <ProductForm 
        initialValues={initialValues} 
        onSubmit={onSubmit} 
        isSubmitting={isSubmitting} 
        submitLabel="Update Product"
      />
    </div>
  );
}
