"use client";

import { useState } from "react";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";

interface ImageUploadProps {
  currentImage?: string;
  onImageUpload: (url: string) => void;
  className?: string;
}

export default function ImageUpload({
  currentImage,
  onImageUpload,
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Criar preview local
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Preparar form data para upload
      const formData = new FormData();
      formData.append("file", file);

      // Fazer upload para Vercel Blob
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        onImageUpload(data.url);
      } else {
        throw new Error("No URL in response");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={isUploading}
      />
      <div className="w-32 h-32 relative rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-all">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Foto do aluno"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <UserCircleIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="mt-2 text-center text-sm text-gray-500 group-hover:text-blue-600">
        {previewUrl ? "Trocar foto" : "Adicionar foto"}
      </div>
    </div>
  );
}
