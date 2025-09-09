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
import { Gift, Star, Heart, Sparkles, ArrowRight, Quote } from 'lucide-react';
import { Link } from 'wouter';
import { isUnauthorizedError } from '@/lib/authUtils';

// Animated Background Component for Home
function HomeAnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
      
      {/* Floating Gift Icons */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 text-purple-300 opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            🎁
          </div>
        ))}
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
    </div>
  );
}

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <HomeAnimatedBackground />
      <Navigation />
      <HeroSection />
      <FeaturedCategories />
      
      {/* Featured Products Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16 animate-fade-in">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h2 className="font-serif text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Featured Gifts
                </h2>
              </div>
              <p className="text-xl text-muted-foreground">Handpicked favorites that make perfect gifts for every occasion</p>
            </div>
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105" data-testid="button-view-all-products">
              <Link href="/products">
                View All
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
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
              {featuredProducts.map((product: any, index: number) => (
                <Card 
                  key={product.id} 
                  className="product-card overflow-hidden bg-white/80 backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.05] relative group animate-slide-up" 
                  style={{animationDelay: `${index * 0.1}s`}}
                  data-testid={`card-featured-product-${product.id}`}
                >
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative group/image">
                      <img
                        src={product.images?.[0] || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-full h-56 object-contain bg-white rounded-t-lg transition-all duration-300 group-hover/image:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                        }}
                      />
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 rounded-t-lg"></div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-t-lg">
                        <Button variant="secondary" className="bg-white/90 hover:bg-white text-purple-600 hover:text-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" data-testid={`button-view-product-${product.id}`}>
                          <Gift className="mr-2 h-4 w-4" />
                          View Gift
                        </Button>
                      </div>

                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-4 right-4 h-10 w-10 bg-white/90 hover:bg-pink-50 border border-pink-200 hover:border-pink-300 transition-all duration-300 transform hover:scale-110"
                        data-testid={`button-wishlist-${product.id}`}
                      >
                        <Heart className="h-4 w-4 text-pink-600" />
                      </Button>

                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.isFeatured && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg animate-pulse">
                            ✨ Featured
                          </Badge>
                        )}
                        
                        {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                            {Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)}% OFF
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-6 bg-gradient-to-b from-white to-purple-50/50">
                      <h3 className="font-bold text-xl mb-3 line-clamp-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid={`text-featured-product-name-${product.id}`}>
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full">
                              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid={`text-featured-product-price-${product.id}`}>
                                ₹{parseFloat(product.price).toLocaleString()}
                              </span>
                            </div>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{parseFloat(product.originalPrice).toLocaleString()}
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
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <Gift className="mr-2 h-4 w-4" />
                            Add to Cart
                          </Button>
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
      <section className="py-20 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Quote className="h-6 w-6 text-white" />
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                What Our Customers Say
              </h2>
            </div>
            <p className="text-xl text-muted-foreground">Real stories from gift-givers who found the perfect presents</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Raj Kumar",
                initials: "RK",
                feedback: "Found the most beautiful anniversary gift for my wife. The personalization was perfect and delivery was super fast!",
                type: "Verified Purchase",
                color: "from-blue-500 to-purple-500"
              },
              {
                name: "Priya Singh",
                initials: "PS",
                feedback: "The corporate gifts for our clients were exceptional. Professional packaging and great quality. Highly recommend!",
                type: "Business Customer",
                color: "from-purple-500 to-pink-500"
              },
              {
                name: "Arjun Mehta",
                initials: "AM",
                feedback: "Amazing experience! The gift guide helped me find something perfect for my mother's birthday. She absolutely loved it!",
                type: "Happy Customer",
                color: "from-pink-500 to-red-500"
              }
            ].map((testimonial, index) => (
              <Card 
                key={index} 
                className="p-8 bg-white/80 backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] animate-slide-up"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className="flex items-center mb-6">
                  <div className="flex text-yellow-400 mr-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-purple-300" />
                </div>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed italic">"{testimonial.feedback}"</p>
                <div className="flex items-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center mr-4 shadow-lg`}>
                    <span className="text-white font-bold text-lg">{testimonial.initials}</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-purple-600 font-medium">{testimonial.type}</p>
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
