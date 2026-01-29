/**
 * Tests for Recurring Bill handlers (v2 AP API)
 * Tools: search_recurring_bills, get_recurring_bill, create_recurring_bill, update_recurring_bill, archive_recurring_bill
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRecurringBill } from '../setup.js';

// Mock the billcomClient before importing handlers
vi.mock('../../clients/billcom-client.js', () => ({
  billcomClient: {
    request: vi.fn(),
    authenticate: vi.fn(),
    getSessionInfo: vi.fn(),
    logout: vi.fn(),
  },
}));

import { billcomClient } from '../../clients/billcom-client.js';
import { searchRecurringBills } from '../../handlers/search-recurring-bills.handler.js';
import { getRecurringBill } from '../../handlers/get-recurring-bill.handler.js';
import { createRecurringBill } from '../../handlers/create-recurring-bill.handler.js';
import { updateRecurringBill } from '../../handlers/update-recurring-bill.handler.js';
import { archiveRecurringBill } from '../../handlers/archive-recurring-bill.handler.js';

describe('Recurring Bill Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchRecurringBills', () => {
    it('should search recurring bills successfully', async () => {
      const mockBills = [
        createMockRecurringBill({ id: 'rcb_1' }),
        createMockRecurringBill({ id: 'rcb_2' }),
      ];
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBills);

      const result = await searchRecurringBills();

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should pass pagination parameters', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchRecurringBills({ start: 0, max: 50 });

      expect(billcomClient.request).toHaveBeenCalledWith('List/RecurringBill', expect.objectContaining({
        start: 0,
        max: 50,
      }));
    });

    it('should pass filter by vendor', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchRecurringBills({
        filters: [{ field: 'vendorId', op: 'eq', value: 'vnd_123' }],
      });

      expect(billcomClient.request).toHaveBeenCalledWith('List/RecurringBill', expect.objectContaining({
        filters: [{ field: 'vendorId', op: 'eq', value: 'vnd_123' }],
      }));
    });

    it('should pass filter by time period', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchRecurringBills({
        filters: [{ field: 'timePeriod', op: 'eq', value: '3' }],
      });

      expect(billcomClient.request).toHaveBeenCalledWith('List/RecurringBill', expect.objectContaining({
        filters: [{ field: 'timePeriod', op: 'eq', value: '3' }],
      }));
    });

    it('should handle API errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Service unavailable')
      );

      const result = await searchRecurringBills();

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Service unavailable');
    });

    it('should return empty array when no recurring bills found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await searchRecurringBills();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });
  });

  describe('getRecurringBill', () => {
    it('should get recurring bill by ID successfully', async () => {
      const mockBill = createMockRecurringBill({ id: 'rcb_123' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      const result = await getRecurringBill('rcb_123');

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('rcb_123');
      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Read/RecurringBill', { id: 'rcb_123' });
    });

    it('should handle recurring bill not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Recurring bill not found')
      );

      const result = await getRecurringBill('invalid_id');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should return complete recurring bill details', async () => {
      const mockBill = createMockRecurringBill({
        id: 'rcb_123',
        vendorId: 'vnd_456',
      });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      const result = await getRecurringBill('rcb_123');

      expect(result.isError).toBe(false);
      expect(result.result?.vendorId).toBe('vnd_456');
      expect(result.result?.timePeriod).toBe('Monthly');
    });
  });

  describe('createRecurringBill', () => {
    it('should create recurring bill successfully', async () => {
      const mockBill = createMockRecurringBill({ id: 'rcb_new' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      const result = await createRecurringBill({
        vendorId: 'vnd_123',
        timePeriod: '3',
        frequencyPerTimePeriod: '1',
        nextDueDate: '2024-02-01',
      });

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('rcb_new');
    });

    it('should pass all parameters correctly', async () => {
      const mockBill = createMockRecurringBill();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      await createRecurringBill({
        vendorId: 'vnd_123',
        timePeriod: '3',
        frequencyPerTimePeriod: '1',
        nextDueDate: '2024-02-01',
        endDate: '2024-12-31',
        daysInAdvance: '7',
        description: 'Monthly subscription',
        recurringBillLineItems: [
          { amount: '500.00', chartOfAccountId: 'coa_1' },
        ],
      });

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Create/RecurringBill', {
        obj: expect.objectContaining({
          entity: 'RecurringBill',
          vendorId: 'vnd_123',
          timePeriod: '3',
          frequencyPerTimePeriod: '1',
          nextDueDate: '2024-02-01',
          endDate: '2024-12-31',
          daysInAdvance: '7',
          description: 'Monthly subscription',
        }),
      });
    });

    it('should handle validation errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Invalid time period')
      );

      const result = await createRecurringBill({
        vendorId: 'vnd_123',
        timePeriod: 'Invalid',
        frequencyPerTimePeriod: '1',
        nextDueDate: '2024-02-01',
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Invalid time period');
    });

    it('should handle invalid vendor error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Vendor not found')
      );

      const result = await createRecurringBill({
        vendorId: 'invalid_vendor',
        timePeriod: '3',
        frequencyPerTimePeriod: '1',
        nextDueDate: '2024-02-01',
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Vendor not found');
    });
  });

  describe('updateRecurringBill', () => {
    it('should update recurring bill successfully', async () => {
      const mockBill = createMockRecurringBill({ id: 'rcb_123' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      const result = await updateRecurringBill({ id: 'rcb_123', description: 'Updated' });

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('rcb_123');
    });

    it('should pass update fields correctly', async () => {
      const mockBill = createMockRecurringBill();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      await updateRecurringBill({
        id: 'rcb_123',
        description: 'Updated subscription',
        nextDueDate: '2024-03-01',
      });

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Update/RecurringBill', {
        obj: expect.objectContaining({
          entity: 'RecurringBill',
          id: 'rcb_123',
          description: 'Updated subscription',
          nextDueDate: '2024-03-01',
        }),
      });
    });

    it('should handle recurring bill not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Recurring bill not found')
      );

      const result = await updateRecurringBill({ id: 'invalid', description: 'Update' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should handle archived recurring bill update error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Cannot update archived recurring bill')
      );

      const result = await updateRecurringBill({ id: 'rcb_archived', description: 'Update' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('archived');
    });
  });

  describe('archiveRecurringBill', () => {
    it('should archive recurring bill successfully', async () => {
      const mockBill = createMockRecurringBill({ id: 'rcb_123' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      const result = await archiveRecurringBill('rcb_123');

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('rcb_123');
    });

    it('should set isActive to 2 for archival', async () => {
      const mockBill = createMockRecurringBill();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      await archiveRecurringBill('rcb_123');

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Update/RecurringBill', {
        obj: {
          entity: 'RecurringBill',
          id: 'rcb_123',
          isActive: '2',
        },
      });
    });

    it('should handle recurring bill not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Recurring bill not found')
      );

      const result = await archiveRecurringBill('invalid');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should handle already archived error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Recurring bill already archived')
      );

      const result = await archiveRecurringBill('rcb_archived');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('already archived');
    });
  });
});
