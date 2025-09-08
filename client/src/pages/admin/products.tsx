import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
import { Package, Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.string().min(1, 'Price is required'),
  originalPrice: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  stock: z.number().min(0, 'Stock must be non-negative'),
  minOrderQuantity: z.number().min(1, 'Minimum order quantity must be at least 1'),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  hasDeliveryCharge: z.boolean(),
  deliveryCharge: z.number().min(0, 'Delivery charge must be non-negative'),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [imageInputs, setImageInputs] = useState(['']);
  const [tagInput, setTagInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isFeatured: false,
      isActive: true,
      stock: 0,
      minOrderQuantity: 1,
      images: [''],
      tags: [],
      hasDeliveryCharge: true,
      deliveryCharge: 99,
    },
  });

  // Check admin access
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, authLoading, user, toast]);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/products', { search: searchQuery, categoryId: selectedCategory }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      
      console.log('=== CLIENT SIDE DEBUG ===');
      console.log('Admin products query - URL params:', params.toString());
      const url = `/api/admin/products?${params}`;
      console.log('Admin products query - Full URL:', url);
      
      const response = await fetch(url);
      console.log('Admin products query - Response status:', response.status);
      console.log('Admin products query - Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Admin products query - Response data:', data);
      console.log('Admin products query - Data length:', data.length);
      console.log('Admin products query - Data type:', typeof data);
      console.log('Admin products query - Is array:', Array.isArray(data));
      
      return data;
    },
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Debug logging for products data
  console.log('=== PRODUCTS DATA DEBUG ===');
  console.log('Products data:', products);
  console.log('Products length:', products?.length);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return await apiRequest('POST', '/api/products', productData);
    },
    onSuccess: () => {
      // Invalidate all product queries to refresh the list
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === '/api/products' || query.queryKey[0] === '/api/admin/products'
      });
      setIsCreateDialogOpen(false);
      reset();
      setImageInputs(['']);
      setSelectedCategories([]);
      setTagInput('');
      toast({
        title: "Product Created",
        description: "Product has been created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create product.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log('Updating product with ID:', id);
      console.log('Product data:', data);
      return await apiRequest('PUT', `/api/products/${id}`, data);
    },
    onSuccess: () => {
      // Invalidate all product queries to refresh the list
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === '/api/products' || query.queryKey[0] === '/api/admin/products'
      });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      reset();
      setImageInputs(['']);
      setSelectedCategories([]);
      setTagInput('');
      toast({
        title: "Product Updated",
        description: "Product has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      // Invalidate all product queries to refresh the list
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === '/api/products' || query.queryKey[0] === '/api/admin/products'
      });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductForm) => {
    console.log('Form submitted with data:', data);
    console.log('hasDeliveryCharge from form:', data.hasDeliveryCharge, 'type:', typeof data.hasDeliveryCharge);
    console.log('deliveryCharge from form:', data.deliveryCharge, 'type:', typeof data.deliveryCharge);
    console.log('Selected product:', selectedProduct);
    
    // Validate that at least one category is selected
    if (selectedCategories.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one category is required.",
        variant: "destructive",
      });
      return;
    }

    const images = imageInputs.filter(img => img.trim() !== '');
    const tags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    // Validate that at least one image is provided
    if (images.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one image is required.",
        variant: "destructive",
      });
      return;
    }
    
    const productData = {
      ...data,
      categoryIds: selectedCategories,
      images,
      tags,
      price: parseFloat(data.price),
      originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
      minOrderQuantity: data.minOrderQuantity,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      hasDeliveryCharge: data.hasDeliveryCharge,
      deliveryCharge: data.deliveryCharge,
    };

    console.log('Final product data:', productData);

    if (selectedProduct) {
      console.log('Calling updateProductMutation with ID:', selectedProduct._id);
      updateProductMutation.mutate({ id: selectedProduct._id, data: productData });
    } else {
      console.log('Calling createProductMutation');
      createProductMutation.mutate(productData);
    }
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    
    // Convert categoryIds from ObjectIds to strings
    const categoryIds = product.categoryIds ? product.categoryIds.map((id: any) => id.toString()) : [];
    
    reset({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      categoryIds: categoryIds,
      stock: product.stock,
      minOrderQuantity: product.minOrderQuantity || 1,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      hasDeliveryCharge: product.hasDeliveryCharge ?? true,
      deliveryCharge: product.deliveryCharge ?? 99,
    });
    setSelectedCategories(categoryIds);
    setImageInputs(product.images || ['']);
    setTagInput(product.tags?.join(', ') || '');
    setIsEditDialogOpen(true);
  };

  const handleDelete = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const addImageInput = () => {
    setImageInputs([...imageInputs, '']);
  };

  const removeImageInput = (index: number) => {
    if (imageInputs.length > 1) {
      const newInputs = imageInputs.filter((_, i) => i !== index);
      setImageInputs(newInputs);
    }
  };

  const updateImageInput = (index: number, value: string) => {
    const newInputs = [...imageInputs];
    newInputs[index] = value;
    setImageInputs(newInputs);
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // Filter products based on search and category
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || 
      (product.categoryIds && product.categoryIds.includes(selectedCategory));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-3xl font-bold">Products</h1>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gift-gradient"
            data-testid="button-add-product"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Search Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-products"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any) => (
                  <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || '/placeholder-image.jpg'}
                          alt={product.name}
                          className="w-12 h-12 object-contain bg-white rounded border"
                        />
                        <div>
                          <p className="font-medium" data-testid={`product-name-${product.id}`}>
                            {product.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate max-w-48">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`product-category-${product.id}`}>
                      <div className="flex flex-wrap gap-1">
                        {product.categoryIds && product.categoryIds.length > 0 ? (
                          product.categoryIds.map((categoryId: string) => {
                            const category = categories.find((cat: any) => cat._id === categoryId);
                            return category ? (
                              <Badge key={categoryId} className="text-xs">
                                {category.name}
                              </Badge>
                            ) : null;
                          })
                        ) : (
                          <span className="text-muted-foreground text-sm">No categories</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-semibold" data-testid={`product-price-${product.id}`}>
                          ₹{parseFloat(product.price).toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            ₹{parseFloat(product.originalPrice).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`product-stock-${product.id}`}>
                      <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                        {product.stock} units
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`product-min-order-${product.id}`}>
                      <Badge variant="outline">
                        {product.minOrderQuantity || 1} units
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={product.isActive ? 'default' : 'secondary'} data-testid={`product-status-${product.id}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {product.isFeatured && (
                          <Badge className="gift-gradient text-xs">Featured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                          data-testid={`button-view-${product.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          data-testid={`button-edit-${product.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(product)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-${product.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">Add your first product to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Product Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedProduct(null);
            reset();
            setImageInputs(['']);
            setTagInput('');
            setSelectedCategories([]); // Clear selected categories when dialog closes
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {selectedProduct ? 'Update product information' : 'Fill in the details to create a new product'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    onChange={(e) => {
                      register('name').onChange(e);
                      setValue('slug', generateSlug(e.target.value));
                    }}
                    className={errors.name ? 'border-destructive' : ''}
                    data-testid="input-product-name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    className={errors.slug ? 'border-destructive' : ''}
                    data-testid="input-product-slug"
                  />
                  {errors.slug && (
                    <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  className={errors.description ? 'border-destructive' : ''}
                  data-testid="input-product-description"
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price')}
                    className={errors.price ? 'border-destructive' : ''}
                    data-testid="input-product-price"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    {...register('originalPrice')}
                    data-testid="input-product-original-price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                    className={errors.stock ? 'border-destructive' : ''}
                    data-testid="input-product-stock"
                  />
                  {errors.stock && (
                    <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="minOrderQuantity">Minimum Order Quantity *</Label>
                  <Input
                    id="minOrderQuantity"
                    type="number"
                    min="1"
                    {...register('minOrderQuantity', { valueAsNumber: true })}
                    className={errors.minOrderQuantity ? 'border-destructive' : ''}
                    data-testid="input-product-min-order-quantity"
                  />
                  {errors.minOrderQuantity && (
                    <p className="text-sm text-destructive mt-1">{errors.minOrderQuantity.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Categories *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {categories.map((category: any) => (
                    <div key={category._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category._id}`}
                        checked={selectedCategories.includes(category._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            const newCategories = [...selectedCategories, category._id];
                            setSelectedCategories(newCategories);
                            setValue('categoryIds', newCategories);
                          } else {
                            const newCategories = selectedCategories.filter(id => id !== category._id);
                            setSelectedCategories(newCategories);
                            setValue('categoryIds', newCategories);
                          }
                        }}
                        data-testid={`checkbox-category-${category._id}`}
                      />
                      <Label htmlFor={`category-${category._id}`} className="text-sm">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedCategories.length === 0 && (
                  <p className="text-sm text-destructive mt-1">At least one category is required</p>
                )}
              </div>

              <CloudinaryUpload
                value={imageInputs}
                onChange={setImageInputs}
                maxFiles={5}
              />

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="birthday, anniversary, personalized"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  data-testid="input-product-tags"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={watch('isFeatured')}
                    onCheckedChange={(checked) => setValue('isFeatured', checked === true)}
                    data-testid="checkbox-featured"
                  />
                  <Label htmlFor="isFeatured">Featured Product</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={watch('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', checked === true)}
                    data-testid="checkbox-active"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              {/* Delivery Charge Configuration */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDeliveryCharge"
                    checked={watch('hasDeliveryCharge')}
                    onCheckedChange={(checked) => setValue('hasDeliveryCharge', checked === true)}
                    data-testid="checkbox-delivery-charge"
                  />
                  <Label htmlFor="hasDeliveryCharge">Apply Delivery Charge</Label>
                </div>

                {watch('hasDeliveryCharge') && (
                  <div className="space-y-2">
                    <Label htmlFor="deliveryCharge">Delivery Charge (₹)</Label>
                    <Input
                      id="deliveryCharge"
                      type="number"
                      min="0"
                      step="1"
                      {...register('deliveryCharge', { valueAsNumber: true })}
                      data-testid="input-delivery-charge"
                    />
                    {errors.deliveryCharge && (
                      <p className="text-sm text-red-500">{errors.deliveryCharge.message}</p>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setSelectedProduct(null);
                    reset();
                    setImageInputs(['']);
                    setTagInput('');
                    setSelectedCategories([]); // Clear selected categories when dialog closes
                  }}
                  data-testid="button-cancel-product"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gift-gradient"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  data-testid="button-save-product"
                >
                  {createProductMutation.isPending || updateProductMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    selectedProduct ? 'Update Product' : 'Create Product'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedProduct && deleteProductMutation.mutate(selectedProduct._id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
