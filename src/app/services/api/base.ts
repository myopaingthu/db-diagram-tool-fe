import axios, { type AxiosInstance } from "axios";
import { CONFIG } from "@/config";

export class Base {
  protected readonly http: AxiosInstance;

  constructor(axiosInstance?: AxiosInstance) {
    this.http = axiosInstance || axios.create({
      baseURL: CONFIG.API_HOST,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.http.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.http.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        return Promise.reject(error.response?.data || error);
      }
    );
  }
}

