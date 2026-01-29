import dotenv from "dotenv";
import { formatError } from "../helpers/format-error.js";

dotenv.config();

const apiToken = process.env.BILLCOM_SPEND_API_TOKEN;
const environment = process.env.BILLCOM_ENVIRONMENT || 'sandbox';

// v3 Spend & Expense API Base URLs
const SPEND_BASE_URLS = {
  production: 'https://gateway.prod.bill.com/connect/v3/spend',
  sandbox: 'https://gateway.stage.bill.com/connect/v3/spend'
} as const;

/**
 * Response wrapper for v3 Spend API
 * Note: v3 API returns data directly or with a different structure than v2
 */
export interface SpendApiResponse<T> {
  data?: T;
  items?: T[];  // For list endpoints
  results?: T[];  // For list endpoints (v3 format)
  pagination?: {
    cursor?: string;
    hasMore?: boolean;
    total?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * v3 Spend & Expense API Client
 * 
 * Unlike the v2 AP API which uses session-based auth,
 * the v3 Spend API uses token-based authentication via the apiToken header.
 */
class SpendClient {
  private readonly apiToken?: string;
  private readonly environment: 'production' | 'sandbox';
  private readonly baseUrl: string;
  private initialized: boolean = false;

  constructor(config: {
    apiToken?: string;
    environment: 'production' | 'sandbox';
  }) {
    this.apiToken = config.apiToken;
    this.environment = config.environment;
    this.baseUrl = SPEND_BASE_URLS[config.environment];
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiToken;
  }

  /**
   * Ensure the client is configured before making requests
   */
  private ensureConfigured(): void {
    if (!this.apiToken) {
      throw new Error(
        "BILLCOM_SPEND_API_TOKEN must be set in environment variables for Spend & Expense API access"
      );
    }
  }

  /**
   * Make a GET request to the Spend API
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined>
  ): Promise<T> {
    this.ensureConfigured();

    const url = new URL(`${this.baseUrl}/${endpoint}`);
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'apiToken': this.apiToken!,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Spend API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = `Spend API error: ${errorJson.error.message}`;
        }
      } catch {
        errorMessage = `Spend API error: ${response.status} ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json() as SpendApiResponse<T>;
    
    // Handle error responses
    if (result.error) {
      throw new Error(`Spend API error: ${result.error.message}`);
    }

    // Return data or items/results depending on response structure
    if (result.data !== undefined) {
      return result.data;
    }
    if (result.items !== undefined) {
      return result.items as T;
    }
    if (result.results !== undefined) {
      return result.results as T;
    }
    
    // For responses that return data directly
    return result as T;
  }

  /**
   * Make a POST request to the Spend API
   */
  async post<T>(
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<T> {
    this.ensureConfigured();

    const url = `${this.baseUrl}/${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apiToken': this.apiToken!,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Spend API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = `Spend API error: ${errorJson.error.message}`;
        }
      } catch {
        errorMessage = `Spend API error: ${response.status} ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json() as SpendApiResponse<T>;
    
    if (result.error) {
      throw new Error(`Spend API error: ${result.error.message}`);
    }

    if (result.data !== undefined) {
      return result.data;
    }
    
    return result as T;
  }

  /**
   * Make a PATCH request to the Spend API
   */
  async patch<T>(
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<T> {
    this.ensureConfigured();

    const url = `${this.baseUrl}/${endpoint}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apiToken': this.apiToken!,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Spend API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = `Spend API error: ${errorJson.error.message}`;
        }
      } catch {
        errorMessage = `Spend API error: ${response.status} ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json() as SpendApiResponse<T>;
    
    if (result.error) {
      throw new Error(`Spend API error: ${result.error.message}`);
    }

    if (result.data !== undefined) {
      return result.data;
    }
    
    return result as T;
  }

  /**
   * Get the base URL (for debugging)
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the environment (for debugging)
   */
  getEnvironment(): string {
    return this.environment;
  }
}

// Export singleton instance
// Note: apiToken may be undefined if not configured - handlers should check isConfigured()
export const spendClient = new SpendClient({
  apiToken: apiToken,
  environment: environment as 'production' | 'sandbox',
});
