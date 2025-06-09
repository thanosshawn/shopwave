
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Product, PlainProduct, Order, PlainOrder } from './types';
import { Timestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function makeProductPlain(product: Product | null | undefined): PlainProduct | null | undefined {
  if (!product) return product;

  const { createdAt, updatedAt, ...rest } = product;
  const plainProduct: PlainProduct = { ...rest };

  if (createdAt && createdAt instanceof Timestamp) {
    plainProduct.createdAt = createdAt.toDate().toISOString();
  } else if (typeof createdAt === 'string') { // Handle if already serialized (e.g. by other means)
    plainProduct.createdAt = createdAt;
  }


  if (updatedAt && updatedAt instanceof Timestamp) {
    plainProduct.updatedAt = updatedAt.toDate().toISOString();
  } else if (typeof updatedAt === 'string') {
    plainProduct.updatedAt = updatedAt;
  }
  
  return plainProduct;
}

export function makeOrderPlain(order: Order | null | undefined): PlainOrder | null | undefined {
  if (!order) return order;
  const { createdAt, ...rest } = order;
  const plainOrder: PlainOrder = { ...rest };

  if (createdAt && createdAt instanceof Timestamp) {
    plainOrder.createdAt = createdAt.toDate().toISOString();
  } else if (typeof createdAt === 'string') {
    plainOrder.createdAt = createdAt;
  }
  return plainOrder;
}
