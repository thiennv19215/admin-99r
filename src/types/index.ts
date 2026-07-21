export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
}

export interface ProductPrompt {
  id: string;
  title: string;
  prompt_text: string;
  description?: string;
  prompt_type?: 'text' | 'image' | 'video' | 'code' | string;
  thumbnail_url?: string;
  ai_model?: string;
  category_id?: string;
  categories?: Category | null;
  copy_count?: number;
  view_count?: number;
  is_active?: boolean;
  is_hot?: boolean;
  submission_status?: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
}

// Unified interface for UI display
export interface Product {
  id: string;
  name: string; // mapped to title
  sku: string; // mapped to slug or SKU
  category: string; // mapped to categories.name or ai_model
  price: number; // mapped to copy_count or price
  stock: number; // mapped to view_count or stock
  image: string; // mapped to thumbnail_url
  rating: number;
  description: string; // mapped to prompt_text / description
  ai_model?: string;
  prompt_type?: string;
  prompt_text?: string;
  category_id?: string;
  is_active?: boolean;
  is_hot?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
export type SortOption = 'default' | 'price_low' | 'price_high' | 'stock_low' | 'stock_high' | 'name_asc';
export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
