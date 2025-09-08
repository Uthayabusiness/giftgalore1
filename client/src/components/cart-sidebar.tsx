import { Link } from 'wouter';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, X, Lock } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const { toast } = useToast();

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number, stock: number, minOrderQuantity: number = 1) => {
    const newQuantity = currentQuantity + change;
    const minQty = minOrderQuantity || 1;
    
    if (newQuantity >= minQty && newQuantity <= stock) {
      updateQuantity(productId, newQuantity);
    } else if (newQuantity < minQty) {
      toast({
        title: "Minimum Order Quantity",
        description: `Cannot reduce below minimum order quantity of ${minQty} items.`,
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-96 sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Shopping Cart
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-cart">
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-muted-foreground mb-4">Your cart is empty</div>
            <Button asChild onClick={onClose} data-testid="button-continue-shopping">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Cart Items - Scrollable Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="space-y-4 mt-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4" data-testid={`cart-item-${item.productId}`}>
                      <img
                        src={item.product.images?.[0] || '/placeholder-image.jpg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-contain bg-white rounded-lg border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate" data-testid={`text-item-name-${item.productId}`}>
                          {item.product.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleQuantityChange(
                                item.productId, 
                                item.quantity, 
                                -1, 
                                (item.product as any).stock || 0, 
                                (item.product as any).minOrderQuantity || 1
                              )}
                              data-testid={`button-decrease-${item.productId}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm w-8 text-center" data-testid={`text-quantity-${item.productId}`}>
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className={`h-6 w-6 ${item.quantity >= ((item.product as any).stock || 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => handleQuantityChange(item.productId, item.quantity, 1, (item.product as any).stock || 0)}
                              disabled={item.quantity >= ((item.product as any).stock || 0) || (item.product as any).stock === 0}
                              data-testid={`button-increase-${item.productId}`}
                              title={(item.product as any).stock === 0 ? 'Out of stock' : item.quantity >= (item.product as any).stock ? 'Maximum quantity reached' : 'Increase quantity'}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm" data-testid={`text-price-${item.productId}`}>
                              ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(item.productId)}
                              data-testid={`button-remove-${item.productId}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {items.length > 3 && (
                <div className="text-center text-xs text-muted-foreground mt-2 pb-2">
                  Scroll to see more items
                </div>
              )}
            </div>

            {/* Total and Checkout - Fixed at Bottom */}
            <div className="mt-6 pt-4 border-t bg-background sticky bottom-0 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary" data-testid="text-total-price">
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>
              <Button
                asChild
                className="w-full gift-gradient hover:opacity-90 text-white font-semibold py-3"
                onClick={onClose}
                data-testid="button-checkout"
              >
                <Link href="/checkout">
                  <Lock className="mr-2 h-4 w-4" />
                  Secure Checkout
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
