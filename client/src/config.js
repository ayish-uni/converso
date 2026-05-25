const getBackendHost = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // If the client is accessed via a local network IP or custom hostname, use it
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:5001`;
    }
  }
  return "http://localhost:5001";
};

const backendHost = getBackendHost();

export const API_URL =
  import.meta.env.VITE_API_URL || `${backendHost}/api`;
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || backendHost;
