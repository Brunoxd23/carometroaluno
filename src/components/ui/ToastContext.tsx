"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import type { ToastProps } from "../Toast";

type ToastActionElement = React.ReactElement | undefined;
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const TOAST_LIMIT = 1;

const ToastContext = createContext<
  | {
      toasts: ToasterToast[];
      toast: (props: ToastProps) => void;
      removeToast: (id: string) => void;
    }
  | undefined
>(undefined);

function toastReducer(
  state: ToasterToast[],
  action: { type: string; toast?: ToasterToast; toastId?: string }
) {
  switch (action.type) {
    case "ADD_TOAST":
      return [...state, action.toast!].slice(-TOAST_LIMIT);
    case "UPDATE_TOAST":
      return state.map((t) =>
        t.id === action.toast!.id ? { ...t, ...action.toast } : t
      );
    case "REMOVE_TOAST":
      return state.filter((t) => t.id !== action.toastId);
    default:
      return state;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, []);

  const toast = useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9);
    dispatch({ type: "ADD_TOAST", toast: { ...props, id } });
  }, []);

  const removeToast = useCallback((id: string) => {
    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", toastId: id });
    }, 0);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts: state, toast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
