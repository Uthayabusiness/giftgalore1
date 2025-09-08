import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { isUnauthorizedError } from '../lib/authUtils';

interface WishlistItem {
  _id: string;
  userId: string;
  productId: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: string;
    originalPrice?: string;
    images?: string[];
    description?: string;
  };
  createdAt: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  checkWishlistStatus: (productId: string) => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['/api/wishlist'],
    enabled: isAuthenticated,
    retry: false,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest('POST', '/api/wishlist', { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: "Added to Wishlist",
        description: "Item has been added to your wishlist",
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
      
      const errorMessage = error?.response?.data?.message || "Failed to add to wishlist";
      
      if (errorMessage.includes('already in your wishlist')) {
        toast({
          title: "Already in Wishlist",
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

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest('DELETE', `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your wishlist",
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
      
      const errorMessage = error?.response?.data?.message || "Failed to remove from wishlist";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const addToWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to wishlist",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
    await addToWishlistMutation.mutateAsync(productId);
  };

  const removeFromWishlist = async (productId: string) => {
    await removeFromWishlistMutation.mutateAsync(productId);
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => String(item.productId) === productId);
  };

  const checkWishlistStatus = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await apiRequest('GET', `/api/wishlist/check/${productId}`);
      const data = await response.json();
      return data.isInWishlist;
    } catch (error) {
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        checkWishlistStatus,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
