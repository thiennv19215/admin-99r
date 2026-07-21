import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ProductProvider } from "@/context/ProductContext";

export const metadata: Metadata = {
  title: "AdminPulse - Product Management & Analytics",
  description: "Next.js Admin Dashboard with full Product CRUD operations, live analytics, and role-based authentication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <ProductProvider>
            {children}
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
