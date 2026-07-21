"use client";

import React, { useState } from "react";
import { useProduct } from "@/context/ProductContext";
import { X, Layers, Plus, Trash2, Tag, Loader2, Sparkles, FolderPlus } from "lucide-react";

export const CategoryModal: React.FC = () => {
  const {
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    categories,
    products,
    addCategory,
    deleteCategory,
    showToast
  } = useProduct();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isCategoryModalOpen) return null;

  const closeModal = () => {
    setIsCategoryModalOpen(false);
    setName("");
    setDescription("");
    setErrorMsg("");
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập tên ngành prompt / danh mục.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await addCategory(name.trim(), description.trim());
      setName("");
      setDescription("");
    } catch (err: any) {
      setErrorMsg("Lỗi tạo ngành prompt: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa ngành prompt "${catName}"?`)) return;
    try {
      await deleteCategory(id);
    } catch (e: any) {
      showToast("Không thể xóa ngành prompt: " + e.message, "danger");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-indigo-950/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Quản Lý Ngành Prompt / Danh Mục DB</h2>
              <p className="text-xs text-slate-400">Thêm, sửa và quản lý danh mục prompt trên Supabase DB</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
              <FolderPlus className="w-4 h-4" />
              <span>Thêm Ngành Prompt Mới</span>
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                {errorMsg}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Tên Ngành Prompt <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Video AI, Marketing..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Mô tả ngắn
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="VD: Tổng hợp các câu lệnh video..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Thêm Ngành Prompt</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* List of Existing Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                <span>Danh sách Ngành Prompt ({categories.length})</span>
              </h3>
            </div>

            {categories.length === 0 ? (
              <div className="py-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500 text-xs">
                Chưa có ngành prompt nào. Hãy nhập tên ở trên để thêm ngành mới!
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const productCount = products.filter(
                    (p) => p.category_id === cat.id || p.category?.toLowerCase() === cat.name.toLowerCase()
                  ).length;

                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {cat.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{cat.name}</span>
                            <span className="text-[10px] font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                              {productCount} sản phẩm
                            </span>
                          </p>
                          {cat.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{cat.description}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        title="Xóa ngành prompt"
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
