import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CategoryImageUpload } from '@/components/ui/category-image-upload';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Eye,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

export default function CategoriesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
  });

  const { data: categories = [], isLoading, refetch } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      return data;
    },
    retry: false,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      return response.json();
    },
    onSuccess: () => {
      // Clear all queries and force a complete refetch
      queryClient.removeQueries({ queryKey: ['/api/categories'] });
      queryClient.removeQueries({ queryKey: ['/api/products'] });
      // Force a refetch
      refetch();
      toast({
        title: "Category created successfully",
        description: "The category has been added to your store.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to create category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      return response.json();
    },
    onSuccess: () => {
      // Clear all queries and force a complete refetch
      queryClient.removeQueries({ queryKey: ['/api/categories'] });
      queryClient.removeQueries({ queryKey: ['/api/products'] });
      // Force a refetch
      refetch();
      toast({
        title: "Category updated successfully",
        description: "The category has been updated.",
      });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to update category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      return response.json();
    },
    onSuccess: () => {
      // Clear all queries and force a complete refetch
      queryClient.removeQueries({ queryKey: ['/api/categories'] });
      queryClient.removeQueries({ queryKey: ['/api/products'] });
      // Force a refetch
      refetch();
      toast({
        title: "Category deleted successfully",
        description: "The category has been removed from your store.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
    });
    setEditingCategory(null);
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    // Generate slug from name
    const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    createCategoryMutation.mutate({
      ...formData,
      slug,
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      imageUrl: category.imageUrl || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingCategory || !formData.name.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    // Generate slug from name
    const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    updateCategoryMutation.mutate({
      id: editingCategory._id,
      data: {
        ...formData,
        slug,
      },
    });
  };

  const handleDelete = (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name || 'this category'}"? This action cannot be undone.`)) {
      deleteCategoryMutation.mutate(category._id);
    }
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailsDialogOpen(true);
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-3xl font-bold">Categories Management</h1>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gift-gradient"
            data-testid="button-add-category"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                                 {categories.map((category: Category) => (
                   <TableRow key={category._id} data-testid={`category-row-${category._id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                          {category.imageUrl ? (
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                                                                                <p className="font-medium" data-testid={`category-name-${category._id}`}>
                             {category.name || 'Unnamed Category'}
                           </p>
                           <p className="text-sm text-muted-foreground">
                             ID: {category._id ? category._id.slice(0, 8) + '...' : 'N/A'}
                           </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                                           <Badge variant="outline" data-testid={`category-slug-${category._id}`}>
                       {category.slug || 'no-slug'}
                     </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground max-w-48 truncate">
                        {category.description || 'No description'}
                      </p>
                    </TableCell>
                                         <TableCell data-testid={`category-date-${category._id}`}>
                       <div className="flex items-center gap-1 text-sm">
                         <Calendar className="h-3 w-3" />
                         {category.createdAt ? new Date(category.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                       </div>
                     </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                                                 <Button
                           variant="outline"
                           size="icon"
                           onClick={() => handleView(category)}
                           data-testid={`button-view-${category._id}`}
                         >
                          <Eye className="h-4 w-4" />
                        </Button>
                                                 <Button
                           variant="outline"
                           size="icon"
                           onClick={() => handleEdit(category)}
                           data-testid={`button-edit-${category._id}`}
                         >
                          <Edit className="h-4 w-4" />
                        </Button>
                                                 <Button
                           variant="outline"
                           size="icon"
                           onClick={() => handleDelete(category)}
                           className="text-destructive hover:text-destructive"
                           data-testid={`button-delete-${category._id}`}
                         >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {categories.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                <p className="text-muted-foreground">Add your first category to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Category Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Category Name *</Label>
                  <Input
                    id="create-name"
                    placeholder="Enter category name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="input-category-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-slug">Slug</Label>
                  <Input
                    id="create-slug"
                    placeholder="auto-generated"
                    value={formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  data-testid="textarea-category-description"
                />
              </div>

              <div className="space-y-2">
                <CategoryImageUpload
                  value={formData.imageUrl}
                  onChange={handleImageUpload}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createCategoryMutation.isPending}
                  className="gift-gradient"
                  data-testid="button-create-category"
                >
                  {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Category Name *</Label>
                  <Input
                    id="edit-name"
                    placeholder="Enter category name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="input-edit-category-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input
                    id="edit-slug"
                    placeholder="auto-generated"
                    value={formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  data-testid="textarea-edit-category-description"
                />
              </div>

              <div className="space-y-2">
                <CategoryImageUpload
                  value={formData.imageUrl}
                  onChange={handleImageUpload}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={updateCategoryMutation.isPending}
                  className="gift-gradient"
                  data-testid="button-update-category"
                >
                  {updateCategoryMutation.isPending ? 'Updating...' : 'Update Category'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Category Details</DialogTitle>
            </DialogHeader>
            {selectedCategory && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted">
                    {selectedCategory.imageUrl ? (
                      <img
                        src={selectedCategory.imageUrl}
                        alt={selectedCategory.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                                     <div>
                     <h3 className="text-xl font-semibold">{selectedCategory.name || 'Unnamed Category'}</h3>
                     <p className="text-muted-foreground">Category ID: {selectedCategory._id || 'N/A'}</p>
                   </div>
                </div>

                <div className="space-y-4">
                                     <div>
                     <label className="text-sm font-medium text-muted-foreground">Slug</label>
                     <Badge variant="outline">{selectedCategory.slug || 'no-slug'}</Badge>
                   </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm">
                      {selectedCategory.description || 'No description provided'}
                    </p>
                  </div>
                                     <div>
                     <label className="text-sm font-medium text-muted-foreground">Created</label>
                     <p className="flex items-center gap-2 text-sm">
                       <Calendar className="h-4 w-4" />
                       {selectedCategory.createdAt ? new Date(selectedCategory.createdAt).toLocaleString('en-IN') : 'N/A'}
                     </p>
                   </div>
                                     <div>
                     <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                     <p className="flex items-center gap-2 text-sm">
                       <Calendar className="h-4 w-4" />
                       {new Date(selectedCategory.updatedAt).toLocaleString('en-IN')}
                     </p>
                   </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
