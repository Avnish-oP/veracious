'use client';

import { use } from 'react';
import { useOrderDetails, useUpdateOrderStatus } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, Package, User, MapPin, CreditCard, Tag, Download } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import api from '@/lib/axios';

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Status badge colors
const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  PAYMENT_FAILED: 'destructive',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'default',
  CANCELLED: 'destructive',
  RETURNED: 'outline',
};

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAYMENT_FAILED', label: 'Payment Failed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RETURNED', label: 'Returned' },
];

export default function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { data, isLoading, isError } = useOrderDetails(orderId);
  const updateStatus = useUpdateOrderStatus();
  const [newStatus, setNewStatus] = useState<string>('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.order) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <div className="text-red-500">Order not found or failed to load.</div>
      </div>
    );
  }

  const { order } = data;

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order.status) return;
    
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: newStatus });
      setNewStatus('');
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const [downloading, setDownloading] = useState(false);
  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/admin/orders/${order.id}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${order.id.slice(-8).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Order Details</h2>
            <p className="text-muted-foreground font-mono text-sm">{order.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            {order.paymentStatus === 'PAID' && (
              <Button variant="outline" size="sm" onClick={handleDownloadInvoice} disabled={downloading}>
                {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Invoice
              </Button>
            )}
            <Badge variant={statusColors[order.status] || 'secondary'} className="text-sm px-3 py-1">
              {order.status}
            </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Order Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 rounded-lg border">
                      <AvatarImage src={item.productImage || undefined} className="object-cover" />
                      <AvatarFallback className="rounded-lg">
                        {item.productName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      {item.configuration && (
                        <p className="text-xs text-muted-foreground">
                          {item.configuration.lensType && `Lens: ${item.configuration.lensType}`}
                          {item.configuration.lensColor && ` • Color: ${item.configuration.lensColor}`}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.quantity * item.price)}
                    </p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              {/* Order Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.finalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.user ? (
                <div className="space-y-2">
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-sm text-muted-foreground">{order.user.email}</p>
                  {order.user.phoneNumber && (
                    <p className="text-sm text-muted-foreground">{order.user.phoneNumber}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Guest checkout</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p>{order.address.line1}</p>
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>
                    {order.address.city}, {order.address.state} {order.address.postal}
                  </p>
                  <p>{order.address.country}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions & Meta */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Change the order status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newStatus || order.status} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                onClick={handleUpdateStatus}
                disabled={!newStatus || newStatus === order.status || updateStatus.isPending}
              >
                {updateStatus.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                  {order.paymentStatus || 'PENDING'}
                </Badge>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span>{order.paymentMethod}</span>
                </div>
              )}
              {order.payments?.[0]?.paymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-xs">{order.payments[0].paymentId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coupon */}
          {order.coupon && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Coupon Applied
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code</span>
                  <Badge variant="outline">{order.coupon.code}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>
                    {order.coupon.discountType === 'PERCENTAGE'
                      ? `${order.coupon.discount}%`
                      : formatCurrency(order.coupon.discount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Meta */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{formatDate(order.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
