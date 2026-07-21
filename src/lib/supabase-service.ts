import { supabase } from "./supabase";
import { Product, Category, ProductPrompt } from "@/types";

/**
 * Upload image file to Supabase Storage bucket or fallback to Data URL
 */
export async function uploadImageToSupabase(file: File): Promise<{ url?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Try uploading to Supabase Storage 'product-images' bucket
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
      return { url: publicUrlData.publicUrl };
    }

    // Try secondary bucket 'prompts'
    const { data: pData, error: pErr } = await supabase.storage
      .from('prompts')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (!pErr && pData) {
      const { data: publicUrlData } = supabase.storage.from('prompts').getPublicUrl(filePath);
      return { url: publicUrlData.publicUrl };
    }
  } catch (err) {
    console.warn("Storage bucket upload exception, falling back to base64 encoding:", err);
  }

  // Guaranteed fallback: Convert local file to Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ url: reader.result as string });
    };
    reader.onerror = () => {
      resolve({ error: "Không thể đọc định dạng file ảnh này." });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Fetch all categories from Supabase 'categories' table
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return [];
  }
}

/**
 * Insert new category into Supabase 'categories' table
 */
export async function createSupabaseCategory(name: string, description?: string): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || `cat-${Date.now()}`;

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: name.trim(), slug, description: description?.trim() || "" }])
      .select()
      .single();

    if (!error && data) {
      return { success: true, data };
    }
    return { success: false, error: error?.message || "Lỗi tạo danh mục trên Supabase" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete category from Supabase 'categories' table
 */
export async function deleteSupabaseCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) return { success: true };
    return { success: false, error: error.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch products from Supabase 'prompts' or 'products' table
 */
export async function fetchSupabaseProducts(): Promise<{ products: Product[]; rawPrompts: ProductPrompt[] }> {
  try {
    // 1. Try querying 'prompts' table
    let promptData: any[] = [];
    const { data: pData, error: pErr } = await supabase
      .from("prompts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!pErr && pData && pData.length > 0) {
      promptData = pData;
    } else {
      // 2. Try querying 'products' table if prompts is empty or not found
      const { data: prodData } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (prodData && prodData.length > 0) {
        promptData = prodData;
      }
    }

    if (promptData && promptData.length > 0) {
      const mappedProducts: Product[] = promptData.map((p: any) => ({
        id: p.id,
        name: p.title || p.name || "Sản phẩm Prompt",
        sku: p.sku || (p.slug ? p.slug.toUpperCase() : `PRM-${p.id.toString().substring(0, 6)}`),
        category: p.category || p.categories?.name || p.ai_model || "Tổng hợp",
        price: p.price !== undefined && p.price !== null ? p.price : (p.copy_count ? p.copy_count * 10000 : 150000),
        stock: p.stock !== undefined && p.stock !== null ? p.stock : (p.is_active !== false ? (p.view_count || 25) : 0),
        image: p.thumbnail_url || p.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
        rating: p.rating ?? (p.is_hot ? 5.0 : 4.8),
        description: p.prompt_text || p.description || "",
        ai_model: p.ai_model || "ChatGPT",
        prompt_type: p.prompt_type || "text",
        prompt_text: p.prompt_text || p.description || "",
        category_id: p.category_id || "",
        is_active: p.is_active !== false,
        is_hot: !!p.is_hot,
      }));

      return { products: mappedProducts, rawPrompts: promptData };
    }
  } catch (err) {
    console.warn("Supabase fetch exception:", err);
  }

  return { products: [], rawPrompts: [] };
}

/**
 * Insert new product/prompt into Supabase database ('prompts' or 'products')
 */
export async function createSupabaseProduct(payload: {
  title: string;
  prompt_text: string;
  description?: string;
  category_id?: string;
  ai_model?: string;
  prompt_type?: string;
  thumbnail_url?: string;
  is_active?: boolean;
  is_hot?: boolean;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;

    const slug = payload.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || `prompt-${Date.now()}`;

    const promptBody: any = {
      title: payload.title,
      prompt_text: payload.prompt_text,
      description: payload.description || "",
      prompt_type: payload.prompt_type || "text",
      thumbnail_url: payload.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
      ai_model: payload.ai_model || "ChatGPT",
      category_id: payload.category_id || null,
      is_active: payload.is_active ?? true,
      is_hot: payload.is_hot ?? false,
      submission_status: "approved",
      slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (currentUser?.id) {
      promptBody.created_by = currentUser.id;
    }

    // Attempt 1: Insert into 'prompts'
    const { data: prData, error: prErr } = await supabase
      .from("prompts")
      .insert([promptBody])
      .select()
      .single();

    if (!prErr && prData) {
      return { success: true, data: prData };
    }

    // Attempt 2: Insert into 'products'
    const prodBody = {
      name: payload.title,
      sku: slug.toUpperCase(),
      category: payload.ai_model || "Sản phẩm",
      price: 200000,
      stock: payload.is_active !== false ? 50 : 0,
      image: payload.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
      description: payload.prompt_text || payload.description || "",
      is_active: payload.is_active ?? true,
      is_hot: payload.is_hot ?? false,
      created_at: new Date().toISOString()
    };

    const { data: pData, error: pErr } = await supabase
      .from("products")
      .insert([prodBody])
      .select()
      .single();

    if (!pErr && pData) {
      return { success: true, data: pData };
    }

    return { success: false, error: prErr?.message || pErr?.message || "Lỗi tạo sản phẩm trên Supabase" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Update product/prompt in Supabase database
 */
export async function updateSupabaseProduct(
  id: string,
  payload: {
    title?: string;
    prompt_text?: string;
    description?: string;
    category_id?: string;
    ai_model?: string;
    prompt_type?: string;
    thumbnail_url?: string;
    is_active?: boolean;
    is_hot?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Local demo products have string IDs like "prod_1" - skip Supabase DB query for demo items
    if (typeof id === "string" && id.startsWith("prod_")) {
      return { success: true };
    }

    const updateBody: any = {
      updated_at: new Date().toISOString(),
    };

    if (payload.title !== undefined) updateBody.title = payload.title;
    if (payload.prompt_text !== undefined) updateBody.prompt_text = payload.prompt_text;
    if (payload.description !== undefined) updateBody.description = payload.description;
    if (payload.category_id !== undefined) updateBody.category_id = payload.category_id || null;
    if (payload.ai_model !== undefined) updateBody.ai_model = payload.ai_model;
    if (payload.prompt_type !== undefined) updateBody.prompt_type = payload.prompt_type;
    if (payload.thumbnail_url !== undefined) updateBody.thumbnail_url = payload.thumbnail_url;
    if (payload.is_active !== undefined) updateBody.is_active = payload.is_active;
    if (payload.is_hot !== undefined) updateBody.is_hot = payload.is_hot;

    // Try update on 'prompts'
    const { error: prErr } = await supabase
      .from("prompts")
      .update(updateBody)
      .eq("id", id);

    if (!prErr) return { success: true };

    // Fallback update on 'products'
    const { error: pErr } = await supabase
      .from("products")
      .update({
        name: payload.title,
        description: payload.description || payload.prompt_text,
        image: payload.thumbnail_url,
        is_active: payload.is_active,
        is_hot: payload.is_hot,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (!pErr) return { success: true };

    return { success: false, error: prErr?.message || pErr?.message || "Lỗi cập nhật sản phẩm trên Supabase" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete product from Supabase database
 */
export async function deleteSupabaseProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof id === "string" && id.startsWith("prod_")) {
      return { success: true };
    }

    // 1. Delete from 'prompts' table
    const { error: prErr } = await supabase.from("prompts").delete().eq("id", id);
    if (!prErr) {
      return { success: true };
    }

    // 2. Fallback delete on 'products' table
    const { error: pErr } = await supabase.from("products").delete().eq("id", id);
    if (!pErr) {
      return { success: true };
    }

    return { success: false, error: prErr?.message || pErr?.message || "Lỗi xóa sản phẩm khỏi Supabase" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
