// Frontend type definitions for GiftGalore

export interface User {
  _id: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  profileImageUrl?: string;
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

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isAdminCreated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  price: number | string;
  originalPrice?: number;
  images?: string[];
  categoryIds?: string[];
  stock: number;
  minOrderQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  hasDeliveryCharge: boolean;
  deliveryCharge: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  _id: string;
  userId?: string;
  productId: string;
  product: Product;
  quantity: number;
  createdAt: Date;
}

export interface WishlistItem {
  _id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  isReconstructed?: boolean;
}

export interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    apartment?: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
    phoneNumber: string;
    alternativeNumber?: string;
  };
  paymentId?: string;
  paymentStatus?: string;
  additionalInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderTracking {
  _id: string;
  orderId: string;
  status: string;
  notes?: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: Date;
}

// Address related types
export interface AddressData {
  state: string;
  districts: string[];
}

export interface DetailedAddressData {
  state: string;
  districts: {
    name: string;
    areas: string[];
  }[];
}

export interface AddressFormData {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  apartment?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  phoneNumber: string;
  alternativeNumber?: string;
}
