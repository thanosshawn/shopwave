
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { updateProfile as updateFirebaseUserProfile } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { db, auth } from './config';
import type { Product, CartItem, UserProfile, Order } from '@/lib/types';

// Product Services
export async function getProducts(filters?: { featured?: boolean; category?: string }, count?: number): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  let q = query(productsCol); 

  const conditions = [];
  if (filters?.featured !== undefined) {
    conditions.push(where('featured', '==', filters.featured));
  }
  if (filters?.category) {
    conditions.push(where('category', '==', filters.category));
  }
  
  // Apply orderBy name after all filters
  // Note: If you filter by inequality on one field and order by another, you might need a composite index.
  // For simplicity, we'll order by name. If `featured` is used, this query may require an index on `featured` and `name`.
  q = query(productsCol, ...conditions, orderBy('name'));


  if (count) {
    q = query(q, limit(count));
  }
  
  const productSnapshot = await getDocs(q);
  return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getProductById(id: string): Promise<Product | null> {
  const productDocRef = doc(db, 'products', id);
  const productSnap = await getDoc(productDocRef);
  if (productSnap.exists()) {
    return { id: productSnap.id, ...productSnap.data() } as Product;
  }
  return null;
}

export async function createProduct(productData: Omit<Product, 'id' | 'name_lowercase' | 'images'> & { images?: string }): Promise<string> {
  const productsCol = collection(db, 'products');
  const parsedImages = productData.images ? productData.images.split(',').map(url => url.trim()).filter(url => url) : [];
  const newProductRef = await addDoc(productsCol, {
    ...productData,
    images: parsedImages,
    name_lowercase: productData.name.toLowerCase(),
    createdAt: serverTimestamp(), 
    updatedAt: serverTimestamp(),
  });
  return newProductRef.id;
}

export async function updateProduct(productId: string, productData: Partial<Omit<Product, 'id' | 'name_lowercase' | 'images'>> & { images?: string }): Promise<void> {
  const productDocRef = doc(db, 'products', productId);
  const updateData: Partial<Product> & { updatedAt: Timestamp, images?: string[], name_lowercase?: string } = {
    ...productData,
    updatedAt: serverTimestamp() as Timestamp,
  };
  if (productData.name) {
    updateData.name_lowercase = productData.name.toLowerCase();
  }
  if (productData.images && typeof productData.images === 'string') {
    updateData.images = productData.images.split(',').map(url => url.trim()).filter(url => url);
  } else if (productData.images === undefined) { // Handle explicitly clearing images
    updateData.images = [];
  }

  await updateDoc(productDocRef, updateData);
}

export async function deleteProduct(productId: string): Promise<void> {
  const productDocRef = doc(db, 'products', productId);
  await deleteDoc(productDocRef);
}


export async function searchProducts(searchTerm: string): Promise<Product[]> {
  if (!searchTerm.trim()) return [];
  const productsCol = collection(db, 'products');
  const searchTermLower = searchTerm.toLowerCase();
  const q = query(
    productsCol,
    where('name_lowercase', '>=', searchTermLower),
    where('name_lowercase', '<=', searchTermLower + '\uf8ff'),
    orderBy('name_lowercase'),
    limit(20)
  );

  const productSnapshot = await getDocs(q);
  return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}


// User Profile Services
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userDocRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userDocRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  if (auth.currentUser && (data.displayName !== undefined || data.photoURL !== undefined) ) {
    await updateFirebaseUserProfile(auth.currentUser, {
      displayName: data.displayName,
      photoURL: data.photoURL,
    });
  }
  await setDoc(userDocRef, data, { merge: true });
}

export async function createUserProfile(user: FirebaseUser, additionalData: Partial<UserProfile> = {}): Promise<void> {
  const userDocRef = doc(db, 'users', user.uid);
  const profileData: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    ...additionalData,
  };
  await setDoc(userDocRef, profileData, { merge: true }); 
}


// Cart Services
export async function getUserCart(userId: string): Promise<CartItem[]> {
  const cartCol = collection(db, 'users', userId, 'cart');
  const cartSnapshot = await getDocs(cartCol);
  return cartSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
}

export async function addOrUpdateCartItem(userId: string, item: CartItem): Promise<void> {
  const cartItemRef = doc(db, 'users', userId, 'cart', item.id); 
  await setDoc(cartItemRef, item, { merge: true });
}

export async function removeCartItem(userId: string, productId: string): Promise<void> {
  const cartItemRef = doc(db, 'users', userId, 'cart', productId);
  await deleteDoc(cartItemRef);
}

export async function clearUserCart(userId: string): Promise<void> {
  const cartColRef = collection(db, 'users', userId, 'cart');
  const cartSnapshot = await getDocs(cartColRef);
  const batch = writeBatch(db);
  cartSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

export async function mergeLocalCartToFirestore(userId: string, localCartItems: CartItem[]): Promise<void> {
  if (!localCartItems || localCartItems.length === 0) return;

  const firestoreCart = await getUserCart(userId);
  const batch = writeBatch(db);

  for (const localItem of localCartItems) {
    const firestoreItem = firestoreCart.find(item => item.id === localItem.id);
    const cartItemRef = doc(db, 'users', userId, 'cart', localItem.id);
    if (firestoreItem) {
      batch.update(cartItemRef, { quantity: firestoreItem.quantity + localItem.quantity });
    } else {
      batch.set(cartItemRef, localItem);
    }
  }
  await batch.commit();
}

// Order Services
export async function createOrder(userId: string, orderData: Omit<Order, 'id' | 'createdAt' | 'userId'>): Promise<string> {
  const ordersCol = collection(db, 'orders');
  const newOrderRef = await addDoc(ordersCol, {
    ...orderData,
    userId,
    createdAt: serverTimestamp() as Timestamp, 
  });
  return newOrderRef.id;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const ordersCol = collection(db, 'orders');
  const q = query(ordersCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const orderSnapshot = await getDocs(q);
  return orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

// Admin - Product Management (specific example)
export async function getAllProductsAdmin(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const q = query(productsCol, orderBy('name'));
  const productSnapshot = await getDocs(q);
  return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}
