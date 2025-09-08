import { useState } from 'react';
import Navigation from '@/components/navigation';
import HeroSection from '@/components/hero-section';
import FeaturedCategories from '@/components/featured-categories';
import GiftGuide from '@/components/gift-guide';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/footer';
import { useQuery } from '@tanstack/react-query';
import { Gift, Star, Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'wouter';
import type { IProduct as Product } from '@shared/schema';

export default function Landing() {
  const [isGiftGuideOpen, setIsGiftGuideOpen] = useState(false);
  
  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products', { featured: true, limit: 4 }],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection onGiftGuideClick={() => setIsGiftGuideOpen(true)} />
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product: any) => (
              <Card key={product.id} className="product-card overflow-hidden card-hover relative group" data-testid={`card-featured-product-${product.id}`}>
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative">
                    <img
                      src={product.images?.[0] || '/placeholder-image.jpg'}
                      alt={product.name}
                      className="w-full h-48 object-contain bg-white"
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
        </div>
      </section>

      {/* Gift Guide Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6">Not Sure What to Give?</h2>
            <p className="text-lg text-muted-foreground mb-8">Let our gift guide help you find the perfect present</p>
            
            <Card className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 gift-gradient rounded-full flex items-center justify-center">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Tell us about them</h3>
                  <p className="text-sm text-muted-foreground">Age, interests, relationship</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-accent rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Get recommendations</h3>
                  <p className="text-sm text-muted-foreground">Personalized suggestions</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Perfect gift found</h3>
                  <p className="text-sm text-muted-foreground">Make someone happy</p>
                </div>
              </div>
              
              <Button 
                className="gift-gradient hover:opacity-90" 
                size="lg" 
                data-testid="button-start-gift-guide"
                onClick={() => setIsGiftGuideOpen(true)}
              >
                <Gift className="mr-2 h-4 w-4" />
                Start Gift Guide
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 gift-gradient text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Ready to Find the Perfect Gift?
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who found the perfect gifts for their loved ones
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" data-testid="button-cta-login">
              <a href="/login">
                <Gift className="mr-2 h-4 w-4" />
                Get Started
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" data-testid="button-cta-browse">
              <Link href="/products">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Browse Gifts
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Gift Guide Modal */}
      <GiftGuide 
        isOpen={isGiftGuideOpen} 
        onClose={() => setIsGiftGuideOpen(false)} 
      />
    </div>
  );
}
