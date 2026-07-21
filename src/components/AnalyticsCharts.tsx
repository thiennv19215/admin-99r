"use client";

import React from "react";
import { useProduct } from "@/context/ProductContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const salesData = [
  { month: "T1", revenue: 28500000 },
  { month: "T2", revenue: 32000000 },
  { month: "T3", revenue: 29800000 },
  { month: "T4", revenue: 41000000 },
  { month: "T5", revenue: 38500000 },
  { month: "T6", revenue: 48000000 },
  { month: "T7", revenue: 52400000 },
  { month: "T8", revenue: 49000000 },
  { month: "T9", revenue: 58000000 },
  { month: "T10", revenue: 64200000 },
  { month: "T11", revenue: 71000000 },
  { month: "T12", revenue: 85400000 },
];

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"];

export const AnalyticsCharts: React.FC = () => {
  const { products } = useProduct();

  // Aggregate category stock level
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + (p.stock || 1);
    return acc;
  }, {} as Record<string, number>);

  const categoryPieData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Area Chart */}
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-extrabold text-white">Tổng Quan Doanh Thu & Tăng Trưởng</h2>
            <p className="text-xs text-slate-400">Tình hình kinh doanh theo các tháng năm 2026</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
            Năm Tài Chính 2026
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000000}Tr`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(value: number) => [`${value.toLocaleString('vi-VN')} đ`, 'Doanh Thu']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Doughnut Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-extrabold text-white">Tồn Kho Theo Danh Mục DB</h2>
          <p className="text-xs text-slate-400">Tỷ lệ phân bố số lượng sản phẩm</p>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryPieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(val: number) => [`${val} sản phẩm`, 'Số lượng']}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
