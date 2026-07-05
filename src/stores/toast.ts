import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastState {
  toasts: ToastItem[];
  show: (type: ToastType, message: string, duration?: number) => string;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (type, message, duration = 2400) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    set(state => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));
    if (type !== 'loading' && duration > 0) {
      window.setTimeout(() => {
        get().dismiss(id);
      }, duration);
    }
    return id;
  },
  dismiss: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
}));

// 便捷方法（在组件外也可调用）
export const toast = {
  success: (msg: string, duration?: number) => useToastStore.getState().show('success', msg, duration),
  error: (msg: string, duration?: number) => useToastStore.getState().show('error', msg, duration),
  info: (msg: string, duration?: number) => useToastStore.getState().show('info', msg, duration),
  loading: (msg: string) => useToastStore.getState().show('loading', msg, 0),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
