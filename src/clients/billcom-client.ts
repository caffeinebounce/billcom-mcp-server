import dotenv from "dotenv";
import { formatError } from "../helpers/format-error.js";
import { SessionInfo, BillcomResponse } from "../types/billcom-entities.js";

dotenv.config();

const username = process.env.BILLCOM_USERNAME;
const password = process.env.BILLCOM_PASSWORD;
const orgId = process.env.BILLCOM_ORG_ID;
const devKey = process.env.BILLCOM_DEV_KEY;
const environment = process.env.BILLCOM_ENVIRONMENT || 'sandbox';

// Validate required environment variables
if (!username || !password || !orgId || !devKey) {
  throw new Error(
    "BILLCOM_USERNAME, BILLCOM_PASSWORD, BILLCOM_ORG_ID, and BILLCOM_DEV_KEY must be set in environment variables"
  );
}

// API Base URLs
const BASE_URLS = {
  production: 'https://api.bill.com/api/v2',
  sandbox: 'https://api-sandbox.bill.com/api/v2'
} as const;

class BillcomClient {
  private readonly username: string;
  private readonly password: string;
  private readonly orgId: string;
  private readonly devKey: string;
  private readonly environment: 'production' | 'sandbox';
  private readonly baseUrl: string;

  private sessionId?: string;
  private sessionExpiry?: Date;
  private isAuthenticating: boolean = false;
  private authPromise?: Promise<void>;

  // Session timeout is 35 minutes, but we refresh at 30 min for safety
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000;

  constructor(config: {
    username: string;
    password: string;
    orgId: string;
    devKey: string;
    environment: 'production' | 'sandbox';
  }) {
    this.username = config.username;
    this.password = config.password;
    this.orgId = config.orgId;
    this.devKey = config.devKey;
    this.environment = config.environment;
    this.baseUrl = BASE_URLS[config.environment];
  }

  /**
   * Check if the current session is valid
   */
  private isSessionValid(): boolean {
    if (!this.sessionId || !this.sessionExpiry) {
      return false;
    }
    return new Date() < this.sessionExpiry;
  }

  /**
   * Authenticate with Bill.com and obtain a session ID
   */
  async authenticate(): Promise<void> {
    // If session is still valid, no need to re-authenticate
    if (this.isSessionValid()) {
      return;
    }

    // If already authenticating, wait for the existing promise
    if (this.isAuthenticating && this.authPromise) {
      await this.authPromise;
      return;
    }

    this.isAuthenticating = true;
    this.authPromise = this.performAuthentication();

    try {
      await this.authPromise;
    } finally {
      this.isAuthenticating = false;
      this.authPromise = undefined;
    }
  }

  private async performAuthentication(): Promise<void> {
    const loginUrl = `${this.baseUrl}/Login.json`;

    const body = new URLSearchParams();
    body.append('userName', this.username);
    body.append('password', this.password);
    body.append('orgId', this.orgId);
    body.append('devKey', this.devKey);

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bill.com login failed: ${response.status} ${errorText}`);
    }

    const data = await response.json() as BillcomResponse<{ sessionId: string }>;

    if (data.response_status !== 0) {
      throw new Error(`Bill.com login failed: ${data.response_message}`);
    }

    this.sessionId = data.response_data.sessionId;
    this.sessionExpiry = new Date(Date.now() + this.SESSION_TIMEOUT_MS);
  }

  /**
   * Make an authenticated request to the Bill.com API
   */
  async request<T>(
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<T> {
    await this.authenticate();

    const url = `${this.baseUrl}/${endpoint}.json`;

    const body = new URLSearchParams();
    body.append('devKey', this.devKey);
    body.append('sessionId', this.sessionId!);

    if (data) {
      body.append('data', JSON.stringify(data));
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bill.com API error: ${response.status} ${errorText}`);
    }

    const result = await response.json() as BillcomResponse<T>;

    if (result.response_status !== 0) {
      throw new Error(`Bill.com API error: ${result.response_message}`);
    }

    return result.response_data;
  }

  /**
   * Get session info (for debugging)
   */
  getSessionInfo(): SessionInfo | null {
    if (!this.sessionId || !this.sessionExpiry) {
      return null;
    }
    return {
      sessionId: this.sessionId,
      orgId: this.orgId,
      userId: this.username,
      devKey: this.devKey,
      expiresAt: this.sessionExpiry,
    };
  }

  /**
   * Logout and invalidate the current session
   */
  async logout(): Promise<void> {
    if (!this.sessionId) {
      return;
    }

    try {
      await this.request('Logout', {});
    } catch {
      // Ignore logout errors
    } finally {
      this.sessionId = undefined;
      this.sessionExpiry = undefined;
    }
  }
}

// Export singleton instance
export const billcomClient = new BillcomClient({
  username: username!,
  password: password!,
  orgId: orgId!,
  devKey: devKey!,
  environment: environment as 'production' | 'sandbox',
});
