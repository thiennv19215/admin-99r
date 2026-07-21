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
 * Fetch products from Supabase 'prompts' or 'products' table
 */
export async function fetchSupabaseProducts(): Promise<{ products: Product[]; rawPrompts: ProductPrompt[] }> {
  try {
    // Primary query on Supabase 'prompts' table joined with 'categories'
    const { data: promptData, error: promptErr } = await supabase
      .from("prompts")
      .select("*, categories(id, name, slug)")
      .order("created_at", { ascending: false });

    if (!promptErr && promptData && promptData.length > 0) {
      const mappedProducts: Product[] = promptData.map((p: any) => ({
        id: p.id,
        name: p.title || "Sản phẩm Prompt",
        sku: p.slug ? p.slug.toUpperCase() : `PRM-${p.id.toString().substring(0, 6)}`,
        category: p.categories?.name || p.ai_model || "Tổng hợp",
        price: p.copy_count ? p.copy_count * 10000 : 150000,
        stock: p.is_active !== false ? (p.view_count || 25) : 0,
        image: p.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
        rating: p.is_hot ? 5.0 : 4.8,
        description: p.prompt_text || p.description || "",
        ai_model: p.ai_model || "ChatGPT",
        prompt_type: p.prompt_type || "text",
        prompt_text: p.prompt_text || "",
        category_id: p.category_id || "",
        is_active: p.is_active !== false,
        is_hot: !!p.is_hot,
      }));

      return { products: mappedProducts, rawPrompts: promptData };
    }

    // Secondary fallback on 'products' table (only if prompts is completely empty or error)
    if (promptErr && promptErr.code !== "PGRST205") {
      console.warn("Prompts query notice:", promptErr.message);
    } else if (promptErr && promptErr.code === "PGRST205") {
      const { data: prodData, error: prodErr } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!prodErr && prodData && prodData.length > 0) {
        const mappedProducts: Product[] = prodData.map((p: any) => ({
          id: p.id,
          name: p.name || p.title || "Sản phẩm Mới",
          sku: p.sku || `SKU-${p.id.toString().substring(0, 6)}`,
          category: p.category || "Thiết bị",
          price: p.price ?? 250000,
          stock: p.stock ?? 10,
          image: p.image || p.thumbnail_url || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&q=80",
          rating: p.rating ?? 4.8,
          description: p.description || "",
          ai_model: "ChatGPT",
          prompt_type: "text",
          is_active: true,
          is_hot: false,
        }));

        return { products: mappedProducts, rawPrompts: [] };
      }
    }
  } catch (err) {
    console.warn("Supabase fetch exception:", err);
  }

  return { products: [], rawPrompts: [] };
}

/**
 * Insert new product/prompt into Supabase database (table 'prompts')
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
    const slug = payload.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || `prompt-${Date.now()}`;

    const promptBody = {
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

    const { data, error } = await supabase
      .from("prompts")
      .insert([promptBody])
      .select("*, categories(id, name)")
      .single();

    if (!error && data) {
      return { success: true, data };
    }

    if (error && error.code !== "PGRST205") {
      console.error("Prompts insert error:", error);
      return { success: false, error: error.message };
    }

    // Fallback to 'products' table only if 'prompts' table does not exist
    const { data: pData, error: pErr } = await supabase
      .from("products")
      .insert([{
        name: payload.title,
        sku: slug.toUpperCase(),
        category: payload.ai_model || "Sản phẩm",
        price: 200000,
        stock: 50,
        image: payload.thumbnail_url,
        description: payload.description,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (!pErr && pData) {
      return { success: true, data: pData };
    }

    return { success: false, error: error?.message || pErr?.message || "Lỗi tạo sản phẩm" };
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

    const { error } = await supabase
      .from("prompts")
      .update(updateBody)
      .eq("id", id);

    if (!error) return { success: true };

    if (error && error.code !== "PGRST205") {
      return { success: false, error: error.message };
    }

    // Fallback update on 'products' table only if 'prompts' is missing
    const { error: pErr } = await supabase
      .from("products")
      .update({
        name: payload.title,
        description: payload.description,
        image: payload.thumbnail_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (!pErr) return { success: true };

    return { success: false, error: error.message || pErr.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete product from Supabase database
 */
export async function deleteSupabaseProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Delete from 'prompts' table
    const { error: prErr } = await supabase.from("prompts").delete().eq("id", id);
    if (!prErr) {
      return { success: true };
    }

    // If prompts deletion had non-PGRST205 error, return error
    if (prErr && prErr.code !== "PGRST205") {
      console.error("Prompts delete error:", prErr);
      return { success: false, error: prErr.message };
    }

    // 2. Fallback delete on 'products' table only if 'prompts' table doesn't exist
    const { error: pErr } = await supabase.from("products").delete().eq("id", id);
    if (!pErr) {
      return { success: true };
    }

    return { success: false, error: prErr?.message || pErr?.message || "Lỗi xóa sản phẩm khỏi Supabase" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
