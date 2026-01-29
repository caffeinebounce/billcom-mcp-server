/**
 * Tests for Bill handlers (v2 AP API)
 * Tools: search_bills, get_bill, create_bill, update_bill, archive_bill
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockBill } from '../setup.js';

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
import { searchBills } from '../../handlers/search-bills.handler.js';
import { getBill } from '../../handlers/get-bill.handler.js';
import { createBill } from '../../handlers/create-bill.handler.js';
import { updateBill } from '../../handlers/update-bill.handler.js';
import { archiveBill } from '../../handlers/archive-bill.handler.js';

describe('Bill Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchBills', () => {
    it('should search bills successfully', async () => {
      const mockBills = [
        createMockBill({ id: 'bill_1' }),
        createMockBill({ id: 'bill_2' }),
      ];
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBills);

      const result = await searchBills();

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should pass pagination parameters', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchBills({ start: 0, max: 100 });

      expect(billcomClient.request).toHaveBeenCalledWith('List/Bill', expect.objectContaining({
        start: 0,
        max: 100,
      }));
    });

    it('should pass filter parameters', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchBills({
        filters: [{ field: 'vendorId', op: 'eq', value: 'vnd_123' }],
      });

      expect(billcomClient.request).toHaveBeenCalledWith('List/Bill', expect.objectContaining({
        filters: [{ field: 'vendorId', op: 'eq', value: 'vnd_123' }],
      }));
    });

    it('should pass nested parameter for line items', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchBills({ nested: true });

      expect(billcomClient.request).toHaveBeenCalledWith('List/Bill', expect.objectContaining({
        nested: true,
      }));
    });

    it('should handle API errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Session expired')
      );

      const result = await searchBills();

      expect(result.isError).toBe(true);
      expect(result.result).toBeNull();
      expect(result.error).toContain('Session expired');
    });

    it('should return empty array when no bills found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await searchBills();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });
  });

  describe('getBill', () => {
    it('should get bill by ID successfully', async () => {
      const mockBill = createMockBill({ id: 'bill_123' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      const result = await getBill('bill_123');

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('bill_123');
      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Read/Bill', { id: 'bill_123' });
    });

    it('should handle bill not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Bill not found')
      );

      const result = await getBill('invalid_id');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Bill not found');
    });
  });

  describe('createBill', () => {
    it('should create bill successfully', async () => {
      const mockBill = createMockBill({ id: 'bill_new' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      const result = await createBill({
        vendorId: 'vnd_123',
        invoiceDate: '2024-01-01',
        dueDate: '2024-02-01',
        invoiceNumber: 'INV-001',
      });

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('bill_new');
    });

    it('should pass all parameters correctly', async () => {
      const mockBill = createMockBill();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      await createBill({
        vendorId: 'vnd_123',
        invoiceDate: '2024-01-01',
        dueDate: '2024-02-01',
        invoiceNumber: 'INV-001',
        description: 'Test bill',
        poNumber: 'PO-001',
      });

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Create/Bill', {
        obj: expect.objectContaining({
          entity: 'Bill',
          vendorId: 'vnd_123',
          invoiceDate: '2024-01-01',
          dueDate: '2024-02-01',
          invoiceNumber: 'INV-001',
        }),
      });
    });

    it('should create bill with line items', async () => {
      const mockBill = createMockBill();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      await createBill({
        vendorId: 'vnd_123',
        invoiceDate: '2024-01-01',
        dueDate: '2024-02-01',
        billLineItems: [
          { amount: '500.00', chartOfAccountId: 'coa_1' },
          { amount: '500.00', chartOfAccountId: 'coa_2' },
        ],
      });

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Create/Bill', {
        obj: expect.objectContaining({
          billLineItems: expect.arrayContaining([
            expect.objectContaining({ amount: '500.00' }),
          ]),
        }),
      });
    });

    it('should handle validation errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('vendorId is required')
      );

      const result = await createBill({
        vendorId: '',
        invoiceDate: '2024-01-01',
        dueDate: '2024-02-01',
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('vendorId');
    });

    it('should handle duplicate invoice number', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Duplicate invoice number')
      );

      const result = await createBill({
        vendorId: 'vnd_123',
        invoiceDate: '2024-01-01',
        dueDate: '2024-02-01',
        invoiceNumber: 'DUP-001',
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Duplicate');
    });
  });

  describe('updateBill', () => {
    it('should update bill successfully', async () => {
      const mockBill = createMockBill({ id: 'bill_123' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      const result = await updateBill({ id: 'bill_123', dueDate: '2024-03-01' });

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('bill_123');
    });

    it('should pass update fields correctly', async () => {
      const mockBill = createMockBill();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      await updateBill({
        id: 'bill_123',
        dueDate: '2024-03-01',
        description: 'Updated description',
      });

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Update/Bill', {
        obj: expect.objectContaining({
          entity: 'Bill',
          id: 'bill_123',
          dueDate: '2024-03-01',
          description: 'Updated description',
        }),
      });
    });

    it('should handle bill not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Bill not found')
      );

      const result = await updateBill({ id: 'invalid', dueDate: '2024-03-01' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should handle paid bill update error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Cannot update paid bill')
      );

      const result = await updateBill({ id: 'bill_paid', description: 'Update' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('paid bill');
    });
  });

  describe('archiveBill', () => {
    it('should archive bill successfully', async () => {
      const mockBill = createMockBill({ id: 'bill_123' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      const result = await archiveBill('bill_123');

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('bill_123');
    });

    it('should set isActive to 2 for archival', async () => {
      const mockBill = createMockBill();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBill);

      await archiveBill('bill_123');

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Update/Bill', {
        obj: {
          entity: 'Bill',
          id: 'bill_123',
          isActive: '2',
        },
      });
    });

    it('should handle bill with pending payments', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Cannot archive bill with pending payments')
      );

      const result = await archiveBill('bill_123');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('pending payments');
    });

    it('should handle bill not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Bill not found')
      );

      const result = await archiveBill('invalid');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });
  });
});
