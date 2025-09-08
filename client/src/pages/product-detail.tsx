import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, ShoppingCart, Minus, Plus, Shield, Truck, RotateCcw, Gift } from 'lucide-react';

export default function ProductDetail() {
  const [, params] = useRoute('/products/:slug');
  const { slug } = params || {};
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products/slug', slug],
    queryFn: async () => {
      const response = await fetch(`/api/products/slug/${slug}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!slug,
    retry: false,
  });

  const isWishlisted = isInWishlist(product?._id || '');

  // Set initial quantity based on minimum order quantity
  useEffect(() => {
    if (product && product.minOrderQuantity) {
      setQuantity(product.minOrderQuantity);
    }
  }, [product]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="w-full h-96 bg-muted animate-pulse rounded-lg"></div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full h-20 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded w-3/4"></div>
              <div className="h-6 bg-muted animate-pulse rounded w-1/2"></div>
              <div className="h-20 bg-muted animate-pulse rounded"></div>
              <div className="h-12 bg-muted animate-pulse rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
            <Button asChild data-testid="button-back-to-products">
              <a href="/products">Back to Products</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
    
    // Check stock before adding to cart
    if (product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This item is currently out of stock.",
        variant: "destructive",
      });
      return;
    }
    
    // Check minimum order quantity
    const minQty = product.minOrderQuantity || 1;
    if (quantity < minQty) {
      toast({
        title: "Minimum Order Quantity",
        description: `Minimum order quantity for this item is ${minQty} items.`,
        variant: "destructive",
      });
      return;
    }
    
    if (quantity > product.stock) {
      toast({
        title: "Limited Stock",
        description: `Only ${product.stock} items available in stock.`,
        variant: "destructive",
      });
      return;
    }
    
    addToCart(product._id, quantity);
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (error) {
      // Error handling is done in the context
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <a href="/" className="hover:text-foreground" data-testid="breadcrumb-home">Home</a>
          <span>/</span>
          <a href="/products" className="hover:text-foreground" data-testid="breadcrumb-products">Products</a>
          <span>/</span>
          <span className="text-foreground" data-testid="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg border overflow-hidden">
              <img
                src={product.images?.[selectedImage] || '/placeholder-image.jpg'}
                alt={product.name}
                className="w-full h-64 sm:h-80 lg:h-96 object-contain rounded-lg transition-transform duration-300 hover:scale-105"
                data-testid="img-product-main"
                style={{ 
                  maxHeight: '400px',
                  minHeight: '200px'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
              {discount > 0 && (
                <Badge variant="destructive" className="absolute top-4 left-4" data-testid="badge-discount">
                  {discount}% OFF
                </Badge>
              )}
              {product.isFeatured && (
                <Badge className="absolute top-4 right-4 gift-gradient" data-testid="badge-featured">
                  Featured
                </Badge>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 bg-white hover:border-primary/70 ${
                      selectedImage === index ? 'border-primary' : 'border-gray-200'
                    }`}
                    data-testid={`button-image-${index}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-16 sm:h-20 object-contain transition-transform duration-200 hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-3xl font-bold mb-2" data-testid="text-product-name">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground" data-testid="text-rating">(4.5 stars • 128 reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary" data-testid="text-price">
                ₹{parseFloat(product.price).toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through" data-testid="text-original-price">
                  ₹{parseFloat(product.originalPrice).toLocaleString()}
                </span>
              )}
              {discount > 0 && (
                <Badge variant="destructive" data-testid="badge-save">
                  Save {discount}%
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
              {product.description}
            </p>

            {/* Stock Information */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">Stock:</span>
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">
                  {product.stock} items available
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  Out of stock
                </span>
              )}
            </div>

            {/* Minimum Order Quantity Information */}
            {product.minOrderQuantity && product.minOrderQuantity > 1 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Minimum Order:</span>
                <span className="text-blue-600 font-medium">
                  {product.minOrderQuantity} items
                </span>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" data-testid={`badge-tag-${tag}`}>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const minQty = product.minOrderQuantity || 1;
                      if (quantity > minQty) {
                        setQuantity(quantity - 1);
                      }
                    }}
                    disabled={quantity <= (product.minOrderQuantity || 1)}
                    data-testid="button-decrease-quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (quantity < product.stock) {
                        setQuantity(quantity + 1);
                      } else {
                        toast({
                          title: "Limited Stock",
                          description: `Only ${product.stock} items available in stock.`,
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={quantity >= product.stock || product.stock === 0}
                    className={quantity >= product.stock ? 'opacity-50 cursor-not-allowed' : ''}
                    data-testid="button-increase-quantity"
                    title={product.stock === 0 ? 'Out of stock' : quantity >= product.stock ? 'Maximum quantity reached' : 'Increase quantity'}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  className={`flex-1 ${product.stock > 0 ? 'gift-gradient hover:opacity-90' : 'bg-gray-400 cursor-not-allowed'}`}
                  size="lg"
                  disabled={product.stock === 0}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWishlistToggle}
                  data-testid="button-wishlist"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-5 w-5 text-primary" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-5 w-5 text-primary" />
                <span>Easy Returns</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-5 w-5 text-primary" />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
              <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping" data-testid="tab-shipping">Shipping</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Product Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Specifications</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Material: Premium quality</li>
                        <li>Dimensions: Standard size</li>
                        <li>Weight: Lightweight</li>
                        <li>Color: As shown in image</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Care Instructions</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Handle with care</li>
                        <li>Clean with soft cloth</li>
                        <li>Store in cool, dry place</li>
                        <li>Avoid direct sunlight</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Customer Reviews</h3>
                  <div className="space-y-4">
                    {[
                      { name: "Arjun K.", rating: 5, comment: "Excellent quality gift! Highly recommended." },
                      { name: "Priya S.", rating: 5, comment: "Perfect for anniversary. Beautiful packaging." },
                      { name: "Raj M.", rating: 4, comment: "Good product, fast delivery. Happy with purchase." }
                    ].map((review, index) => (
                      <div key={index} className="border-b border-border pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{review.name}</span>
                          <div className="flex text-yellow-400">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Shipping Information</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Delivery Options</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Standard Delivery: 3-5 business days (Free)</li>
                        <li>• Express Delivery: 1-2 business days (₹99)</li>
                        <li>• Same Day Delivery: Available in select cities (₹199)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Return Policy</h4>
                      <p className="text-sm text-muted-foreground">
                        30-day return policy. Items must be in original condition with all packaging.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
