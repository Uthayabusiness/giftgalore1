import {
  User,
  Category,
  Product,
  Cart,
  Wishlist,
  Order,
  OrderTracking,
  type IUser,
  type ICategory,
  type IProduct,
  type ICart,
  type IWishlist,
  type IOrder,
  type IOrderTracking,
} from "@shared/schema";
import mongoose from "mongoose";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<IUser | undefined>;
  getUsers(): Promise<IUser[]>;
  upsertUser(user: Partial<IUser>): Promise<IUser>;
  
  // Category operations
  getCategories(): Promise<ICategory[]>;
  getAdminCreatedCategories(): Promise<ICategory[]>;
  getCategoryBySlug(slug: string): Promise<ICategory | undefined>;
  createCategory(category: Partial<ICategory>): Promise<ICategory>;
  updateCategory(id: string, category: Partial<ICategory>): Promise<ICategory>;
  deleteCategory(id: string): Promise<void>;
  
  // Product operations
  getProducts(filters?: {
    categoryId?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<IProduct[]>;
  getAllProducts(filters?: {
    categoryId?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<IProduct[]>;
  getProductById(id: string): Promise<IProduct | undefined>;
  getProductBySlug(slug: string): Promise<IProduct | undefined>;
  createProduct(product: Partial<IProduct>): Promise<IProduct>;
  updateProduct(id: string, product: Partial<IProduct>): Promise<IProduct>;
  deleteProduct(id: string): Promise<void>;
  
  // Cart operations
  getCartItems(userId: string): Promise<(ICart & { product: IProduct })[]>;
  addToCart(cartItem: Partial<ICart>): Promise<ICart>;
  updateCartItem(userId: string, productId: string, quantity: number): Promise<ICart>;
  removeFromCart(userId: string, productId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Wishlist operations
  getWishlistItems(userId: string): Promise<(IWishlist & { product: IProduct })[]>;
  addToWishlist(userId: string, productId: string): Promise<IWishlist>;
  removeFromWishlist(userId: string, productId: string): Promise<void>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;
  
  // Order operations
  getOrders(userId?: string): Promise<IOrder[]>;
  getOrderById(id: string): Promise<IOrder | undefined>;
  getOrderByOrderNumber(orderNumber: string): Promise<IOrder | undefined>;
  createOrder(order: Partial<IOrder>): Promise<IOrder>;
  updateOrderStatus(id: string, status: string, updatedBy: string, updatedByName: string, notes?: string): Promise<IOrder>;
  
  // Order tracking operations
  getOrderTrackingHistory(orderId: string): Promise<IOrderTracking[]>;
  getRecentOrderUpdates(limit?: number): Promise<IOrderTracking[]>;
  
  // Order additional information operations
  updateOrderAdditionalInfo(orderId: string, additionalInfo: string, updatedBy: string): Promise<IOrder>;
  clearOrderAdditionalInfo(orderId: string, updatedBy: string): Promise<IOrder>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<IUser | undefined> {
    const user = await User.findById(id).exec();
    return user || undefined;
  }

  async getUsers(): Promise<IUser[]> {
    return await User.find().sort({ createdAt: -1 }).exec();
  }

  async upsertUser(userData: Partial<IUser>): Promise<IUser> {
    const userId = (userData as any)._id || (userData as any).id;
    const user = await User.findByIdAndUpdate(
      userId,
      { ...userData, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );
    if (!user) throw new Error('Failed to upsert user');
    return user;
  }

  // Category operations
  async getCategories(): Promise<ICategory[]> {
    return await Category.find().sort({ createdAt: -1 }).exec();
  }

  async getAdminCreatedCategories(): Promise<ICategory[]> {
    return await Category.find({ isAdminCreated: true }).sort({ createdAt: -1 }).exec();
  }

  async getCategoryBySlug(slug: string): Promise<ICategory | undefined> {
    const category = await Category.findOne({ slug }).exec();
    return category || undefined;
  }

  async createCategory(category: Partial<ICategory>): Promise<ICategory> {
    const newCategory = new Category({
      ...category,
      isAdminCreated: true
    });
    return await newCategory.save();
  }

  async updateCategory(id: string, category: Partial<ICategory>): Promise<ICategory> {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { ...category, isAdminCreated: true, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!updatedCategory) throw new Error('Category not found');
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    // First, remove this category from all products that reference it
    await Product.updateMany(
      { categoryIds: id },
      { $pull: { categoryIds: id } }
    );
    
    // Then delete the category
    const result = await Category.findByIdAndDelete(id);
    if (!result) throw new Error('Category not found');
  }

  // Product operations
  async getProducts(filters?: {
    categoryId?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<IProduct[]> {
    const query: any = { isActive: true };

    if (filters?.categoryId) {
      query.categoryIds = { $in: [new mongoose.Types.ObjectId(filters.categoryId)] };
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters?.featured) {
      query.isFeatured = true;
    }

    let baseQuery = Product.find(query).sort({ createdAt: -1 });

    if (filters?.limit && filters?.offset) {
      baseQuery = baseQuery.limit(filters.limit).skip(filters.offset);
    } else if (filters?.limit) {
      baseQuery = baseQuery.limit(filters.limit);
    } else if (filters?.offset) {
      baseQuery = baseQuery.skip(filters.offset);
    }

    return await baseQuery.exec();
  }

  async getAllProducts(filters?: {
    categoryId?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<IProduct[]> {
    console.log('getAllProducts called with filters:', filters);
    
    // First, let's check if there are any products at all in the database
    const totalProducts = await Product.countDocuments({});
    console.log('Total products in database:', totalProducts);
    
    const query: any = {}; // No isActive filter - get all products
    console.log('Initial query:', query);

    if (filters?.categoryId) {
      query.categoryIds = { $in: [new mongoose.Types.ObjectId(filters.categoryId)] };
      console.log('Added categoryId filter:', query.categoryIds);
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
      console.log('Added search filter:', query.$or);
    }

    if (filters?.featured) {
      query.isFeatured = true;
      console.log('Added featured filter:', query.isFeatured);
    }

    console.log('Final query:', JSON.stringify(query, null, 2));

    let baseQuery = Product.find(query).sort({ createdAt: -1 });

    if (filters?.limit && filters?.offset) {
      baseQuery = baseQuery.limit(filters.limit).skip(filters.offset);
    } else if (filters?.limit) {
      baseQuery = baseQuery.limit(filters.limit);
    } else if (filters?.offset) {
      baseQuery = baseQuery.skip(filters.offset);
    }

    const result = await baseQuery.exec();
    console.log('getAllProducts result count:', result.length);
    console.log('First few products:', result.slice(0, 2).map(p => ({ id: p._id, name: p.name, isActive: p.isActive })));
    
    return result;
  }

  async getProductById(id: string): Promise<IProduct | undefined> {
    const product = await Product.findById(id).exec();
    return product || undefined;
  }

  async getProductBySlug(slug: string): Promise<IProduct | undefined> {
    const product = await Product.findOne({ slug }).exec();
    return product || undefined;
  }

  async createProduct(product: Partial<IProduct>): Promise<IProduct> {
    const newProduct = new Product(product);
    return await newProduct.save();
  }

  async updateProduct(id: string, product: Partial<IProduct>): Promise<IProduct> {
    console.log('Storage updateProduct called with ID:', id);
    console.log('Product data to update:', product);
    console.log('hasDeliveryCharge in storage:', product.hasDeliveryCharge);
    console.log('deliveryCharge in storage:', product.deliveryCharge);
    
    const updateData = { ...product, updatedAt: new Date() };
    console.log('Final update data:', updateData);
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log('Updated product result:', updatedProduct);
    console.log('Updated product hasDeliveryCharge:', updatedProduct?.hasDeliveryCharge);
    console.log('Updated product deliveryCharge:', updatedProduct?.deliveryCharge);
    
    if (!updatedProduct) throw new Error('Product not found');
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await Product.findByIdAndDelete(id);
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(ICart & { product: IProduct })[]> {
    const cartItems = await Cart.find({ userId })
      .populate('productId')
      .sort({ createdAt: -1 })
      .exec();
    
    return cartItems.map((item: any) => {
      // Skip items with invalid productId (they will be cleaned up)
      if (!item.productId || typeof item.productId === 'object' && item.productId.toString() === '[object Object]') {
        return null;
      }
      
      return {
        ...item.toObject(),
        productId: item.productId._id.toString(), // Keep the original productId as string
        product: {
          ...item.productId.toObject(),
          id: item.productId._id // Add id field for compatibility
        }
      };
    }).filter(Boolean); // Remove null items
  }

  async addToCart(cartItem: Partial<ICart>): Promise<ICart> {
    // Ensure productId is a string (MongoDB ObjectId)
    const productId = typeof cartItem.productId === 'string' ? cartItem.productId : cartItem.productId?.toString();
    
    // Get product to check stock
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Check if item already exists in cart
    const existingItem = await Cart.findOne({
      userId: cartItem.userId,
      productId: productId
    });

    const requestedQuantity = cartItem.quantity || 1;
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const totalRequestedQuantity = currentCartQuantity + requestedQuantity;
    const minOrderQuantity = product.minOrderQuantity || 1;

    // Check minimum order quantity for the new request
    if (requestedQuantity < minOrderQuantity) {
      throw new Error(`Minimum order quantity for this product is ${minOrderQuantity} items.`);
    }

    // Check if total quantity (existing + new) would exceed available stock
    if (totalRequestedQuantity > product.stock) {
      if (currentCartQuantity > 0) {
        throw new Error(`Cannot add ${requestedQuantity} more items. You already have ${currentCartQuantity} in your cart, but only ${product.stock} total items are available in stock.`);
      } else {
        throw new Error(`Insufficient stock. Only ${product.stock} items available, but you're trying to add ${requestedQuantity} items.`);
      }
    }

    if (existingItem) {
      // Update quantity
      existingItem.quantity = totalRequestedQuantity;
      return await existingItem.save();
    } else {
      // Insert new item with correct productId
      const newItem = new Cart({
        ...cartItem,
        productId: productId
      });
      return await newItem.save();
    }
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<ICart> {
    // Ensure productId is a string (MongoDB ObjectId)
    const productIdStr = productId.toString();
    
    // Get product to check stock
    const product = await Product.findById(productIdStr);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const minOrderQuantity = product.minOrderQuantity || 1;
    
    // Check minimum order quantity
    if (quantity < minOrderQuantity) {
      throw new Error(`Cannot reduce quantity below minimum order quantity of ${minOrderQuantity} items.`);
    }
    
    // Check if requested quantity exceeds available stock
    if (quantity > product.stock) {
      throw new Error(`Cannot set quantity to ${quantity}. Only ${product.stock} items available in stock.`);
    }
    
    const updatedItem = await Cart.findOneAndUpdate(
      { userId, productId: productIdStr },
      { quantity },
      { new: true, runValidators: true }
    );
    if (!updatedItem) throw new Error('Cart item not found');
    return updatedItem;
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    // Ensure productId is a string (MongoDB ObjectId)
    const productIdStr = productId.toString();
    
    const result = await Cart.findOneAndDelete({ userId, productId: productIdStr });
    
    if (!result) {
      throw new Error('Cart item not found or already removed');
    }
  }

  async clearCart(userId: string): Promise<void> {
    await Cart.deleteMany({ userId });
  }

  async cleanupInvalidCartItems(): Promise<void> {
    // Remove cart items with invalid productId
    await Cart.deleteMany({
      $or: [
        { productId: { $exists: false } },
        { productId: null },
        { productId: '[object Object]' }
      ]
    });
  }

  // Wishlist operations
  async getWishlistItems(userId: string): Promise<(IWishlist & { product: IProduct })[]> {
    const wishlistItems = await Wishlist.find({ userId })
      .populate('productId')
      .sort({ createdAt: -1 })
      .exec();
    
    return wishlistItems.map((item: any) => ({
      ...item.toObject(),
      product: item.productId,
      productId: item.productId._id // Keep the original productId
    }));
  }

  async addToWishlist(userId: string, productId: string): Promise<IWishlist> {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ userId, productId });
    if (existingItem) {
      throw new Error('Product is already in your wishlist');
    }

    const wishlistItem = new Wishlist({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId)
    });
    
    return await wishlistItem.save();
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const result = await Wishlist.findOneAndDelete({ userId, productId });
    
    if (!result) {
      throw new Error('Wishlist item not found or already removed');
    }
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlistItem = await Wishlist.findOne({ userId, productId });
    return !!wishlistItem;
  }

  // Order operations
  async getOrders(userId?: string): Promise<IOrder[]> {
    const query = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
    return await Order.find(query).sort({ createdAt: -1 }).exec();
  }

  async getOrderById(id: string): Promise<IOrder | undefined> {
    const order = await Order.findById(id).exec();
    return order || undefined;
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<IOrder | undefined> {
    const order = await Order.findOne({ orderNumber }).exec();
    return order || undefined;
  }

  async createOrder(order: Partial<IOrder>): Promise<IOrder> {
    const newOrder = new Order(order);
    return await newOrder.save();
  }

  async updateOrderStatus(id: string, status: string, updatedBy: string, updatedByName: string, notes?: string): Promise<IOrder> {
    // Get the current order to track the previous status
    const currentOrder = await Order.findById(id);
    if (!currentOrder) {
      throw new Error("Order not found");
    }

    const previousStatus = currentOrder.status;

    // Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    // Create tracking history entry
    await OrderTracking.create({
      orderId: new mongoose.Types.ObjectId(id),
      orderNumber: currentOrder.orderNumber,
      status,
      previousStatus,
      updatedBy: new mongoose.Types.ObjectId(updatedBy),
      updatedByName,
      notes,
      timestamp: new Date()
    });

    return updatedOrder!;
  }

  // Order tracking operations
  async getOrderTrackingHistory(orderId: string): Promise<IOrderTracking[]> {
    console.log('Storage: Getting tracking history for orderId:', orderId);
    
    try {
      const objectId = new mongoose.Types.ObjectId(orderId);
      console.log('Storage: Converted to ObjectId:', objectId);
      
      const history = await OrderTracking.find({ orderId: objectId })
        .sort({ timestamp: -1 })
        .exec();
      
      console.log('Storage: Found tracking history entries:', history.length);
      return history;
    } catch (error) {
      console.error('Storage: Error in getOrderTrackingHistory:', error);
      throw error;
    }
  }

  async getRecentOrderUpdates(limit: number = 10): Promise<IOrderTracking[]> {
    return await OrderTracking.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  // Order additional information operations
    async updateOrderAdditionalInfo(orderId: string, additionalInfo: string, updatedBy: string): Promise<IOrder> {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        additionalInfo: {
          message: additionalInfo,
          updatedAt: new Date(),
          updatedBy: updatedBy
        },
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      throw new Error("Order not found");
    }

    return updatedOrder;
  }

  async clearOrderAdditionalInfo(orderId: string, updatedBy: string): Promise<IOrder> {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $unset: { additionalInfo: 1 },
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      throw new Error("Order not found");
    }

    return updatedOrder;
  }
}

export const storage = new DatabaseStorage();
