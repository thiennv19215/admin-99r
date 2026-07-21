"use client";

import React, { useState } from "react";
import { useProduct } from "@/context/ProductContext";
import { X, Copy, Check, Sparkles, Tag, Eye, Flame, Edit2, ShieldCheck } from "lucide-react";

export const ProductDetailModal: React.FC = () => {
  const { viewingProduct, setViewingProduct, setEditingProduct, showToast } = useProduct();
  const [copied, setCopied] = useState(false);

  if (!viewingProduct) return null;

  const handleCopyPrompt = () => {
    const textToCopy = viewingProduct.prompt_text || viewingProduct.description || viewingProduct.name;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast("Đã sao chép nội dung Prompt vào bộ nhớ tạm!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-blue-950/40 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Chi Tiết Sản Phẩm & Prompt DB</h2>
              <p className="text-xs text-slate-400">Mã SKU: {viewingProduct.sku}</p>
            </div>
          </div>
          <button
            onClick={() => setViewingProduct(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Main Info Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
            <img
              src={viewingProduct.image}
              alt={viewingProduct.name}
              className="w-20 h-20 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop";
              }}
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">{viewingProduct.name}</h3>
                {viewingProduct.is_hot && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                    <Flame className="w-3 h-3" /> HOT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{viewingProduct.description}</p>
              
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold rounded-md">
                  {viewingProduct.category}
                </span>
                <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold rounded-md">
                  AI: {viewingProduct.ai_model || "ChatGPT"}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded-md">
                  {viewingProduct.price ? `${viewingProduct.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                </span>
              </div>
            </div>
          </div>

          {/* Prompt Text Section with 1-Click Copy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Nội dung Prompt Chi Tiết</span>
              </label>
              <button
                onClick={handleCopyPrompt}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow transition active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao Chép Prompt</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
              {viewingProduct.prompt_text || viewingProduct.description || "Chưa có nội dung prompt chi tiết."}
            </div>
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-slate-400 font-semibold block mb-1">Loại Prompt</span>
              <span className="font-bold text-white uppercase">{viewingProduct.prompt_type || 'text'}</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-slate-400 font-semibold block mb-1">Lượt Xem / Stock</span>
              <span className="font-bold text-white">{viewingProduct.stock} lượt</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-slate-400 font-semibold block mb-1">Trạng Thái</span>
              <span className={`font-bold ${viewingProduct.is_active !== false ? 'text-emerald-400' : 'text-red-400'}`}>
                {viewingProduct.is_active !== false ? 'Đang hoạt động' : 'Đã tắt'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={() => {
              setEditingProduct(viewingProduct);
              setViewingProduct(null);
            }}
            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 text-xs font-bold rounded-xl flex items-center gap-2 transition"
          >
            <Edit2 className="w-4 h-4" />
            <span>Chỉnh sửa sản phẩm này</span>
          </button>

          <button
            onClick={() => setViewingProduct(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
