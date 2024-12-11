import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  // Initialize
  connect() {
    if (this.socket?.connected) return;

    console.log('Connecting to WebSocket server: ');
    // Default Behavior: If 'VITE_BACKEND_URL' is not set, the app will use the same host name as the frontend
    this.socket = io(import.meta.env.VITE_BACKEND_URL);

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('app-error', (error) => {
      console.error('Failed:', error);
    });


    // Listen for incoming custom events
    this.socket.onAny((event: string, data: any) => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach((listener) => listener(data));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToEvent<T>(event: string, listener: (data: T) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(listener);
  }

  // Event abbestellen
  unsubscribeFromEvent<T>(event: string, listener: (data: T) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      this.listeners.set(
        event,
        eventListeners.filter((existingListener) => existingListener !== listener)
      );
    }
  }


  // Nachricht senden
  sendMessage(userName: string, userAvatar: string, message: string, timestamp: string) {
    if (!this.socket) throw new Error('Socket is not connected.');

    this.socket.emit('send-message', { userName, userAvatar, message, timestamp });
  }

  // Channel hinzufügen
  addChannel(name: string, url: string, avatar: string, restream: boolean, headersJson: string) {
    if (!this.socket) throw new Error('Socket is not connected.');

    this.socket.emit('add-channel', { name, url, avatar, restream, headersJson });
  }

  // Aktuellen Channel setzen
  setCurrentChannel(id: number) {
    if (!this.socket) throw new Error('Socket is not connected.');

    this.socket.emit('set-current-channel', id);
  }

  // Channel löschen
  deleteChannel(id: number) {
    if (!this.socket) throw new Error('Socket is not connected.');

    this.socket.emit('delete-channel', id);
  }

  // Channel aktualisieren
  updateChannel(id: number, updatedAttributes: any) {
    if (!this.socket) throw new Error('Socket is not connected.');

    this.socket.emit('update-channel', { id, updatedAttributes });
  }
}

const socketService = new SocketService();
export default socketService;