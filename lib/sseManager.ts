// Global SSE Manager to handle SSE connections per user/channel
// and broadcast events to all registered listeners

export interface NotificationData {
  id: string;
  recipientUserId: string;
  type: string;
  module: string;
  entityId: string;
  message: string;
  channel: string;
  read: boolean;
  createdAt: string;
}

export type NotificationListener = (notification: NotificationData) => void;
export type UnreadCountListener = (count: number) => void;
export type ConnectionListener = (connected: boolean) => void;

interface ConnectionEntry {
  userId: string;
  eventSource: EventSource | null;
  refCount: number;
  isConnected: boolean;
  reconnectAttempts: number;
  reconnectTimer?: ReturnType<typeof setTimeout> | null;
}

function getBackendBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith("http")) {
      try {
        const parsed = new URL(process.env.NEXT_PUBLIC_API_URL);
        return parsed.origin;
      } catch {
        // ignore
      }
    }
  }
  return "http://localhost:8080";
}

class SSEManager {
  private connections: Map<string, ConnectionEntry> = new Map();
  private notificationListeners: Set<NotificationListener> = new Set();
  private unreadCountListeners: Set<UnreadCountListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();

  /**
   * Connect to an SSE channel for a specific user ID or channel ID.
   * If already connected or connecting to this ID, increments reference count.
   */
  connect(userId: string) {
    if (typeof window === "undefined" || typeof EventSource === "undefined") {
      return;
    }

    if (!userId || typeof userId !== "string") {
      return;
    }

    const trimmedId = userId.trim();
    if (!trimmedId) return;

    const existing = this.connections.get(trimmedId);
    if (existing) {
      if (
        existing.eventSource &&
        (existing.eventSource.readyState === EventSource.OPEN ||
          existing.eventSource.readyState === EventSource.CONNECTING)
      ) {
        existing.refCount++;
        console.log(`SSEManager: Channel [${trimmedId}] already active (refCount: ${existing.refCount})`);
        return;
      }
      // Stale or closed connection, clean it up before reconnecting
      this.closeConnectionEntry(existing);
    }

    const entry: ConnectionEntry = {
      userId: trimmedId,
      eventSource: null,
      refCount: 1,
      isConnected: false,
      reconnectAttempts: 0,
      reconnectTimer: null,
    };

    this.connections.set(trimmedId, entry);
    this.createEventSource(entry);
  }

  private createEventSource(entry: ConnectionEntry) {
    if (typeof window === "undefined" || typeof EventSource === "undefined") return;

    const backendOrigin = getBackendBaseUrl();
    const sseUrl = `${backendOrigin}/api/notifications/subscribe?userId=${encodeURIComponent(entry.userId)}`;
    console.log(`SSEManager: Connecting to [${entry.userId}] via ${sseUrl}`);

    try {
      const es = new EventSource(sseUrl);
      entry.eventSource = es;

      es.addEventListener("connected", (event) => {
        console.log(`SSEManager: [${entry.userId}] connected:`, event.data);
        entry.isConnected = true;
        entry.reconnectAttempts = 0;
        if (entry.reconnectTimer) {
          clearTimeout(entry.reconnectTimer);
          entry.reconnectTimer = null;
        }
        this.notifyConnectionListeners(true);
      });

      es.addEventListener("notification", (event) => {
        console.log(`SSEManager: [${entry.userId}] notification event:`, event.data);
        try {
          const notification: NotificationData = JSON.parse(event.data);
          this.notifyNotificationListeners(notification);
        } catch (error) {
          console.error(`SSEManager: Failed to parse notification on [${entry.userId}]:`, error);
        }
      });

      es.addEventListener("unreadCount", (event) => {
        console.log(`SSEManager: [${entry.userId}] unread count event:`, event.data);
        try {
          const data = JSON.parse(event.data);
          this.notifyUnreadCountListeners(Number(data.count ?? 0));
        } catch (error) {
          console.error(`SSEManager: Failed to parse unread count on [${entry.userId}]:`, error);
        }
      });

      es.onerror = (error) => {
        console.warn(`SSEManager: [${entry.userId}] connection error (readyState: ${es.readyState})`, error);
        entry.isConnected = false;
        this.notifyConnectionListeners(false);

        // Native EventSource automatically reconnects on readyState === 0 (CONNECTING).
        // If readyState is 2 (CLOSED), schedule manual reconnect with backoff.
        if (es.readyState === 2) {
          try {
            es.close();
          } catch {}
          entry.eventSource = null;

          if (this.connections.has(entry.userId)) {
            const delay = Math.min(1000 * Math.pow(2, entry.reconnectAttempts), 15000);
            entry.reconnectAttempts++;
            console.log(`SSEManager: Reconnecting [${entry.userId}] in ${delay}ms (attempt ${entry.reconnectAttempts})...`);
            
            if (entry.reconnectTimer) clearTimeout(entry.reconnectTimer);
            entry.reconnectTimer = setTimeout(() => {
              if (this.connections.has(entry.userId)) {
                this.createEventSource(entry);
              }
            }, delay);
          }
        }
      };
    } catch (error) {
      console.error(`SSEManager: Failed to create EventSource for [${entry.userId}]:`, error);
      entry.isConnected = false;
      this.notifyConnectionListeners(false);
    }
  }

  /**
   * Disconnect from a channel or all channels.
   */
  disconnect(userId?: string) {
    if (!userId) {
      this.connections.forEach((entry) => this.closeConnectionEntry(entry));
      this.connections.clear();
      this.notifyConnectionListeners(false);
      return;
    }

    const trimmedId = userId.trim();
    const entry = this.connections.get(trimmedId);
    if (!entry) return;

    entry.refCount--;
    console.log(`SSEManager: Decremented refCount for [${trimmedId}] (now: ${entry.refCount})`);

    if (entry.refCount <= 0) {
      this.closeConnectionEntry(entry);
      this.connections.delete(trimmedId);
      if (this.connections.size === 0) {
        this.notifyConnectionListeners(false);
      }
    }
  }

  private closeConnectionEntry(entry: ConnectionEntry) {
    if (entry.reconnectTimer) {
      clearTimeout(entry.reconnectTimer);
      entry.reconnectTimer = null;
    }
    if (entry.eventSource) {
      console.log(`SSEManager: Closing EventSource for [${entry.userId}]`);
      try {
        entry.eventSource.close();
      } catch {}
      entry.eventSource = null;
    }
    entry.isConnected = false;
  }

  onNotification(listener: NotificationListener): () => void {
    this.notificationListeners.add(listener);
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  onUnreadCount(listener: UnreadCountListener): () => void {
    this.unreadCountListeners.add(listener);
    return () => {
      this.unreadCountListeners.delete(listener);
    };
  }

  onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    const anyConnected = Array.from(this.connections.values()).some((c) => c.isConnected);
    listener(anyConnected);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  private notifyNotificationListeners(notification: NotificationData) {
    this.notificationListeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (error) {
        console.error("SSEManager: Error in notification listener:", error);
      }
    });
  }

  private notifyUnreadCountListeners(count: number) {
    this.unreadCountListeners.forEach((listener) => {
      try {
        listener(count);
      } catch (error) {
        console.error("SSEManager: Error in unread count listener:", error);
      }
    });
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach((listener) => {
      try {
        listener(connected);
      } catch (error) {
        console.error("SSEManager: Error in connection listener:", error);
      }
    });
  }
}

// Export singleton instance
export const sseManager = new SSEManager();
