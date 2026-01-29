/**
 * Tests for Budget handlers (v3 Spend API)
 * Tools: search_budgets, get_budget, create_budget, update_budget
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockBudget } from '../setup.js';

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
import { searchBudgets } from '../../handlers/search-budgets.handler.js';
import { getBudget } from '../../handlers/get-budget.handler.js';
import { createBudget } from '../../handlers/create-budget.handler.js';
import { updateBudget } from '../../handlers/update-budget.handler.js';

describe('Budget Handlers (v3 Spend API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchBudgets', () => {
    it('should search budgets successfully', async () => {
      const mockBudgets = [
        createMockBudget({ uuid: 'bgt_1', name: 'Marketing' }),
        createMockBudget({ uuid: 'bgt_2', name: 'Engineering' }),
      ];
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudgets);

      const result = await searchBudgets();

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should map uuid to id for backwards compatibility', async () => {
      const mockBudgets = [createMockBudget({ uuid: 'bgt_123' })];
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudgets);

      const result = await searchBudgets();

      expect(result.isError).toBe(false);
      expect(result.result?.[0].id).toBe('bgt_123');
    });

    it('should pass query parameters', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchBudgets({ limit: 10, name: 'Marketing' });

      expect(spendClient.get).toHaveBeenCalledWith('budgets', expect.objectContaining({
        limit: 10,
        name: 'Marketing',
      }));
    });

    it('should pass cursor for pagination', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchBudgets({ cursor: 'next_page_token' });

      expect(spendClient.get).toHaveBeenCalledWith('budgets', expect.objectContaining({
        cursor: 'next_page_token',
      }));
    });

    it('should pass isActive filter', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchBudgets({ isActive: true });

      expect(spendClient.get).toHaveBeenCalledWith('budgets', expect.objectContaining({
        isActive: 'true',
      }));
    });

    it('should pass budgetType filter', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchBudgets({ budgetType: 'expense' });

      expect(spendClient.get).toHaveBeenCalledWith('budgets', expect.objectContaining({
        budgetType: 'expense',
      }));
    });

    it('should handle API errors', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Rate limit exceeded')
      );

      const result = await searchBudgets();

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('should return empty array when no budgets found', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await searchBudgets();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });

    it('should handle null response', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const result = await searchBudgets();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });
  });

  describe('getBudget', () => {
    it('should get budget by UUID successfully', async () => {
      const mockBudget = createMockBudget({ uuid: 'bgt_123' });
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudget);

      const result = await getBudget('bgt_123');

      expect(result.isError).toBe(false);
      expect(result.result?.uuid).toBe('bgt_123');
      expect(spendClient.get).toHaveBeenCalledWith('budgets/bgt_123');
    });

    it('should map uuid to id for backwards compatibility', async () => {
      const mockBudget = createMockBudget({ uuid: 'bgt_123' });
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudget);

      const result = await getBudget('bgt_123');

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('bgt_123');
    });

    it('should handle budget not found', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Budget not found')
      );

      const result = await getBudget('invalid_id');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Budget not found');
    });

    it('should return complete budget details', async () => {
      const mockBudget = createMockBudget({
        uuid: 'bgt_123',
        name: 'Q1 Marketing',
        amount: '10000.00',
      });
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudget);

      const result = await getBudget('bgt_123');

      expect(result.isError).toBe(false);
      expect(result.result?.name).toBe('Q1 Marketing');
      expect(result.result?.amount).toBe('10000.00');
      expect(result.result?.spent).toBeDefined();
      expect(result.result?.remaining).toBeDefined();
    });
  });

  describe('createBudget', () => {
    it('should create budget successfully', async () => {
      const mockBudget = createMockBudget({ uuid: 'bgt_new' });
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudget);

      const result = await createBudget({
        name: 'New Budget',
        amount: '5000.00',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
      });

      expect(result.isError).toBe(false);
      expect(result.result?.uuid).toBe('bgt_new');
    });

    it('should pass all parameters correctly', async () => {
      const mockBudget = createMockBudget();
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudget);

      await createBudget({
        name: 'Q1 Marketing',
        amount: '10000.00',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        budgetType: 'expense',
        description: 'Q1 Marketing Budget',
        departmentId: 'dept_123',
        locationId: 'loc_456',
        chartOfAccountId: 'coa_789',
      });

      expect(spendClient.post).toHaveBeenCalledWith('budgets', {
        name: 'Q1 Marketing',
        amount: '10000.00',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        budgetType: 'expense',
        description: 'Q1 Marketing Budget',
        departmentId: 'dept_123',
        locationId: 'loc_456',
        chartOfAccountId: 'coa_789',
      });
    });

    it('should handle validation errors', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Name is required')
      );

      const result = await createBudget({
        name: '',
        amount: '5000.00',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Name is required');
    });

    it('should handle invalid date range', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: End date must be after start date')
      );

      const result = await createBudget({
        name: 'Budget',
        amount: '5000.00',
        startDate: '2024-03-31',
        endDate: '2024-01-01',
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('End date');
    });

    it('should map uuid to id in response', async () => {
      const mockBudget = createMockBudget({ uuid: 'bgt_new' });
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudget);

      const result = await createBudget({
        name: 'Budget',
        amount: '5000.00',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
      });

      expect(result.result?.id).toBe('bgt_new');
    });
  });

  describe('updateBudget', () => {
    it('should update budget successfully', async () => {
      const mockBudget = createMockBudget({ uuid: 'bgt_123', amount: '15000.00' });
      (spendClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudget);

      const result = await updateBudget({ uuid: 'bgt_123', amount: '15000.00' });

      expect(result.isError).toBe(false);
      expect(result.result?.amount).toBe('15000.00');
    });

    it('should call PATCH endpoint with UUID', async () => {
      const mockBudget = createMockBudget();
      (spendClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudget);

      await updateBudget({ uuid: 'bgt_123', name: 'Updated Name' });

      expect(spendClient.patch).toHaveBeenCalledWith('budgets/bgt_123', {
        name: 'Updated Name',
      });
    });

    it('should pass update fields correctly', async () => {
      const mockBudget = createMockBudget();
      (spendClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudget);

      await updateBudget({
        uuid: 'bgt_123',
        name: 'Updated Budget',
        amount: '20000.00',
        description: 'Updated description',
      });

      expect(spendClient.patch).toHaveBeenCalledWith('budgets/bgt_123', {
        name: 'Updated Budget',
        amount: '20000.00',
        description: 'Updated description',
      });
    });

    it('should handle budget not found', async () => {
      (spendClient.patch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Budget not found')
      );

      const result = await updateBudget({ uuid: 'invalid', amount: '5000.00' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should handle validation errors', async () => {
      (spendClient.patch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Invalid amount')
      );

      const result = await updateBudget({ uuid: 'bgt_123', amount: '-1000.00' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Invalid amount');
    });

    it('should map uuid to id in response', async () => {
      const mockBudget = createMockBudget({ uuid: 'bgt_123' });
      (spendClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudget);

      const result = await updateBudget({ uuid: 'bgt_123', name: 'Updated' });

      expect(result.result?.id).toBe('bgt_123');
    });
  });
});
