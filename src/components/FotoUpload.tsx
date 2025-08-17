"use client";

import { UserCircleIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState, useRef } from "react";

interface FotoUploadProps {
  onUpload: (url: string) => void;
  fotoAtual?: string;
}

export default function FotoUpload({ onUpload, fotoAtual }: FotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToBlob = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        onUpload(data.url);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadToBlob(file);
    }
  };

  return (
    <div className="relative w-24 h-24">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full h-full rounded-full overflow-hidden border-3 border-primary/20 hover:border-primary/50 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : fotoAtual ? (
          <div className="relative w-full h-full">
            <Image
              src={fotoAtual}
              alt="Foto do aluno"
              fill
              className="object-cover"
              sizes="96px"
              priority
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
              <PhotoIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <UserCircleIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </button>
    </div>
  );
}
