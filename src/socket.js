// socket.js - thay đổi thành default export
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL_V1 || import.meta.env.VITE_API_URL_V2;
// Socket.IO attaches to the server's default namespace at its origin — strip any
// `/api` path from the REST base URL so it doesn't get treated as a namespace.
const SOCKET_URL = API_URL ? new URL(API_URL).origin : undefined;

const socket = io(SOCKET_URL, {
  transports: ['polling', 'websocket'],
  withCredentials: true,
});

export default socket;
