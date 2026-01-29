/**
 * Tests for Vendor Credit handlers (v2 AP API)
 * Tools: search_vendor_credits, get_vendor_credit, create_vendor_credit, update_vendor_credit, archive_vendor_credit
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockVendorCredit } from '../setup.js';

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
import { searchVendorCredits } from '../../handlers/search-vendor-credits.handler.js';
import { getVendorCredit } from '../../handlers/get-vendor-credit.handler.js';
import { createVendorCredit } from '../../handlers/create-vendor-credit.handler.js';
import { updateVendorCredit } from '../../handlers/update-vendor-credit.handler.js';
import { archiveVendorCredit } from '../../handlers/archive-vendor-credit.handler.js';

describe('Vendor Credit Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchVendorCredits', () => {
    it('should search vendor credits successfully', async () => {
      const mockCredits = [
        createMockVendorCredit({ id: 'vcr_1' }),
        createMockVendorCredit({ id: 'vcr_2' }),
      ];
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCredits);

      const result = await searchVendorCredits();

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should pass pagination parameters', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchVendorCredits({ start: 10, max: 25 });

      expect(billcomClient.request).toHaveBeenCalledWith('List/VendorCredit', expect.objectContaining({
        start: 10,
        max: 25,
      }));
    });

    it('should pass filter by vendor', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchVendorCredits({
        filters: [{ field: 'vendorId', op: 'eq', value: 'vnd_123' }],
      });

      expect(billcomClient.request).toHaveBeenCalledWith('List/VendorCredit', expect.objectContaining({
        filters: [{ field: 'vendorId', op: 'eq', value: 'vnd_123' }],
      }));
    });

    it('should handle API errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Database timeout')
      );

      const result = await searchVendorCredits();

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Database timeout');
    });

    it('should return empty array when no credits found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await searchVendorCredits();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });
  });

  describe('getVendorCredit', () => {
    it('should get vendor credit by ID successfully', async () => {
      const mockCredit = createMockVendorCredit({ id: 'vcr_123' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCredit);

      const result = await getVendorCredit('vcr_123');

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('vcr_123');
      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Read/VendorCredit', { id: 'vcr_123' });
    });

    it('should handle credit not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Vendor credit not found')
      );

      const result = await getVendorCredit('invalid_id');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should return complete credit details', async () => {
      const mockCredit = createMockVendorCredit({
        id: 'vcr_123',
        vendorId: 'vnd_456',
      });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCredit);

      const result = await getVendorCredit('vcr_123');

      expect(result.isError).toBe(false);
      expect(result.result?.vendorId).toBe('vnd_456');
    });
  });

  describe('createVendorCredit', () => {
    it('should create vendor credit successfully', async () => {
      const mockCredit = createMockVendorCredit({ id: 'vcr_new' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCredit);

      const result = await createVendorCredit({
        vendorId: 'vnd_123',
        creditDate: '2024-01-01',
      });

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('vcr_new');
    });

    it('should pass all parameters correctly', async () => {
      const mockCredit = createMockVendorCredit();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCredit);

      await createVendorCredit({
        vendorId: 'vnd_123',
        creditDate: '2024-01-01',
        creditNumber: 'CR-001',
        description: 'Refund for damaged goods',
        vendorCreditLineItems: [
          { amount: '100.00', chartOfAccountId: 'coa_1' },
        ],
      });

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Create/VendorCredit', {
        obj: expect.objectContaining({
          entity: 'VendorCredit',
          vendorId: 'vnd_123',
          creditDate: '2024-01-01',
          creditNumber: 'CR-001',
          description: 'Refund for damaged goods',
        }),
      });
    });

    it('should handle validation errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('vendorId is required')
      );

      const result = await createVendorCredit({
        vendorId: '',
        creditDate: '2024-01-01',
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('vendorId');
    });

    it('should handle invalid vendor error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Vendor not found')
      );

      const result = await createVendorCredit({
        vendorId: 'invalid_vendor',
        creditDate: '2024-01-01',
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Vendor not found');
    });
  });

  describe('updateVendorCredit', () => {
    it('should update vendor credit successfully', async () => {
      const mockCredit = createMockVendorCredit({ id: 'vcr_123' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCredit);

      const result = await updateVendorCredit({ id: 'vcr_123', description: 'Updated' });

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('vcr_123');
    });

    it('should pass update fields correctly', async () => {
      const mockCredit = createMockVendorCredit();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCredit);

      await updateVendorCredit({
        id: 'vcr_123',
        description: 'Updated description',
        creditNumber: 'CR-002',
      });

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Update/VendorCredit', {
        obj: expect.objectContaining({
          entity: 'VendorCredit',
          id: 'vcr_123',
          description: 'Updated description',
          creditNumber: 'CR-002',
        }),
      });
    });

    it('should handle credit not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Vendor credit not found')
      );

      const result = await updateVendorCredit({ id: 'invalid', description: 'Update' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should handle applied credit update error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Cannot update applied credit')
      );

      const result = await updateVendorCredit({ id: 'vcr_applied', description: 'Update' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('applied credit');
    });
  });

  describe('archiveVendorCredit', () => {
    it('should archive vendor credit successfully', async () => {
      const mockCredit = createMockVendorCredit({ id: 'vcr_123' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCredit);

      const result = await archiveVendorCredit('vcr_123');

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('vcr_123');
    });

    it('should set isActive to 2 for archival', async () => {
      const mockCredit = createMockVendorCredit();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCredit);

      await archiveVendorCredit('vcr_123');

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Update/VendorCredit', {
        obj: {
          entity: 'VendorCredit',
          id: 'vcr_123',
          isActive: '2',
        },
      });
    });

    it('should handle credit not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Vendor credit not found')
      );

      const result = await archiveVendorCredit('invalid');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should handle applied credit archive error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Cannot archive credit with applied amount')
      );

      const result = await archiveVendorCredit('vcr_applied');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('applied amount');
    });
  });
});
