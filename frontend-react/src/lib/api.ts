import { useAuthStore } from "@/store/auth";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
});

let isRefreshing = false

let failedQueue: {
	resolve: () => void
	reject: (error: any) => void
}[] = []

function processQueue(error?: any) {
	failedQueue.forEach((promise) => {
	if (error) {
		promise.reject(error)
	} else {
		promise.resolve()
	}
	})
	failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
      }

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    // Don't try to refresh the refresh request itself
    if (originalRequest.url?.includes("/auth/token/refresh/")) {
      return Promise.reject(error)
    }

    // Prevent retry loops
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        })
      }).then(() => {
        return api(originalRequest)
      })
    }

    isRefreshing = true

    try {
      await api.post("/auth/token/refresh/")

      processQueue();

      return api(originalRequest)
    } catch (refreshError) {

      processQueue(refreshError)

      // log user out
      useAuthStore.getState().logout()

      window.location.href = "/auth/sign-in";

      return Promise.reject(refreshError);
      
    } finally {
      isRefreshing = false
    }
  },
)