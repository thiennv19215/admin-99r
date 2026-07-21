"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { AdminLogin } from "@/components/AdminLogin";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { KPICards } from "@/components/KPICards";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ProductTable } from "@/components/ProductTable";
import { ProductFormModal } from "@/components/ProductFormModal";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { CategoryModal } from "@/components/CategoryModal";
import { ToastContainer } from "@/components/ToastContainer";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Đang tải AdminPulse...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Container */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        <Header />

        {/* Content Body */}
        <main className="p-8 space-y-8 flex-1">
          {/* KPI Summary Cards */}
          <KPICards />

          {/* Revenue & Category Analytics */}
          <AnalyticsCharts />

          {/* Product Data Table & Controls */}
          <ProductTable />
        </main>
      </div>

      {/* Modals & Overlays */}
      <ProductFormModal />
      <ProductDetailModal />
      <DeleteConfirmModal />
      <CategoryModal />
      <ToastContainer />
    </div>
  );
}
