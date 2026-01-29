/**
 * Tests for Reimbursement handlers (v3 Spend API)
 * Tools: search_reimbursements, get_reimbursement, create_reimbursement, approve_reimbursement
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockReimbursement } from '../setup.js';

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
import { searchReimbursements } from '../../handlers/search-reimbursements.handler.js';
import { getReimbursement } from '../../handlers/get-reimbursement.handler.js';
import { createReimbursement } from '../../handlers/create-reimbursement.handler.js';
import { approveReimbursement } from '../../handlers/approve-reimbursement.handler.js';

describe('Reimbursement Handlers (v3 Spend API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchReimbursements', () => {
    it('should search reimbursements successfully', async () => {
      const mockReimbursements = [
        createMockReimbursement({ uuid: 'rmb_1', amount: '100.00' }),
        createMockReimbursement({ uuid: 'rmb_2', amount: '250.00' }),
      ];
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReimbursements);

      const result = await searchReimbursements();

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should map uuid to id for backwards compatibility', async () => {
      const mockReimbursements = [createMockReimbursement({ uuid: 'rmb_123' })];
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReimbursements);

      const result = await searchReimbursements();

      expect(result.isError).toBe(false);
      expect(result.result?.[0].id).toBe('rmb_123');
    });

    it('should pass query parameters', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchReimbursements({ limit: 15, userId: 'usr_123' });

      expect(spendClient.get).toHaveBeenCalledWith('reimbursements', expect.objectContaining({
        limit: 15,
        userId: 'usr_123',
      }));
    });

    it('should pass status filter', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchReimbursements({ status: 'pending' });

      expect(spendClient.get).toHaveBeenCalledWith('reimbursements', expect.objectContaining({
        status: 'pending',
      }));
    });

    it('should pass date range filters', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchReimbursements({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(spendClient.get).toHaveBeenCalledWith('reimbursements', expect.objectContaining({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      }));
    });

    it('should pass cursor for pagination', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchReimbursements({ cursor: 'next_page_token' });

      expect(spendClient.get).toHaveBeenCalledWith('reimbursements', expect.objectContaining({
        cursor: 'next_page_token',
      }));
    });

    it('should handle API errors', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Access denied')
      );

      const result = await searchReimbursements();

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Access denied');
    });

    it('should return empty array when no reimbursements found', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await searchReimbursements();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });

    it('should handle null response', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const result = await searchReimbursements();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });
  });

  describe('getReimbursement', () => {
    it('should get reimbursement by UUID successfully', async () => {
      const mockReimbursement = createMockReimbursement({ uuid: 'rmb_123' });
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReimbursement);

      const result = await getReimbursement('rmb_123');

      expect(result.isError).toBe(false);
      expect(result.result?.uuid).toBe('rmb_123');
      expect(spendClient.get).toHaveBeenCalledWith('reimbursements/rmb_123');
    });

    it('should map uuid to id for backwards compatibility', async () => {
      const mockReimbursement = createMockReimbursement({ uuid: 'rmb_123' });
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReimbursement);

      const result = await getReimbursement('rmb_123');

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('rmb_123');
    });

    it('should handle reimbursement not found', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Reimbursement not found')
      );

      const result = await getReimbursement('invalid_id');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Reimbursement not found');
    });

    it('should return complete reimbursement details', async () => {
      const mockReimbursement = createMockReimbursement({
        uuid: 'rmb_123',
        userId: 'usr_456',
        amount: '325.00',
      });
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReimbursement);

      const result = await getReimbursement('rmb_123');

      expect(result.isError).toBe(false);
      expect(result.result?.userId).toBe('usr_456');
      expect(result.result?.amount).toBe('325.00');
      expect(result.result?.status).toBeDefined();
      expect(result.result?.submittedDate).toBeDefined();
    });
  });

  describe('createReimbursement', () => {
    it('should create reimbursement successfully', async () => {
      const mockReimbursement = createMockReimbursement({ uuid: 'rmb_new' });
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReimbursement);

      const result = await createReimbursement({
        userId: 'usr_123',
        reimbursementLineItems: [
          { amount: '50.00', expenseDate: '2024-01-10', description: 'Lunch meeting' },
        ],
      });

      expect(result.isError).toBe(false);
      expect(result.result?.uuid).toBe('rmb_new');
    });

    it('should pass all parameters correctly', async () => {
      const mockReimbursement = createMockReimbursement();
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReimbursement);

      await createReimbursement({
        userId: 'usr_123',
        description: 'Travel expenses',
        reimbursementLineItems: [
          {
            amount: '150.00',
            expenseDate: '2024-01-10',
            description: 'Flight',
            chartOfAccountId: 'coa_1',
            departmentId: 'dept_1',
          },
          {
            amount: '75.00',
            expenseDate: '2024-01-10',
            description: 'Hotel',
            chartOfAccountId: 'coa_2',
          },
        ],
      });

      expect(spendClient.post).toHaveBeenCalledWith('reimbursements', expect.objectContaining({
        userId: 'usr_123',
        description: 'Travel expenses',
        lineItems: expect.arrayContaining([
          expect.objectContaining({ amount: '150.00', description: 'Flight' }),
          expect.objectContaining({ amount: '75.00', description: 'Hotel' }),
        ]),
      }));
    });

    it('should handle validation errors', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Line items required')
      );

      const result = await createReimbursement({
        userId: 'usr_123',
        reimbursementLineItems: [],
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Line items required');
    });

    it('should handle user not found', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: User not found')
      );

      const result = await createReimbursement({
        userId: 'invalid_user',
        reimbursementLineItems: [
          { amount: '50.00', expenseDate: '2024-01-10' },
        ],
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('User not found');
    });

    it('should map uuid to id in response', async () => {
      const mockReimbursement = createMockReimbursement({ uuid: 'rmb_new' });
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReimbursement);

      const result = await createReimbursement({
        userId: 'usr_123',
        reimbursementLineItems: [
          { amount: '50.00', expenseDate: '2024-01-10' },
        ],
      });

      expect(result.result?.id).toBe('rmb_new');
    });

    it('should handle invalid amount', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Amount must be positive')
      );

      const result = await createReimbursement({
        userId: 'usr_123',
        reimbursementLineItems: [
          { amount: '-50.00', expenseDate: '2024-01-10' },
        ],
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Amount must be positive');
    });
  });

  describe('approveReimbursement', () => {
    it('should approve reimbursement successfully', async () => {
      const mockReimbursement = createMockReimbursement({ uuid: 'rmb_123' });
      (mockReimbursement as { status: string }).status = 'approved';
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReimbursement);

      const result = await approveReimbursement('rmb_123');

      expect(result.isError).toBe(false);
      expect(result.result).toBeDefined();
      expect(spendClient.post).toHaveBeenCalledWith('reimbursements/rmb_123/approve');
    });

    it('should handle reimbursement not found', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Reimbursement not found')
      );

      const result = await approveReimbursement('invalid');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Reimbursement not found');
    });

    it('should handle already approved error', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Reimbursement already approved')
      );

      const result = await approveReimbursement('rmb_approved');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('already approved');
    });

    it('should handle not pending error', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Reimbursement is not pending approval')
      );

      const result = await approveReimbursement('rmb_rejected');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not pending');
    });

    it('should handle permission denied', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Not authorized to approve reimbursement')
      );

      const result = await approveReimbursement('rmb_123');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Not authorized');
    });

    it('should return result on success', async () => {
      const mockReimbursement = createMockReimbursement({ uuid: 'rmb_123' });
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockReimbursement);

      const result = await approveReimbursement('rmb_123');

      expect(result.isError).toBe(false);
      expect(result.result).not.toBeNull();
    });
  });
});
