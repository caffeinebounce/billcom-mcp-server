/**
 * Tests for Bill Payment handlers (v2 AP API)
 * Tools: search_bill_payments, get_bill_payment, create_bill_payment, void_bill_payment
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockBillPayment } from '../setup.js';

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
import { searchBillPayments } from '../../handlers/search-bill-payments.handler.js';
import { getBillPayment } from '../../handlers/get-bill-payment.handler.js';
import { createBillPayment } from '../../handlers/create-bill-payment.handler.js';
import { voidBillPayment } from '../../handlers/void-bill-payment.handler.js';

describe('Bill Payment Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchBillPayments', () => {
    it('should search bill payments successfully', async () => {
      const mockPayments = [
        createMockBillPayment({ id: 'pmt_1', amount: '500.00' }),
        createMockBillPayment({ id: 'pmt_2', amount: '750.00' }),
      ];
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockPayments);

      const result = await searchBillPayments();

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should pass pagination parameters', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchBillPayments({ start: 0, max: 50 });

      expect(billcomClient.request).toHaveBeenCalledWith('List/SentPay', expect.objectContaining({
        start: 0,
        max: 50,
      }));
    });

    it('should pass filter by vendor', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchBillPayments({
        filters: [{ field: 'vendorId', op: 'eq', value: 'vnd_123' }],
      });

      expect(billcomClient.request).toHaveBeenCalledWith('List/SentPay', expect.objectContaining({
        filters: [{ field: 'vendorId', op: 'eq', value: 'vnd_123' }],
      }));
    });

    it('should pass filter by status', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchBillPayments({
        filters: [{ field: 'status', op: 'eq', value: '1' }],
      });

      expect(billcomClient.request).toHaveBeenCalledWith('List/SentPay', expect.objectContaining({
        filters: [{ field: 'status', op: 'eq', value: '1' }],
      }));
    });

    it('should handle API errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Permission denied')
      );

      const result = await searchBillPayments();

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Permission denied');
    });

    it('should return empty array when no payments found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await searchBillPayments();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });
  });

  describe('getBillPayment', () => {
    it('should get bill payment by ID successfully', async () => {
      const mockPayment = createMockBillPayment({ id: 'pmt_123' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockPayment);

      const result = await getBillPayment('pmt_123');

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('pmt_123');
      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Read/SentPay', { id: 'pmt_123' });
    });

    it('should handle payment not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Payment not found')
      );

      const result = await getBillPayment('invalid_id');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Payment not found');
    });

    it('should return complete payment details', async () => {
      const mockPayment = createMockBillPayment({
        id: 'pmt_123',
        vendorId: 'vnd_456',
        amount: '1000.00',
      });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockPayment);

      const result = await getBillPayment('pmt_123');

      expect(result.isError).toBe(false);
      expect(result.result?.vendorId).toBe('vnd_456');
      expect(result.result?.amount).toBe('1000.00');
    });
  });

  describe('createBillPayment', () => {
    it('should create bill payment successfully', async () => {
      const mockPayment = createMockBillPayment({ id: 'pmt_new' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockPayment);

      const result = await createBillPayment({
        vendorId: 'vnd_123',
        processDate: '2024-01-15',
        chartOfAccountId: 'coa_1',
        billPayments: [{ billId: 'bill_1', amount: '500.00' }],
      });

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('pmt_new');
    });

    it('should pass all parameters correctly', async () => {
      const mockPayment = createMockBillPayment();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockPayment);

      await createBillPayment({
        vendorId: 'vnd_123',
        processDate: '2024-01-15',
        chartOfAccountId: 'coa_1',
        billPayments: [
          { billId: 'bill_1', amount: '500.00' },
          { billId: 'bill_2', amount: '300.00' },
        ],
        description: 'Payment for invoices',
        toPrintCheck: '0',
      });

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Create/SentPay', {
        obj: expect.objectContaining({
          entity: 'SentPay',
          vendorId: 'vnd_123',
          processDate: '2024-01-15',
          chartOfAccountId: 'coa_1',
          billPayments: expect.arrayContaining([
            expect.objectContaining({ billId: 'bill_1', amount: '500.00' }),
          ]),
          description: 'Payment for invoices',
          toPrintCheck: '0',
        }),
      });
    });

    it('should handle insufficient funds error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Insufficient funds')
      );

      const result = await createBillPayment({
        vendorId: 'vnd_123',
        processDate: '2024-01-15',
        chartOfAccountId: 'coa_1',
        billPayments: [{ billId: 'bill_1', amount: '500.00' }],
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Insufficient funds');
    });

    it('should handle invalid bill error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Bill not found or already paid')
      );

      const result = await createBillPayment({
        vendorId: 'vnd_123',
        processDate: '2024-01-15',
        chartOfAccountId: 'coa_1',
        billPayments: [{ billId: 'invalid_bill', amount: '500.00' }],
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Bill not found');
    });

    it('should handle vendor mismatch error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Bills do not belong to specified vendor')
      );

      const result = await createBillPayment({
        vendorId: 'vnd_wrong',
        processDate: '2024-01-15',
        chartOfAccountId: 'coa_1',
        billPayments: [{ billId: 'bill_1', amount: '500.00' }],
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('vendor');
    });

    it('should support multiple bill payments in single request', async () => {
      const mockPayment = createMockBillPayment();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockPayment);

      await createBillPayment({
        vendorId: 'vnd_123',
        processDate: '2024-01-15',
        chartOfAccountId: 'coa_1',
        billPayments: [
          { billId: 'bill_1', amount: '500.00' },
          { billId: 'bill_2', amount: '300.00' },
          { billId: 'bill_3', amount: '200.00' },
        ],
      });

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Create/SentPay', expect.objectContaining({
        obj: expect.objectContaining({
          billPayments: expect.arrayContaining([
            expect.objectContaining({ billId: 'bill_1' }),
            expect.objectContaining({ billId: 'bill_2' }),
            expect.objectContaining({ billId: 'bill_3' }),
          ]),
        }),
      }));
    });
  });

  describe('voidBillPayment', () => {
    it('should void bill payment successfully', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

      const result = await voidBillPayment('pmt_123');

      expect(result.isError).toBe(false);
      expect(result.result).toBe(true);
      expect(billcomClient.request).toHaveBeenCalledWith('Void/SentPay', { sentPayId: 'pmt_123' });
    });

    it('should handle already voided payment', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Payment already voided')
      );

      const result = await voidBillPayment('pmt_voided');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('already voided');
    });

    it('should handle processed payment error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Cannot void processed payment')
      );

      const result = await voidBillPayment('pmt_processed');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('processed payment');
    });

    it('should handle payment not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Payment not found')
      );

      const result = await voidBillPayment('invalid');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should handle permission denied', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Permission denied to void payment')
      );

      const result = await voidBillPayment('pmt_123');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Permission denied');
    });
  });
});
