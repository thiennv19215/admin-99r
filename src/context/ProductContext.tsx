"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, StockFilter, SortOption, ToastMessage, ToastType, Category } from "@/types";
import {
  fetchSupabaseProducts,
  createSupabaseProduct,
  updateSupabaseProduct,
  deleteSupabaseProduct,
  getCategories
} from "@/lib/supabase-service";

const INITIAL_VIETNAMESE_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: "Prompt AI Veo 3 Bán Hàng Mỹ Phẩm Bứt Phá Doanh Số",
    sku: "VEO-MYPHAM-01",
    category: "Video AI",
    price: 350000,
    stock: 45,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
    rating: 5.0,
    description: "Bộ câu lệnh chuyển đổi ý tưởng thành video 3D quảng cáo mỹ phẩm cao cấp siêu chân thực.",
    ai_model: "Veo 3",
    prompt_type: "video",
    prompt_text: "A cinematic 8k close up commercial video of a luxury cosmetic product surrounded by glowing water droplets...",
    is_active: true,
    is_hot: true
  },
  {
    id: "prod_2",
    name: "Bộ Câu Lệnh ChatGPT Viết Content Kéo 10,000 Traffic TikTok",
    sku: "GPT-TIKTOK-10K",
    category: "Viết lách & Content",
    price: 199000,
    stock: 120,
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop",
    rating: 4.9,
    description: "Tự động lập kế hoạch 30 ngày kịch bản TikTok viral cho sản phẩm thời trang và gia dụng.",
    ai_model: "ChatGPT",
    prompt_type: "text",
    prompt_text: "Hãy đóng vai một Chuyên gia Copywriter hàng đầu. Hãy tạo kịch bản video TikTok 60 giây gồm 3 phần: Hook, Body, CTA...",
    is_active: true,
    is_hot: true
  },
  {
    id: "prod_3",
    name: "Prompt Midjourney v6 Vẽ Chân Dung Doanh Nhân Sang Trọng",
    sku: "MJ6-DOANHNHAN-02",
    category: "Thiết kế & Đồ họa",
    price: 250000,
    stock: 8,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
    rating: 4.8,
    description: "Tạo ảnh đại diện phong thái chuyên nghiệp dành cho chủ doanh nghiệp và CEO.",
    ai_model: "Midjourney",
    prompt_type: "image",
    prompt_text: "Professional corporate headshot of a successful Asian executive in a tailored navy suit, studio lighting --ar 3:4 --v 6.0",
    is_active: true,
    is_hot: false
  },
  {
    id: "prod_4",
    name: "Mẫu Prompt Claude 3.5 Sonnet Viết Code Next.js Admin Full",
    sku: "CLAUDE-NEXT-ADMIN",
    category: "Lập trình & Code",
    price: 490000,
    stock: 0,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop",
    rating: 4.9,
    description: "Tự động sinh cấu trúc dự án Next.js 14 App Router chuẩn TypeScript và Tailwind CSS.",
    ai_model: "Claude 3.5",
    prompt_type: "code",
    prompt_text: "You are a Senior Next.js Architect. Build a full-stack admin dashboard component with Supabase integration...",
    is_active: false,
    is_hot: false
  }
];

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  stockFilter: StockFilter;
  setStockFilter: (s: StockFilter) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  
  // Modals & Active State
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;
  deletingProduct: Product | null;
  setDeletingProduct: (p: Product | null) => void;
  viewingProduct: Product | null;
  setViewingProduct: (p: Product | null) => void;
  
  // CRUD Actions & Quick Toggles
  addProduct: (productData: {
    title: string;
    prompt_text: string;
    description?: string;
    category_id?: string;
    ai_model?: string;
    prompt_type?: string;
    thumbnail_url?: string;
    is_active?: boolean;
    is_hot?: boolean;
  }) => Promise<void>;
  updateProduct: (id: string, productData: {
    title?: string;
    prompt_text?: string;
    description?: string;
    category_id?: string;
    ai_model?: string;
    prompt_type?: string;
    thumbnail_url?: string;
    is_active?: boolean;
    is_hot?: boolean;
  }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductStatus: (id: string) => Promise<void>;
  resetDemoData: () => void;
  syncSupabaseData: () => Promise<void>;
  
  // Supabase Status & UI
  isSupabaseConnected: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync Supabase products & categories
  const syncSupabaseData = async () => {
    try {
      const dbCats = await getCategories();
      setCategories(dbCats);

      const { products: supaData } = await fetchSupabaseProducts();
      if (supaData && supaData.length > 0) {
        setProducts(supaData);
        localStorage.setItem("next_admin_products", JSON.stringify(supaData));
        setIsSupabaseConnected(true);
      } else {
        const saved = localStorage.getItem("next_admin_products");
        setProducts(saved ? JSON.parse(saved) : INITIAL_VIETNAMESE_PRODUCTS);
        setIsSupabaseConnected(true);
      }
    } catch (e) {
      console.error("Supabase sync error:", e);
      const saved = localStorage.getItem("next_admin_products");
      setProducts(saved ? JSON.parse(saved) : INITIAL_VIETNAMESE_PRODUCTS);
    }
  };

  useEffect(() => {
    syncSupabaseData();
    const savedTheme = (localStorage.getItem("next_admin_theme") as "light" | "dark") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const saveProductsToStorage = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem("next_admin_products", JSON.stringify(updated));
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("next_admin_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const showToast = (message: string, type: ToastType = "success") => {
    const id = "toast_" + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addProduct = async (payload: {
    title: string;
    prompt_text: string;
    description?: string;
    category_id?: string;
    ai_model?: string;
    prompt_type?: string;
    thumbnail_url?: string;
    is_active?: boolean;
    is_hot?: boolean;
  }) => {
    const matchedCategory = categories.find(c => c.id === payload.category_id)?.name || payload.ai_model || "Tổng hợp";
    
    // 1. Instant local update for smooth UX
    const localNewProd: Product = {
      id: "prod_" + Date.now(),
      name: payload.title,
      sku: payload.title.toLowerCase().substring(0, 10).replace(/\s+/g, '-').toUpperCase(),
      category: matchedCategory,
      price: 250000,
      stock: payload.is_active !== false ? 50 : 0,
      image: payload.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
      rating: payload.is_hot ? 5.0 : 4.8,
      description: payload.prompt_text || payload.description || "",
      ai_model: payload.ai_model || "ChatGPT",
      prompt_type: payload.prompt_type || "text",
      prompt_text: payload.prompt_text,
      category_id: payload.category_id,
      is_active: payload.is_active ?? true,
      is_hot: !!payload.is_hot
    };

    const localUpdated = [localNewProd, ...products];
    saveProductsToStorage(localUpdated);

    // 2. Persist to Supabase DB
    const supaRes = await createSupabaseProduct(payload);
    
    if (supaRes && supaRes.success) {
      await syncSupabaseData();
      showToast(`Đã lưu sản phẩm "${payload.title}" lên Supabase DB thành công!`, "success");
    } else {
      showToast(`Đã lưu sản phẩm cục bộ (Lưu ý Supabase: ${supaRes?.error || 'RLSPolicy'})`, "warning");
    }
  };

  const updateProduct = async (id: string, payload: {
    title?: string;
    prompt_text?: string;
    description?: string;
    category_id?: string;
    ai_model?: string;
    prompt_type?: string;
    thumbnail_url?: string;
    is_active?: boolean;
    is_hot?: boolean;
  }) => {
    const matchedCategory = categories.find(c => c.id === payload.category_id)?.name;

    // 1. Instant local state update
    const localUpdated = products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name: payload.title !== undefined ? payload.title : p.name,
          category: matchedCategory || (payload.ai_model ? payload.ai_model : p.category),
          image: payload.thumbnail_url !== undefined ? payload.thumbnail_url : p.image,
          description: payload.description !== undefined ? payload.description : (payload.prompt_text || p.description),
          ai_model: payload.ai_model !== undefined ? payload.ai_model : p.ai_model,
          prompt_type: payload.prompt_type !== undefined ? payload.prompt_type : p.prompt_type,
          prompt_text: payload.prompt_text !== undefined ? payload.prompt_text : p.prompt_text,
          category_id: payload.category_id !== undefined ? payload.category_id : p.category_id,
          is_active: payload.is_active !== undefined ? payload.is_active : p.is_active,
          is_hot: payload.is_hot !== undefined ? payload.is_hot : p.is_hot,
          stock: payload.is_active === false ? 0 : (p.stock || 25)
        };
      }
      return p;
    });

    saveProductsToStorage(localUpdated);

    // 2. Persist update to Supabase DB
    const res = await updateSupabaseProduct(id, payload);
    if (res && res.success) {
      await syncSupabaseData();
      showToast(`Đã cập nhật sản phẩm thành công`, "success");
    } else {
      showToast(`Đã lưu thay đổi sản phẩm cục bộ`, "info");
    }
  };

  const deleteProduct = async (id: string) => {
    const item = products.find(p => p.id === id);

    // 1. Instant local deletion
    const localUpdated = products.filter(p => p.id !== id);
    saveProductsToStorage(localUpdated);

    // 2. Delete from Supabase DB
    const res = await deleteSupabaseProduct(id);
    if (res && res.success) {
      await syncSupabaseData();
      showToast(`Đã xóa sản phẩm "${item?.name || 'Sản phẩm'}" khỏi Supabase`, "danger");
    } else {
      showToast(`Đã xóa sản phẩm khỏi bộ nhớ local`, "info");
    }
  };

  const toggleProductStatus = async (id: string) => {
    const item = products.find(p => p.id === id);
    if (!item) return;
    const newStatus = !item.is_active;

    // 1. Instant local toggle
    const localUpdated = products.map(p => p.id === id ? { ...p, is_active: newStatus, stock: newStatus ? 30 : 0 } : p);
    saveProductsToStorage(localUpdated);

    // 2. Update status in Supabase DB
    const res = await updateSupabaseProduct(id, { is_active: newStatus });
    if (res && res.success) {
      await syncSupabaseData();
    }
    showToast(`Đã ${newStatus ? 'Bật' : 'Tắt'} trạng thái sản phẩm "${item.name}"`, newStatus ? "success" : "warning");
  };

  const resetDemoData = () => {
    saveProductsToStorage(INITIAL_VIETNAMESE_PRODUCTS);
    showToast("Đã khôi phục dữ liệu sản phẩm mẫu Tiếng Việt", "info");
  };

  // Filter & Sort computation
  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter || p.category_id === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === "in_stock") matchesStock = (p.stock > 5) && p.is_active !== false;
    else if (stockFilter === "low_stock") matchesStock = p.stock > 0 && p.stock <= 5;
    else if (stockFilter === "out_of_stock") matchesStock = p.stock === 0 || p.is_active === false;

    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    if (sortBy === "price_low") return a.price - b.price;
    if (sortBy === "price_high") return b.price - a.price;
    if (sortBy === "stock_low") return a.stock - b.stock;
    if (sortBy === "stock_high") return b.stock - a.stock;
    if (sortBy === "name_asc") return a.name.localeCompare(b.name, 'vi');
    return 0;
  });

  return (
    <ProductContext.Provider
      value={{
        products,
        filteredProducts,
        categories,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        stockFilter,
        setStockFilter,
        sortBy,
        setSortBy,
        isAddModalOpen,
        setIsAddModalOpen,
        editingProduct,
        setEditingProduct,
        deletingProduct,
        setDeletingProduct,
        viewingProduct,
        setViewingProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        resetDemoData,
        syncSupabaseData,
        isSupabaseConnected,
        theme,
        toggleTheme,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
};
