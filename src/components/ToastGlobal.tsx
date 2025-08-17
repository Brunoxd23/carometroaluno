"use client";
import { useToast } from "@/components/ui/ToastContext";
import Toast from "@/components/Toast";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

export default function ToastGlobal() {
  const { toasts, removeToast } = useToast();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end pointer-events-none">
      {toasts.map((toast) => {
        let Icon = InformationCircleIcon;
        let bgColor = "bg-blue-50";
        let borderColor = "border-blue-300";
        let textColor = "text-blue-800";

        if (toast.type === "success") {
          Icon = CheckCircleIcon;
          bgColor = "bg-emerald-50";
          borderColor = "border-emerald-300";
          textColor = "text-emerald-800";
        }
        if (toast.type === "error") {
          Icon = XCircleIcon;
          bgColor = "bg-rose-50";
          borderColor = "border-rose-300";
          textColor = "text-rose-800";
        }

        return (
          <div
            key={toast.id}
            className={`animate-toast-in shadow-lg rounded-xl ${borderColor} pointer-events-auto transition-all duration-500 flex items-center px-4 py-3 gap-3 ${bgColor} backdrop-blur-sm`}
            style={{
              animation: `toast-in 0.4s cubic-bezier(.21,1.02,.73,1)`,
              minWidth: 280,
              maxWidth: 360,
            }}
          >
            <div className="flex-shrink-0">
              <Icon className={`w-7 h-7 ${textColor} drop-shadow-lg`} />
            </div>
            <div className={`flex-1 ${textColor} text-sm font-semibold`}>
              <Toast
                {...{
                  ...toast,
                  showProgress: true,
                  duration: toast.duration || 2000,
                  onClose: () => removeToast(toast.id),
                }}
              />
            </div>
          </div>
        );
      })}
      <style jsx global>{`
        @keyframes toast-in {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toast-out {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
