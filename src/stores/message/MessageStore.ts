// EduSmart/stores/message/MessageStore.ts
import { create } from "zustand";
import type { NoticeType } from "antd/es/message/interface";

interface MessageState {
  message: string;
  type: NoticeType;
  duration?: number;

  setMessage: (
    message: string,
    options?: {
      type?: NoticeType;
      duration?: number;
    }
  ) => void;

  clearMessage: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  message: "",
  type: "info",
  duration: 3,

  setMessage: (message, options) =>
    set((state) => ({
      message,
      type: options?.type ?? state.type,
      duration: options?.duration ?? state.duration,
    })),

  clearMessage: () => set({ message: "" }),
}));
