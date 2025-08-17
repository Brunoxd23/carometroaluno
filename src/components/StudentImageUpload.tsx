"use client";

import { useState } from "react";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";

interface StudentImageUploadProps {
  photoUrl?: string;
  onImageChange: (photoUrl: string) => void;
}

export default function StudentImageUpload({
  photoUrl,
  onImageChange,
}: StudentImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      // Upload para Vercel Blob
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        onImageChange(data.url);
      } else {
        throw new Error("No URL in response");
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="w-24 h-24 relative rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-colors">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt="Foto do aluno"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
            <UserCircleIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-center text-gray-500 group-hover:text-blue-600">
        {photoUrl ? "Clique para alterar" : "Adicionar foto"}
      </div>
    </div>
  );
}
