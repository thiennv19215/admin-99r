"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col fixed top-0 bottom-0 left-0 z-40 transition-all">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-indigo-500/30">
          A
        </div>
        <div>
          <div className="font-extrabold text-lg tracking-tight text-white">AdminPulse</div>
          <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">
            NEXT.JS v14
          </span>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-3 pt-2 pb-1">
          Menu Chính
        </div>
        
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 shadow-md shadow-indigo-600/30"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Bảng Điều Khiển</span>
        </a>

        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <Package className="w-4 h-4" />
          <span>Sản Phẩm & Prompt</span>
        </a>

        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Đơn Hàng</span>
        </a>

        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <Users className="w-4 h-4" />
          <span>Khách Hàng</span>
        </a>

        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Thống Kê DB</span>
        </a>

        <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-3 pt-4 pb-1">
          Cài Đặt Hệ Thống
        </div>

        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <Settings className="w-4 h-4" />
          <span>Cấu Hình Admin</span>
        </a>

        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Bảo Mật Supabase</span>
        </a>
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"}
            alt="User"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500"
          />
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-white truncate">{user?.name || "Admin Quản Lý"}</span>
            <span className="text-[11px] text-slate-400 truncate">{user?.email || "admin@adminpulse.io"}</span>
          </div>
        </div>

        <button
          onClick={logout}
          title="Đăng xuất"
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
