import axios from 'axios';

const SECRET_KEY_STORAGE = 'grit_secret_key';

const unauthorizedListeners = new Set<() => void>();

export function getStoredSecretKey(): string | null {
  return localStorage.getItem(SECRET_KEY_STORAGE);
}

export function setStoredSecretKey(key: string): void {
  localStorage.setItem(SECRET_KEY_STORAGE, key);
}

export function clearStoredSecretKey(): void {
  localStorage.removeItem(SECRET_KEY_STORAGE);
}

export function subscribeUnauthorized(listener: () => void): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

export function isUnauthorizedError(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 401;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const key = getStoredSecretKey();
  if (key) {
    config.headers.set('X-Grit-Key', key);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isUnauthorizedError(error)) {
      clearStoredSecretKey();
      unauthorizedListeners.forEach((listener) => listener());
    }
    return Promise.reject(error);
  },
);

export default api;
