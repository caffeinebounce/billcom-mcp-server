/**
 * Tests for Approval handlers (v2 AP API)
 * Tools: get_approval_policies, get_pending_approvals, approve_bill, reject_bill, get_approval_history
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockApproval, createMockApprovalPolicy } from '../setup.js';

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
import { getApprovalPolicies } from '../../handlers/get-approval-policies.handler.js';
import { getPendingApprovals } from '../../handlers/get-pending-approvals.handler.js';
import { approveBill } from '../../handlers/approve-bill.handler.js';
import { rejectBill } from '../../handlers/reject-bill.handler.js';
import { getApprovalHistory } from '../../handlers/get-approval-history.handler.js';

describe('Approval Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getApprovalPolicies', () => {
    it('should get approval policies successfully', async () => {
      const mockPolicies = [
        createMockApprovalPolicy({ id: 'pol_1', name: 'Default Policy' }),
        createMockApprovalPolicy({ id: 'pol_2', name: 'High Value Policy' }),
      ];
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockPolicies);

      const result = await getApprovalPolicies();

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should call List/ApprovalPolicy endpoint with pagination', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await getApprovalPolicies();

      expect(billcomClient.request).toHaveBeenCalledWith('List/ApprovalPolicy', { start: 0, max: 999 });
    });

    it('should handle API errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Permission denied')
      );

      const result = await getApprovalPolicies();

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Permission denied');
    });

    it('should return empty array when no policies configured', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await getApprovalPolicies();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });

    it('should return policy details', async () => {
      const mockPolicy = createMockApprovalPolicy({
        id: 'pol_123',
        name: 'Test Policy',
      });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([mockPolicy]);

      const result = await getApprovalPolicies();

      expect(result.isError).toBe(false);
      expect(result.result?.[0].name).toBe('Test Policy');
      expect(result.result?.[0].approvalType).toBe('Bill');
    });
  });

  describe('getPendingApprovals', () => {
    it('should get pending approvals successfully', async () => {
      const mockBills = [
        { id: 'bill_1', vendorId: 'v1', amount: '100.00', dueDate: '2026-02-01', approvalStatus: '1', createdTime: '2026-01-01' },
        { id: 'bill_2', vendorId: 'v2', amount: '200.00', dueDate: '2026-02-02', approvalStatus: '1', createdTime: '2026-01-02' },
      ];
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBills);

      const result = await getPendingApprovals();

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should filter by approvalStatus using List/Bill endpoint', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await getPendingApprovals();

      expect(billcomClient.request).toHaveBeenCalledWith('List/Bill', expect.objectContaining({
        filters: expect.arrayContaining([
          { field: 'approvalStatus', op: '=', value: '1' },
        ]),
      }));
    });

    it('should pass pagination parameters', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await getPendingApprovals({ start: 0, max: 50 });

      expect(billcomClient.request).toHaveBeenCalledWith('List/Bill', expect.objectContaining({
        start: 0,
        max: 50,
      }));
    });

    it('should handle API errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Session timeout')
      );

      const result = await getPendingApprovals();

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Session timeout');
    });

    it('should return empty array when no pending approvals', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await getPendingApprovals();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });

    it('should transform bills to pending approval items', async () => {
      const mockBills = [
        { id: 'bill_1', vendorId: 'v1', amount: '150.00', dueDate: '2026-02-01', approvalStatus: '1', invoiceNumber: 'INV-001', createdTime: '2026-01-01' },
      ];
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBills);

      const result = await getPendingApprovals();

      expect(result.result?.[0]).toMatchObject({
        id: 'bill_1',
        entity: 'Bill',
        vendorId: 'v1',
        amount: 150,
        dueDate: '2026-02-01',
        invoiceNumber: 'INV-001',
        approvalStatus: 'Pending',
      });
    });
  });

  describe('approveBill', () => {
    it('should approve bill successfully', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

      const result = await approveBill('bill_123');

      expect(result.isError).toBe(false);
      expect(result.result).toBe(true);
      expect(billcomClient.request).toHaveBeenCalledWith('Approve/Bill', { objectId: 'bill_123' });
    });

    it('should handle bill not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Bill not found')
      );

      const result = await approveBill('invalid');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should handle already approved error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Bill already approved')
      );

      const result = await approveBill('bill_approved');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('already approved');
    });

    it('should handle not pending approval error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Bill is not pending approval')
      );

      const result = await approveBill('bill_no_approval');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not pending');
    });

    it('should handle permission denied', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Not authorized to approve this bill')
      );

      const result = await approveBill('bill_123');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Not authorized');
    });
  });

  describe('rejectBill', () => {
    it('should reject bill successfully', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

      const result = await rejectBill('bill_123');

      expect(result.isError).toBe(false);
      expect(result.result).toBe(true);
      expect(billcomClient.request).toHaveBeenCalledWith('Deny/Bill', { objectId: 'bill_123' });
    });

    it('should handle bill not found', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Bill not found')
      );

      const result = await rejectBill('invalid');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not found');
    });

    it('should handle already rejected error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Bill already rejected')
      );

      const result = await rejectBill('bill_rejected');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('already rejected');
    });

    it('should handle not pending approval error', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Bill is not pending approval')
      );

      const result = await rejectBill('bill_no_approval');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not pending');
    });

    it('should handle permission denied', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Not authorized to reject this bill')
      );

      const result = await rejectBill('bill_123');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Not authorized');
    });
  });

  describe('getApprovalHistory', () => {
    it('should get approval history successfully', async () => {
      const mockHistory = [
        createMockApproval({ id: 'apr_1', objectId: 'bill_123', status: '2' }),
        createMockApproval({ id: 'apr_2', objectId: 'bill_123', status: '3' }),
      ];
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockHistory);

      const result = await getApprovalHistory('bill_123', 'Bill');

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should filter by object ID and object type', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await getApprovalHistory('bill_123', 'Bill');

      expect(billcomClient.request).toHaveBeenCalledWith('List/Approval', expect.objectContaining({
        filters: expect.arrayContaining([
          { field: 'objectId', op: 'eq', value: 'bill_123' },
          { field: 'objectType', op: 'eq', value: 'Bill' },
        ]),
      }));
    });

    it('should handle API errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Database error')
      );

      const result = await getApprovalHistory('bill_123', 'Bill');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Database error');
    });

    it('should return empty array when no history', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await getApprovalHistory('bill_new', 'Bill');

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });

    it('should return approval details including approver', async () => {
      const mockApproval = createMockApproval({
        id: 'apr_123',
        objectId: 'bill_123',
        status: '2',
      });
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([mockApproval]);

      const result = await getApprovalHistory('bill_123', 'Bill');

      expect(result.isError).toBe(false);
      expect(result.result?.[0].approverUserId).toBe('usr_123456');
      expect(result.result?.[0].status).toBe('2');
    });

    it('should sort by createdTime descending', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await getApprovalHistory('bill_123', 'Bill');

      expect(billcomClient.request).toHaveBeenCalledWith('List/Approval', expect.objectContaining({
        sort: [{ field: 'createdTime', asc: false }],
      }));
    });
  });
});
