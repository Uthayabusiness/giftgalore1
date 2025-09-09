import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, X, ArrowRight, Gift, Trash2, Sparkles, Heart, Shield, Truck } from 'lucide-react';

// Animated Background Component for Cart
function CartAnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"></div>
      
      {/* Floating Shopping Icons */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-purple-300 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
    </div>
  );
}

export default function Cart() {
  const { items, isLoading, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number, stock: number, minOrderQuantity: number = 1) => {
    const newQuantity = currentQuantity + change;
    const minQty = minOrderQuantity || 1;
    
    if (newQuantity >= minQty && newQuantity <= stock) {
      updateQuantity(productId, newQuantity);
    } else if (newQuantity < minQty) {
      toast({
        title: "Minimum Order Quantity",
        description: `Minimum order quantity for this item is ${minQty}.`,
        variant: "destructive",
      });
    } else if (newQuantity > stock) {
      toast({
        title: "Limited Stock",
        description: `Only ${stock} items available in stock.`,
        variant: "destructive",
      });
    }
  };

  // Calculate delivery charges based on individual products
  const deliveryFee = items.reduce((total, item) => {
    // Only add delivery charge if both hasDeliveryCharge is true AND deliveryCharge exists
    if (item.product.hasDeliveryCharge && item.product.deliveryCharge) {
      return total + parseFloat(item.product.deliveryCharge.toString());
    }
    return total;
  }, 0);
  
  const shippingFee = deliveryFee;
  const finalTotal = totalPrice + shippingFee;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <CartAnimatedBackground />
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12 animate-fade-in">
          <div className="relative">
            <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-ping"></div>
            <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-yellow-400 animate-spin" style={{animationDuration: '3s'}} />
          </div>
          <div>
            <h1 className="font-serif text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-20 animate-fade-in-delay">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-16 w-16 text-purple-600 animate-bounce" />
              </div>
            </div>
            <h2 className="font-serif text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your cart is empty
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
              Looks like you haven't added any gifts yet. Explore our collection and find the perfect presents for your loved ones! 🎁
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-lg px-8 py-6" data-testid="button-continue-shopping">
              <Link href="/products">
                <Gift className="mr-3 h-6 w-6" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center animate-slide-up">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Items in your cart
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive border-destructive hover:bg-destructive hover:text-white transition-all duration-300 transform hover:scale-105"
                  data-testid="button-clear-cart"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>

              {items.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden bg-white/80 backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] animate-slide-up" 
                  style={{animationDelay: `${index * 0.1}s`}}
                  data-testid={`cart-item-${item.productId}`}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="relative group">
                      <img
                        src={item.product.images?.[0] || '/placeholder-image.jpg'}
                        alt={item.product.name}
                          className="w-28 h-28 object-contain bg-white rounded-xl border-2 border-purple-100 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105"
                        data-testid={`img-cart-item-${item.productId}`}
                      />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg truncate pr-4" data-testid={`text-item-name-${item.productId}`}>
                            {item.product.name}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.productId)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-remove-${item.productId}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full">
                              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid={`text-price-${item.productId}`}>
                              ₹{parseFloat(item.product.price).toLocaleString()}
                            </span>
                            </div>
                            <span className="text-sm text-muted-foreground">each</span>
                          </div>
                          
                          {/* Stock and Minimum Order information */}
                          <div className="text-sm text-muted-foreground">
                            {(item.product as any).stock > 0 ? (
                              <>
                                Stock: {(item.product as any).stock} available
                                {item.quantity >= (item.product as any).stock && (
                                  <span className="ml-2 text-orange-600 font-medium">(Max quantity reached)</span>
                                )}
                                {(item.product as any).minOrderQuantity && (item.product as any).minOrderQuantity > 1 && (
                                  <div className="text-blue-600 font-medium">
                                    Min order: {(item.product as any).minOrderQuantity} items
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-red-600 font-medium">Out of stock</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded-xl border border-purple-100">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 bg-white hover:bg-purple-100 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-110"
                                onClick={() => handleQuantityChange(
                                  item.productId, 
                                  item.quantity, 
                                  -1, 
                                  (item.product as any).stock || 0, 
                                  (item.product as any).minOrderQuantity || 1
                                )}
                                disabled={item.quantity <= ((item.product as any).minOrderQuantity || 1)}
                                data-testid={`button-decrease-${item.productId}`}
                              >
                                <Minus className="h-4 w-4 text-purple-600" />
                              </Button>
                              <span className="w-16 text-center font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid={`text-quantity-${item.productId}`}>
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className={`h-10 w-10 bg-white hover:bg-pink-100 border-pink-200 hover:border-pink-300 transition-all duration-300 transform hover:scale-110 ${item.quantity >= ((item.product as any).stock || 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => handleQuantityChange(item.productId, item.quantity, 1, (item.product as any).stock || 0)}
                                disabled={item.quantity >= ((item.product as any).stock || 0) || (item.product as any).stock === 0}
                                data-testid={`button-increase-${item.productId}`}
                                title={(item.product as any).stock === 0 ? 'Out of stock' : item.quantity >= (item.product as any).stock ? 'Maximum quantity reached' : 'Increase quantity'}
                              >
                                <Plus className="h-4 w-4 text-pink-600" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-bold text-lg" data-testid={`text-item-total-${item.productId}`}>
                                ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-white/90 backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-slide-up-delay">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Gift className="h-5 w-5 text-white" />
                    </div>
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <span className="font-medium text-blue-800">Subtotal ({totalItems} items)</span>
                      <span className="font-bold text-blue-900" data-testid="text-subtotal">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <span className="font-medium text-green-800">Shipping</span>
                      <span className="font-bold text-green-900" data-testid="text-shipping">
                      {shippingFee === 0 ? 'Free' : `₹${shippingFee}`}
                    </span>
                  </div>
                  
                  {shippingFee > 0 && (
                      <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <Truck className="h-4 w-4 inline mr-2" />
                      Delivery charges apply to some items
                    </div>
                  )}
                  {shippingFee === 0 && (
                      <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                        <Gift className="h-4 w-4 inline mr-2" />
                      Free delivery on all items!
                    </div>
                  )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-200">
                    <span className="text-xl font-bold text-purple-800">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid="text-final-total">₹{finalTotal.toLocaleString()}</span>
                  </div>
                  
                  <Button
                    asChild
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-lg font-semibold"
                    size="lg"
                    data-testid="button-proceed-checkout"
                  >
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Link>
                  </Button>
                  
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-12 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 transform hover:scale-105"
                    data-testid="button-continue-shopping-summary"
                  >
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                  
                  {/* Features */}
                  <div className="space-y-3 pt-6 border-t border-purple-200">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Gift className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-green-800">Free gift wrapping</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-blue-800">Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-purple-800">Easy returns</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
