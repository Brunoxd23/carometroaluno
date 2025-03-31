"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose?: () => void;
  showSpinner?: boolean;
  showProgress?: boolean;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  showSpinner,
  showProgress = true,
  duration = 3000,
}: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration && showProgress) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          setIsVisible(false);
          onClose?.();
        }
      }, 10);

      return () => clearInterval(interval);
    }
  }, [duration, type, onClose, showProgress]);

  if (!isVisible) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type];

  const progressColor = {
    success: "bg-green-300",
    error: "bg-red-300",
    info: "bg-blue-300",
  }[type];

  return (
    <div className="min-w-[320px] max-w-md animate-slide-in">
      <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
        <div className={`${bgColor} flex items-center gap-3 p-4`}>
          {showSpinner && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          <span className="text-white flex-1">{message}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        {showProgress && (
          <div
            className={`h-1 ${progressColor} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        )}
      </div>
    </div>
  );
}
