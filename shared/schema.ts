import mongoose, { Schema, Document } from 'mongoose';

// Session Schema
export interface ISession extends Document {
  sid: string;
  sess: any;
  expire: Date;
}

const sessionSchema = new Schema<ISession>({
  sid: { type: String, required: true, unique: true },
  sess: { type: Schema.Types.Mixed, required: true },
  expire: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
});

// User Schema
export interface IUser extends Document {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  profileImageUrl?: string;
  password?: string;
  role: string;
  isActive: boolean;
  address?: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    apartment?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
    country?: string;
    phoneNumber?: string;
    alternativeNumber?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  userId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  mobileNumber: String,
  profileImageUrl: String,
  password: String,
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  isActive: { type: Boolean, default: true },
  address: {
    firstName: String,
    lastName: String,
    addressLine1: String,
    addressLine2: String,
    apartment: String,
    city: String,
    district: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
    phoneNumber: String,
    alternativeNumber: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to generate unique userId
userSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.userId) {
      // Generate a unique 8-character alphanumeric ID
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let userId;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isUnique && attempts < maxAttempts) {
        userId = '';
        for (let i = 0; i < 8; i++) {
          userId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Check if this userId already exists
        const existingUser = await mongoose.model('User').findOne({ userId });
        if (!existingUser) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (isUnique && userId) {
        this.userId = userId;
        console.log(`Generated userId: ${userId} for new user`);
      } else {
        console.error('Failed to generate unique userId after maximum attempts');
      }
    }
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error);
    next(error as Error);
  }
});

// Category Schema
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isAdminCreated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  imageUrl: String,
  isAdminCreated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Product Schema
export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  categoryIds?: mongoose.Types.ObjectId[];
  stock: number;
  minOrderQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  images: [String],
  categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  stock: { type: Number, default: 0 },
  minOrderQuantity: { type: Number, default: 1, min: 1 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Cart Schema
export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
}

const cartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

// Wishlist Schema
export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const wishlistSchema = new Schema<IWishlist>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create unique compound index to prevent duplicate wishlist items
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Order Tracking History Schema
export interface IOrderTracking extends Document {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  status: string;
  previousStatus?: string;
  updatedBy: mongoose.Types.ObjectId;
  updatedByName: string;
  notes?: string;
  timestamp: Date;
}

const orderTrackingSchema = new Schema<IOrderTracking>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  orderNumber: { type: String, required: true },
  status: { type: String, required: true },
  previousStatus: { type: String },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedByName: { type: String, required: true },
  notes: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Order Schema
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderNumber: string;
  status: string;
  total: number;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress: any;
  paymentId?: string;
  paymentStatus?: string;
  additionalInfo?: {
    message: string;
    updatedAt: Date;
    updatedBy: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] 
  },
  total: { type: Number, required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  shippingAddress: { type: Schema.Types.Mixed, required: true },
  paymentId: String,
  paymentStatus: String,
  additionalInfo: {
    message: String,
    updatedAt: { type: Date, default: Date.now },
    updatedBy: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create and export models
export const Session = mongoose.model<ISession>('Session', sessionSchema);
export const User = mongoose.model<IUser>('User', userSchema);
export const Category = mongoose.model<ICategory>('Category', categorySchema);
export const Product = mongoose.model<IProduct>('Product', productSchema);
export const Cart = mongoose.model<ICart>('Cart', cartSchema);
export const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema);
export const Order = mongoose.model<IOrder>('Order', orderSchema);
export const OrderTracking = mongoose.model<IOrderTracking>('OrderTracking', orderTrackingSchema);

// Export all models as a single object for convenience
export const models = {
  Session,
  User,
  Category,
  Product,
  Cart,
  Wishlist,
  Order,
  OrderTracking
};
