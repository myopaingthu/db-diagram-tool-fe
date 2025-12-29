import axios, { type AxiosInstance } from "axios";
import { CONFIG } from "@/config";
import { Auth } from "./auth";
import { Diagrams } from "./diagrams";

class ApiFactory {
  private readonly axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: CONFIG.API_HOST,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axios.interceptors.request.use(
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

    this.axios.interceptors.response.use(
      (response) => {
        return response.data;
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

  public get auth() {
    return new Auth(this.axios);
  }

  public get diagrams() {
    return new Diagrams(this.axios);
  }
}

export const factory = new ApiFactory();

export const useApi = () => factory;

