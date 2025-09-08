import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { upload } from "./cloudinary";
import { z } from "zod";
import mongoose from "mongoose";
import { Order } from "@shared/schema";
import { databaseDiagnostics, testUserCreation, testAuthentication, clearAllSessions, checkSpecificUser } from "./diagnostics";
import { cashfreeService, CreateOrderRequest } from "./cashfree-service";

// Validation schemas
const insertCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

const insertProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  images: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
  minOrderQuantity: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

const insertCartSchema = z.object({
  userId: z.string().optional(),
  productId: z.string().min(1),
  quantity: z.number().int().min(1).optional(),
});

const insertOrderSchema = z.object({
  userId: z.string().min(1),
  orderNumber: z.string().min(1),
  status: z.string().optional(),
  total: z.number().positive(),
  shippingAddress: z.any(),
  paymentId: z.string().optional(),
  paymentStatus: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {



  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/admin-created', async (req, res) => {
    try {
      const categories = await storage.getAdminCreatedCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching admin-created categories:", error);
      res.status(500).json({ message: "Failed to fetch admin-created categories" });
    }
  });

  app.post('/api/categories', isAdmin, async (req: any, res) => {
    try {

      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/categories/:id', isAdmin, async (req: any, res) => {
    try {

      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/categories/:id', isAdmin, async (req: any, res) => {
    try {

      await storage.deleteCategory(req.params.id);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { categoryId, search, featured, limit, offset, admin } = req.query;
      
      console.log('Products API called with query params:', req.query);
      console.log('Admin parameter:', admin);
      
      // If admin=true, get all products (including inactive ones)
      if (admin === 'true') {
        console.log('Using getAllProducts (admin mode)');
        const allProducts = await storage.getAllProducts({
          categoryId: categoryId as string,
          search: search as string,
          featured: featured === 'true',
          limit: limit ? parseInt(limit as string) : undefined,
          offset: offset ? parseInt(offset as string) : undefined,
        });
        console.log('All products returned:', allProducts.length);
        return res.json(allProducts);
      }
      
      // Regular users only see active products
      console.log('Using getProducts (regular mode)');
      const products = await storage.getProducts({
        categoryId: categoryId as string,
        search: search as string,
        featured: featured === 'true',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      console.log('Active products returned:', products.length);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get('/api/products/slug/:slug', async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAdmin, async (req: any, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Convert categoryIds strings to ObjectIds
      if (productData.categoryIds) {
        (productData as any).categoryIds = productData.categoryIds.map(id => new mongoose.Types.ObjectId(id));
      }
      
      const product = await storage.createProduct(productData as any);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAdmin, async (req: any, res) => {
    try {
      console.log('Update product request for ID:', req.params.id);
      console.log('Request body:', req.body);
      
      const productData = insertProductSchema.partial().parse(req.body);
      console.log('Parsed product data:', productData);
      
      // Convert categoryIds strings to ObjectIds
      if (productData.categoryIds) {
        (productData as any).categoryIds = productData.categoryIds.map(id => new mongoose.Types.ObjectId(id));
      }
      
      const product = await storage.updateProduct(req.params.id, productData as any);
      console.log('Updated product:', product);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAdmin, async (req: any, res) => {
    try {

      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Admin-specific endpoint for getting all products
  app.get('/api/admin/products', isAdmin, async (req, res) => {
    try {
      console.log('=== ADMIN PRODUCTS ENDPOINT CALLED ===');
      const { categoryId, search, featured, limit, offset } = req.query;
      console.log('Admin products endpoint called with params:', req.query);
      
      console.log('About to call storage.getAllProducts...');
      const allProducts = await storage.getAllProducts({
        categoryId: categoryId as string,
        search: search as string,
        featured: featured === 'true',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      
      console.log('Storage returned products:', allProducts);
      console.log('Admin products endpoint returning:', allProducts.length, 'products');
      
      // Let's also check what's in the database directly
      const { Product } = await import('@shared/schema');
      const totalProducts = await Product.countDocuments({});
      console.log('Total products in database (direct query):', totalProducts);
      
      const sampleProducts = await Product.find({}).limit(3);
      console.log('Sample products from database:', sampleProducts.map(p => ({ id: p._id, name: p.name, isActive: p.isActive })));
      
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ message: "Failed to fetch admin products" });
    }
  });

  // Test endpoint to check database directly
  app.get('/api/test/products', async (req, res) => {
    try {
      console.log('=== TEST PRODUCTS ENDPOINT CALLED ===');
      const { Product } = await import('@shared/schema');
      
      const totalProducts = await Product.countDocuments({});
      console.log('Total products in database:', totalProducts);
      
      const allProducts = await Product.find({}).limit(5);
      console.log('All products found:', allProducts.length);
      console.log('Sample products:', allProducts.map(p => ({ id: p._id, name: p.name, isActive: p.isActive })));
      
      res.json({ totalProducts, products: allProducts });
    } catch (error) {
      console.error("Error in test endpoint:", error);
      res.status(500).json({ message: "Test failed", error: (error as Error).message });
    }
  });

  // Simple test endpoint
  app.get('/api/debug/products', async (req, res) => {
    try {
      console.log('=== DEBUG ENDPOINT CALLED ===');
      res.json({ message: 'Debug endpoint working', timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const cartData = insertCartSchema.parse({ ...req.body, userId: user._id.toString() });
      const cartItem = await storage.addToCart({
        ...cartData,
        userId: new mongoose.Types.ObjectId(cartData.userId),
        productId: new mongoose.Types.ObjectId(cartData.productId)
      });
      res.json(cartItem);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      
      // Check if it's a stock validation error or cart quantity error
      if (error.message && (error.message.includes('Insufficient stock') || error.message.includes('Cannot add') || error.message.includes('Minimum order quantity'))) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to add to cart" });
      }
    }
  });

  app.put('/api/cart/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(userId, req.params.productId, quantity);
      res.json(cartItem);
    } catch (error: any) {
      console.error("Error updating cart item:", error);
      
      // Check if it's a stock validation error or quantity error
      if (error.message && (error.message.includes('Insufficient stock') || error.message.includes('Cannot set quantity') || error.message.includes('Cannot reduce quantity') || error.message.includes('Minimum order quantity'))) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update cart item" });
      }
    }
  });

  app.delete('/api/cart/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const productId = req.params.productId;
      console.log('Removing from cart - User ID:', userId, 'Product ID:', productId);
      await storage.removeFromCart(userId, productId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to remove from cart";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to clear cart";
      res.status(500).json({ message: errorMessage });
    }
  });

  // Cleanup invalid cart items
  app.post('/api/cart/cleanup', async (req: any, res) => {
    try {
      await storage.cleanupInvalidCartItems();
      res.json({ message: "Invalid cart items cleaned up" });
    } catch (error) {
      console.error("Error cleaning up cart items:", error);
      res.status(500).json({ message: "Failed to cleanup cart items" });
    }
  });

  // Wishlist routes
  app.get('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const wishlistItems = await storage.getWishlistItems(userId);
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      const wishlistItem = await storage.addToWishlist(userId, productId);
      res.json(wishlistItem);
    } catch (error: any) {
      console.error("Error adding to wishlist:", error);
      
      if (error.message && error.message.includes('already in your wishlist')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to add to wishlist" });
      }
    }
  });

  app.delete('/api/wishlist/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const productId = req.params.productId;
      await storage.removeFromWishlist(userId, productId);
      res.json({ message: "Item removed from wishlist" });
    } catch (error: any) {
      console.error("Error removing from wishlist:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to remove from wishlist";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get('/api/wishlist/check/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const productId = req.params.productId;
      const isInWishlist = await storage.isInWishlist(userId, productId);
      res.json({ isInWishlist });
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      res.status(500).json({ message: "Failed to check wishlist status" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const user = await storage.getUser(userId);
      
      // Admin can see all orders, users see only their orders
      let orders = await storage.getOrders(user?.role === 'admin' ? undefined : userId);
      
      // Automatically populate missing items for all orders
      const populatedOrders = await Promise.all(
        orders.map(async (order) => {
          // If order already has items, return as is
          if (order.items && order.items.length > 0) {
            console.log(`✅ Order ${order.orderNumber} already has ${order.items.length} items`);
            return order;
          }
          
          // If order doesn't have items, try to reconstruct them
          try {
            console.log(`🔄 Auto-populating items for order ${order.orderNumber} (total: ${order.total})`);
            const orderItems = await tryReconstructRealProducts(order.total);
            
            console.log(`📦 Reconstructed items for order ${order.orderNumber}:`, orderItems);
            
            // Update the order in the database
            const updateResult = await Order.findByIdAndUpdate(order._id, {
              items: orderItems,
              updatedAt: new Date()
            }, { new: true });
            
            console.log(`✅ Database update result for order ${order.orderNumber}:`, updateResult);
            
            // Return the updated order
            const updatedOrder = {
              ...order.toObject(),
              items: orderItems
            };
            
            console.log(`✅ Updated order ${order.orderNumber} with items:`, updatedOrder.items);
            return updatedOrder;
          } catch (error) {
            console.error(`❌ Failed to auto-populate order ${order.orderNumber}:`, error);
            
            // For debugging, return a simple test item
            const testItem = {
              productId: new mongoose.Types.ObjectId(),
              productName: `Test Product for Order ${order.orderNumber}`,
              productImage: '/placeholder-image.jpg',
              price: order.total,
              quantity: 1,
              isReconstructed: true
            };
            
            console.log(`🔧 Returning test item for debugging:`, testItem);
            return {
              ...order.toObject(),
              items: [testItem]
            };
          }
        })
      );
      
      console.log(`🚀 Sending ${populatedOrders.length} orders to frontend`);
      populatedOrders.forEach((order, index) => {
        console.log(`Order ${index + 1}: ${order.orderNumber} - Items: ${order.items?.length || 0}`);
      });
      
      res.json(populatedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const user = await storage.getUser(userId);
      const order = await storage.getOrderById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Users can only see their own orders, admins can see all
      if (user?.role !== 'admin' && order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Get order by order number (for tracking - no authentication required)
  app.get('/api/orders/track/:orderNumber', async (req, res) => {
    try {
      const order = await storage.getOrderByOrderNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Return basic order info for tracking (no sensitive data)
      const trackingInfo = {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        total: order.total,
        shippingAddress: {
          city: order.shippingAddress?.city,
          state: order.shippingAddress?.state,
          pincode: order.shippingAddress?.pincode
        },
        additionalInfo: order.additionalInfo
      };

      res.json(trackingInfo);
    } catch (error) {
      console.error("Error fetching order for tracking:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      console.log('📝 Order creation request received');
      const userId = req.user._id;
      const { items, shippingAddress } = req.body;
      
      console.log('👤 User ID:', userId);
      console.log('📦 Request body:', { items, shippingAddress });
      
      // Get cart items to create order
      const cartItems = await storage.getCartItems(userId);
      console.log('🛍️ Cart items:', cartItems);
      
      if (cartItems.length === 0) {
        console.log('❌ Cart is empty');
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate total
      const total = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.product.price.toString());
        return sum + (price * item.quantity);
      }, 0);

      // Prepare order items data
      const orderItems = cartItems.map(item => ({
        productId: new mongoose.Types.ObjectId(item.productId.toString()),
        productName: item.product.name,
        productImage: item.product.images?.[0] || '/placeholder-image.jpg',
        price: parseFloat(item.product.price.toString()),
        quantity: item.quantity
      }));

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Create order
      const orderData = {
        userId,
        orderNumber,
        total: total,
        items: orderItems,
        shippingAddress,
        status: "pending" as const,
      };

      const order = await storage.createOrder(orderData);
      console.log('✅ Order created successfully:', order);

      // Clear cart
      await storage.clearCart(userId);
      console.log('🛒 Cart cleared');

      res.json({ success: true, order });
    } catch (error) {
      console.error("❌ Error creating order:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id/status', isAdmin, async (req: any, res) => {
    try {
      const { status, notes } = req.body;
      const userId = req.user._id;
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      
      console.log('🔧 Server: Updating order status:', { orderId: req.params.id, status, notes });
      const order = await storage.updateOrderStatus(req.params.id, status, userId, userName, notes);
      console.log('🔧 Server: Order after update:', { 
        id: order._id, 
        status: order.status, 
        statusType: typeof order.status,
        orderNumber: order.orderNumber 
      });
      console.log('🔧 Server: Order status in response:', order.status);
      console.log('🔧 Server: Order status type:', typeof order.status);
      console.log('🔧 Server: Order ID in response:', order._id);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.put('/api/orders/:id/additional-info', isAdmin, async (req: any, res) => {
    try {
      const { additionalInfo } = req.body;
      const userId = req.user._id;
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      
      const order = await storage.updateOrderAdditionalInfo(req.params.id, additionalInfo, userName);
      res.json(order);
    } catch (error) {
      console.error("Error updating order additional info:", error);
      res.status(500).json({ message: "Failed to update additional information" });
    }
  });

  app.delete('/api/orders/:id/additional-info', isAdmin, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      
      const order = await storage.clearOrderAdditionalInfo(req.params.id, userName);
      res.json(order);
    } catch (error) {
      console.error("Error clearing order additional info:", error);
      res.status(500).json({ message: "Failed to clear additional information" });
    }
  });

  // Admin migration endpoint to populate all existing orders with items
  app.post('/api/orders/migrate-items', isAdmin, async (req: any, res) => {
    try {
      console.log('🔄 Starting admin order items migration...');
      
      // Get all orders without items
      const ordersWithoutItems = await Order.find({ 
        $or: [
          { items: { $exists: false } },
          { items: { $size: 0 } }
        ]
      });
      
      console.log(`Found ${ordersWithoutItems.length} orders without items`);
      
      let migratedCount = 0;
      
      for (const order of ordersWithoutItems) {
        try {
          const orderItems = await tryReconstructRealProducts(order.total);
          
          await Order.findByIdAndUpdate(order._id, {
            items: orderItems,
            updatedAt: new Date()
          });
          
          migratedCount++;
          console.log(`✅ Admin migrated order ${order.orderNumber} with ${orderItems.length} items`);
        } catch (error) {
          console.error(`❌ Failed to migrate order ${order.orderNumber}:`, error);
        }
      }
      
      console.log(`🔄 Admin migration completed. ${migratedCount} orders updated.`);
      res.json({ 
        message: 'Migration completed', 
        totalOrders: ordersWithoutItems.length,
        migratedCount 
      });
    } catch (error) {
      console.error('Error during admin migration:', error);
      res.status(500).json({ message: 'Migration failed' });
    }
  });

  // User-friendly endpoint to populate a specific order with items
  app.post('/api/orders/:orderId/populate-items', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.user._id;
      
      console.log(`🔄 User ${userId} requesting to populate order ${orderId}`);
      
      if (!orderId || orderId === 'undefined') {
        return res.status(400).json({ message: 'Invalid order ID provided' });
      }
      
      // Find the specific order
      const order = await Order.findById(orderId);
      if (!order) {
        console.log(`❌ Order not found with ID: ${orderId}`);
        return res.status(404).json({ message: 'Order not found' });
      }
      
      console.log(`✅ Found order: ${order.orderNumber} with total: ${order.total}`);
      
      // Check if user owns this order or is admin
      if (order.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
        console.log(`❌ Access denied: User ${userId} trying to access order ${orderId}`);
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if order already has items
      if (order.items && order.items.length > 0) {
        console.log(`ℹ️ Order ${orderId} already has ${order.items.length} items`);
        return res.json({ 
          message: 'Order already has items', 
          migratedCount: order.items.length 
        });
      }
      
      // Try to find the original cart data or create a more honest representation
      let orderItems;
      
      // First, try to find if there are any cart items that might match this order
      const cartItems = await storage.getCartItems(userId);
      
      if (cartItems.length > 0) {
        // Use actual cart items if available
        orderItems = cartItems.map(item => ({
          productId: new mongoose.Types.ObjectId(item.productId.toString()),
          productName: item.product.name,
          productImage: item.product.images?.[0] || '/placeholder-image.jpg',
          price: parseFloat(item.product.price.toString()),
          quantity: item.quantity
        }));
        console.log(`🔄 Using actual cart items for order ${orderId}:`, orderItems);
      } else {
        // If no cart items, try to reconstruct from real products in database
        orderItems = await tryReconstructRealProducts(order.total);
        console.log(`🔄 Created reconstruction from real products for order ${orderId}:`, orderItems);
      }
      
      // Update the order
      await Order.findByIdAndUpdate(orderId, {
        items: orderItems,
        updatedAt: new Date()
      });
      
      console.log(`✅ User ${userId} successfully populated order ${orderId} with ${orderItems.length} items`);
      
      res.json({ 
        message: 'Order items populated successfully', 
        migratedCount: orderItems.length,
        items: orderItems,
        isReconstructed: cartItems.length === 0
      });
    } catch (error) {
      console.error('Error populating order items:', error);
      res.status(500).json({ message: 'Failed to populate order items' });
    }
  });

  // Helper function to create honest order items (clearly marked as reconstructed)
  function createHonestOrderItems(total: number) {
    // Create a single item that represents the total, clearly marked as reconstructed
    return [{
      productId: new mongoose.Types.ObjectId(),
      productName: `Order Total: ₹${total} (Items not available)`,
      productImage: '/placeholder-image.jpg',
      price: total,
      quantity: 1,
      isReconstructed: true
    }];
  }

  // Helper function to try to reconstruct real product details from database
  async function tryReconstructRealProducts(total: number) {
    try {
      // Try to find products that might have been in this order
      // Look for products with prices that could add up to the total
      const products = await storage.getAllProducts({});
      
      console.log(`🔍 Found ${products.length} products in database for reconstruction`);
      console.log(`🔍 Products:`, products.map(p => ({ name: p.name, price: p.price, isActive: p.isActive })));
      
      // Simple algorithm: try to find products that could reasonably make up this order
      // This is a fallback when we don't have the exact cart data
      const possibleProducts = products.filter(p => 
        p.price > 0 && p.price <= total && p.isActive
      ).sort((a, b) => b.price - a.price); // Sort by price descending
      
      console.log(`🔍 Found ${possibleProducts.length} possible products for total ${total}`);
      console.log(`🔍 Possible products:`, possibleProducts.map(p => ({ name: p.name, price: p.price })));
      
      if (possibleProducts.length > 0) {
        // Try to create a reasonable reconstruction
        let remainingTotal = total;
        const reconstructedItems = [];
        
        for (const product of possibleProducts) {
          if (remainingTotal <= 0) break;
          
          const maxQuantity = Math.floor(remainingTotal / product.price);
          if (maxQuantity > 0) {
            const quantity = Math.min(maxQuantity, 3); // Cap at 3 items per product
            const itemTotal = quantity * product.price;
            
            const item = {
              productId: product._id.toString(),
              productName: product.name,
              productImage: product.images?.[0] || '/placeholder-image.jpg',
              price: product.price,
              quantity: quantity,
              isReconstructed: true
            };
            
            console.log(`🔍 Creating item:`, item);
            reconstructedItems.push(item);
            
            remainingTotal -= itemTotal;
          }
        }
        
        console.log(`🔍 Final reconstructed items:`, reconstructedItems);
        
        if (reconstructedItems.length > 0) {
          return reconstructedItems;
        }
      }
      
      // If no products found, create a simple test item for debugging
      console.log(`🔍 No products found, creating test item for total ${total}`);
      return [{
        productId: new mongoose.Types.ObjectId(),
        productName: `Test Product for ₹${total}`,
        productImage: '/placeholder-image.jpg',
        price: total,
        quantity: 1,
        isReconstructed: true
      }];
      
    } catch (error) {
      console.error('Error trying to reconstruct real products:', error);
    }
    
    console.log(`🔍 Falling back to honest representation for total ${total}`);
    // Fallback to honest representation
    return createHonestOrderItems(total);
  }

  // Order tracking routes
  app.get('/api/orders/:id/tracking', isAdmin, async (req: any, res) => {
    try {
      console.log('Tracking history request for order ID:', req.params.id);
      console.log('User making request:', req.user);
      
      const trackingHistory = await storage.getOrderTrackingHistory(req.params.id);
      console.log('Tracking history found:', trackingHistory.length, 'entries');
      
      res.json(trackingHistory);
    } catch (error) {
      console.error("Error fetching order tracking history:", error);
      res.status(500).json({ message: "Failed to fetch tracking history" });
    }
  });

  app.get('/api/orders/tracking/recent', isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const recentUpdates = await storage.getRecentOrderUpdates(limit);
      res.json(recentUpdates);
    } catch (error) {
      console.error("Error fetching recent order updates:", error);
      res.status(500).json({ message: "Failed to fetch recent updates" });
    }
  });

  // Razorpay payment routes
  app.post('/api/payment/create-order', isAuthenticated, async (req: any, res) => {
    try {
      const { amount, currency = 'INR' } = req.body;
      
      // In a real implementation, you would integrate with Razorpay SDK here
      // For now, return a mock response
      const razorpayOrder = {
        id: `order_${Date.now()}`,
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        status: 'created',
      };

      res.json(razorpayOrder);
    } catch (error) {
      console.error("Error creating payment order:", error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  app.post('/api/payment/verify', isAuthenticated, async (req: any, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      // In a real implementation, you would verify the payment signature here
      // For now, assume payment is successful
      
      res.json({ verified: true });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Image upload route
  app.post('/api/upload', isAdmin, upload.single('image'), async (req: any, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // The file is automatically uploaded to Cloudinary by multer-storage-cloudinary
      // req.file.path contains the Cloudinary URL
      res.json({ 
        url: req.file.path,
        publicId: req.file.filename,
        message: "Image uploaded successfully" 
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Admin customers route
  app.get('/api/admin/customers', isAdmin, async (req: any, res) => {
    try {
      const customers = await storage.getUsers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // Payment routes
  app.post('/api/payments/create-order', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId, amount, customerDetails, returnUrl } = req.body;
      
      if (!orderId || !amount || !customerDetails || !returnUrl) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const orderData: CreateOrderRequest = {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerDetails.customerId || req.user.id,
          customer_name: customerDetails.customerName,
          customer_email: customerDetails.customerEmail,
          customer_phone: customerDetails.customerPhone,
        },
        order_meta: {
          return_url: returnUrl,
          notify_url: `https://giftgalore-jfnb.onrender.com/api/payments/webhook`,
        },
        order_note: `Order for ${customerDetails.customerName}`,
      };

      const cashfreeOrder = await cashfreeService.createOrder(orderData);
      
      res.json({
        success: true,
        order: cashfreeOrder,
        paymentSessionId: cashfreeOrder.payment_session_id,
      });
    } catch (error) {
      console.error('Error creating payment order:', error);
      res.status(500).json({ message: 'Failed to create payment order' });
    }
  });

  app.get('/api/payments/order/:orderId', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const order = await cashfreeService.getOrder(orderId);
      res.json({ success: true, order });
    } catch (error) {
      console.error('Error fetching payment order:', error);
      res.status(500).json({ message: 'Failed to fetch payment order' });
    }
  });

  app.post('/api/payments/capture/:orderId', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const { amount } = req.body;
      
      const result = await cashfreeService.capturePayment(orderId, amount);
      res.json({ success: true, result });
    } catch (error) {
      console.error('Error capturing payment:', error);
      res.status(500).json({ message: 'Failed to capture payment' });
    }
  });

  app.post('/api/payments/refund/:orderId', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const { refundAmount, refundNote } = req.body;
      
      const result = await cashfreeService.createRefund(orderId, refundAmount, refundNote);
      res.json({ success: true, result });
    } catch (error) {
      console.error('Error creating refund:', error);
      res.status(500).json({ message: 'Failed to create refund' });
    }
  });

  // Payment webhook for Cashfree notifications
  app.post('/api/payments/webhook', async (req, res) => {
    try {
      const webhookData = req.body;
      console.log('🔔 Cashfree webhook received:', {
        type: webhookData.type,
        timestamp: new Date().toISOString(),
        data: webhookData.data
      });
      
      // Handle different webhook events
      switch (webhookData.type) {
        case 'PAYMENT_SUCCESS_WEBHOOK':
          {
            const { order_id, payment_status, payment_amount, payment_method } = webhookData.data;
            console.log(`✅ Payment Success - Order: ${order_id}, Amount: ₹${payment_amount}, Method: ${payment_method}`);
            
            // Update order status in database
            try {
              await Order.findOneAndUpdate(
                { orderNumber: order_id },
                { 
                  status: 'confirmed',
                  paymentStatus: 'completed',
                  paymentMethod: payment_method,
                  paymentAmount: payment_amount,
                  updatedAt: new Date()
                }
              );
              console.log(`📝 Order ${order_id} status updated to confirmed`);
            } catch (dbError) {
              console.error('❌ Database update failed:', dbError);
            }
          }
          break;
          
        case 'PAYMENT_FAILED_WEBHOOK':
          {
            const { order_id, payment_status, failure_reason } = webhookData.data;
            console.log(`❌ Payment Failed - Order: ${order_id}, Reason: ${failure_reason}`);
            
            // Update order status in database
            try {
              await Order.findOneAndUpdate(
                { orderNumber: order_id },
                { 
                  status: 'failed',
                  paymentStatus: 'failed',
                  failureReason: failure_reason,
                  updatedAt: new Date()
                }
              );
              console.log(`📝 Order ${order_id} status updated to failed`);
            } catch (dbError) {
              console.error('❌ Database update failed:', dbError);
            }
          }
          break;
          
        case 'PAYMENT_USER_DROPPED_WEBHOOK':
          {
            const { order_id } = webhookData.data;
            console.log(`⏸️ Payment User Dropped - Order: ${order_id}`);
            
            // Update order status in database
            try {
              await Order.findOneAndUpdate(
                { orderNumber: order_id },
                { 
                  status: 'cancelled',
                  paymentStatus: 'cancelled',
                  updatedAt: new Date()
                }
              );
              console.log(`📝 Order ${order_id} status updated to cancelled`);
            } catch (dbError) {
              console.error('❌ Database update failed:', dbError);
            }
          }
          break;
          
        case 'REFUND_SUCCESS_WEBHOOK':
          {
            const { order_id, refund_amount, refund_id } = webhookData.data;
            console.log(`💰 Refund Success - Order: ${order_id}, Amount: ₹${refund_amount}, Refund ID: ${refund_id}`);
            
            // Update order status in database
            try {
              await Order.findOneAndUpdate(
                { orderNumber: order_id },
                { 
                  refundStatus: 'completed',
                  refundAmount: refund_amount,
                  refundId: refund_id,
                  updatedAt: new Date()
                }
              );
              console.log(`📝 Order ${order_id} refund status updated`);
            } catch (dbError) {
              console.error('❌ Database update failed:', dbError);
            }
          }
          break;
          
        case 'REFUND_FAILED_WEBHOOK':
          {
            const { order_id, refund_id, failure_reason } = webhookData.data;
            console.log(`❌ Refund Failed - Order: ${order_id}, Refund ID: ${refund_id}, Reason: ${failure_reason}`);
            
            // Update order status in database
            try {
              await Order.findOneAndUpdate(
                { orderNumber: order_id },
                { 
                  refundStatus: 'failed',
                  refundFailureReason: failure_reason,
                  updatedAt: new Date()
                }
              );
              console.log(`📝 Order ${order_id} refund status updated to failed`);
            } catch (dbError) {
              console.error('❌ Database update failed:', dbError);
            }
          }
          break;
          
        default:
          console.log(`ℹ️ Unhandled webhook type: ${webhookData.type}`);
      }
      
      res.status(200).json({ 
        message: 'Webhook received successfully',
        timestamp: new Date().toISOString(),
        type: webhookData.type
      });
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      res.status(500).json({ 
        message: 'Webhook processing failed',
        error: error.message 
      });
    }
  });

  // Webhook test endpoint
  app.get('/api/payments/webhook-test', (req, res) => {
    res.json({
      message: 'Webhook endpoint is accessible',
      timestamp: new Date().toISOString(),
      url: `${req.protocol}://${req.get('host')}/api/payments/webhook`,
      status: 'active'
    });
  });

  // Diagnostic routes for debugging
  app.get('/api/diagnostics/database', databaseDiagnostics);
  app.post('/api/diagnostics/test-user', testUserCreation);
  app.post('/api/diagnostics/test-auth', testAuthentication);
  app.post('/api/diagnostics/clear-sessions', clearAllSessions);
  app.post('/api/diagnostics/check-user', checkSpecificUser);

  const httpServer = createServer(app);
  return httpServer;
}
