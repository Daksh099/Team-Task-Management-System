import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - attach auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const store = useAuthStore.getState();
      if (store.refreshToken) {
        try {
          const res = await axios.post("/api/auth/refresh", {
            refreshToken: store.refreshToken,
          });
          const { accessToken, refreshToken } = res.data;
          store.setAuth(store.user!, accessToken, refreshToken);
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return axios(error.config);
        } catch {
          store.logout();
          window.location.href = "/login";
        }
      } else {
        store.logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
