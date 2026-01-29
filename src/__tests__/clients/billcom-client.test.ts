/**
 * Tests for Bill.com v2 AP API Client
 * 
 * Note: BillcomClient is a singleton that maintains session state.
 * These tests verify the client's configuration and basic behavior.
 * Full integration testing is done via handler tests.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('BillcomClient', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Configuration', () => {
    it('should be instantiated with environment variables', async () => {
      const { billcomClient } = await import('../../clients/billcom-client.js');
      expect(billcomClient).toBeDefined();
    });

    it('should have request method', async () => {
      const { billcomClient } = await import('../../clients/billcom-client.js');
      expect(typeof billcomClient.request).toBe('function');
    });

    it('should have authenticate method', async () => {
      const { billcomClient } = await import('../../clients/billcom-client.js');
      expect(typeof billcomClient.authenticate).toBe('function');
    });

    it('should have getSessionInfo method', async () => {
      const { billcomClient } = await import('../../clients/billcom-client.js');
      expect(typeof billcomClient.getSessionInfo).toBe('function');
    });

    it('should have logout method', async () => {
      const { billcomClient } = await import('../../clients/billcom-client.js');
      expect(typeof billcomClient.logout).toBe('function');
    });
  });

  describe('Session management', () => {
    it('should return session info or null', async () => {
      const { billcomClient } = await import('../../clients/billcom-client.js');
      const sessionInfo = billcomClient.getSessionInfo();
      
      // Session info is either null or has expected properties
      if (sessionInfo) {
        expect(sessionInfo).toHaveProperty('sessionId');
        expect(sessionInfo).toHaveProperty('orgId');
        expect(sessionInfo).toHaveProperty('userId');
        expect(sessionInfo).toHaveProperty('devKey');
        expect(sessionInfo).toHaveProperty('expiresAt');
      } else {
        expect(sessionInfo).toBeNull();
      }
    });

    it('should clear session on logout', async () => {
      const { billcomClient } = await import('../../clients/billcom-client.js');
      
      // Mock fetch for logout call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response_status: 0, response_data: {} }),
        text: async () => '',
      });
      
      await billcomClient.logout();
      
      const sessionInfo = billcomClient.getSessionInfo();
      expect(sessionInfo).toBeNull();
    });
  });

  describe('Request format', () => {
    it('should make POST requests to .json endpoints', async () => {
      const { billcomClient } = await import('../../clients/billcom-client.js');
      
      // Setup mocks for login + request
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ response_status: 0, response_data: { sessionId: 'test-123' } }),
          text: async () => '',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ response_status: 0, response_data: { id: 'test' } }),
          text: async () => '',
        });
      
      await billcomClient.logout();
      await billcomClient.request('Test/Endpoint', {});
      
      // Verify POST method and URL structure
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      for (const call of calls) {
        expect(call[1].method).toBe('POST');
        expect(call[0]).toContain('.json');
      }
    });

    it('should use form-urlencoded content type', async () => {
      const { billcomClient } = await import('../../clients/billcom-client.js');
      
      // Mock logout first to clear session
      const logoutMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response_status: 0, response_data: {} }),
        text: async () => '',
      });
      global.fetch = logoutMock;
      await billcomClient.logout();
      
      // Now set up fresh mocks for login + request
      const requestMock = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ response_status: 0, response_data: { sessionId: 'test-format-123' } }),
          text: async () => '',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ response_status: 0, response_data: { id: 'test' } }),
          text: async () => '',
        });
      global.fetch = requestMock;
      
      await billcomClient.request('Test/Endpoint', {});
      
      const calls = requestMock.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      for (const call of calls) {
        expect(call[1].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
      }
    });
  });

  describe('Error handling', () => {
    it('should throw on API error response', async () => {
      const { billcomClient } = await import('../../clients/billcom-client.js');
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ response_status: 0, response_data: { sessionId: 'test-123' } }),
          text: async () => '',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ response_status: 1, response_message: 'Entity not found' }),
          text: async () => '',
        });
      
      await billcomClient.logout();
      
      await expect(billcomClient.request('Test/Endpoint', {}))
        .rejects.toThrow('Entity not found');
    });

    it('should throw on HTTP error', async () => {
      const { billcomClient } = await import('../../clients/billcom-client.js');
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ response_status: 0, response_data: { sessionId: 'test-123' } }),
          text: async () => '',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({}),
          text: async () => 'Internal Server Error',
        });
      
      await billcomClient.logout();
      
      await expect(billcomClient.request('Test/Endpoint', {}))
        .rejects.toThrow();
    });

    it('should throw on network error', async () => {
      const { billcomClient } = await import('../../clients/billcom-client.js');
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ response_status: 0, response_data: { sessionId: 'test-123' } }),
          text: async () => '',
        })
        .mockRejectedValueOnce(new Error('Network failure'));
      
      await billcomClient.logout();
      
      await expect(billcomClient.request('Test/Endpoint', {}))
        .rejects.toThrow('Network failure');
    });
  });
});
