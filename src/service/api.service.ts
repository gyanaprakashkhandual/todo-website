/* eslint-disable @typescript-eslint/no-unused-vars */
import { API_CONFIG, TOKEN_KEY } from "../configs/config";
import type { ApiResponse } from "../types";

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (includeAuth) {
      const token = this.getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }

  async get<T>(
    endpoint: string,
    _p0: Record<string, string | number | boolean | undefined>,
  ): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    auth = true,
  ): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(auth),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (res.status === 204)
      return { success: true, message: "Deleted" } as ApiResponse<T>;
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }
}

export const apiClient = new ApiClient();
