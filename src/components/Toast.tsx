"use client";

import { useEffect, useState } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
  showProgress?: boolean;
  showSpinner?: boolean; // Nova propriedade para exibir spinner
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 3000,
  showProgress = false,
  showSpinner = false, // Inicializado como false
}: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      // Atualizar barra de progresso
      if (showProgress) {
        const intervalTime = 10;
        const steps = duration / intervalTime;
        const decrementPerStep = 100 / steps;

        const progressTimer = setInterval(() => {
          setProgress((prevProgress) => {
            const newProgress = prevProgress - decrementPerStep;
            return newProgress > 0 ? newProgress : 0;
          });
        }, intervalTime);

        return () => {
          clearTimeout(timer);
          clearInterval(progressTimer);
        };
      }

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, showProgress]);

  const bgColor = {
    success: "bg-green-100 border-green-400 text-green-800",
    error: "bg-red-100 border-red-400 text-red-800",
    info: "bg-blue-100 border-blue-400 text-blue-800",
  };

  const progressColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  const IconComponent = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon,
  }[type];

  return (
    <div
      className={`rounded-lg border px-4 py-3 shadow-lg animate-fade-in ${bgColor[type]}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showSpinner ? (
            <div
              className={`w-5 h-5 border-2 ${
                type === "info" ? "border-blue-600" : "border-current"
              } border-t-transparent rounded-full animate-spin`}
            />
          ) : (
            <IconComponent className="w-5 h-5" />
          )}
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 focus:outline-none ml-3"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {showProgress && (
        <div className="h-1 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full ${progressColor[type]} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
