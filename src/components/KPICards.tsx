"use client";

import React from "react";
import { useProduct } from "@/context/ProductContext";
import { Package, DollarSign, AlertTriangle, XCircle, TrendingUp, TrendingDown } from "lucide-react";

export const KPICards: React.FC = () => {
  const { products } = useProduct();

  const totalProds = products.length;
  const totalRevenue = products.reduce((sum, p) => sum + p.price * (p.stock || 1), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter(p => p.stock === 0 || p.is_active === false).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Products */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng Số Sản Phẩm DB</span>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white mb-2">{totalProds}</div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +15.2%
          </span>
          <span className="text-slate-500">so với tháng trước</span>
        </div>
      </div>

      {/* Revenue Valuation */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng Giá Trị Kho Hàng</span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white mb-2">{totalRevenue.toLocaleString('vi-VN')} đ</div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +24%
          </span>
          <span className="text-slate-500">định giá tồn kho</span>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cảnh Báo Kho Sắp Hết</span>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white mb-2">{lowStockCount}</div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
            Còn dưới 5 sản phẩm
          </span>
        </div>
      </div>

      {/* Out of Stock */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đã Tắt / Hết Hàng</span>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white mb-2">{outOfStockCount}</div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Cần nhập thêm
          </span>
        </div>
      </div>
    </div>
  );
};
