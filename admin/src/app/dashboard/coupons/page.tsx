'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Ticket } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount: number;
  validFrom: string;
  validTo?: string;
  usageLimit?: number;
  perUserLimit?: number;
  minOrderValue?: number;
  isActive: boolean;
  isForNewUsers: boolean;
  isForAllProducts: boolean;
  usageCount: number;
  createdAt: string;
}

interface CouponsResponse {
  success: boolean;
  coupons: Coupon[];
  total: number;
  page: number;
  totalPages: number;
}

export default function CouponsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Coupon | null>(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<CouponsResponse>({
    queryKey: ['coupons', search],
    queryFn: async () => {
      const { data } = await api.get('/admin/coupons', {
        params: { search: search || undefined },
      });
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (editingItem) {
        return api.put(`/admin/coupons/${editingItem.id}`, values);
      } else {
        return api.post('/admin/coupons', values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setIsOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to save coupon';
      alert(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/coupons/${id}`);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      if (response.data?.deactivated) {
        alert('Coupon has been deactivated (it was used in orders)');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      code: formData.get('code') as string,
      description: formData.get('description') as string || undefined,
      discountType: formData.get('discountType') as 'PERCENTAGE' | 'FIXED_AMOUNT',
      discount: parseFloat(formData.get('discount') as string),
      validFrom: formData.get('validFrom') as string,
      validTo: formData.get('validTo') as string || undefined,
      usageLimit: formData.get('usageLimit') as string || undefined,
      perUserLimit: formData.get('perUserLimit') as string || undefined,
      minOrderValue: formData.get('minOrderValue') as string || undefined,
      isActive: formData.get('isActive') === 'on',
      isForNewUsers: formData.get('isForNewUsers') === 'on',
      isForAllProducts: formData.get('isForAllProducts') === 'on',
    };
    
    mutation.mutate(data);
  };

  const handleEdit = (item: Coupon) => {
    setEditingItem(item);
    setIsOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.validTo) return false;
    return new Date(coupon.validTo) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Coupons</h2>
          <p className="text-muted-foreground">
            Manage discount coupons and promotional codes.
          </p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setEditingItem(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Coupon' : 'Create New Coupon'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input
                    id="code"
                    name="code"
                    defaultValue={editingItem?.code}
                    placeholder="SUMMER20"
                    className="uppercase"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="discountType">Discount Type *</Label>
                  <Select
                    name="discountType"
                    defaultValue={editingItem?.discountType || 'PERCENTAGE'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="discount">Discount Value *</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    step="0.01"
                    defaultValue={editingItem?.discount}
                    placeholder="20"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="minOrderValue">Minimum Order Value</Label>
                  <Input
                    id="minOrderValue"
                    name="minOrderValue"
                    type="number"
                    step="0.01"
                    defaultValue={editingItem?.minOrderValue}
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editingItem?.description}
                  placeholder="Get 20% off on your first order"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="validFrom">Valid From *</Label>
                  <Input
                    id="validFrom"
                    name="validFrom"
                    type="datetime-local"
                    defaultValue={
                      editingItem?.validFrom
                        ? new Date(editingItem.validFrom).toISOString().slice(0, 16)
                        : new Date().toISOString().slice(0, 16)
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="validTo">Valid Until</Label>
                  <Input
                    id="validTo"
                    name="validTo"
                    type="datetime-local"
                    defaultValue={
                      editingItem?.validTo
                        ? new Date(editingItem.validTo).toISOString().slice(0, 16)
                        : ''
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="usageLimit">Total Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    name="usageLimit"
                    type="number"
                    defaultValue={editingItem?.usageLimit}
                    placeholder="Unlimited"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="perUserLimit">Per User Limit</Label>
                  <Input
                    id="perUserLimit"
                    name="perUserLimit"
                    type="number"
                    defaultValue={editingItem?.perUserLimit}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Coupon can be used by customers
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    name="isActive"
                    defaultChecked={editingItem ? editingItem.isActive : true}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isForNewUsers">New Users Only</Label>
                    <p className="text-sm text-muted-foreground">
                      Only for first-time customers
                    </p>
                  </div>
                  <Switch
                    id="isForNewUsers"
                    name="isForNewUsers"
                    defaultChecked={editingItem?.isForNewUsers || false}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isForAllProducts">All Products</Label>
                    <p className="text-sm text-muted-foreground">
                      Apply to all products in catalog
                    </p>
                  </div>
                  <Switch
                    id="isForAllProducts"
                    name="isForAllProducts"
                    defaultChecked={editingItem ? editingItem.isForAllProducts : true}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingItem ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by code or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.coupons.filter((c) => c.isActive && !isExpired(c)).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data?.coupons.filter((c) => isExpired(c)).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.coupons.reduce((acc, c) => acc + c.usageCount, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No coupons found. Create your first coupon!
                  </TableCell>
                </TableRow>
              ) : (
                data?.coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="font-mono font-semibold">{coupon.code}</div>
                      {coupon.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {coupon.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discount}%`
                          : `₹${coupon.discount}`}
                      </div>
                      {coupon.minOrderValue && (
                        <div className="text-xs text-muted-foreground">
                          Min: ₹{coupon.minOrderValue}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(coupon.validFrom)}
                        {coupon.validTo && (
                          <>
                            <br />
                            to {formatDate(coupon.validTo)}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{coupon.usageCount}</div>
                      <div className="text-xs text-muted-foreground">
                        {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'unlimited'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isExpired(coupon) ? (
                        <Badge variant="secondary">Expired</Badge>
                      ) : coupon.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                      {coupon.isForNewUsers && (
                        <Badge variant="outline" className="ml-1">New Users</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this coupon?')) {
                              deleteMutation.mutate(coupon.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
