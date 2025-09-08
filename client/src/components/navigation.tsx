import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Search, Heart, ShoppingCart, User, Menu, Gift, LogOut, Package, Settings, LayoutDashboard, Truck } from 'lucide-react';
import CartSidebar from './cart-sidebar';
import type { Category } from '@shared/schema';

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all query caches first
      queryClient.clear();
      
      // Make logout request - server will redirect
      const response = await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
        redirect: 'follow'
      });
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out.",
      });
      
      // If we get here, the redirect didn't work, so force it
      window.location.replace('/login');
      
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
      // Force redirect on error
      window.location.replace('/login');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <div className="h-8 w-8 gift-gradient rounded-lg flex items-center justify-center">
                <Gift className="h-4 w-4 text-white" />
              </div>
              <span className="font-serif text-xl font-bold">GiftVault</span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search for perfect gifts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                  data-testid="input-search"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </form>

            {/* Navigation Actions */}
            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              <div className="relative">
                <Button variant="ghost" size="icon" asChild data-testid="button-wishlist">
                  <Link href="/wishlist">
                    <Heart className="h-5 w-5" />
                    {wishlistItems.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center" data-testid="badge-wishlist-count">
                        {wishlistItems.length}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </div>

              {/* Cart */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCartOpen(true)}
                  data-testid="button-cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center" data-testid="badge-cart-count">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || ''} />
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm">
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      {user?.mobileNumber && (
                        <p className="text-xs text-muted-foreground">{user.mobileNumber}</p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" data-testid="link-profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" data-testid="link-orders">
                        <Package className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/track-order" data-testid="link-track-order">
                        <Truck className="mr-2 h-4 w-4" />
                        Track Order
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" data-testid="link-admin-dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      data-testid="link-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild data-testid="button-login">
                  <Link href="/login">Login</Link>
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col space-y-4 mt-6">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Search gifts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                          data-testid="input-mobile-search"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </form>

                    {/* Mobile Categories */}
                    {!categoriesLoading && !categoriesError && categories.length > 0 && (
                      <>
                        <button
                          onClick={() => {
                            console.log('Mobile navigation category clicked: All Gifts');
                            setIsMobileMenuOpen(false);
                            window.location.href = '/products';
                          }}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors text-left w-full"
                          data-testid="mobile-link-category-all-gifts"
                        >
                          All Gifts
                        </button>
                        {categories.map((category: Category) => (
                          <button
                            key={category._id}
                            onClick={() => {
                              console.log('Mobile navigation category clicked:', category.name, category._id);
                              setIsMobileMenuOpen(false);
                              window.location.href = `/products?category=${category._id}`;
                            }}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors text-left w-full"
                            data-testid={`mobile-link-category-${category.slug}`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 overflow-x-auto py-3">
              {/* Categories */}
              {!categoriesLoading && !categoriesError && categories.length > 0 && (
                <>
                  <button
                    onClick={() => {
                      console.log('Navigation category clicked: All Gifts');
                      window.location.href = '/products';
                    }}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    All Gifts
                  </button>
                  {categories.map((category: Category) => (
                    <button
                      key={category._id}
                      onClick={() => {
                        console.log('Navigation category clicked:', category.name, category._id);
                        window.location.href = `/products?category=${category._id}`;
                      }}
                      className={`text-sm font-medium transition-colors ${
                        location.includes(`category=${category._id}`)
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                      data-testid={category.slug}
                    >
                      {category.name}
                    </button>
                  ))}
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
