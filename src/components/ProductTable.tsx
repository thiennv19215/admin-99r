"use client";

import React from "react";
import { useProduct } from "@/context/ProductContext";
import { StockFilter, SortOption } from "@/types";
import { Edit2, Trash2, Eye, RefreshCw, Filter, Layers, Flame, Copy, ToggleLeft, ToggleRight } from "lucide-react";

export const ProductTable: React.FC = () => {
  const {
    products,
    filteredProducts,
    categories,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
    sortBy,
    setSortBy,
    setEditingProduct,
    setDeletingProduct,
    setViewingProduct,
    toggleProductStatus,
    resetDemoData,
    showToast,
  } = useProduct();

  // Unified category options
  const uniqueCategories = Array.from(
    new Set([
      ...categories.map((c) => c.name),
      ...products.map((p) => p.category),
    ])
  ).filter(Boolean);

  const handleCopyPromptText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Đã sao chép nội dung Prompt vào bộ nhớ tạm!", "success");
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer font-semibold"
            >
              <option value="all" className="bg-slate-900 text-white">Tất cả danh mục</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer font-semibold"
            >
              <option value="all" className="bg-slate-900 text-white">Tất cả trạng thái kho</option>
              <option value="in_stock" className="bg-slate-900 text-white">Còn hàng (&gt;5)</option>
              <option value="low_stock" className="bg-slate-900 text-white">Sắp hết (1-5)</option>
              <option value="out_of_stock" className="bg-slate-900 text-white">Hết hàng (0)</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer font-semibold"
            >
              <option value="default" className="bg-slate-900 text-white">Sắp xếp: Mặc định</option>
              <option value="price_low" className="bg-slate-900 text-white">Giá: Thấp đến Cao</option>
              <option value="price_high" className="bg-slate-900 text-white">Giá: Cao đến Thấp</option>
              <option value="stock_low" className="bg-slate-900 text-white">Tồn kho: Thấp đến Cao</option>
              <option value="stock_high" className="bg-slate-900 text-white">Tồn kho: Cao đến Thấp</option>
              <option value="name_asc" className="bg-slate-900 text-white">Tên: A đến Z</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">
            Hiển thị <span className="text-white font-bold">{filteredProducts.length}</span> / {products.length} sản phẩm DB
          </span>
          <button
            onClick={resetDemoData}
            title="Khôi phục dữ liệu sản phẩm mẫu Tiếng Việt"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tải mẫu</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">Thông tin Sản phẩm / Prompt</th>
                <th className="py-3.5 px-5">Danh mục DB</th>
                <th className="py-3.5 px-5">Giá bán</th>
                <th className="py-3.5 px-5">Bật / Tắt</th>
                <th className="py-3.5 px-5">Mô hình AI</th>
                <th className="py-3.5 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="text-base font-bold text-slate-400">Không tìm thấy sản phẩm phù hợp</p>
                    <p className="text-xs mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bỏ lọc danh mục.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  let stockBadgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  let stockLabel = `Đang hoạt động (${p.stock})`;
                  if (p.stock === 0 || p.is_active === false) {
                    stockBadgeClass = "bg-red-500/10 text-red-400 border-red-500/20";
                    stockLabel = "Tắt / Hết hàng";
                  } else if (p.stock <= 5) {
                    stockBadgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                    stockLabel = `Sắp hết (${p.stock})`;
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={p.image}
                            alt={p.name}
                            onClick={() => setViewingProduct(p)}
                            className="w-11 h-11 rounded-xl object-cover bg-slate-800 border border-slate-700/80 shrink-0 cursor-pointer hover:opacity-80 transition"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop";
                            }}
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewingProduct(p)}
                                className="font-bold text-white text-sm leading-snug hover:text-indigo-400 text-left transition"
                              >
                                {p.name}
                              </button>
                              {p.is_hot && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                                  <Flame className="w-3 h-3" /> HOT
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">SKU: {p.sku}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 border border-slate-700/60 text-indigo-300 rounded-lg">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-extrabold text-white text-sm">
                          {p.price ? `${p.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <button
                          onClick={() => toggleProductStatus(p.id)}
                          title="Click để Bật/Tắt trạng thái nhanh"
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          {p.is_active !== false ? (
                            <ToggleRight className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-500 group-hover:scale-110 transition" />
                          )}
                          <span className={`text-xs font-bold ${p.is_active !== false ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {p.is_active !== false ? 'Bật' : 'Tắt'}
                          </span>
                        </button>
                      </td>

                      <td className="py-4 px-5">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                          {p.ai_model || "ChatGPT"}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingProduct(p)}
                            title="Xem chi tiết Prompt"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCopyPromptText(p.prompt_text || p.description || p.name)}
                            title="Sao chép câu lệnh Prompt"
                            className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg transition"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingProduct(p)}
                            title="Sửa sản phẩm"
                            className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            title="Xóa sản phẩm"
                            className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
