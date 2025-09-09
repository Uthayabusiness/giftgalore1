import { useEffect } from 'react';
import { Link } from 'wouter';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, X, ArrowRight, Gift, Trash2 } from 'lucide-react';

export default function Cart() {
  const { items, isLoading, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="font-serif text-3xl font-bold">Shopping Cart</h1>
          <span className="text-muted-foreground">({totalItems} items)</span>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="font-serif text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any gifts yet. Explore our collection and find the perfect presents!
            </p>
            <Button asChild size="lg" className="gift-gradient" data-testid="button-continue-shopping">
              <Link href="/products">
                <Gift className="mr-2 h-5 w-5" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Items in your cart</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive"
                  data-testid="button-clear-cart"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>

              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden" data-testid={`cart-item-${item.productId}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={item.product.images?.[0] || '/placeholder-image.jpg'}
                        alt={item.product.name}
                        className="w-24 h-24 object-contain bg-white rounded-lg border"
                        data-testid={`img-cart-item-${item.productId}`}
                      />
                      
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
                            <span className="text-lg font-bold text-primary" data-testid={`text-price-${item.productId}`}>
                              ₹{parseFloat(item.product.price).toLocaleString()}
                            </span>
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
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
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
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-12 text-center font-semibold" data-testid={`text-quantity-${item.productId}`}>
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className={`h-8 w-8 ${item.quantity >= ((item.product as any).stock || 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => handleQuantityChange(item.productId, item.quantity, 1, (item.product as any).stock || 0)}
                                disabled={item.quantity >= ((item.product as any).stock || 0) || (item.product as any).stock === 0}
                                data-testid={`button-increase-${item.productId}`}
                                title={(item.product as any).stock === 0 ? 'Out of stock' : item.quantity >= (item.product as any).stock ? 'Maximum quantity reached' : 'Increase quantity'}
                              >
                                <Plus className="h-3 w-3" />
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
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({totalItems} items)</span>
                    <span data-testid="text-subtotal">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span data-testid="text-shipping">
                      {shippingFee === 0 ? 'Free' : `₹${shippingFee}`}
                    </span>
                  </div>
                  
                  {shippingFee > 0 && (
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      Delivery charges apply to some items
                    </div>
                  )}
                  {shippingFee === 0 && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                      Free delivery on all items!
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span data-testid="text-final-total">₹{finalTotal.toLocaleString()}</span>
                  </div>
                  
                  <Button
                    asChild
                    className="w-full gift-gradient hover:opacity-90"
                    size="lg"
                    data-testid="button-proceed-checkout"
                  >
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    data-testid="button-continue-shopping-summary"
                  >
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                  
                  {/* Features */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Gift className="h-3 w-3" />
                      <span>Free gift wrapping</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShoppingCart className="h-3 w-3" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3" />
                      <span>Easy returns</span>
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
