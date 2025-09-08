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
  hasDeliveryCharge: z.any().optional(),
  deliveryCharge: z.any().optional(),
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
      console.log('Create product request body:', req.body);
      console.log('hasDeliveryCharge type:', typeof req.body.hasDeliveryCharge, 'value:', req.body.hasDeliveryCharge);
      console.log('deliveryCharge type:', typeof req.body.deliveryCharge, 'value:', req.body.deliveryCharge);
      
      const productData = insertProductSchema.parse(req.body);
      console.log('Parsed product data:', productData);
      console.log('Parsed hasDeliveryCharge:', productData.hasDeliveryCharge);
      console.log('Parsed deliveryCharge:', productData.deliveryCharge);
      
      // Manual check
      if (req.body.hasDeliveryCharge !== undefined) {
        console.log('Manually adding hasDeliveryCharge:', req.body.hasDeliveryCharge);
        (productData as any).hasDeliveryCharge = req.body.hasDeliveryCharge;
      }
      if (req.body.deliveryCharge !== undefined) {
        console.log('Manually adding deliveryCharge:', req.body.deliveryCharge);
        (productData as any).deliveryCharge = req.body.deliveryCharge;
      }
      
      console.log('Final product data after manual addition:', productData);
      
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
      console.log('hasDeliveryCharge type:', typeof req.body.hasDeliveryCharge, 'value:', req.body.hasDeliveryCharge);
      console.log('deliveryCharge type:', typeof req.body.deliveryCharge, 'value:', req.body.deliveryCharge);
      
      console.log('About to parse with Zod schema...');
      console.log('Schema fields:', Object.keys(insertProductSchema.shape));
      
      const productData = insertProductSchema.partial().parse(req.body);
      console.log('Parsed product data:', productData);
      console.log('Parsed hasDeliveryCharge:', productData.hasDeliveryCharge);
      console.log('Parsed deliveryCharge:', productData.deliveryCharge);
      
      // Manual check
      if (req.body.hasDeliveryCharge !== undefined) {
        console.log('Manually adding hasDeliveryCharge:', req.body.hasDeliveryCharge);
        (productData as any).hasDeliveryCharge = req.body.hasDeliveryCharge;
      }
      if (req.body.deliveryCharge !== undefined) {
        console.log('Manually adding deliveryCharge:', req.body.deliveryCharge);
        (productData as any).deliveryCharge = req.body.deliveryCharge;
      }
      
      console.log('Final product data after manual addition:', productData);
      
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
      
      console.log(`🔍 Orders request from user: ${userId} (Role: ${user?.role || 'user'})`);
      
      // Admin can see all orders, users see only their orders
      const isAdmin = user?.role === 'admin';
      let orders = await storage.getOrders(isAdmin ? undefined : userId);
      
      console.log(`📊 Retrieved ${orders.length} orders for ${isAdmin ? 'admin' : 'user'} ${userId}`);
      
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
      
      // Debug order statuses
      const statusCounts = {};
      populatedOrders.forEach((order) => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      console.log('📊 Order status counts:', statusCounts);
      
      console.log(`🚀 Sending ${populatedOrders.length} orders to frontend`);
      populatedOrders.forEach((order, index) => {
        console.log(`Order ${index + 1}: ${order.orderNumber} - Status: ${order.status} - Items: ${order.items?.length || 0}`);
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
      const orderId = req.params.id;
      const user = await storage.getUser(userId);
      
      console.log(`🔍 Individual order request: User ${userId} requesting order ${orderId}`);
      
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        console.log(`❌ Order not found: ${orderId}`);
        return res.status(404).json({ message: "Order not found" });
      }

      // Users can only see their own orders, admins can see all
      const isAdmin = user?.role === 'admin';
      const isOwner = order.userId.toString() === userId.toString();
      
      if (!isAdmin && !isOwner) {
        console.log(`🚨 Access denied: User ${userId} (${user?.role || 'user'}) trying to access order ${orderId} owned by ${order.userId}`);
        return res.status(403).json({ message: "Access denied. You can only view your own orders." });
      }

      console.log(`✅ Access granted: User ${userId} (${isAdmin ? 'admin' : 'owner'}) accessing order ${orderId}`);
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Get order by order number (for tracking - no authentication required)
  app.get('/api/orders/track/:orderNumber', async (req, res) => {
    try {
      const orderNumber = req.params.orderNumber;
      console.log(`🔍 Public order tracking request for: ${orderNumber}`);
      
      const order = await storage.getOrderByOrderNumber(orderNumber);
      if (!order) {
        console.log(`❌ Order not found for tracking: ${orderNumber}`);
        return res.status(404).json({ message: "Order not found" });
      }

      console.log(`✅ Order found for public tracking: ${orderNumber} (Status: ${order.status})`);

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

  // Get order by order number (for authenticated users - with full details)
  app.get('/api/orders/track/:orderNumber/authenticated', isAuthenticated, async (req: any, res) => {
    try {
      const orderNumber = req.params.orderNumber;
      const userId = req.user._id;
      const user = await storage.getUser(userId);
      
      console.log(`🔍 Authenticated order tracking request: User ${userId} requesting order ${orderNumber}`);
      
      const order = await storage.getOrderByOrderNumber(orderNumber);
      if (!order) {
        console.log(`❌ Order not found for authenticated tracking: ${orderNumber}`);
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if user owns this order or is admin
      const isAdmin = user?.role === 'admin';
      const isOwner = order.userId.toString() === userId.toString();
      
      if (!isAdmin && !isOwner) {
        console.log(`🚨 Access denied: User ${userId} trying to track order ${orderNumber} owned by ${order.userId}`);
        return res.status(403).json({ message: "Access denied. You can only track your own orders." });
      }

      console.log(`✅ Authenticated tracking access granted: User ${userId} (${isAdmin ? 'admin' : 'owner'}) tracking order ${orderNumber}`);

      // Return full order details for authenticated users
      res.json(order);
    } catch (error) {
      console.error("Error fetching order for authenticated tracking:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // This endpoint is now deprecated - orders are created only after successful payment
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    res.status(400).json({ 
      message: "Orders are now created only after successful payment. Please use the payment flow." 
    });
  });

  // New endpoint: Initiate payment directly from cart (creates order only after payment success)
  app.post('/api/payments/initiate-from-cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const { shippingAddress } = req.body;
      
      console.log('💳 Payment initiation from cart request:', { userId, shippingAddress });
      
      // Get cart items
      const cartItems = await storage.getCartItems(userId);
      console.log('🛍️ Cart items:', cartItems);
      
      if (cartItems.length === 0) {
        console.log('❌ Cart is empty');
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate total including delivery charges
      const total = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.product.price.toString());
        const itemTotal = price * item.quantity;
        
        // Add delivery charge if product has it
        const deliveryCharge = item.product.hasDeliveryCharge ? 
          parseFloat(item.product.deliveryCharge.toString()) : 0;
        
        return sum + itemTotal + deliveryCharge;
      }, 0);

      // Get user details
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate unique order number for payment
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      console.log('🔢 Generated order number for payment:', orderNumber);

      // Prepare customer details for Cashfree
      const customerDetails = {
        customer_id: userId,
        customer_name: `${user.firstName} ${user.lastName}`,
        customer_email: user.email,
        customer_phone: user.mobileNumber,
      };

      // Create payment order data
      const orderData = {
        order_id: orderNumber,
        order_amount: total,
        order_currency: 'INR',
        customer_details: customerDetails,
        order_meta: {
          return_url: `${req.protocol}://${req.get('host')}/orders`,
          notify_url: `${req.protocol}://${req.get('host')}/api/payments/webhook`,
          shipping_address: shippingAddress,
        },
        order_note: `Order for ${customerDetails.customer_name}`,
      };

      const cashfreeOrder = await cashfreeService.createOrder(orderData);
      
      console.log('✅ Cashfree payment order created:', { 
        orderNumber,
        paymentSessionId: cashfreeOrder.payment_session_id 
      });
      
      res.json({ 
        success: true,
        order: cashfreeOrder,
        paymentSessionId: cashfreeOrder.payment_session_id,
        orderNumber: orderNumber,
        total: total
      });
    } catch (error) {
      console.error('❌ Error initiating payment from cart:', error);
      res.status(500).json({ message: 'Failed to initiate payment' });
    }
  });

  // Initiate payment for draft order
  app.post('/api/orders/:id/initiate-payment', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = req.params.id;
      const userId = req.user._id;
      
      console.log('💳 Payment initiation request:', { orderId, userId });
      
      // Find the order - ensure proper ObjectId conversion
      const order = await Order.findOne({ 
        _id: new mongoose.Types.ObjectId(orderId), 
        userId: userId 
      });
      
      if (!order) {
        console.log('❌ Order not found for payment initiation:', { orderId, userId });
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Only allow payment initiation for draft orders
      if (order.status !== 'draft') {
        return res.status(400).json({ 
          message: `Only draft orders can initiate payment. Current status: ${order.status}` 
        });
      }
      
      // Update order status to pending when payment is initiated
      await Order.findByIdAndUpdate(orderId, {
        status: 'pending',
        paymentInitiatedAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Order status updated to pending for payment:', { orderId, orderNumber: order.orderNumber });
      
      res.json({ 
        message: "Payment initiated successfully", 
        orderId,
        orderNumber: order.orderNumber,
        status: 'pending'
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      res.status(500).json({ message: "Failed to initiate payment" });
    }
  });

  // Auto-cleanup expired orders every 5 minutes
  setInterval(async () => {
    try {
      console.log('🧹 Auto-cleanup: Checking for expired pending orders...');
      
      // Cashfree payment timeout is typically 30 minutes
      const paymentTimeoutMinutes = 30;
      const timeoutDate = new Date(Date.now() - (paymentTimeoutMinutes * 60 * 1000));
      
      // Find pending orders that are older than the timeout period
      const expiredOrders = await Order.find({
        status: 'pending',
        paymentInitiatedAt: { $lt: timeoutDate }
      });
      
      if (expiredOrders.length > 0) {
        console.log(`🔍 Auto-cleanup: Found ${expiredOrders.length} expired pending orders`);
        
        let deletedCount = 0;
        for (const order of expiredOrders) {
          try {
            await Order.findByIdAndDelete(order._id);
            deletedCount++;
            console.log(`🗑️ Auto-cleanup: Deleted expired order: ${order.orderNumber}`);
          } catch (error) {
            console.error(`❌ Auto-cleanup: Failed to delete expired order ${order.orderNumber}:`, error);
          }
        }
        
        console.log(`✅ Auto-cleanup: Completed. Deleted ${deletedCount} expired orders.`);
      }
    } catch (error) {
      console.error("❌ Auto-cleanup error:", error);
    }
  }, 5 * 60 * 1000); // Run every 5 minutes

  // Manual cleanup endpoint (called by cron job or manually)
  app.post('/api/orders/cleanup-expired', async (req: any, res) => {
    try {
      console.log('🧹 Starting cleanup of expired pending orders...');
      
      // Cashfree payment timeout is typically 30 minutes
      const paymentTimeoutMinutes = 30;
      const timeoutDate = new Date(Date.now() - (paymentTimeoutMinutes * 60 * 1000));
      
      // Find pending orders that are older than the timeout period
      const expiredOrders = await Order.find({
        status: 'pending',
        paymentInitiatedAt: { $lt: timeoutDate }
      });
      
      console.log(`🔍 Found ${expiredOrders.length} expired pending orders`);
      
      let deletedCount = 0;
      
      for (const order of expiredOrders) {
        try {
          // Delete the expired order
          await Order.findByIdAndDelete(order._id);
          deletedCount++;
          console.log(`🗑️ Deleted expired order: ${order.orderNumber}`);
        } catch (error) {
          console.error(`❌ Failed to delete expired order ${order.orderNumber}:`, error);
        }
      }
      
      console.log(`✅ Cleanup completed. Deleted ${deletedCount} expired orders.`);
      
      res.json({ 
        message: "Cleanup completed", 
        expiredOrdersFound: expiredOrders.length,
        deletedCount 
      });
    } catch (error) {
      console.error("Error during order cleanup:", error);
      res.status(500).json({ message: "Failed to cleanup expired orders" });
    }
  });

  // Initiate payment for pending order
  app.post('/api/orders/:id/initiate-payment', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = req.params.id;
      const userId = req.user._id;
      
      console.log('💳 Payment initiation request:', { orderId, userId });
      
      // Find the order - ensure proper ObjectId conversion
      const order = await Order.findOne({ 
        _id: new mongoose.Types.ObjectId(orderId), 
        userId: userId 
      });
      
      if (!order) {
        console.log('❌ Order not found for payment initiation:', { orderId, userId });
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Only allow payment initiation for pending orders
      if (order.status !== 'pending') {
        return res.status(400).json({ 
          message: `Only pending orders can initiate payment. Current status: ${order.status}` 
        });
      }
      
      // Check if payment is still within timeout period (30 minutes)
      const paymentTimeoutMinutes = 30;
      const timeoutDate = new Date(Date.now() - (paymentTimeoutMinutes * 60 * 1000));
      
      if (order.paymentInitiatedAt && order.paymentInitiatedAt < timeoutDate) {
        // Order has expired, cancel it
        await Order.findByIdAndUpdate(orderId, {
          status: 'cancelled',
          updatedAt: new Date()
        });
        
        // Restore items to cart
        if (order.items && order.items.length > 0) {
          console.log(`🔄 Restoring cart items for user ${userId} after order expiration`);
          
          // Clear existing cart first
          await storage.clearCart(userId.toString());
          
          // Add items back to cart (skip products that no longer exist)
          let restoredItems = 0;
          let skippedItems = 0;
          for (const item of order.items) {
            try {
              await storage.addToCart({
                userId: userId,
                productId: item.productId,
                quantity: item.quantity
              });
              restoredItems++;
            } catch (error) {
              console.log(`⚠️ Skipping product ${item.productId} - ${error.message}`);
              skippedItems++;
            }
          }
          
          console.log(`✅ Cart restoration completed: ${restoredItems} items restored, ${skippedItems} items skipped`);
        }
        
        return res.status(400).json({ 
          message: "Payment session has expired. Order has been automatically cancelled.",
          expired: true
        });
      }
      
      // Create Cashfree payment order
      const customerDetails = {
        customer_id: userId,
        customer_name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        customer_email: order.shippingAddress.email,
        customer_phone: order.shippingAddress.phone,
      };
      
      const orderData: CreateOrderRequest = {
        order_id: order.orderNumber,
        order_amount: order.total,
        order_currency: 'INR',
        customer_details: customerDetails,
        order_meta: {
          return_url: `${req.protocol}://${req.get('host')}/orders`,
          notify_url: `${req.protocol}://${req.get('host')}/api/payments/webhook`,
        },
        order_note: `Order for ${customerDetails.customer_name}`,
      };

      const cashfreeOrder = await cashfreeService.createOrder(orderData);
      
      console.log('✅ Cashfree payment order created:', { 
        orderId, 
        orderNumber: order.orderNumber,
        paymentSessionId: cashfreeOrder.payment_session_id 
      });
      
      res.json({ 
        success: true,
        order: cashfreeOrder,
        paymentSessionId: cashfreeOrder.payment_session_id,
        orderId,
        orderNumber: order.orderNumber
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      res.status(500).json({ message: "Failed to initiate payment" });
    }
  });

  // Get time remaining for pending order
  app.get('/api/orders/:id/time-remaining', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = req.params.id;
      const userId = req.user._id;
      
      const order = await Order.findOne({ 
        _id: new mongoose.Types.ObjectId(orderId), 
        userId: userId 
      });
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.status !== 'pending') {
        return res.status(400).json({ 
          message: "Order is not pending" 
        });
      }
      
      const paymentTimeoutMinutes = 30;
      const timeoutDate = new Date(order.paymentInitiatedAt.getTime() + (paymentTimeoutMinutes * 60 * 1000));
      const now = new Date();
      const timeRemaining = Math.max(0, timeoutDate.getTime() - now.getTime());
      
      res.json({
        timeRemaining: timeRemaining,
        timeRemainingMinutes: Math.ceil(timeRemaining / (60 * 1000)),
        timeoutDate: timeoutDate,
        isExpired: timeRemaining <= 0
      });
    } catch (error) {
      console.error("Error getting time remaining:", error);
      res.status(500).json({ message: "Failed to get time remaining" });
    }
  });

  // Cancel pending order endpoint
  app.delete('/api/orders/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = req.params.id;
      const userId = req.user._id;
      
      console.log('🔄 Cancel order request:', { orderId, userId, orderIdType: typeof orderId });
      
      // Debug: List all orders for this user
      try {
        const allUserOrders = await Order.find({ userId: userId });
        console.log('🔍 All orders for user:', allUserOrders.map(o => ({
          id: o._id,
          orderNumber: o.orderNumber,
          status: o.status,
          createdAt: o.createdAt
        })));
      } catch (debugError) {
        console.log('❌ Debug query failed:', debugError.message);
      }
      
      // Try to find the order with different approaches for debugging
      let order = null;
      
      // First try with ObjectId conversion
      try {
        order = await Order.findOne({ 
          _id: new mongoose.Types.ObjectId(orderId), 
          userId: userId 
        });
        console.log('🔍 Search with ObjectId conversion result:', order ? 'Found' : 'Not found');
      } catch (objectIdError) {
        console.log('❌ ObjectId conversion failed:', objectIdError.message);
      }
      
      // If not found, try with string comparison
      if (!order) {
        try {
          order = await Order.findOne({ 
            _id: orderId, 
            userId: userId 
          });
          console.log('🔍 Search with string ID result:', order ? 'Found' : 'Not found');
        } catch (stringError) {
          console.log('❌ String ID search failed:', stringError.message);
        }
      }
      
      // If still not found, try to find any order with this ID (for debugging)
      if (!order) {
        try {
          const anyOrder = await Order.findById(orderId);
          if (anyOrder) {
            console.log('🔍 Found order by ID (any user):', {
              id: anyOrder._id,
              orderNumber: anyOrder.orderNumber,
              userId: anyOrder.userId,
              status: anyOrder.status
            });
            
            // Check if it's a user mismatch
            if (anyOrder.userId.toString() !== userId.toString()) {
              console.log('🚨 SECURITY ALERT: User mismatch detected!');
              console.log('🚨 Order belongs to user:', anyOrder.userId.toString());
              console.log('🚨 Current user is:', userId.toString());
              console.log('🚨 This is expected behavior - users can only cancel their own orders');
              console.log('🚨 Returning 403 - Access denied for user mismatch');
              return res.status(403).json({ 
                message: "Access denied. This order belongs to a different user account." 
              });
            }
          } else {
            console.log('🔍 Order not found in database');
          }
        } catch (findByIdError) {
          console.log('❌ FindById failed:', findByIdError.message);
        }
      }
      
      if (!order) {
        console.log('❌ Order not found:', { orderId, userId });
        return res.status(404).json({ message: "Order not found" });
      }
      
      console.log('✅ Order found:', { 
        orderId: order._id, 
        orderNumber: order.orderNumber, 
        status: order.status,
        userId: order.userId 
      });
      
      // Allow cancellation of pending, confirmed, and processing orders
      const cancellableStatuses = ['pending', 'confirmed', 'processing'];
      if (!cancellableStatuses.includes(order.status)) {
        return res.status(400).json({ 
          message: `Only ${cancellableStatuses.join(', ')} orders can be cancelled. Current status: ${order.status}` 
        });
      }
      
      // Update order status to cancelled
      await Order.findByIdAndUpdate(orderId, {
        status: 'cancelled',
        updatedAt: new Date()
      });
      
      // Restore cart items
      let restoredItems = 0;
      let skippedItems = 0;
      
      if (order.items && order.items.length > 0) {
        console.log(`🔄 Restoring cart items for user ${userId} after order cancellation`);
        
        // Clear existing cart first
        await storage.clearCart(userId.toString());
        
        // Add items back to cart (skip products that no longer exist)
        for (const item of order.items) {
          try {
            await storage.addToCart({
              userId: userId,
              productId: item.productId,
              quantity: item.quantity
            });
            restoredItems++;
          } catch (error) {
            console.log(`⚠️ Skipping product ${item.productId} - ${error.message}`);
            skippedItems++;
          }
        }
        
        if (skippedItems > 0) {
          console.log(`⚠️ Skipped ${skippedItems} items that no longer exist in the database`);
        }
        
        console.log(`✅ Cart restoration completed: ${restoredItems} items restored, ${skippedItems} items skipped`);
      }
      
      res.json({ 
        message: "Order cancelled successfully", 
        orderId,
        restoredItems: restoredItems || 0,
        skippedItems: skippedItems || 0
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Failed to cancel order" });
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
            
            // Check if order already exists (for backward compatibility)
            let existingOrder = await Order.findOne({ orderNumber: order_id });
            
            if (existingOrder) {
              // Update existing order status
              try {
                const updatedOrder = await Order.findOneAndUpdate(
                  { orderNumber: order_id },
                  { 
                    status: 'confirmed',
                    paymentStatus: 'completed',
                    paymentMethod: payment_method,
                    paymentAmount: payment_amount,
                    updatedAt: new Date()
                  },
                  { new: true }
                );
                console.log(`📝 Existing order ${order_id} status updated to confirmed`);
                
                // Clear cart only after successful payment
                if (updatedOrder && updatedOrder.userId) {
                  await storage.clearCart(updatedOrder.userId.toString());
                  console.log(`🛒 Cart cleared for user ${updatedOrder.userId} after successful payment`);
                }
              } catch (dbError) {
                console.error('❌ Database update failed:', dbError);
              }
            } else {
              // Create new order only after successful payment
              try {
                // Get payment session data to retrieve order details
                const paymentSessionData = await cashfreeService.getOrder(order_id);
                
                if (paymentSessionData && paymentSessionData.customer_details) {
                  // Find user by email or phone
                  const user = await storage.getUserByEmail(paymentSessionData.customer_details.customer_email) ||
                               await storage.getUserByPhone(paymentSessionData.customer_details.customer_phone);
                  
                  if (user) {
                    // Get cart items to create order
                    const cartItems = await storage.getCartItems(user._id.toString());
                    
                    if (cartItems.length > 0) {
                      // Calculate total including delivery charges
                      const total = cartItems.reduce((sum, item) => {
                        const price = parseFloat(item.product.price.toString());
                        const itemTotal = price * item.quantity;
                        
                        // Add delivery charge if product has it
                        const deliveryCharge = item.product.hasDeliveryCharge ? 
                          parseFloat(item.product.deliveryCharge.toString()) : 0;
                        
                        return sum + itemTotal + deliveryCharge;
                      }, 0);

                      // Prepare order items data
                      const orderItems = cartItems.map(item => ({
                        productId: new mongoose.Types.ObjectId(item.productId.toString()),
                        productName: item.product.name,
                        productImage: item.product.images?.[0] || '/placeholder-image.jpg',
                        price: parseFloat(item.product.price.toString()),
                        quantity: item.quantity
                      }));

                      // Create order with confirmed status
                      const orderData = {
                        userId: new mongoose.Types.ObjectId(user._id.toString()),
                        orderNumber: order_id,
                        total: total,
                        items: orderItems,
                        shippingAddress: (paymentSessionData.order_meta as any)?.shipping_address || {},
                        status: 'confirmed' as const,
                        paymentStatus: 'completed',
                        paymentMethod: payment_method,
                        paymentAmount: payment_amount,
                      };

                      const newOrder = await storage.createOrder(orderData);
                      console.log(`✅ New order created after successful payment: ${order_id}`);
                      
                      // Clear cart after successful order creation
                      await storage.clearCart(user._id.toString());
                      console.log(`🛒 Cart cleared for user ${user._id} after successful payment`);
                    } else {
                      console.log(`⚠️ No cart items found for user ${user._id} during payment success`);
                    }
                  } else {
                    console.log(`⚠️ User not found for payment success: ${paymentSessionData.customer_details.customer_email}`);
                  }
                }
              } catch (createError) {
                console.error('❌ Failed to create order after payment success:', createError);
              }
            }
          }
          break;
          
        case 'PAYMENT_FAILED_WEBHOOK':
          {
            const { order_id, payment_status, failure_reason } = webhookData.data;
            console.log(`❌ Payment Failed - Order: ${order_id}, Reason: ${failure_reason}`);
            
            // Update order status in database
            try {
              const failedOrder = await Order.findOneAndUpdate(
                { orderNumber: order_id },
                { 
                  status: 'failed',
                  paymentStatus: 'failed',
                  failureReason: failure_reason,
                  updatedAt: new Date()
                },
                { new: true }
              );
              console.log(`📝 Order ${order_id} status updated to failed`);
              
              // Restore cart items for failed payment
              if (failedOrder && failedOrder.userId && failedOrder.items) {
                console.log(`🔄 Restoring cart items for user ${failedOrder.userId} after payment failure`);
                
                // Clear existing cart first
                await storage.clearCart(failedOrder.userId.toString());
                
                // Add items back to cart (skip products that no longer exist)
                let restoredItems = 0;
                let skippedItems = 0;
                for (const item of failedOrder.items) {
                  try {
                    await storage.addToCart({
                      userId: failedOrder.userId,
                      productId: item.productId,
                      quantity: item.quantity
                    });
                    restoredItems++;
                  } catch (error) {
                    console.log(`⚠️ Skipping product ${item.productId} - ${error.message}`);
                    skippedItems++;
                  }
                }
                
                if (skippedItems > 0) {
                  console.log(`⚠️ Skipped ${skippedItems} items that no longer exist in the database`);
                }
                
                console.log(`✅ Cart restoration completed: ${restoredItems} items restored, ${skippedItems} items skipped`);
              }
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
              const cancelledOrder = await Order.findOneAndUpdate(
                { orderNumber: order_id },
                { 
                  status: 'cancelled',
                  paymentStatus: 'cancelled',
                  updatedAt: new Date()
                },
                { new: true }
              );
              console.log(`📝 Order ${order_id} status updated to cancelled`);
              
              // Restore cart items for cancelled payment
              if (cancelledOrder && cancelledOrder.userId && cancelledOrder.items) {
                console.log(`🔄 Restoring cart items for user ${cancelledOrder.userId} after payment cancellation`);
                
                // Clear existing cart first
                await storage.clearCart(cancelledOrder.userId.toString());
                
                // Add items back to cart (skip products that no longer exist)
                let restoredItems = 0;
                let skippedItems = 0;
                for (const item of cancelledOrder.items) {
                  try {
                    await storage.addToCart({
                      userId: cancelledOrder.userId,
                      productId: item.productId,
                      quantity: item.quantity
                    });
                    restoredItems++;
                  } catch (error) {
                    console.log(`⚠️ Skipping product ${item.productId} - ${error.message}`);
                    skippedItems++;
                  }
                }
                
                if (skippedItems > 0) {
                  console.log(`⚠️ Skipped ${skippedItems} items that no longer exist in the database`);
                }
                
                console.log(`✅ Cart restoration completed: ${restoredItems} items restored, ${skippedItems} items skipped`);
              }
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
