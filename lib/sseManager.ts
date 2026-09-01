// Global SSE Manager to handle a single SSE connection per user
// and broadcast events to all listeners

interface NotificationData {
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

type NotificationListener = (notification: NotificationData) => void;
type UnreadCountListener = (count: number) => void;
type ConnectionListener = (connected: boolean) => void;

class SSEManager {
  private eventSource: EventSource | null = null;
  private notificationListeners: Set<NotificationListener> = new Set();
  private unreadCountListeners: Set<UnreadCountListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();
  private currentUserId: string | null = null;
  private isConnected: boolean = false;

  connect(userId: string) {
    // If already connected to the same user, don't reconnect
    if (this.eventSource && this.currentUserId === userId && this.isConnected) {
      console.log("SSEManager: Already connected to", userId);
      return;
    }

    // Close existing connection if any
    this.disconnect();

    console.log("SSEManager: Connecting to SSE with userId:", userId);
    this.currentUserId = userId;
    this.eventSource = new EventSource(`http://localhost:8080/api/notifications/subscribe?userId=${userId}`);

    this.eventSource.addEventListener('connected', (event) => {
      console.log("SSEManager: Connected:", event.data);
      this.isConnected = true;
      this.notifyConnectionListeners(true);
    });

    this.eventSource.addEventListener('notification', (event) => {
      console.log("SSEManager: Received notification:", event.data);
      const notification = JSON.parse(event.data);
      this.notifyNotificationListeners(notification);
    });

    this.eventSource.addEventListener('unreadCount', (event) => {
      console.log("SSEManager: Received unread count:", event.data);
      const data = JSON.parse(event.data);
      this.notifyUnreadCountListeners(data.count);
    });

    this.eventSource.onerror = (error) => {
      console.error("SSEManager: Error:", error);
      this.isConnected = false;
      this.notifyConnectionListeners(false);
      this.eventSource?.close();
    };
  }

  disconnect() {
    if (this.eventSource) {
      console.log("SSEManager: Disconnecting");
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      this.currentUserId = null;
      this.notifyConnectionListeners(false);
    }
  }

  onNotification(listener: NotificationListener) {
    this.notificationListeners.add(listener);
    return () => this.notificationListeners.delete(listener);
  }

  onUnreadCount(listener: UnreadCountListener) {
    this.unreadCountListeners.add(listener);
    return () => this.unreadCountListeners.delete(listener);
  }

  onConnectionChange(listener: ConnectionListener) {
    this.connectionListeners.add(listener);
    // Immediately notify of current state
    listener(this.isConnected);
    return () => this.connectionListeners.delete(listener);
  }

  private notifyNotificationListeners(notification: any) {
    this.notificationListeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error("SSEManager: Error in notification listener:", error);
      }
    });
  }

  private notifyUnreadCountListeners(count: number) {
    this.unreadCountListeners.forEach(listener => {
      try {
        listener(count);
      } catch (error) {
        console.error("SSEManager: Error in unread count listener:", error);
      }
    });
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => {
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
