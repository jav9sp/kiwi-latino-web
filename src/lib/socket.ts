import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL as string || 'http://localhost:3000/api')
  .replace('/api', '');

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] connect error:', err.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
