import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Gift,
  BarChart3,
  Bell
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      // Clear all query caches first
      queryClient.clear();
      
      // Make logout request - server will redirect
      const response = await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
        redirect: 'follow'
      });
      
      // If we get here, the redirect didn't work, so force it
      window.location.replace('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect on error
      window.location.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const sidebarItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      disabled: false,
    },
    {
      title: 'Categories',
      href: '/admin/categories',
      icon: Package,
      disabled: false,
    },
    {
      title: 'Products',
      href: '/admin/products',
      icon: Package,
      disabled: false,
    },
    {
      title: 'Orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      disabled: false,
    },
    {
      title: 'Customers',
      href: '/admin/customers',
      icon: Users,
      disabled: false,
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      disabled: true,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <div className="h-8 w-8 gift-gradient rounded-lg flex items-center justify-center">
                <Gift className="h-4 w-4 text-white" />
              </div>
              <span className="font-serif text-xl font-bold">GiftVault Admin</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              disabled={isLoggingOut}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-muted/30">
          <div className="p-6">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.disabled ? '#' : item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location === item.href
                      ? 'bg-primary text-primary-foreground'
                      : item.disabled
                      ? 'text-muted-foreground cursor-not-allowed'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  data-testid={`link-admin-${item.title.toLowerCase()}`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {item.disabled && (
                    <span className="text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded">
                      Soon
                    </span>
                  )}
                </Link>
              ))}
            </nav>
            
            <Separator className="my-6" />
            
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild data-testid="link-view-store">
                <Link href="/">
                  <Gift className="h-4 w-4 mr-3" />
                  View Store
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
