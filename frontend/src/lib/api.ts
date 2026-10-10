import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

import { ApiError } from "@/errors/api-error";
import { ambiente } from "@/config/ambiente";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ambiente.apiUrl,
      timeout: ambiente.timeoutApiMs,
    });

    this.client.interceptors.response.use(
      (response) => response,

      (error: AxiosError<unknown>) => {
        return Promise.reject(this.handleError(error));
      },
    );
  }

  private handleError(error: AxiosError<unknown>): ApiError {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError(
        "O servidor demorou mais de 10 segundos para responder. Tente novamente.",
        0,
        error,
      );
    }

    if (!error.response) {
      return new ApiError("Não foi possível conectar ao servidor", 0, error);
    }

    return new ApiError(
      this.getErrorMessage(error.response.data),
      error.response.status,
      error.response.data,
    );
  }

  private getErrorMessage(errorData: unknown): string {
    if (
      typeof errorData === "object" &&
      errorData !== null &&
      "message" in errorData
    ) {
      const message = (errorData as { message?: unknown }).message;

      if (typeof message === "string") {
        return message;
      }

      if (
        Array.isArray(message) &&
        message.every((item) => typeof item === "string")
      ) {
        return message.join(", ");
      }
    }

    return "Ocorreu um erro inesperado";
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);

    return response.data;
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);

    return response.data;
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);

    return response.data;
  }

  async patch<T>(
    endpoint: string,
    data: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data, config);

    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);

    return response.data;
  }
}

export const api = new ApiClient();
