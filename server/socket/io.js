/**
 * Lazy socket.io singleton.
 * Import this instead of importing `io` directly from server.js
 * to avoid circular dependency TDZ issues.
 */
let _io = null;

export function setIO(ioInstance) {
  _io = ioInstance;
}

export function getIO() {
  return _io;
}
