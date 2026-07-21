"use client";

import React, { useState, useEffect } from "react";
import { useProduct } from "@/context/ProductContext";
import { StockFilter, SortOption, Product } from "@/types";
import {
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Filter,
  Layers,
  Flame,
  Copy,
  ToggleLeft,
  ToggleRight,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Download,
  Power,
  Trash
} from "lucide-react";

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
    syncSupabaseData,
    showToast,
    updateProduct,
    deleteProduct
  } = useProduct();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Reset pagination when filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, stockFilter, sortBy, filteredProducts.length]);

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

  // Multi-select handlers
  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.includes(p.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkToggleStatus = async (activate: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => updateProduct(id, { is_active: activate }))
      );
      showToast(`Đã ${activate ? "bật" : "tắt"} trạng thái cho ${selectedIds.length} sản phẩm`, "success");
      setSelectedIds([]);
    } catch (e: any) {
      showToast(`Lỗi thao tác hàng loạt: ${e.message}`, "danger");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteProduct(id)));
      showToast(`Đã xóa ${selectedIds.length} sản phẩm đã chọn khỏi DB`, "danger");
      setSelectedIds([]);
    } catch (e: any) {
      showToast(`Lỗi xóa hàng loạt: ${e.message}`, "danger");
    }
  };

  const handleExportSelectedCSV = () => {
    const selectedProds = products.filter((p) => selectedIds.includes(p.id));
    if (selectedProds.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,ID,Tên sản phẩm,Mã SKU,Danh mục,Giá bán,Tồn kho,Trạng thái\n";
    selectedProds.forEach((p) => {
      csvContent += `"${p.id}","${p.name}","${p.sku}","${p.category}",${p.price},${p.stock},"${p.is_active ? 'Bật' : 'Tắt'}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `san_pham_da_chon_${selectedProds.length}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Đã xuất ${selectedProds.length} sản phẩm chọn ra CSV`, "success");
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-4">
      {/* Bulk Action Notification Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-950/90 border border-indigo-500/40 rounded-2xl p-3.5 px-5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-bold text-white">
              Đã chọn <span className="text-indigo-400 font-extrabold">{selectedIds.length}</span> / {filteredProducts.length} sản phẩm
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkToggleStatus(true)}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Bật Tất Cả</span>
            </button>

            <button
              onClick={() => handleBulkToggleStatus(false)}
              className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Power className="w-3.5 h-3.5 text-amber-400" />
              <span>Tắt Tất Cả</span>
            </button>

            <button
              onClick={handleExportSelectedCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Xuất CSV Đã Chọn</span>
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Xóa Đã Chọn</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="text-xs font-semibold text-slate-400 hover:text-white ml-2 underline"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

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

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-2">
            Hiển thị <span className="text-white font-bold">{filteredProducts.length}</span> / {products.length} sản phẩm DB
          </span>
          <button
            onClick={async () => {
              await syncSupabaseData();
              showToast("Đã đồng bộ dữ liệu mới nhất từ Supabase DB!", "success");
            }}
            title="Đồng bộ lại dữ liệu trực tiếp từ Supabase DB"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 rounded-xl transition text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Làm mới DB</span>
          </button>

          <button
            onClick={resetDemoData}
            title="Nạp 4 sản phẩm mẫu Tiếng Việt vào Supabase DB"
            className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl transition text-xs font-bold flex items-center gap-1.5"
          >
            <span>Nạp mẫu DB</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 w-10 text-center">
                  <button onClick={handleSelectAll} title="Chọn tất cả">
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Thông tin Sản phẩm / Prompt</th>
                <th className="py-3.5 px-4">Danh mục DB</th>
                <th className="py-3.5 px-4">Giá bán</th>
                <th className="py-3.5 px-4">Bật / Tắt</th>
                <th className="py-3.5 px-4">Mô hình AI</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-base font-bold text-slate-400">Không tìm thấy sản phẩm phù hợp</p>
                    <p className="text-xs mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bỏ lọc danh mục.</p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/40 transition ${isSelected ? 'bg-indigo-950/30' : ''}`}
                    >
                      <td className="py-4 px-4 text-center">
                        <button onClick={() => handleToggleSelect(p.id)}>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-4">
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

                      <td className="py-4 px-4">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 border border-slate-700/60 text-indigo-300 rounded-lg">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-extrabold text-white text-sm">
                          {p.price ? `${p.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
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

                      <td className="py-4 px-4">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                          {p.ai_model || "ChatGPT"}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
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

        {/* Pagination Controls Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4 text-xs">
            <span className="text-slate-400 font-semibold">
              Trang <span className="text-white font-bold">{currentPage}</span> / {totalPages} (Tổng {filteredProducts.length} mục)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 flex items-center gap-1 font-bold transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                    currentPage === page
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 flex items-center gap-1 font-bold transition"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
