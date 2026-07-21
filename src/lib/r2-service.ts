import { uploadImageToSupabase } from "./supabase-service";

/**
 * Upload image to Cloudflare R2 Storage or fallback to Supabase / Local Data URL
 */
export async function uploadImageToR2(file: File): Promise<{ url?: string; error?: string }> {
  try {
    // 1. Check if Cloudflare R2 Worker upload endpoint is specified
    const r2WorkerUrl = process.env.NEXT_PUBLIC_R2_WORKER_URL;
    if (r2WorkerUrl) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(r2WorkerUrl, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) return { url: data.url };
      }
    }

    // 2. Try Next.js Server API Route /api/upload
    const formData = new FormData();
    formData.append("file", file);

    const apiRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.url) return { url: data.url };
    }
  } catch (err) {
    console.warn("R2 upload API exception, falling back:", err);
  }

  // 3. Fallback to Supabase Storage & Data URL
  return uploadImageToSupabase(file);
}
