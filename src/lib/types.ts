
import type { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string; // Corresponds to Firestore document ID
  name: string;
  name_lowercase?: string; // For case-insensitive search
  description: string;
  price: number;
  imageUrl: string;
  images?: string[]; // Array of image URLs
  category: string;
  featured?: boolean;
  stock?: number;
  condition?: 'new' | 'used'; // Added condition field
}

export interface CartItem {
  id: string; // Product ID
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface AuthContextType {
  user: import('firebase/auth').User | null;
  isAdmin?: boolean; // Added for admin check
  loading: boolean;
  logout: () => Promise<void>;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  loadingCart: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface Order {
  id?: string; // Firestore document ID
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email: string;
  };
  createdAt: Timestamp;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}
