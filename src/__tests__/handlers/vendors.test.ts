/**
 * Tests for Vendor handlers (v2 AP API)
 * Tools: search_vendors, get_vendor, create_vendor, update_vendor, archive_vendor
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockV2Response,
  mockV2Error,
  mockHttpError,
  createMockVendor,
} from '../setup.js';

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
import { searchVendors } from '../../handlers/search-vendors.handler.js';
import { getVendor } from '../../handlers/get-vendor.handler.js';
import { createVendor } from '../../handlers/create-vendor.handler.js';
import { updateVendor } from '../../handlers/update-vendor.handler.js';
import { archiveVendor } from '../../handlers/archive-vendor.handler.js';

describe('Vendor Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchVendors', () => {
    it('should search vendors successfully', async () => {
      const mockVendors = [
        createMockVendor({ id: 'vnd_1', name: 'Vendor 1' }),
        createMockVendor({ id: 'vnd_2', name: 'Vendor 2' }),
      ];
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVendors);

      const result = await searchVendors();

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should pass pagination parameters', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchVendors({ start: 10, max: 50 });

      expect(billcomClient.request).toHaveBeenCalledWith('List/Vendor', {
        start: 10,
        max: 50,
      });
    });

    it('should pass filter parameters', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchVendors({
        filters: [{ field: 'name', op: 'ct', value: 'test' }],
      });

      expect(billcomClient.request).toHaveBeenCalledWith('List/Vendor', expect.objectContaining({
        filters: [{ field: 'name', op: 'ct', value: 'test' }],
      }));
    });

    it('should pass sort parameters', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchVendors({
        sort: [{ field: 'name', asc: true }],
      });

      expect(billcomClient.request).toHaveBeenCalledWith('List/Vendor', expect.objectContaining({
        sort: [{ field: 'name', asc: true }],
      }));
    });

    it('should pass nested parameter', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchVendors({ nested: true });

      expect(billcomClient.request).toHaveBeenCalledWith('List/Vendor', expect.objectContaining({
        nested: true,
      }));
    });

    it('should handle API errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('API error: Rate limit exceeded')
      );

      const result = await searchVendors();

      expect(result.isError).toBe(true);
      expect(result.result).toBeNull();
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('should use default pagination values', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchVendors();

      expect(billcomClient.request).toHaveBeenCalledWith('List/Vendor', {
        start: 0,
        max: 999,
      });
    });
  });

  describe('getVendor', () => {
    it('should get vendor by ID successfully', async () => {
      const mockVendor = createMockVendor({ id: 'vnd_123' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVendor);

      const result = await getVendor('vnd_123');

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('vnd_123');
      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Read/Vendor', { id: 'vnd_123' });
    });

    it('should handle vendor not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Vendor not found')
      );

      const result = await getVendor('invalid_id');

      expect(result.isError).toBe(true);
      expect(result.result).toBeNull();
      expect(result.error).toContain('Vendor not found');
    });

    it('should handle network errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await getVendor('vnd_123');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Network error');
    });
  });

  describe('createVendor', () => {
    it('should create vendor successfully', async () => {
      const mockVendor = createMockVendor({ id: 'vnd_new', name: 'New Vendor' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVendor);

      const result = await createVendor({ name: 'New Vendor' });

      expect(result.isError).toBe(false);
      expect(result.result?.name).toBe('New Vendor');
    });

    it('should pass all parameters correctly', async () => {
      const mockVendor = createMockVendor();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVendor);

      await createVendor({
        name: 'Test Vendor',
        email: 'test@vendor.com',
        phone: '555-1234',
        address1: '123 Main St',
        addressCity: 'San Francisco',
        addressState: 'CA',
        addressZip: '94102',
      });

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Create/Vendor', {
        obj: expect.objectContaining({
          entity: 'Vendor',
          name: 'Test Vendor',
          email: 'test@vendor.com',
          phone: '555-1234',
          address1: '123 Main St',
          addressCity: 'San Francisco',
          addressState: 'CA',
          addressZip: '94102',
        }),
      });
    });

    it('should handle validation errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Name is required')
      );

      const result = await createVendor({ name: '' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Name is required');
    });

    it('should handle duplicate vendor error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Vendor already exists')
      );

      const result = await createVendor({ name: 'Duplicate Vendor' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('already exists');
    });
  });

  describe('updateVendor', () => {
    it('should update vendor successfully', async () => {
      const mockVendor = createMockVendor({ id: 'vnd_123', name: 'Updated Name' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVendor);

      const result = await updateVendor({ id: 'vnd_123', name: 'Updated Name' });

      expect(result.isError).toBe(false);
      expect(result.result?.name).toBe('Updated Name');
    });

    it('should pass update fields correctly', async () => {
      const mockVendor = createMockVendor();
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVendor);

      await updateVendor({
        id: 'vnd_123',
        name: 'Updated',
        email: 'new@email.com',
        phone: '555-9999',
      });

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Update/Vendor', {
        obj: expect.objectContaining({
          entity: 'Vendor',
          id: 'vnd_123',
          name: 'Updated',
          email: 'new@email.com',
          phone: '555-9999',
        }),
      });
    });

    it('should handle vendor not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Vendor not found')
      );

      const result = await updateVendor({ id: 'invalid', name: 'Update' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should handle permission error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Permission denied')
      );

      const result = await updateVendor({ id: 'vnd_123', name: 'Update' });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Permission denied');
    });
  });

  describe('archiveVendor', () => {
    it('should archive vendor successfully', async () => {
      const mockVendor = createMockVendor({ id: 'vnd_123', isActive: '2' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVendor);

      const result = await archiveVendor('vnd_123');

      expect(result.isError).toBe(false);
      expect(result.result?.isActive).toBe('2');
    });

    it('should set isActive to 2 for archival', async () => {
      const mockVendor = createMockVendor({ isActive: '2' });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVendor);

      await archiveVendor('vnd_123');

      expect(billcomClient.request).toHaveBeenCalledWith('Crud/Update/Vendor', {
        obj: {
          entity: 'Vendor',
          id: 'vnd_123',
          isActive: '2',
        },
      });
    });

    it('should handle vendor not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Vendor not found')
      );

      const result = await archiveVendor('invalid');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should handle vendor with open payments', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Cannot archive vendor with open payments')
      );

      const result = await archiveVendor('vnd_123');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('open payments');
    });
  });
});
