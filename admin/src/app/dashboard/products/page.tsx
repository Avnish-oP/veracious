'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Pencil, Trash, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import api from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;
  
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useProducts({ page, limit, search });

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this product?")) return;
      
      try {
          await api.delete(`/admin/products/${id}`);
          // Invalidate query to refetch
          queryClient.invalidateQueries({ queryKey: ['products'] });
      } catch (error) {
          console.error("Delete failed", error);
          alert("Failed to delete product");
      }
  };

  if (isError) return <div className="p-8 text-red-500">Failed to load products.</div>;

  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog ({data?.total || 0})
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Input 
                placeholder="Search products..." 
                className="w-[200px] lg:w-[300px]" 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <Link href="/dashboard/products/create">
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
            </Button>
            </Link>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><div className="h-10 w-10 bg-gray-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                        <TableCell />
                    </TableRow>
                 ))
            ) : data?.products.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        No products found.
                    </TableCell>
                </TableRow>
            ) : (
                data?.products.map((product) => (
                <TableRow key={product.id}>
                    <TableCell>
                    <Avatar className="h-10 w-10 rounded-lg border">
                        <AvatarImage
                        src={product.image || undefined}
                        alt={product.name}
                        className="object-cover"
                        />
                        <AvatarFallback>
                             {product.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>{product.sku || '-'}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                    <Badge variant={product.stock > 0 ? 'default' : 'secondary'}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                            <DropdownMenuItem className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem 
                            className="text-red-600 cursor-pointer"
                            onClick={() => handleDelete(product.id)}
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

       {/* Pagination Controls */}
       <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="text-sm font-medium">
            Page {page} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((old) => (old < totalPages ? old + 1 : old))}
          disabled={page === totalPages || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
