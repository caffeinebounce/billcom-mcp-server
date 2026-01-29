/**
 * Tests for Transaction handlers (v3 Spend API)
 * Tools: search_transactions, get_transaction, update_transaction
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockTransaction } from '../setup.js';

// Mock the spendClient before importing handlers
vi.mock('../../clients/spend-client.js', () => ({
  spendClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    isConfigured: vi.fn().mockReturnValue(true),
    getBaseUrl: vi.fn().mockReturnValue('https://gateway.stage.bill.com/connect/v3/spend'),
    getEnvironment: vi.fn().mockReturnValue('sandbox'),
  },
}));

import { spendClient } from '../../clients/spend-client.js';
import { searchTransactions } from '../../handlers/search-transactions.handler.js';
import { getTransaction } from '../../handlers/get-transaction.handler.js';
import { updateTransaction } from '../../handlers/update-transaction.handler.js';

describe('Transaction Handlers (v3 Spend API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchTransactions', () => {
    it('should search transactions successfully', async () => {
      const mockTransactions = [
        createMockTransaction({ uuid: 'txn_1', amount: '50.00' }),
        createMockTransaction({ uuid: 'txn_2', amount: '150.00' }),
      ];
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTransactions);

      const result = await searchTransactions();

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should map uuid to id for backwards compatibility', async () => {
      const mockTransactions = [createMockTransaction({ uuid: 'txn_123' })];
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTransactions);

      const result = await searchTransactions();

      expect(result.isError).toBe(false);
      expect(result.result?.[0].id).toBe('txn_123');
    });

    it('should pass query parameters', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchTransactions({ limit: 20, cardId: 'crd_123' });

      expect(spendClient.get).toHaveBeenCalledWith('transactions', expect.objectContaining({
        limit: 20,
        cardId: 'crd_123',
      }));
    });

    it('should pass status filter', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchTransactions({ status: 'completed' });

      expect(spendClient.get).toHaveBeenCalledWith('transactions', expect.objectContaining({
        status: 'completed',
      }));
    });

    it('should pass date range filters', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchTransactions({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(spendClient.get).toHaveBeenCalledWith('transactions', expect.objectContaining({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      }));
    });

    it('should pass merchantName filter', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchTransactions({ merchantName: 'Office Supplies' });

      expect(spendClient.get).toHaveBeenCalledWith('transactions', expect.objectContaining({
        merchantName: 'Office Supplies',
      }));
    });

    it('should pass cursor for pagination', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchTransactions({ cursor: 'next_page_token' });

      expect(spendClient.get).toHaveBeenCalledWith('transactions', expect.objectContaining({
        cursor: 'next_page_token',
      }));
    });

    it('should handle API errors', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Invalid date format')
      );

      const result = await searchTransactions();

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Invalid date format');
    });

    it('should return empty array when no transactions found', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await searchTransactions();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });

    it('should handle null response', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const result = await searchTransactions();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });
  });

  describe('getTransaction', () => {
    it('should get transaction by UUID successfully', async () => {
      const mockTransaction = createMockTransaction({ uuid: 'txn_123' });
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTransaction);

      const result = await getTransaction('txn_123');

      expect(result.isError).toBe(false);
      expect(result.result?.uuid).toBe('txn_123');
      expect(spendClient.get).toHaveBeenCalledWith('transactions/txn_123');
    });

    it('should map uuid to id for backwards compatibility', async () => {
      const mockTransaction = createMockTransaction({ uuid: 'txn_123' });
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTransaction);

      const result = await getTransaction('txn_123');

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('txn_123');
    });

    it('should handle transaction not found', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Transaction not found')
      );

      const result = await getTransaction('invalid_id');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Transaction not found');
    });

    it('should return complete transaction details', async () => {
      const mockTransaction = createMockTransaction({
        uuid: 'txn_123',
        cardId: 'crd_456',
        amount: '75.00',
      });
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTransaction);

      const result = await getTransaction('txn_123');

      expect(result.isError).toBe(false);
      expect(result.result?.cardId).toBe('crd_456');
      expect(result.result?.amount).toBe('75.00');
      expect(result.result?.merchantName).toBeDefined();
      expect(result.result?.transactionDate).toBeDefined();
    });

    it('should include receipt status', async () => {
      const mockTransaction = createMockTransaction({
        uuid: 'txn_123',
      });
      mockTransaction.receiptStatus = 'uploaded';
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTransaction);

      const result = await getTransaction('txn_123');

      expect(result.isError).toBe(false);
      expect(result.result?.receiptStatus).toBe('uploaded');
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction successfully', async () => {
      const mockTransaction = createMockTransaction({ uuid: 'txn_123' });
      mockTransaction.description = 'Updated description';
      (spendClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTransaction);

      const result = await updateTransaction({ uuid: 'txn_123', description: 'Updated description' });

      expect(result.isError).toBe(false);
      expect(result.result?.description).toBe('Updated description');
    });

    it('should call PATCH endpoint with UUID', async () => {
      const mockTransaction = createMockTransaction();
      (spendClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTransaction);

      await updateTransaction({ uuid: 'txn_123', description: 'Test' });

      expect(spendClient.patch).toHaveBeenCalledWith('transactions/txn_123', {
        description: 'Test',
      });
    });

    it('should pass update fields correctly', async () => {
      const mockTransaction = createMockTransaction();
      (spendClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTransaction);

      await updateTransaction({
        uuid: 'txn_123',
        description: 'Office supplies purchase',
        chartOfAccountId: 'coa_456',
        departmentId: 'dept_789',
        locationId: 'loc_012',
      });

      expect(spendClient.patch).toHaveBeenCalledWith('transactions/txn_123', {
        description: 'Office supplies purchase',
        chartOfAccountId: 'coa_456',
        departmentId: 'dept_789',
        locationId: 'loc_012',
      });
    });

    it('should handle transaction not found', async () => {
      (spendClient.patch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Transaction not found')
      );

      const result = await updateTransaction({ uuid: 'invalid', description: 'Test' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should handle validation errors', async () => {
      (spendClient.patch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Invalid chart of account')
      );

      const result = await updateTransaction({ uuid: 'txn_123', chartOfAccountId: 'invalid' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Invalid chart of account');
    });

    it('should handle readonly transaction error', async () => {
      (spendClient.patch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Transaction cannot be modified')
      );

      const result = await updateTransaction({ uuid: 'txn_readonly', description: 'Test' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('cannot be modified');
    });

    it('should map uuid to id in response', async () => {
      const mockTransaction = createMockTransaction({ uuid: 'txn_123' });
      (spendClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTransaction);

      const result = await updateTransaction({ uuid: 'txn_123', description: 'Updated' });

      expect(result.result?.id).toBe('txn_123');
    });
  });
});
