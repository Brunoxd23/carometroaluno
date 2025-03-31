"use client";

import { XMarkIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  studentName: string;
}

export default function PhotoModal({
  isOpen,
  onClose,
  photoUrl,
  studentName,
}: PhotoModalProps) {
  const [scale, setScale] = useState(1);
  const MIN_SCALE = 1;
  const MAX_SCALE = 3;
  const SCALE_STEP = 0.5;

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
  };

  // Fecha o modal com a tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {/* Container do modal com responsividade */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Fechar"
        >
          <XMarkIcon className="w-6 h-6 text-gray-800" />
        </button>

        {/* Cabeçalho com nome do aluno */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-6 z-40">
          <h3 className="text-white text-xl md:text-2xl font-semibold drop-shadow-lg">
            {studentName}
          </h3>
        </div>

        {/* Container da imagem com aspect ratio */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden">
          <div
            className="absolute inset-0 transition-transform duration-200 ease-out"
            style={{
              transform: `scale(${scale})`,
            }}
          >
            <Image
              src={photoUrl}
              alt={studentName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 50vw"
              className="object-contain"
              priority
              quality={100}
            />
          </div>
        </div>

        {/* Botões de zoom */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale === MIN_SCALE}
            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Diminuir zoom"
          >
            <MinusIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={scale === MAX_SCALE}
            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Aumentar zoom"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
