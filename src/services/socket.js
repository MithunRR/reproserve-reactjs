import { io } from 'socket.io-client';

// Singleton socket. The Express server hosts Socket.IO on the same port as
// the REST API, so we connect to the same origin in prod and let Vite proxy
// `/socket.io/*` in dev.

let socket = null;
const listeners = new Map(); // event → Set<handler>

const apiHost = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';

export function connectSocket(token) {
  if (!token) return null;
  if (socket && socket.connected && socket.auth?.token === token) return socket;

  if (socket) socket.disconnect();

  // Empty string ⇒ same-origin (works in both dev via proxy and prod).
  socket = io(apiHost || undefined, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000
  });

  // Rebind any handlers that were registered before connect was called.
  for (const [event, handlers] of listeners.entries()) {
    for (const handler of handlers) socket.on(event, handler);
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  listeners.clear();
}

export function getSocket() {
  return socket;
}

export function onSocket(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  if (socket) socket.on(event, handler);
  return () => offSocket(event, handler);
}

export function offSocket(event, handler) {
  if (listeners.has(event)) listeners.get(event).delete(handler);
  if (socket) socket.off(event, handler);
}

// Returns the server's ack so callers can know if persistence failed.
export function emitMessage(receiverId, content) {
  return new Promise((resolve) => {
    if (!socket || !socket.connected) {
      resolve({ ok: false, error: 'Not connected' });
      return;
    }
    socket.emit('message:send', { receiverId, content }, (ack) => resolve(ack || { ok: false }));
  });
}

export function emitMessageRead(peerId) {
  if (!socket || !socket.connected) return;
  socket.emit('message:read', { peerId });
}
