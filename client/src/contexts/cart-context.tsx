import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: {
    _id: string;
    id?: string;
    name: string;
    price: string;
    images: string[];
    hasDeliveryCharge: boolean;
    deliveryCharge: number;
  };
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
    retry: false,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      return await apiRequest('POST', '/api/cart', { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
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
      
      // Get the error message from the response
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to add item to cart";
      
      // Check for specific error types
      if (errorMessage.includes('Cannot add') || errorMessage.includes('Insufficient stock')) {
        toast({
          title: "Limited Stock Available",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (errorMessage.includes('Minimum order quantity')) {
        toast({
          title: "Minimum Order Quantity",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (errorMessage.includes('BSONError') || errorMessage.includes('24 character hex string')) {
        toast({
          title: "Invalid Product ID",
          description: "The product ID format is invalid. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      return await apiRequest('PUT', `/api/cart/${productId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
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
      
      // Get the error message from the response
      const errorMessage = error?.response?.data?.message || "Failed to update cart item";
      
      // Check for specific error types
      if (errorMessage.includes('Cannot add') || errorMessage.includes('Cannot set quantity') || errorMessage.includes('Insufficient stock')) {
        toast({
          title: "Limited Stock Available",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (errorMessage.includes('Minimum order quantity') || errorMessage.includes('Cannot reduce quantity')) {
        toast({
          title: "Minimum Order Quantity",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest('DELETE', `/api/cart/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
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
      
      // Get the error message from the response
      const errorMessage = error?.response?.data?.message || "Failed to remove item from cart";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', '/api/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
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
      
      // Get the error message from the response
      const errorMessage = error?.response?.data?.message || "Failed to clear cart";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const totalItems = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum: number, item: CartItem) => {
    return sum + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const contextValue: CartContextType = {
    items,
    isLoading,
    addToCart: (productId: string, quantity = 1) => {
      addToCartMutation.mutate({ productId, quantity });
    },
    updateQuantity: (productId: string, quantity: number) => {
      updateQuantityMutation.mutate({ productId, quantity });
    },
    removeFromCart: (productId: string) => {
      console.log('Attempting to remove product from cart:', productId);
      removeFromCartMutation.mutate(productId);
    },
    clearCart: () => {
      clearCartMutation.mutate();
    },
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
