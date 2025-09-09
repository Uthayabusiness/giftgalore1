import { useWishlist } from '@/contexts/wishlist-context';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, Trash2, Sparkles, Gift, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';

// Animated Background Component for Wishlist
function WishlistAnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-red-50 to-rose-50"></div>
      
      {/* Floating Hearts */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 text-pink-300 opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            ❤️
          </div>
        ))}
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-200 to-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-gradient-to-r from-rose-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-gradient-to-r from-red-200 to-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
    </div>
  );
}

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <WishlistAnimatedBackground />
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl">
                <Heart className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full opacity-20 animate-ping"></div>
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-yellow-400 animate-spin" style={{animationDuration: '3s'}} />
            </div>
            <div>
              <h1 className="font-serif text-5xl font-bold bg-gradient-to-r from-pink-600 via-red-600 to-rose-600 bg-clip-text text-transparent">
                My Wishlist
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                {wishlistItems.length === 0 
                  ? "Your wishlist is empty" 
                  : `${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist`
                }
              </p>
            </div>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-delay">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-red-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-pink-300 to-red-300 rounded-full flex items-center justify-center">
                <Heart className="h-16 w-16 text-pink-600 animate-bounce" />
              </div>
            </div>
            <h2 className="font-serif text-4xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              Your wishlist is empty
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
              Start adding items to your wishlist to see them here. Save your favorite gifts for later! 💕
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-lg px-8 py-6">
              <Link href="/products">
                <Gift className="mr-3 h-6 w-6" />
                Browse Products
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlistItems.map((item, index) => {
              const discount = item.product.originalPrice
                ? Math.round(((parseFloat(item.product.originalPrice) - parseFloat(item.product.price)) / parseFloat(item.product.originalPrice)) * 100)
                : 0;

              return (
                <Card 
                  key={item._id} 
                  className="overflow-hidden bg-white/80 backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.05] relative group animate-slide-up" 
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <Link href={`/products/${item.product.slug}`} className="block">
                    <div className="relative group/image">
                      <img
                        src={item.product.images?.[0] || '/placeholder-image.jpg'}
                        alt={item.product.name}
                        className="w-full h-56 object-contain bg-white rounded-t-lg transition-all duration-300 group-hover/image:scale-105"
                      />
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 rounded-t-lg"></div>
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {discount > 0 && (
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-pulse">
                            {discount}% OFF
                          </Badge>
                        )}
                        <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg">
                          ❤️ Loved
                        </Badge>
                      </div>

                      {/* Action buttons */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-10 w-10 bg-white/90 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all duration-300 transform hover:scale-110"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-t-lg">
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(String(item.productId));
                          }}
                          className="bg-white/90 hover:bg-white text-pink-600 hover:text-pink-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Link>

                  <CardContent className="p-6 bg-gradient-to-b from-white to-pink-50/50">
                    <h3 className="font-bold text-xl mb-3 line-clamp-1 bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                      {item.product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                      {item.product.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-pink-100 to-red-100 px-3 py-1 rounded-full">
                            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                              ₹{parseFloat(item.product.price).toLocaleString()}
                            </span>
                          </div>
                          {item.product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{parseFloat(item.product.originalPrice).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground ml-2 font-medium">
                            (4.5)
                          </span>
                        </div>
                        
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(String(item.productId));
                          }}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
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
