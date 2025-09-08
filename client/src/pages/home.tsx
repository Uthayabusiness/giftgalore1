import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/navigation';
import HeroSection from '@/components/hero-section';
import FeaturedCategories from '@/components/featured-categories';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/footer';
import { useQuery } from '@tanstack/react-query';
import { Gift, Star, Heart } from 'lucide-react';
import { Link } from 'wouter';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: featuredProducts = [], isLoading: productsLoading, error } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const params = new URLSearchParams({ featured: 'true', limit: '8' });
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    retry: false,
  });

  // Handle unauthorized errors at page level
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Handle query errors
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeaturedCategories />
      
      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Featured Gifts</h2>
              <p className="text-lg text-muted-foreground">Handpicked favorites that make perfect gifts</p>
            </div>
            <Button asChild data-testid="button-view-all-products">
              <Link href="/products">View All</Link>
            </Button>
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
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
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No featured products available</h3>
              <p className="text-muted-foreground mb-4">Check back later for amazing gift collections!</p>
              <Button asChild>
                <Link href="/products">Browse All Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product: any) => (
                <Card key={product.id} className="product-card overflow-hidden card-hover relative group" data-testid={`card-featured-product-${product.id}`}>
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative">
                      <img
                        src={product.images?.[0] || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-full h-48 object-contain bg-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                        }}
                      />
                      
                      <div className="product-overlay absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Button variant="secondary" className="font-semibold" data-testid={`button-view-product-${product.id}`}>
                          <Gift className="mr-2 h-4 w-4" />
                          View Gift
                        </Button>
                      </div>

                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                        data-testid={`button-wishlist-${product.id}`}
                      >
                        <Heart className="h-4 w-4 text-gray-600" />
                      </Button>

                      {product.isFeatured && (
                        <Badge className="absolute top-3 left-3 gift-gradient">
                          Featured
                        </Badge>
                      )}
                      
                      {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                        <Badge variant="destructive" className="absolute top-10 left-3">
                          {Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)}% OFF
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1" data-testid={`text-featured-product-name-${product.id}`}>
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-primary" data-testid={`text-featured-product-price-${product.id}`}>
                            ₹{parseFloat(product.price).toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{parseFloat(product.originalPrice).toLocaleString()}
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
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground">Real stories from gift-givers who found the perfect presents</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Raj Kumar",
                initials: "RK",
                feedback: "Found the most beautiful anniversary gift for my wife. The personalization was perfect and delivery was super fast!",
                type: "Verified Purchase"
              },
              {
                name: "Priya Singh",
                initials: "PS",
                feedback: "The corporate gifts for our clients were exceptional. Professional packaging and great quality. Highly recommend!",
                type: "Business Customer"
              },
              {
                name: "Arjun Mehta",
                initials: "AM",
                feedback: "Amazing experience! The gift guide helped me find something perfect for my mother's birthday. She absolutely loved it!",
                type: "Happy Customer"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{testimonial.feedback}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">{testimonial.initials}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.type}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
