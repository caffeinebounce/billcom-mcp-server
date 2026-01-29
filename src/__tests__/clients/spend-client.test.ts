/**
 * Tests for Bill.com v3 Spend API Client
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockV3Response, mockV3ListResponse, mockV3Error, mockHttpError } from '../setup.js';

describe('SpendClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should report configured status when token is set', async () => {
      const { spendClient } = await import('../../clients/spend-client.js');
      expect(spendClient.isConfigured()).toBe(true);
    });

    it('should return correct base URL for sandbox', async () => {
      const { spendClient } = await import('../../clients/spend-client.js');
      expect(spendClient.getBaseUrl()).toContain('stage.bill.com');
    });

    it('should return correct environment', async () => {
      const { spendClient } = await import('../../clients/spend-client.js');
      expect(spendClient.getEnvironment()).toBe('sandbox');
    });
  });

  describe('GET requests', () => {
    it('should make GET request with correct headers', async () => {
      const response = mockV3Response({ uuid: 'bgt_123' });
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      await spendClient.get('budgets/bgt_123');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.method).toBe('GET');
      expect(options.headers['apiToken']).toBe('test-spend-api-token');
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('should include query parameters', async () => {
      const response = mockV3ListResponse([{ uuid: 'bgt_123' }]);
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      await spendClient.get('budgets', { limit: 10, status: 'active' });

      const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toContain('limit=10');
      expect(url).toContain('status=active');
    });

    it('should skip undefined query parameters', async () => {
      const response = mockV3ListResponse([]);
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      await spendClient.get('budgets', { limit: 10, status: undefined });

      const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(url).toContain('limit=10');
      expect(url).not.toContain('status=');
    });

    it('should return data from response', async () => {
      const budget = { uuid: 'bgt_123', name: 'Test Budget' };
      const response = mockV3Response(budget);
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      const result = await spendClient.get('budgets/bgt_123');

      expect(result).toEqual(budget);
    });

    it('should return items from list response', async () => {
      const budgets = [{ uuid: 'bgt_1' }, { uuid: 'bgt_2' }];
      const response = mockV3ListResponse(budgets);
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      const result = await spendClient.get('budgets');

      expect(result).toEqual(budgets);
    });

    it('should handle API error response', async () => {
      const errorResponse = mockV3Error('Budget not found', 'NOT_FOUND', 404);
      global.fetch = vi.fn().mockResolvedValueOnce(errorResponse);

      const { spendClient } = await import('../../clients/spend-client.js');
      
      await expect(spendClient.get('budgets/invalid')).rejects.toThrow('Budget not found');
    });

    it('should handle HTTP error', async () => {
      const httpError = mockHttpError(500, 'Internal Server Error');
      global.fetch = vi.fn().mockResolvedValueOnce(httpError);

      const { spendClient } = await import('../../clients/spend-client.js');
      
      await expect(spendClient.get('budgets')).rejects.toThrow('Spend API error');
    });

    it('should handle network error', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const { spendClient } = await import('../../clients/spend-client.js');
      
      await expect(spendClient.get('budgets')).rejects.toThrow('Network error');
    });
  });

  describe('POST requests', () => {
    it('should make POST request with JSON body', async () => {
      const response = mockV3Response({ uuid: 'bgt_123' });
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      await spendClient.post('budgets', { name: 'Test Budget', amount: '1000' });

      const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(JSON.parse(options.body)).toEqual({ name: 'Test Budget', amount: '1000' });
    });

    it('should include apiToken header', async () => {
      const response = mockV3Response({ uuid: 'bgt_123' });
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      await spendClient.post('budgets', { name: 'Test' });

      const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.headers['apiToken']).toBe('test-spend-api-token');
    });

    it('should handle POST without body', async () => {
      const response = mockV3Response({ uuid: 'crd_123' });
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      await spendClient.post('cards/crd_123/freeze');

      const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.body).toBeUndefined();
    });

    it('should return data from response', async () => {
      const budget = { uuid: 'bgt_123', name: 'Created Budget' };
      const response = mockV3Response(budget);
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      const result = await spendClient.post('budgets', { name: 'Created Budget' });

      expect(result).toEqual(budget);
    });

    it('should handle API error response', async () => {
      const errorResponse = mockV3Error('Validation failed', 'VALIDATION_ERROR', 400);
      global.fetch = vi.fn().mockResolvedValueOnce(errorResponse);

      const { spendClient } = await import('../../clients/spend-client.js');
      
      await expect(spendClient.post('budgets', {})).rejects.toThrow('Validation failed');
    });
  });

  describe('PATCH requests', () => {
    it('should make PATCH request with JSON body', async () => {
      const response = mockV3Response({ uuid: 'bgt_123', name: 'Updated' });
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      await spendClient.patch('budgets/bgt_123', { name: 'Updated' });

      const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.method).toBe('PATCH');
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(JSON.parse(options.body)).toEqual({ name: 'Updated' });
    });

    it('should include apiToken header', async () => {
      const response = mockV3Response({ uuid: 'bgt_123' });
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      await spendClient.patch('budgets/bgt_123', { name: 'Updated' });

      const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.headers['apiToken']).toBe('test-spend-api-token');
    });

    it('should return updated data from response', async () => {
      const budget = { uuid: 'bgt_123', name: 'Updated Budget' };
      const response = mockV3Response(budget);
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      const result = await spendClient.patch('budgets/bgt_123', { name: 'Updated Budget' });

      expect(result).toEqual(budget);
    });

    it('should handle API error response', async () => {
      const errorResponse = mockV3Error('Not found', 'NOT_FOUND', 404);
      global.fetch = vi.fn().mockResolvedValueOnce(errorResponse);

      const { spendClient } = await import('../../clients/spend-client.js');
      
      await expect(spendClient.patch('budgets/invalid', {})).rejects.toThrow('Not found');
    });
  });

  describe('Error handling', () => {
    it('should parse JSON error response', async () => {
      const errorResponse = {
        ok: false,
        status: 400,
        json: async () => ({ error: { code: 'BAD_REQUEST', message: 'Invalid input' } }),
        text: async () => JSON.stringify({ error: { code: 'BAD_REQUEST', message: 'Invalid input' } }),
      };
      global.fetch = vi.fn().mockResolvedValueOnce(errorResponse);

      const { spendClient } = await import('../../clients/spend-client.js');
      
      await expect(spendClient.get('budgets')).rejects.toThrow('Invalid input');
    });

    it('should handle non-JSON error response', async () => {
      const errorResponse = {
        ok: false,
        status: 500,
        json: async () => { throw new Error('Not JSON'); },
        text: async () => 'Internal Server Error',
      };
      global.fetch = vi.fn().mockResolvedValueOnce(errorResponse);

      const { spendClient } = await import('../../clients/spend-client.js');
      
      await expect(spendClient.get('budgets')).rejects.toThrow('500');
    });

    it('should handle success response with error field', async () => {
      const response = {
        ok: true,
        status: 200,
        json: async () => ({ error: { code: 'ERROR', message: 'Operation failed' } }),
        text: async () => JSON.stringify({ error: { code: 'ERROR', message: 'Operation failed' } }),
      };
      global.fetch = vi.fn().mockResolvedValueOnce(response);

      const { spendClient } = await import('../../clients/spend-client.js');
      
      await expect(spendClient.get('budgets')).rejects.toThrow('Operation failed');
    });
  });
});
