"use client";

import React, { useState, useEffect } from "react";
import { useProduct } from "@/context/ProductContext";
import { uploadImageToR2 } from "@/lib/r2-service";
import { X, Sparkles, Image as ImageIcon, Save, Loader2, AlertCircle, Upload, Link, Check, Cloud } from "lucide-react";

export const ProductFormModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, editingProduct, setEditingProduct, categories, addProduct, updateProduct, showToast } = useProduct();

  const isOpen = isAddModalOpen || !!editingProduct;

  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [aiModel, setAiModel] = useState("ChatGPT");
  const [promptType, setPromptType] = useState("text");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isHot, setIsHot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageTab, setImageTab] = useState<"file" | "url">("file");
  const [errorMsg, setErrorMsg] = useState("");

  const aiModels = ["ChatGPT", "Veo 3", "Midjourney", "DALL-E 3", "Claude 3.5", "Stable Diffusion"];

  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.name || "");
      setPromptText(editingProduct.prompt_text || editingProduct.description || "");
      setDescription(editingProduct.description || "");
      const matchedCat = categories.find(
        (c) => c.id === editingProduct.category_id || c.name.toLowerCase() === editingProduct.category?.toLowerCase()
      );
      setCategoryId(matchedCat ? matchedCat.id : (editingProduct.category_id || (categories.length > 0 ? categories[0].id : "")));
      setAiModel(editingProduct.ai_model || "ChatGPT");
      setPromptType(editingProduct.prompt_type || "text");
      setThumbnailUrl(editingProduct.image || "");
      setIsActive(editingProduct.is_active !== false);
      setIsHot(!!editingProduct.is_hot);
    } else {
      setTitle("");
      setPromptText("");
      setDescription("");
      setCategoryId(categories.length > 0 ? categories[0].id : "");
      setAiModel("ChatGPT");
      setPromptType("image");
      setThumbnailUrl("");
      setIsActive(true);
      setIsHot(false);
    }
    setErrorMsg("");
  }, [editingProduct, isAddModalOpen, categories]);

  if (!isOpen) return null;

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Dung lượng file ảnh không được vượt quá 10MB.");
      return;
    }

    setUploadingImage(true);
    setErrorMsg("");

    const res = await uploadImageToR2(file);
    setUploadingImage(false);

    if (res.url) {
      setThumbnailUrl(res.url);
      showToast("Đã tải ảnh lên Cloudflare R2 / Storage thành công!", "success");
    } else {
      setErrorMsg(res.error || "Không thể tải ảnh lên Cloudflare R2. Vui lòng thử lại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !promptText.trim()) {
      setErrorMsg("Vui lòng nhập đầy đủ Tiêu đề và Nội dung Prompt.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const payload = {
      title: title.trim(),
      prompt_text: promptText.trim(),
      description: description.trim(),
      category_id: categoryId || undefined,
      ai_model: aiModel,
      prompt_type: promptType,
      thumbnail_url: thumbnailUrl.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
      is_active: isActive,
      is_hot: isHot,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }
      closeModal();
    } catch (err: any) {
      setErrorMsg("Có lỗi xảy ra khi lưu sản phẩm lên Supabase: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-blue-950/40 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingProduct ? "Chỉnh Sửa Sản Phẩm / Prompt DB" : "Thêm Sản Phẩm / Prompt Mới (Cloudflare R2)"}
              </h2>
              <p className="text-xs text-slate-400">Tải ảnh trực tiếp lên Cloudflare R2 & Đồng bộ Supabase</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Tiêu đề sản phẩm <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Prompt Tạo Video AI Veo 3 Bán Hàng Mỹ Phẩm"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Category & AI Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Danh mục sản phẩm (Categories DB)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {categories.length === 0 ? (
                  <option value="">Không tìm thấy danh mục DB</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Mô hình AI (AI Model)
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {aiModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prompt Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Loại Prompt (Prompt Type)
            </label>
            <select
              value={promptType}
              onChange={(e) => setPromptType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="image">Hình ảnh / Image</option>
              <option value="video">Video / Video AI</option>
            </select>
          </div>

          {/* Image Upload Feature (Cloudflare R2 Upload Tab vs Link URL) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-amber-400" />
                <span>Hình Ảnh Cloudflare R2</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setImageTab("file")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition ${imageTab === "file" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Tải Lên R2 Storage</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab("url")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition ${imageTab === "url" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                >
                  <Link className="w-3 h-3" />
                  <span>Nhập Link URL</span>
                </button>
              </div>
            </div>

            {imageTab === "file" ? (
              <div className="relative border-2 border-dashed border-amber-500/30 hover:border-amber-500 rounded-xl p-4 text-center bg-slate-900/60 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {uploadingImage ? (
                  <div className="flex flex-col items-center justify-center py-3 text-amber-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-bold">Đang tải ảnh lên Cloudflare R2...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 gap-1.5 text-slate-400">
                    <Cloud className="w-6 h-6 text-amber-400" />
                    <p className="text-xs font-bold text-slate-200">Kéo thả hoặc Bấm để Tải Ảnh Lên Cloudflare R2</p>
                    <p className="text-[11px] text-slate-500">Hỗ trợ PNG, JPG, WEBP (Tối đa 10MB)</p>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            )}

            {/* Live Preview Box */}
            <div className="mt-3 h-32 w-full bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden relative">
              {thumbnailUrl ? (
                <>
                  <img
                    src={thumbnailUrl}
                    alt="Xem trước ảnh"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <Check className="w-3 h-3" /> Cloudflare R2 Sẵn Sàng
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-slate-500 text-xs gap-1">
                  <ImageIcon className="w-5 h-5" />
                  <span>Ảnh sản phẩm xem trước sẽ hiển thị ở đây</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Mô tả ngắn sản phẩm
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả công dụng hoặc hướng dẫn sử dụng sản phẩm..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Prompt Text Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Nội dung Prompt chi tiết <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Nhập nội dung lệnh/prompt đầy đủ vào đây..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Trạng thái: Kích hoạt (Is Active)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-amber-400 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isHot}
                onChange={(e) => setIsHot(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>Sản phẩm Nổi bật (Is Hot)</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white shadow-lg shadow-amber-500/25 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu lên Supabase...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? "Lưu thay đổi" : "Tạo sản phẩm DB"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
