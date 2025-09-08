import { useWishlist } from '@/contexts/wishlist-context';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';

export default function Wishlist() {
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = (productId: string) => {
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
    
    addToCart(productId);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      // Error handling is done in the context
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length === 0 
              ? "Your wishlist is empty" 
              : `${wishlistItems.length} item${wishlistItems.length === 1 ? '' : 's'} in your wishlist`
            }
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding items to your wishlist to see them here.
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const discount = item.product.originalPrice
                ? Math.round(((parseFloat(item.product.originalPrice) - parseFloat(item.product.price)) / parseFloat(item.product.originalPrice)) * 100)
                : 0;

              return (
                <Card key={item._id} className="overflow-hidden card-hover relative group">
                  <Link href={`/products/${item.product.slug}`} className="block">
                    <div className="relative">
                      <img
                        src={item.product.images?.[0] || '/placeholder-image.jpg'}
                        alt={item.product.name}
                        className="w-full h-48 object-contain bg-white"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {discount > 0 && (
                          <Badge variant="destructive">
                            {discount}% OFF
                          </Badge>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFromWishlist(String(item.productId));
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      {/* Overlay on hover */}
                      <div className="product-overlay absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <Button
                           variant="secondary"
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             handleAddToCart(String(item.productId));
                           }}
                           className="font-semibold"
                         >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Link>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {item.product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">
                          ₹{parseFloat(item.product.price).toLocaleString()}
                        </span>
                        {item.product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{parseFloat(item.product.originalPrice).toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground ml-1">
                          (4.5)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
