// src/components/ui/use-toast.ts
import * as React from "react";
import type { ToastProps } from "../Toast";

type ToastActionElement = React.ReactElement | undefined;

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// ...existing code...

const toastReducer = (
  state: ToasterToast[],
  action: { type: string; toast?: ToasterToast; toastId?: string }
) => {
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
};

export const useToast = () => {
  const [state, dispatch] = React.useReducer(toastReducer, []);

  const addToRemoveQueue = React.useCallback(
    (toastId: string) => {
      if (toastTimeouts.has(toastId)) {
        return;
      }
      const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId);
        dispatch({
          type: "REMOVE_TOAST",
          toastId: toastId,
        });
      }, TOAST_REMOVE_DELAY);
      toastTimeouts.set(toastId, timeout);
    },
    [dispatch]
  );

  const toast = React.useCallback(
    (props: ToastProps) => {
      const id = Math.random().toString(36).substr(2, 9);
      dispatch({
        type: "ADD_TOAST",
        toast: { ...props, id },
      });
      addToRemoveQueue(id);
    },
    [addToRemoveQueue]
  );

  return { toast, toasts: state };
};
