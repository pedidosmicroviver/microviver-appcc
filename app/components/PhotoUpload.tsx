"use client";

import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";

interface PhotoUploadProps {
  fotos: string[];
  onChange: (fotos: string[]) => void;
  folder?: string;
  maxPhotos?: number;
}

export default function PhotoUpload({
  fotos,
  onChange,
  folder = "general",
  maxPhotos = 10,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const getPublicUrl = (path: string) => {
    return `${supabaseUrl}/storage/v1/object/public/appcc-fotos/${path}`;
  };

  const uploadFile = async (file: File) => {
    if (fotos.length >= maxPhotos) {
      alert(`Maximo ${maxPhotos} fotos`);
      return;
    }

    setUploading(true);
    try {
      // Compress image if too large
      const compressed = await compressImage(file, 1200, 0.8);

      const timestamp = Date.now();
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${folder}/${timestamp}.${ext}`;

      const { error } = await supabase.storage
        .from("appcc-fotos")
        .upload(filePath, compressed, {
          contentType: compressed.type,
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        alert("Error al subir la foto");
        return;
      }

      const url = getPublicUrl(filePath);
      onChange([...fotos, url]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error al subir la foto");
    } finally {
      setUploading(false);
    }
  };

  const compressImage = (
    file: File,
    maxWidth: number,
    quality: number
  ): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => resolve(blob || file),
            "image/jpeg",
            quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    const updated = fotos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Photo grid */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {fotos.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setPreviewUrl(url)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(i);
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload buttons */}
      <div className="flex gap-2">
        {/* Camera button (iPad/mobile) */}
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading || fotos.length >= maxPhotos}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-50 text-green-700 border border-green-200 rounded-xl font-medium text-sm hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          )}
          Camara
        </button>

        {/* Gallery button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || fotos.length >= maxPhotos}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-medium text-sm hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          )}
          Galeria
        </button>

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {fotos.length > 0 && (
        <p className="text-xs text-slate-400 text-center">
          {fotos.length}/{maxPhotos} fotos
        </p>
      )}

      {/* Full-screen preview */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xl"
            onClick={() => setPreviewUrl(null)}
          >
            X
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
