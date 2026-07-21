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

  // Verify admin authorization directly from Supabase Auth user & DB profiles table
  const verifyAdminFromSupabase = async (supabaseUser: any): Promise<boolean> => {
    if (!supabaseUser) return false;

    // 1. Check metadata role in Supabase Auth user object
    const userRole = supabaseUser.user_metadata?.role || supabaseUser.app_metadata?.role;
    if (userRole) {
      const roleStr = String(userRole).toLowerCase();
      if (roleStr.includes("admin")) return true;
      if (roleStr === "user" || roleStr === "member" || roleStr === "customer") {
        return false;
      }
    }

    // 2. Try checking 'profiles' or 'users' table in Supabase DB if present
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      if (profile?.role) {
        const pRole = String(profile.role).toLowerCase();
        return pRole.includes("admin");
      }
    } catch (e) {
      // If table doesn't exist, ignore exception
    }

    // 3. Any user authenticated in this Supabase Auth project is accepted by default
    return true;
  };

  useEffect(() => {
    // Check Supabase session first
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isAllowed = await verifyAdminFromSupabase(session.user);
          if (isAllowed) {
            const userEmail = session.user.email || "";
            const loggedUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split('@')[0] || "Quản Trị Viên",
              email: userEmail,
              role: session.user.user_metadata?.role || "Super Admin",
              avatar: session.user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
            };
            setUser(loggedUser);
            setAuthCookie("admin_auth_session", JSON.stringify(loggedUser), 7);
            setAuthCookie("admin_token", loggedUser.id, 7);
            setIsLoading(false);
            return;
          } else {
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
          if (cookieUser?.id) {
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
          if (parsed?.id) {
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

    try {
      // Authenticate strictly with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) {
        return { success: false, error: error.message || "Tài khoản hoặc mật khẩu không chính xác." };
      }

      if (data?.user) {
        const isAllowed = await verifyAdminFromSupabase(data.user);
        if (!isAllowed) {
          await supabase.auth.signOut();
          return { success: false, error: "Tài khoản này không có quyền Quản trị (Admin)." };
        }

        const loggedUser: User = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || cleanEmail.split('@')[0],
          email: data.user.email || cleanEmail,
          role: data.user.user_metadata?.role || "Super Admin",
          avatar: data.user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
        };

        setUser(loggedUser);
        const userStr = JSON.stringify(loggedUser);
        localStorage.setItem("admin_auth_user", userStr);
        setAuthCookie("admin_auth_session", userStr, 7);
        setAuthCookie("admin_token", loggedUser.id, 7);
        return { success: true };
      }
    } catch (err: any) {
      console.warn("Supabase auth login exception:", err);
      return { success: false, error: err?.message || "Đã xảy ra lỗi khi kết nối với hệ thống xác thực Supabase." };
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
