"use client";

import React from "react";
import { useProduct } from "@/context/ProductContext";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useProduct();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = "border-emerald-500/30 bg-slate-900/90 text-emerald-400";
        let Icon = CheckCircle2;

        if (toast.type === "danger") {
          borderClass = "border-red-500/30 bg-slate-900/90 text-red-400";
          Icon = AlertCircle;
        } else if (toast.type === "warning") {
          borderClass = "border-amber-500/30 bg-slate-900/90 text-amber-400";
          Icon = AlertTriangle;
        } else if (toast.type === "info") {
          borderClass = "border-indigo-500/30 bg-slate-900/90 text-indigo-400";
          Icon = Info;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 border rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 ${borderClass}`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold text-white">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
