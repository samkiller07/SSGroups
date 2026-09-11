'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CatalogItem, CartItem, BrandId } from '@/types';

interface BrandCartMap {
  [brandId: string]: CartItem[];
}

interface CartStoreState {
  brandCarts: BrandCartMap;
  addItem: (brandId: BrandId, item: CatalogItem, quantity?: number) => void;
  removeItem: (brandId: BrandId, itemId: string) => void;
  updateQuantity: (brandId: BrandId, itemId: string, quantity: number) => void;
  clearCart: (brandId: BrandId) => void;
  getItems: (brandId: BrandId) => CartItem[];
  getItemCount: (brandId: BrandId) => number;
  getSubtotal: (brandId: BrandId) => number;
  getOriginalTotal: (brandId: BrandId) => number;
  getSavings: (brandId: BrandId) => number;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      brandCarts: {
        aquarium: [],
        kirubai: [],
        'vision-360': [],
      },

      addItem: (brandId: BrandId, item: CatalogItem, quantity = 1) => {
        if (quantity <= 0) return;
        set((state) => {
          const currentItems = state.brandCarts[brandId] || [];
          const existingIndex = currentItems.findIndex((ci) => ci.item.id === item.id);

          let updated: CartItem[];
          if (existingIndex >= 0) {
            updated = [...currentItems];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
          } else {
            updated = [...currentItems, { item, quantity }];
          }

          return {
            brandCarts: {
              ...state.brandCarts,
              [brandId]: updated,
            },
          };
        });
      },

      removeItem: (brandId: BrandId, itemId: string) => {
        set((state) => {
          const currentItems = state.brandCarts[brandId] || [];
          return {
            brandCarts: {
              ...state.brandCarts,
              [brandId]: currentItems.filter((ci) => ci.item.id !== itemId),
            },
          };
        });
      },

      updateQuantity: (brandId: BrandId, itemId: string, quantity: number) => {
        set((state) => {
          const currentItems = state.brandCarts[brandId] || [];
          if (quantity <= 0) {
            return {
              brandCarts: {
                ...state.brandCarts,
                [brandId]: currentItems.filter((ci) => ci.item.id !== itemId),
              },
            };
          }

          const updated = currentItems.map((ci) =>
            ci.item.id === itemId ? { ...ci, quantity } : ci
          );

          return {
            brandCarts: {
              ...state.brandCarts,
              [brandId]: updated,
            },
          };
        });
      },

      clearCart: (brandId: BrandId) => {
        set((state) => ({
          brandCarts: {
            ...state.brandCarts,
            [brandId]: [],
          },
        }));
      },

      getItems: (brandId: BrandId) => {
        return get().brandCarts[brandId] || [];
      },

      getItemCount: (brandId: BrandId) => {
        const items = get().brandCarts[brandId] || [];
        return items.reduce((sum, ci) => sum + ci.quantity, 0);
      },

      getSubtotal: (brandId: BrandId) => {
        const items = get().brandCarts[brandId] || [];
        return items.reduce((sum, ci) => {
          const price = ci.item.offerPrice ?? ci.item.originalPrice ?? 0;
          return sum + price * ci.quantity;
        }, 0);
      },

      getOriginalTotal: (brandId: BrandId) => {
        const items = get().brandCarts[brandId] || [];
        return items.reduce((sum, ci) => {
          const price = ci.item.originalPrice ?? ci.item.offerPrice ?? 0;
          return sum + price * ci.quantity;
        }, 0);
      },

      getSavings: (brandId: BrandId) => {
        const items = get().brandCarts[brandId] || [];
        return items.reduce((sum, ci) => {
          const original = ci.item.originalPrice ?? 0;
          const offer = ci.item.offerPrice ?? original;
          if (original > offer) {
            return sum + (original - offer) * ci.quantity;
          }
          return sum;
        }, 0);
      },
    }),
    {
      name: 'ss-multibrand-carts-v1',
    }
  )
);
