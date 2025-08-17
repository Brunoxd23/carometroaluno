"use client";

// import { useState } from "react"; // removido, não usado
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
// Update the import path below to match the actual location of use-toast, for example:
import { useToast } from "./ui/ToastContext";
// If you do not have use-toast, you can create a simple toast hook or use a library like react-hot-toast.

interface StudentImageUploadProps {
  photoUrl?: string;
  onImageChange: (photoUrl: string) => void;
}

export default function StudentImageUpload({
  photoUrl,
  onImageChange,
}: StudentImageUploadProps) {
  // Estado de loading removido, feedback visual via Toast
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // setLoading(true); // removido, feedback via Toast
    toast({
      message: "Carregando foto...",
      type: "info",
      onClose: () => {},
      showSpinner: true,
      showProgress: true,
      duration: 2000,
    });
    try {
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
        toast({
          message: "Foto enviada e salva com sucesso.",
          type: "success",
          onClose: () => {},
        });
      } else {
        throw new Error("No URL in response");
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        message: "Falha ao enviar a foto.",
        type: "error",
        onClose: () => {},
      });
    } finally {
      // setLoading(false); // removido, feedback via Toast
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
        {/* O Toast global já mostra o spinner, não precisa duplicar aqui */}
      </div>
      <div className="mt-2 text-xs text-center text-gray-500 group-hover:text-blue-600">
        {photoUrl ? "Clique para alterar" : "Adicionar foto"}
      </div>
    </div>
  );
}
