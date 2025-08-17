"use client";
import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

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
      className="flex flex-col gap-1 animate-fade-in"
      style={{ minWidth: 0, maxWidth: 320 }}
    >
      <div className="flex items-center gap-2">
        {showSpinner ? (
          <div
            className={`w-5 h-5 border-2 ${
              type === "info" ? "border-blue-600" : "border-current"
            } border-t-transparent rounded-full animate-spin mr-1`}
          />
        ) : null}
        <span className="font-semibold text-green-700 text-sm">{message}</span>
        <button
          onClick={onClose}
          className="text-green-700 hover:opacity-70 focus:outline-none transition-opacity ml-2"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {showProgress && (
        <div className="h-1 w-full bg-green-200 rounded-full mt-1 overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
