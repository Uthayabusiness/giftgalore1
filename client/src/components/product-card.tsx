import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Star } from 'lucide-react';

interface Product {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  originalPrice?: string;
  images: string[];
  isFeatured: boolean;
  tags: string[];
  hasDeliveryCharge: boolean;
  deliveryCharge: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  const isWishlisted = isInWishlist(product._id);

  const discount = product.originalPrice
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ((product as any).stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This item is currently out of stock.",
        variant: "destructive",
      });
      return;
    }
    
    addToCart(product._id);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    <Card className="product-card overflow-hidden card-hover relative group" data-testid={`card-product-${product._id}`}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative">
                      <img
              src={product.images?.[0] || '/placeholder-image.jpg'}
              alt={product.name}
              className="w-full h-48 object-contain bg-white"
              data-testid={`img-product-${product._id}`}
            />
          
          {/* Overlay on hover */}
          <div className="product-overlay absolute inset-0 bg-black/40 flex items-center justify-center">
            <Button
              variant="secondary"
              onClick={handleAddToCart}
              className={`font-semibold ${(product as any).stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={(product as any).stock === 0}
              data-testid={`button-quick-add-${product._id}`}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {(product as any).stock > 0 ? 'Quick Add' : 'Out of Stock'}
            </Button>
          </div>

          {/* Wishlist button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white"
            onClick={handleWishlistToggle}
            data-testid={`button-wishlist-${product._id}`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discount > 0 && (
              <Badge variant="destructive" data-testid={`badge-sale-${product._id}`}>
                {discount}% OFF
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="gift-gradient" data-testid={`badge-featured-${product._id}`}>
                Featured
              </Badge>
            )}
            {product.tags?.includes('personalized') && (
              <Badge variant="secondary" data-testid={`badge-personalized-${product._id}`}>
                Personalized
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1" data-testid={`text-product-name-${product._id}`}>
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-product-description-${product._id}`}>
            {product.description}
          </p>
          
                      <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-primary" data-testid={`text-product-price-${product._id}`}>
                    ₹{parseFloat(product.price).toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${product._id}`}>
                      ₹{parseFloat(product.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>
                {product.hasDeliveryCharge && (
                  <span className="text-xs text-muted-foreground">
                    + ₹{product.deliveryCharge} delivery
                  </span>
                )}
                {!product.hasDeliveryCharge && (
                  <span className="text-xs text-green-600 font-medium">
                    Free delivery
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-1" data-testid={`text-rating-${product._id}`}>
                  (4.5)
                </span>
              </div>
            </div>
        </CardContent>
      </Link>
    </Card>
  );
}
