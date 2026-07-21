"use client";

import React from "react";
import { useProduct } from "@/context/ProductContext";
import { AlertTriangle, Trash2, X } from "lucide-react";

export const DeleteConfirmModal: React.FC = () => {
  const { deletingProduct, setDeletingProduct, deleteProduct } = useProduct();

  if (!deletingProduct) return null;

  const handleConfirm = async () => {
    await deleteProduct(deletingProduct.id);
    setDeletingProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={() => setDeletingProduct(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-extrabold text-white mb-2">Xác Nhận Xóa Sản Phẩm?</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Hành động này sẽ xóa vĩnh viễn sản phẩm khỏi hệ thống và cơ sở dữ liệu Supabase Cloud. Bạn có chắc chắn muốn tiếp tục?
          </p>

          <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl mb-6">
            <p className="text-sm font-bold text-white mb-1">{deletingProduct.name}</p>
            <p className="text-xs text-slate-400">Mã SKU: {deletingProduct.sku} • Danh mục: {deletingProduct.category}</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingProduct(null)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 transition active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa Vĩnh Viễn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
