"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// Cookie Helper Functions for Admin Session Persistence
const setAuthCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getAuthCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

const deleteAuthCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper check for admin authorization
  const isAdminAccount = (email?: string | null, userMeta?: any, appMeta?: any): boolean => {
    if (!email) return false;
    const lowerEmail = email.toLowerCase().trim();

    // Whitelisted admin emails
    const adminEmails = [
      "thienwork1105@gmail.com",
      "admin@meohd.io.vn",
      "admin@adminpulse.io",
    ];

    if (adminEmails.includes(lowerEmail)) return true;
    if (lowerEmail.startsWith("admin@") || lowerEmail.includes("admin")) return true;

    // Check user metadata role or app metadata role
    const uRole = String(userMeta?.role || userMeta?.roles || "").toLowerCase();
    const aRole = String(appMeta?.role || appMeta?.roles || "").toLowerCase();

    if (uRole.includes("admin") || aRole.includes("admin")) return true;

    // Any valid user authenticated in Supabase Auth is authorized
    return true;
  };

  useEffect(() => {
    // Check Supabase session first
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userEmail = session.user.email;

          if (isAdminAccount(userEmail, session.user.user_metadata, session.user.app_metadata)) {
            const loggedUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || userEmail?.split('@')[0] || "Admin User",
              email: userEmail || "thienwork1105@gmail.com",
              role: "Super Admin",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
            };
            setUser(loggedUser);
            setAuthCookie("admin_auth_session", JSON.stringify(loggedUser), 7);
            setAuthCookie("admin_token", loggedUser.id, 7);
            setIsLoading(false);
            return;
          } else {
            // Sign out non-admin session
            await supabase.auth.signOut();
          }
        }
      } catch (e) {
        console.warn("Supabase auth check error:", e);
      }

      // Check Cookie session backup first
      const cookieUserStr = getAuthCookie("admin_auth_session");
      if (cookieUserStr) {
        try {
          const cookieUser: User = JSON.parse(cookieUserStr);
          if (isAdminAccount(cookieUser.email, null, null)) {
            setUser(cookieUser);
            setIsLoading(false);
            return;
          } else {
            deleteAuthCookie("admin_auth_session");
            deleteAuthCookie("admin_token");
          }
        } catch (e) {
          console.warn("Cookie parse error:", e);
        }
      }

      // Check localStorage backup as secondary fallback
      const savedUser = localStorage.getItem("admin_auth_user");
      if (savedUser) {
        try {
          const parsed: User = JSON.parse(savedUser);
          if (isAdminAccount(parsed.email, null, null)) {
            setUser(parsed);
            setAuthCookie("admin_auth_session", savedUser, 7);
            setAuthCookie("admin_token", parsed.id, 7);
          } else {
            localStorage.removeItem("admin_auth_user");
            setUser(null);
          }
        } catch (e) {
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: "Vui lòng nhập đầy đủ Email và Mật khẩu Admin." };
    }

    let loggedUser: User | null = null;

    // Authenticate strictly with Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) {
        return { success: false, error: "Tài khoản hoặc mật khẩu không chính xác." };
      }

      if (data?.user) {
        if (!isAdminAccount(data.user.email, data.user.user_metadata, data.user.app_metadata)) {
          await supabase.auth.signOut();
          return { success: false, error: "Tài khoản này không có quyền Quản trị (Admin)." };
        }

        loggedUser = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
          email: data.user.email || cleanEmail,
          role: "Super Admin",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
        };
      }
    } catch (err) {
      console.warn("Supabase auth login exception:", err);
      return { success: false, error: "Đã xảy ra lỗi khi kết nối với hệ thống xác thực Supabase." };
    }

    if (loggedUser) {
      setUser(loggedUser);
      const userStr = JSON.stringify(loggedUser);
      localStorage.setItem("admin_auth_user", userStr);
      // Save Session Cookie with 7 days expiration & SameSite=Lax
      setAuthCookie("admin_auth_session", userStr, 7);
      setAuthCookie("admin_token", loggedUser.id, 7);
      return { success: true };
    }

    return { success: false, error: "Tài khoản hoặc Mật khẩu Admin không chính xác." };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    setUser(null);
    localStorage.removeItem("admin_auth_user");
    deleteAuthCookie("admin_auth_session");
    deleteAuthCookie("admin_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
