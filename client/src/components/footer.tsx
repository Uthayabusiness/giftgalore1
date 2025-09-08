import { Link } from 'wouter';
import { Gift, Facebook, Twitter, Instagram, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isAdminCreated: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Footer() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
    retry: false,
  });
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 gift-gradient rounded-lg flex items-center justify-center">
                <Gift className="h-4 w-4 text-white" />
              </div>
              <span className="font-serif text-xl font-bold">GiftVault</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Making every occasion special with thoughtfully curated gifts that create lasting memories.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <p><strong>Email:</strong> uthayabusiness@gmail.com</p>
              <p><strong>Phone:</strong> +91 9626804123</p>
              <p><strong>Address:</strong> Tamil Nadu, India</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" data-testid="link-facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-instagram">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-pinterest">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">
                  Contact
                </Link>
              </li>
              <li>
                <Button variant="link" asChild className="p-0 text-muted-foreground hover:text-foreground h-auto font-normal" data-testid="button-gift-guide">
                  <Link href="/">Gift Guide</Link>
                </Button>
              </li>
              <li>
                <Link href="/track-order" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-track-order">
                  Track Order
                </Link>
              </li>
                          <li>
              <Button variant="link" asChild className="p-0 text-muted-foreground hover:text-foreground h-auto font-normal" data-testid="button-returns">
                <Link href="/refund-cancellation-policy">Returns</Link>
              </Button>
            </li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse"></div>
              </div>
            ) : categories.length > 0 ? (
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category._id}>
                    <button
                      onClick={() => {
                        console.log('Footer category clicked:', category.name, category._id);
                        window.location.href = `/products?category=${category._id}`;
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors text-left" 
                      data-testid={`link-${category.slug}-gifts`}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No categories available</p>
            )}
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-4">
              Get the latest gift ideas and exclusive offers
            </p>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-muted border-border"
                data-testid="input-newsletter-email"
              />
              <Button className="w-full gift-gradient hover:opacity-90" data-testid="button-newsletter-subscribe">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            &copy; 2024 GiftVault. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Button variant="link" asChild className="text-muted-foreground hover:text-foreground text-sm p-0 h-auto" data-testid="link-privacy-policy">
              <Link href="/privacy-policy">Privacy Policy</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-foreground text-sm p-0 h-auto" data-testid="link-terms-of-service">
              <Link href="/terms-of-service">Terms of Service</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-foreground text-sm p-0 h-auto" data-testid="link-refund-cancellation-policy">
              <Link href="/refund-cancellation-policy">Refund & Cancellation Policy</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-foreground text-sm p-0 h-auto" data-testid="link-shipping-info">
              <Link href="/shipping-info">Shipping Info</Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
