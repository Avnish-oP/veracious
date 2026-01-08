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
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
// import { useToast } from '@/components/ui/use-toast';

interface LensPrice {
  id: string;
  name: string;
  type: 'LENS_TYPE' | 'COATING' | 'DISPOSABILITY';
  price: string; // Decimal comes as string often
  description?: string;
  isActive: boolean;
}

export default function LensPricingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LensPrice | null>(null);
  const queryClient = useQueryClient();
  // const { toast } = useToast();

  const { data: lensPrices, isLoading } = useQuery<LensPrice[]>({
    queryKey: ['lensPrices'],
    queryFn: async () => {
      const { data } = await api.get('/admin/lens-prices');
      return data.lensPrices;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: Partial<LensPrice>) => {
      if (editingItem) {
        return api.put(`/admin/lens-prices/${editingItem.id}`, values);
      } else {
        return api.post('/admin/lens-prices', values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lensPrices'] });
      setIsOpen(false);
      setEditingItem(null);
      // toast({ title: 'Success', description: ... });
    },
    onError: (error: any) => {
      console.error(error);
      alert('Failed to save lens option');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/lens-prices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lensPrices'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      type: formData.get('type') as 'LENS_TYPE' | 'COATING' | 'DISPOSABILITY',
      price: formData.get('price') as string,
      description: formData.get('description') as string,
      isActive: formData.get('isActive') === 'on',
    };
    mutation.mutate(data);
  };

  const handleEdit = (item: LensPrice) => {
    setEditingItem(item);
    setIsOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold tracking-tight">Lens Pricing</h2>
           <p className="text-muted-foreground">Manage prices for lens types and coatings.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingItem(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Option</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Lens Option' : 'Add Lens Option'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editingItem?.name} placeholder="e.g. Single Vision" required />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                 <Select name="type" defaultValue={editingItem?.type || "LENS_TYPE"}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="LENS_TYPE">Lens Type</SelectItem>
                        <SelectItem value="COATING">Coating</SelectItem>
                        <SelectItem value="DISPOSABILITY">Disposability (Contacts)</SelectItem>
                    </SelectContent>
                 </Select>
              </div>

               <div className="grid gap-2">
                <Label htmlFor="price">Price (INR)</Label>
                <Input id="price" name="price" type="number" defaultValue={editingItem?.price} placeholder="0" required />
              </div>

               <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" name="description" defaultValue={editingItem?.description} placeholder="Short description" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isActive" name="isActive" defaultChecked={editingItem ? editingItem.isActive : true} />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lensPrices?.map((item) => (
          <Card key={item.id} className="relative group overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
              <span className={`text-xs px-2 py-1 rounded-full ${item.type === 'LENS_TYPE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {item.type.replace('_', ' ')}
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{item.price}</div>
              <p className="text-xs text-muted-foreground mt-1">{item.description || "No description"}</p>
              
              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <Button variant="secondary" size="sm" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                 </Button>
                 <Button variant="destructive" size="sm" onClick={() => {
                     if (confirm("Are you sure?")) deleteMutation.mutate(item.id);
                 }}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
