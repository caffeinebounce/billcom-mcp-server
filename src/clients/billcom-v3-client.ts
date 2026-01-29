import dotenv from "dotenv";
import { formatError } from "../helpers/format-error.js";
import { billcomClient } from "./billcom-client.js";

dotenv.config();

const devKey = process.env.BILLCOM_DEV_KEY;
const environment = process.env.BILLCOM_ENVIRONMENT || 'sandbox';

// V3 API Base URLs (Gateway API)
const V3_BASE_URLS = {
  production: 'https://gateway.bill.com/connect/v3',
  sandbox: 'https://gateway.stage.bill.com/connect/v3'
} as const;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface V3RequestOptions {
  method: HttpMethod;
  path: string;
  body?: Record<string, unknown>;
  queryParams?: Record<string, string | number | boolean | undefined>;
}

export interface V3Response<T> {
  data?: T;
  items?: T[];
  error?: {
    code: string;
    message: string;
  };
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Bill.com v3 API Client
 * 
 * Uses the Gateway REST API with JSON bodies.
 * Reuses session authentication from the v2 client.
 */
class BillcomV3Client {
  private readonly devKey: string;
  private readonly environment: 'production' | 'sandbox';
  private readonly baseUrl: string;

  constructor(config: {
    devKey: string;
    environment: 'production' | 'sandbox';
  }) {
    this.devKey = config.devKey;
    this.environment = config.environment;
    this.baseUrl = V3_BASE_URLS[config.environment];
  }

  /**
   * Ensure we have a valid session by delegating to v2 client
   */
  private async ensureAuthenticated(): Promise<string> {
    await billcomClient.authenticate();
    const sessionInfo = billcomClient.getSessionInfo();
    if (!sessionInfo?.sessionId) {
      throw new Error('Failed to obtain session ID from v2 client');
    }
    return sessionInfo.sessionId;
  }

  /**
   * Make a request to the v3 API
   */
  async request<T>(options: V3RequestOptions): Promise<T> {
    const sessionId = await this.ensureAuthenticated();

    // Build URL with query params
    let url = `${this.baseUrl}${options.path}`;
    if (options.queryParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(options.queryParams)) {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      }
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'devKey': this.devKey,
      'sessionId': sessionId,
    };

    const fetchOptions: RequestInit = {
      method: options.method,
      headers,
    };

    if (options.body && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    const responseText = await response.text();

    let result: V3Response<T>;
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error(`Invalid JSON response from v3 API: ${responseText}`);
    }

    if (!response.ok) {
      const errorMessage = result.error?.message || `HTTP ${response.status}`;
      const errorCode = result.error?.code || 'UNKNOWN_ERROR';
      throw new Error(`Bill.com v3 API error [${errorCode}]: ${errorMessage}`);
    }

    // Return data or items depending on response structure
    if (result.items !== undefined) {
      return result.items as T;
    }
    if (result.data !== undefined) {
      return result.data;
    }
    return result as T;
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, queryParams?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>({ method: 'GET', path, queryParams });
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: 'POST', path, body });
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body });
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', path });
  }
}

// Export singleton instance
export const billcomV3Client = new BillcomV3Client({
  devKey: devKey!,
  environment: environment as 'production' | 'sandbox',
});
