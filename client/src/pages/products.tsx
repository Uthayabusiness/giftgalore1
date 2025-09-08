import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navigation from '@/components/navigation';
import ProductCard from '@/components/product-card';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Gift, SlidersHorizontal } from 'lucide-react';
import type { IProduct as Product, ICategory as Category } from '@shared/schema';

export default function Products() {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  
  // Simple state management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [showFeatured, setShowFeatured] = useState(false);

  // Parse URL parameters - use window.location.search
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category') || params.get('categoryId') || '';
    const searchParam = params.get('search') || '';
    
    console.log('🔍 URL Effect Triggered:');
    console.log('  - window.location.search:', window.location.search);
    console.log('  - Category param:', categoryParam);
    console.log('  - Search param:', searchParam);
    
    setSearchQuery(searchParam);
    setSelectedCategory(categoryParam || 'all');
    
    console.log('  - Set selectedCategory to:', categoryParam || 'all');
  }, [location]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategory, searchQuery, showFeatured, sortBy, priceRange],
    queryFn: async (): Promise<Product[]> => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (showFeatured) params.append('featured', 'true');
      
      const url = `/api/products?${params}`;
      console.log('🚀 API Query Called:');
      console.log('  - selectedCategory:', selectedCategory);
      console.log('  - API URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('📦 API Response:');
      console.log('  - Products count:', data.length);
      return data;
    },
    retry: false,
  });

  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    retry: false,
  });



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
    if (showFeatured) params.append('featured', 'true');
    const newUrl = `/products?${params}`;
    window.history.pushState({}, '', newUrl);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
    setPriceRange('all');
    setShowFeatured(false);
    window.history.pushState({}, '', '/products');
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (categoryId && categoryId !== 'all') params.append('category', categoryId);
    if (showFeatured) params.append('featured', 'true');
    const newUrl = `/products?${params}`;
    window.history.pushState({}, '', newUrl);
  };

  const filteredProducts = products
    .filter((product: Product) => {
      // Note: Category filtering is now handled server-side
      // Only do client-side filtering for features not handled by server
      
      // Price range filter
      if (priceRange && priceRange !== 'all') {
        const price = parseFloat(product.price.toString());
        switch (priceRange) {
          case 'under-1000':
            return price < 1000;
          case '1000-5000':
            return price >= 1000 && price <= 5000;
          case '5000-10000':
            return price >= 5000 && price <= 10000;
          case 'over-10000':
            return price > 10000;
          default:
            return true;
        }
      }
      
      // Featured filter (if not handled server-side)
      if (showFeatured && !product.isFeatured) {
        return false;
      }
      
      return true;
    })
    .sort((a: Product, b: Product) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price.toString()) - parseFloat(b.price.toString());
        case 'price-high':
          return parseFloat(b.price.toString()) - parseFloat(a.price.toString());
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

  // Debug state changes
  console.log('🎯 Current State:');
  console.log('  - selectedCategory:', selectedCategory);
  console.log('  - products.length:', products.length);
  console.log('  - filteredProducts.length:', filteredProducts.length);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-3xl font-bold">Gift Collection</h1>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search for gifts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-product-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button type="submit" data-testid="button-search">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery && (
              <Badge variant="secondary" data-testid="badge-search-filter">
                Search: {searchQuery}
              </Badge>
            )}
            {selectedCategory && selectedCategory !== 'all' && (
              <Badge variant="secondary" data-testid="badge-category-filter">
                Category: {categories.find(cat => cat._id === selectedCategory)?.name || selectedCategory}
              </Badge>
            )}
            {showFeatured && (
              <Badge variant="secondary" data-testid="badge-featured-filter">
                Featured Only
              </Badge>
            )}
            {priceRange && priceRange !== 'all' && (
              <Badge variant="secondary" data-testid="badge-price-filter">
                Price: {priceRange.replace('-', ' - ₹').replace('under', 'Under ₹').replace('over', 'Over ₹')}
              </Badge>
            )}
            {(searchQuery || (selectedCategory && selectedCategory !== 'all') || showFeatured || (priceRange && priceRange !== 'all')) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                Clear All
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-48" data-testid="select-filter-category">
                      <SelectValue placeholder="All Categories">
                        {selectedCategory === 'all' || !selectedCategory 
                          ? 'All Categories' 
                          : categories.find(cat => cat._id === selectedCategory)?.name || 'All Categories'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {!categoriesLoading && !categoriesError && categories.map((category: any) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-3">Price Range</h3>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger data-testid="select-price-range">
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Price</SelectItem>
                      <SelectItem value="under-1000">Under ₹1,000</SelectItem>
                      <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
                      <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                      <SelectItem value="over-10000">Over ₹10,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Featured Products */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="featured" 
                    checked={showFeatured}
                    onCheckedChange={(checked) => setShowFeatured(checked === true)}
                    data-testid="checkbox-featured"
                  />
                  <label htmlFor="featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Featured Products Only
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort Controls */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground" data-testid="text-product-count">
                {filteredProducts.length} products found
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="w-full h-48 bg-muted animate-pulse"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-muted rounded animate-pulse mb-3 w-3/4"></div>
                      <div className="h-6 bg-muted rounded animate-pulse w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse our categories
                </p>
                <Button onClick={clearFilters} data-testid="button-clear-search">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

