'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ProductForm, ProductFormValues } from '@/components/dashboard/products/ProductForm';

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // Transform specifications array to object
      const specificationsObject = data.specifications?.reduce((acc: Record<string, string>, curr) => {
          if (curr.key) acc[curr.key] = curr.value;
          return acc;
      }, {}) || {};

      // Transform data
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        slug: data.name.toLowerCase().replace(/ /g, '-') + '-' + data.sku, 
        specifications: specificationsObject, 
      };

      const res = await api.post('/admin/products', payload);
      
      if (res.data.success) {
        router.push('/dashboard/products');
      }
    } catch (error: any) {
        console.error("Submit Error", error);
        alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Product</h2>
        <p className="text-muted-foreground">Add a new product to your catalog</p>
      </div>

      <ProductForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
