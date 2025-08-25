"use client";
import { useEffect, useState } from "react";
import { XMarkIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
  showProgress?: boolean;
  showSpinner?: boolean;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 2000,
  showProgress = false,
  showSpinner = false,
}: ToastProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (showProgress && duration && duration > 0) {
      const intervalTime = 50;
      const steps = duration / intervalTime;
      const incrementPerStep = 100 / steps;
      let finished = false;
      const progressTimer = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + incrementPerStep;
          if (newProgress >= 100 && !finished) {
            finished = true;
            clearInterval(progressTimer);
            onClose();
          }
          return newProgress < 100 ? newProgress : 100;
        });
      }, intervalTime);
      return () => clearInterval(progressTimer);
    }
  }, [duration, onClose, showProgress]);

  return (
    <div
      className={`flex flex-row items-center animate-fade-in rounded-lg shadow-md border px-3 py-2 max-w-sm min-w-0 ${
        type === "error"
          ? "bg-red-50 border-red-200"
          : type === "success"
          ? "bg-green-50 border-green-200"
          : "bg-blue-50 border-blue-200"
      }`}
      style={{ fontSize: "0.95rem" }}
    >
      {type === "error" && (
        <ExclamationCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mr-2" />
      )}
      {showSpinner && (
        <div
          className={`w-4 h-4 border-2 ${
            type === "info"
              ? "border-blue-600"
              : type === "error"
              ? "border-red-600"
              : "border-green-600"
          } border-t-transparent rounded-full animate-spin mr-1`}
        />
      )}
      <span
        className={`font-medium ${
          type === "error"
            ? "text-red-700"
            : type === "success"
            ? "text-green-700"
            : "text-blue-700"
        }`}
        style={{ flex: 1 }}
      >
        {message}
      </span>
      <button
        onClick={onClose}
        className={`hover:opacity-70 focus:outline-none transition-opacity ml-2 ${
          type === "error"
            ? "text-red-700"
            : type === "success"
            ? "text-green-700"
            : "text-blue-700"
        }`}
        style={{ padding: 0 }}
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
      {/* Barra de progresso compacta */}
      {showProgress && (
        <div
          className={`h-1 w-full rounded-full mt-1 overflow-hidden absolute left-0 bottom-0 ${
            type === "error"
              ? "bg-red-200"
              : type === "success"
              ? "bg-green-200"
              : "bg-blue-200"
          }`}
        >
          <div
            className={`h-full transition-all duration-100 ease-linear ${
              type === "error"
                ? "bg-red-500"
                : type === "success"
                ? "bg-green-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
