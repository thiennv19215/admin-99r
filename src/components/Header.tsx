"use client";

import React, { useEffect, useRef } from "react";
import { useProduct } from "@/context/ProductContext";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Plus,
  Download,
  Moon,
  Sun,
  Bell,
  LogOut,
  Database,
  RefreshCw,
} from "lucide-react";

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, setIsAddModalOpen, theme, toggleTheme, filteredProducts, showToast, syncSupabaseData } = useProduct();
  const { logout } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcuts (Ctrl + K for Search, Ctrl + N for Add New)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsAddModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsAddModalOpen]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Tên sản phẩm,Mã SKU,Danh mục,Giá bán,Tồn kho,Xếp hạng\n";
    filteredProducts.forEach(p => {
      csvContent += `"${p.id}","${p.name}","${p.sku}","${p.category}",${p.price},${p.stock},${p.rating}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "danh_sach_san_pham.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Đã xuất ${filteredProducts.length} sản phẩm ra file CSV`, "success");
  };

  const handleSync = async () => {
    await syncSupabaseData();
    showToast("Đã đồng bộ trực tiếp dữ liệu từ Supabase Cloud!", "info");
  };

  return (
    <header className="h-18 px-8 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-extrabold text-white tracking-tight">Quản Lý Sản Phẩm DB</h1>

        {/* Supabase Live Connection Indicator Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Database className="w-3.5 h-3.5" />
          <span>Supabase Kết Nối Live</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar with Ctrl+K shortcut badge */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm, SKU..."
            className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-full py-2 pl-10 pr-12 text-xs text-white placeholder-slate-400 outline-none transition"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-700/60 px-1.5 py-0.5 rounded border border-slate-600">
            Ctrl K
          </kbd>
        </div>

        {/* Sync Supabase Button */}
        <button
          onClick={handleSync}
          title="Đồng bộ lại từ Supabase"
          className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500 flex items-center justify-center transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Đổi Giao diện Sáng/Tối"
          className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 flex items-center justify-center transition"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notification Bell */}
        <button
          title="Thông báo"
          className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 flex items-center justify-center relative transition"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5" />
        </button>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCSV}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất CSV</span>
        </button>

        {/* Add Product Button with Ctrl+N badge */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
          <kbd className="hidden sm:inline-block text-[10px] bg-indigo-700/60 px-1.5 py-0.5 rounded border border-indigo-400/40 text-indigo-100">
            Ctrl N
          </kbd>
        </button>

        {/* Header Logout Quick Button */}
        <button
          onClick={logout}
          title="Đăng xuất"
          className="ml-2 text-xs font-bold text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition px-2 py-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Thoát</span>
        </button>
      </div>
    </header>
  );
};
