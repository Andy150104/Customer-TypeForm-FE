import { create } from "zustand";
import apiClient from "EduSmart/hooks/apiClient";
import { NotificationResponseEntity } from "EduSmart/api/api-auth-service";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";

interface NotificationsState {
  notifications: NotificationResponseEntity[];
  loading: boolean;
  streaming: boolean;
  streamTick: number;
  fetchNotifications: () => Promise<void>;
  startStream: () => void;
  stopStream: () => void;
}

let streamController: AbortController | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let isConnecting = false;
let allowReconnect = false;

const scheduleReconnect = (delayMs = 1500) => {
  if (!allowReconnect) return;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    useNotificationsStore.getState().startStream();
  }, delayMs);
};

const buildStreamUrl = () => "/api/notifications/stream";

const safeJsonParse = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const mergeNotification = (
  current: NotificationResponseEntity[],
  next: NotificationResponseEntity,
) => {
  if (!next) return current;
  if (!next.id) return [next, ...current];
  const index = current.findIndex((item) => item.id === next.id);
  if (index === -1) return [next, ...current];
  const updated = [...current];
  updated[index] = { ...updated[index], ...next };
  return updated;
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  loading: false,
  streaming: false,
  streamTick: 0,
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response =
        await apiClient.authEduService.api.v1NotificationsGetNotificationsList();
      if (response.data?.success) {
        set({ notifications: response.data.response ?? [] });
      }
    } catch (error) {
      console.error("fetchNotifications error:", error);
    } finally {
      set({ loading: false });
    }
  },
  startStream: () => {
    if (typeof window === "undefined") return;
    if (isConnecting || streamController) {
      allowReconnect = true;
      return;
    }

    const connect = async () => {
      if (isConnecting || streamController) return;
      allowReconnect = true;
      const token = useAuthStore.getState().token;
      if (!token) {
        scheduleReconnect();
        return;
      }

      isConnecting = true;
      set({ streaming: true });

      const controller = new AbortController();
      streamController = controller;

      try {
        const response = await fetch(buildStreamUrl(), {
          method: "GET",
          headers: {
            accept: "text/event-stream",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            try {
              await useAuthStore.getState().refreshToken();
            } catch (refreshError) {
              console.error("Notifications stream refresh failed:", refreshError);
            }
          }
          throw new Error(`Stream failed with status ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Stream response body is not readable");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        const flushBuffer = () => {
          let separatorIndex = buffer.indexOf("\n\n");
          while (separatorIndex !== -1) {
            const rawEvent = buffer.slice(0, separatorIndex).trim();
            buffer = buffer.slice(separatorIndex + 2);

            if (rawEvent) {
              const dataLines = rawEvent
                .split("\n")
                .filter((line) => line.startsWith("data:"))
                .map((line) => line.replace(/^data:\s?/, ""));

              if (dataLines.length > 0) {
                const data = dataLines.join("\n").trim();
                const dataLower = data.toLowerCase();
                if (
                  data &&
                  dataLower !== "ping" &&
                  dataLower !== "keep-alive" &&
                  dataLower !== "connected"
                ) {
                  const payload = safeJsonParse(data);
                  if (Array.isArray(payload)) {
                    set({ notifications: payload, streamTick: Date.now() });
                  } else if (payload && Array.isArray(payload.notifications)) {
                    set({
                      notifications: payload.notifications,
                      streamTick: Date.now(),
                    });
                  } else if (payload && (payload.id || payload.formId)) {
                    set((state) => ({
                      notifications: mergeNotification(
                        state.notifications,
                        payload,
                      ),
                      streamTick: Date.now(),
                    }));
                  } else {
                    void get()
                      .fetchNotifications()
                      .finally(() => set({ streamTick: Date.now() }));
                  }
                }
              }
            }

            separatorIndex = buffer.indexOf("\n\n");
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          buffer = buffer.replace(/\r\n/g, "\n");
          flushBuffer();
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Notifications stream error:", error);
        }
      } finally {
        isConnecting = false;
        streamController = null;
        set({ streaming: false });

        if (allowReconnect) {
          scheduleReconnect(3000);
        }
      }
    };

    void connect();
  },
  stopStream: () => {
    allowReconnect = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (streamController) {
      streamController.abort();
      streamController = null;
    }
    set({ streaming: false });
  },
}));
