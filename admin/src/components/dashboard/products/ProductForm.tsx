'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Trash2, UploadCloud, Check, ChevronsUpDown, X, ScanEye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useCategories } from '@/hooks/useCategories';
import { Label } from '@/components/ui/label';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// --- Schema Definition ---
export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  brand: z.string().min(2, 'Brand is required'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  discountPrice: z.string().default(''),
  stock: z.string().regex(/^\d+$/, 'Stock must be a number'),
  sku: z.string().min(3, 'SKU is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  frameShape: z.string().default('RECTANGLE'),
 
  frameMaterial: z.string().default('PLASTIC'),
  frameColor: z.string().default('Black'),
  lensType: z.string().default('Demo'),
  lensColor: z.string().default('Transparent'),
  gender: z.enum(['MALE', 'FEMALE', 'UNISEX']),
  isFeatured: z.boolean().default(false),
  images: z.array(
    z.object({
      url: z.string().url(),
      isMain: z.boolean(),
    })
  ).min(1, 'At least one image is required'),
  tags: z.string().default(''),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  specifications: z.array(
      z.object({
          key: z.string().min(1, "Key is required"),
          value: z.string().min(1, "Value is required")
      })
  ).default([])
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
    initialValues?: ProductFormValues;
    onSubmit: (values: ProductFormValues) => Promise<void>;
    isSubmitting: boolean;
    submitLabel?: string;
}

export function ProductForm({ initialValues, onSubmit, isSubmitting, submitLabel = "Create Product" }: ProductFormProps) {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { data: categories } = useCategories();
  const [openCombobox, setOpenCombobox] = useState(false);

  // Fetch Lens Prices
  const { data: lensPrices } = useQuery({
    queryKey: ['lensPrices'],
    queryFn: async () => {
       const { data } = await api.get('/admin/lens-prices');
       return data.lensPrices;
    },
    enabled: true 
  });

  // --- Form Setup ---
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: initialValues || {
      name: '',
      brand: '',
      price: '',
      discountPrice: '',
      stock: '',
      sku: '',
      description: '',
      frameShape: 'RECTANGLE',
      frameMaterial: 'PLASTIC',
      frameColor: 'Black',
      lensType: 'Demo',
      lensColor: 'Transparent',
      gender: 'UNISEX',
      isFeatured: false,
      images: [],
      categoryIds: [],
      tags: '',
      specifications: []
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage, update: updateImage } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
      control: form.control,
      name: 'specifications'
  });

  // --- Handlers ---
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: signData } = await api.post('/admin/upload-url', {
        filename: file.name,
        fileType: file.type,
      });

      if (!signData.success) throw new Error('Failed to get upload URL');

      const uploadRes = await fetch(signData.url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) throw new Error('Upload to storage failed');

      const publicUrl = signData.fullUrl; 
      appendImage({ url: publicUrl, isMain: imageFields.length === 0 }); 

    } catch (error) {
      console.error('Upload error', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const setMainImage = (index: number) => {
    const currentImages = form.getValues('images');
    const updatedImages = currentImages.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    form.setValue('images', updatedImages);
  };

  const toggleCategory = (categoryId: string) => {
      const current = form.getValues('categoryIds');
      if (current.includes(categoryId)) {
          form.setValue('categoryIds', current.filter(id => id !== categoryId));
      } else {
          form.setValue('categoryIds', [...current, categoryId]);
      }
  };

  // Root Categories hardcoded for the 3-step logic requested
  const ROOT_CATEGORIES = [
      { id: 'sunglasses', name: 'Sunglasses' },
      { id: 'eyewear', name: 'Eyewear' },
      { id: 'contact-lenses', name: 'Contact Lenses' }
  ];

  const [selectedRootCategory, setSelectedRootCategory] = useState<string | null>(() => {
      // Try to deduce from initial values if possible, or default to null
      if (initialValues?.categoryIds?.length) {
         // This is tricky without the full category tree loaded and mapped. 
         // For now, let's leave it manual or simple.
         // If we have categories data, we could check.
         return null; 
      }
      return null;
  });

  // Filter available sub-categories based on selected root
  // We need to know which categories belong to which root.
  // The 'categories' hook returns all. We can filter by 'slug' or 'parentId' if available.
  // Assuming 'slug' conventions or types. 
  // BETTER: The user wants *strict* creation.
  
  // Helper to determine active sub-categories
  const availableSubCategories = categories?.filter(cat => {
      if (!selectedRootCategory) return false;
      
      // If categories have parentId (ideal), use that.
      // Based on previous file reads, Category model HAS parentId.
      // We need to find the ID of the selected root category first.
      const rootCatObj = categories.find(c => c.slug === selectedRootCategory || c.name.toLowerCase() === selectedRootCategory.replace('-', ' '));
      
      if (!rootCatObj) {
          // Fallback: Filter by type/conventions if parentId linking isn't fully set up in seed
          // Sunglasses -> Type: SHAPE, STYLE, BRAND (but BRAND might be shared? No, usually specific)
          // Contact Lenses -> Type: MANUFACTURER, DISPOSABILITY, LENS_TYPE
          if (selectedRootCategory === 'contact-lenses') {
             return ['MANUFACTURER', 'LENS_TYPE', 'DISPOSABILITY'].includes(cat.type);
          }
           if (selectedRootCategory === 'sunglasses') {
             return ['SHAPE', 'STYLE', 'COLLECTION', 'BRAND', 'SEX'].includes(cat.type);
          }
           if (selectedRootCategory === 'eyewear') {
             // Eyewear might have shapes/brands/sex too.
             // Relying on type might be ambiguous.
             // BEST: Rely on parentId if your seed set it up (it did).
             return false; 
          }
          return false;
      }

      return cat.parentId === rootCatObj.id;
  }) || [];

  // Handle Root Change
  const handleRootChange = (rootSlug: string) => {
      setSelectedRootCategory(rootSlug);
      // Clear existing selections? Maybe safer to avoid invalid states.
      // form.setValue('categoryIds', []); 
      
      // Auto-select the root category ID itself into the array?
      const rootCatObj = categories?.find(c => c.slug === rootSlug);
      if (rootCatObj) {
          form.setValue('categoryIds', [rootCatObj.id]);
      }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* ... Basic Info Column ... */}
        
         <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
                {/* Basic Details Card (Keep as is) */}
                <Card>
                    <CardHeader>
                    <CardTitle>Basic Details</CardTitle>
                    </CardHeader>
                    {/* ... Inputs ... */}
                    <CardContent className="grid gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl><Input placeholder="Classic Aviator" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="brand" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <FormControl><Input placeholder="Ray-Ban" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="sku" render={({ field }) => (
                            <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl><Input placeholder="RB-3025" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Price (INR)</FormLabel>
                            <FormControl><Input type="number" placeholder="4999" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />

                         <FormField control={form.control} name="discountPrice" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Discount Price (Optional)</FormLabel>
                            <FormControl><Input type="number" placeholder="4499" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <FormField control={form.control} name="stock" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl><Input type="number" placeholder="100" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />

                     <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Product description..." className="min-h-[100px]" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="isFeatured" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Featured Product</FormLabel>
                            <FormDescription>
                            Show this product on the homepage featured section.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )} />
                    </CardContent>
                </Card>
                
                 {/* Images Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {imageFields.map((field, index) => (
                                <div key={field.id} className="relative aspect-square group rounded-lg border overflow-hidden bg-muted">
                                    <Image src={field.url} alt="Product" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <Button 
                                            size="sm" 
                                            variant={field.isMain ? "default" : "secondary"}
                                            onClick={() => setMainImage(index)}
                                            type="button"
                                        >
                                            {field.isMain ? "Main" : "Set Main"}
                                        </Button>
                                        <Button size="icon" variant="destructive" onClick={() => removeImage(index)} type="button">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {field.isMain && <Badge className="absolute top-2 right-2">Main</Badge>}
                                </div>
                            ))}
                            <label className="flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed hover:bg-muted/50 cursor-pointer transition-colors bg-background">
                                {uploading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : <UploadCloud className="h-8 w-8 text-muted-foreground" />}
                                <span className="text-sm text-muted-foreground mt-2">{uploading ? 'Uploading...' : 'Upload Image'}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        </div>
                        {form.formState.errors.images && (
                            <p className="text-sm font-medium text-destructive">{form.formState.errors.images.message}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Categories & attributes */}
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Category Classification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Step 1: Root Category */}
                        <div className="space-y-2">
                            <Label>Main Category</Label>
                            <Select 
                                value={selectedRootCategory || ''} 
                                onValueChange={handleRootChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Main Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROOT_CATEGORIES.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                         {/* Step 2: Sub Categories */}
                         {selectedRootCategory && (
                            <FormField control={form.control} name="categoryIds" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Sub-Categories</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant="outline"
                                            role="combobox"
                                            className="justify-between"
                                            >
                                            {field.value?.length > 1 // >1 because root is auto-added
                                                ? `${field.value.length - 1} selected`
                                                : "Select sub-categories..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search..." />
                                            <CommandList>
                                                <CommandEmpty>No sub-category found.</CommandEmpty>
                                                <CommandGroup>
                                                {availableSubCategories.map((category) => (
                                                    <CommandItem
                                                        key={category.id}
                                                        value={category.name}
                                                        onSelect={() => toggleCategory(category.id)}
                                                    >
                                                    <Check
                                                        className={cn(
                                                        "mr-2 h-4 w-4",
                                                        field.value?.includes(category.id) ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {category.name} ({category.type})
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        Linked to: {categories?.filter(c => field.value?.includes(c.id)).map(c => c.name).join(', ')}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                         )}
                    </CardContent>
                 </Card>

                 {/* Lens Pricing / Configuration Panel */}
                 {selectedRootCategory === 'eyewear' && (
                     <Card className="border-blue-200 bg-blue-50/20">
                         <CardHeader>
                             <CardTitle className="text-blue-700 flex items-center gap-2">
                                 <ScanEye className="w-5 h-5" />
                                 Lens Configuration
                             </CardTitle>
                             <CardDescription>
                                 This product is eligible for the following Global Lens Pricing options.
                             </CardDescription>
                         </CardHeader>
                         <CardContent>
                             <div className="space-y-4">
                                 <div className="text-sm text-gray-600 mb-2">
                                     Customers will be able to select these lens options for this frame:
                                 </div>
                                 <div className="grid grid-cols-1 gap-2">
                                     {lensPrices?.filter((lp: any) => lp.isActive).map((lp: any) => (
                                         <div key={lp.id} className="flex justify-between items-center p-2 bg-white rounded border border-blue-100 text-sm">
                                             <span className="font-medium">{lp.name}</span>
                                             <span className="text-muted-foreground">{lp.type}</span>
                                             <span className="font-bold text-blue-600">₹{lp.price}</span>
                                         </div>
                                     ))}
                                     {(!lensPrices || lensPrices.length === 0) && (
                                         <p className="text-sm text-red-500">No active lens prices found. Please add them in the Lens Pricing dashboard.</p>
                                     )}
                                 </div>
                                 <Button 
                                    variant="link" 
                                    className="px-0 text-blue-700" 
                                    onClick={() => window.open('/dashboard/lens-pricing', '_blank')}
                                    type="button"
                                 >
                                     Manage Global Lens Prices &rarr;
                                 </Button>
                             </div>
                         </CardContent>
                     </Card>
                 )}

                 {/* Attributes for Contact Lenses */}
                 {selectedRootCategory === 'contact-lenses' && (
                     <Card className="border-orange-200 bg-orange-50/20">
                         <CardHeader>
                             <CardTitle className="text-orange-700">Contact Lens Attributes</CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-4">
                             {/* Add specific fields if needed here or rely on specifications */}
                             <p className="text-sm text-muted-foreground">Ensure to add Power/Cylinder availability in specifications if not using a variant system.</p>
                         </CardContent>
                     </Card>
                 )}

                  {/* Attributes */}
                 <Card>
                     <CardHeader>
                        <CardTitle>Attributes</CardTitle>
                     </CardHeader>
                     <CardContent className="grid gap-4">
                        {/* Gender */}
                         <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="gender" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                    <SelectItem value="UNISEX">Unisex</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )} />
                            
                             <FormField control={form.control} name="frameShape" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Frame Shape</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select shape" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                    <SelectItem value="RECTANGLE">Rectangle</SelectItem>
                                    <SelectItem value="ROUND">Round</SelectItem>
                                    <SelectItem value="AVIATOR">Aviator</SelectItem>
                                    <SelectItem value="CAT_EYE">Cat Eye</SelectItem>
                                    <SelectItem value="WAYFARER">Wayfarer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )} />
                         </div>

                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="frameMaterial" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Frame Material</FormLabel>
                                <FormControl><Input placeholder="Plastic" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />

                             <FormField control={form.control} name="frameColor" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Frame Color</FormLabel>
                                <FormControl><Input placeholder="Black" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="lensType" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Lens Type</FormLabel>
                                <FormControl><Input placeholder="Demo" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />

                             <FormField control={form.control} name="lensColor" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Lens Color</FormLabel>
                                <FormControl><Input placeholder="Transparent" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="tags" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags (Comma separated)</FormLabel>
                            <FormControl><Input placeholder="new, summer, sale" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />
                     </CardContent>
                 </Card>

                 {/* Specifications */}
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Specifications</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => appendSpec({ key: '', value: '' })} type="button">
                            <Check className="mr-2 h-4 w-4" /> Add Spec
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {specFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-end">
                                <FormField control={form.control} name={`specifications.${index}.key`} render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormControl><Input placeholder="Key (e.g. Weight)" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`specifications.${index}.value`} render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormControl><Input placeholder="Value (e.g. 20g)" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <Button variant="ghost" size="icon" onClick={() => removeSpec(index)} type="button">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
           </div> {/* End Right Column */}
        </div> {/* End Main Grid */}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
