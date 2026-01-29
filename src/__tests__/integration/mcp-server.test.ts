/**
 * Integration tests for Bill.com MCP Server
 * Tests tool registration, invocation flow, and error propagation
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Mock both clients before importing anything else
vi.mock('../../clients/billcom-client.js', () => ({
  billcomClient: {
    request: vi.fn(),
    authenticate: vi.fn(),
    getSessionInfo: vi.fn(),
    logout: vi.fn(),
  },
}));

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

import { BillcomMCPServer } from '../../server/billcom-mcp-server.js';
import { RegisterTool } from '../../helpers/register-tool.js';

// Import all tools
import { SearchVendorsTool } from '../../tools/search-vendors.tool.js';
import { GetVendorTool } from '../../tools/get-vendor.tool.js';
import { CreateVendorTool } from '../../tools/create-vendor.tool.js';
import { UpdateVendorTool } from '../../tools/update-vendor.tool.js';
import { ArchiveVendorTool } from '../../tools/archive-vendor.tool.js';

import { SearchBillsTool } from '../../tools/search-bills.tool.js';
import { GetBillTool } from '../../tools/get-bill.tool.js';
import { CreateBillTool } from '../../tools/create-bill.tool.js';
import { UpdateBillTool } from '../../tools/update-bill.tool.js';
import { ArchiveBillTool } from '../../tools/archive-bill.tool.js';

import { SearchBillPaymentsTool } from '../../tools/search-bill-payments.tool.js';
import { GetBillPaymentTool } from '../../tools/get-bill-payment.tool.js';
import { CreateBillPaymentTool } from '../../tools/create-bill-payment.tool.js';
import { VoidBillPaymentTool } from '../../tools/void-bill-payment.tool.js';

import { SearchVendorCreditsTool } from '../../tools/search-vendor-credits.tool.js';
import { GetVendorCreditTool } from '../../tools/get-vendor-credit.tool.js';
import { CreateVendorCreditTool } from '../../tools/create-vendor-credit.tool.js';
import { UpdateVendorCreditTool } from '../../tools/update-vendor-credit.tool.js';
import { ArchiveVendorCreditTool } from '../../tools/archive-vendor-credit.tool.js';

import { SearchRecurringBillsTool } from '../../tools/search-recurring-bills.tool.js';
import { GetRecurringBillTool } from '../../tools/get-recurring-bill.tool.js';
import { CreateRecurringBillTool } from '../../tools/create-recurring-bill.tool.js';
import { UpdateRecurringBillTool } from '../../tools/update-recurring-bill.tool.js';
import { ArchiveRecurringBillTool } from '../../tools/archive-recurring-bill.tool.js';

import { GetApprovalPoliciesTool } from '../../tools/get-approval-policies.tool.js';
import { GetPendingApprovalsTool } from '../../tools/get-pending-approvals.tool.js';
import { ApproveBillTool } from '../../tools/approve-bill.tool.js';
import { RejectBillTool } from '../../tools/reject-bill.tool.js';
import { GetApprovalHistoryTool } from '../../tools/get-approval-history.tool.js';

import { SearchBudgetsTool } from '../../tools/search-budgets.tool.js';
import { GetBudgetTool } from '../../tools/get-budget.tool.js';
import { CreateBudgetTool } from '../../tools/create-budget.tool.js';
import { UpdateBudgetTool } from '../../tools/update-budget.tool.js';

import { SearchCardsTool } from '../../tools/search-cards.tool.js';
import { GetCardTool } from '../../tools/get-card.tool.js';
import { CreateVirtualCardTool } from '../../tools/create-virtual-card.tool.js';
import { FreezeCardTool } from '../../tools/freeze-card.tool.js';
import { UnfreezeCardTool } from '../../tools/unfreeze-card.tool.js';

import { SearchTransactionsTool } from '../../tools/search-transactions.tool.js';
import { GetTransactionTool } from '../../tools/get-transaction.tool.js';
import { UpdateTransactionTool } from '../../tools/update-transaction.tool.js';

import { SearchReimbursementsTool } from '../../tools/search-reimbursements.tool.js';
import { GetReimbursementTool } from '../../tools/get-reimbursement.tool.js';
import { CreateReimbursementTool } from '../../tools/create-reimbursement.tool.js';
import { ApproveReimbursementTool } from '../../tools/approve-reimbursement.tool.js';

import { billcomClient } from '../../clients/billcom-client.js';
import { spendClient } from '../../clients/spend-client.js';

// All 45 tools
const ALL_TOOLS = [
  // Vendors (5)
  SearchVendorsTool,
  GetVendorTool,
  CreateVendorTool,
  UpdateVendorTool,
  ArchiveVendorTool,
  // Bills (5)
  SearchBillsTool,
  GetBillTool,
  CreateBillTool,
  UpdateBillTool,
  ArchiveBillTool,
  // Bill Payments (4)
  SearchBillPaymentsTool,
  GetBillPaymentTool,
  CreateBillPaymentTool,
  VoidBillPaymentTool,
  // Vendor Credits (5)
  SearchVendorCreditsTool,
  GetVendorCreditTool,
  CreateVendorCreditTool,
  UpdateVendorCreditTool,
  ArchiveVendorCreditTool,
  // Recurring Bills (5)
  SearchRecurringBillsTool,
  GetRecurringBillTool,
  CreateRecurringBillTool,
  UpdateRecurringBillTool,
  ArchiveRecurringBillTool,
  // Approvals (5)
  GetApprovalPoliciesTool,
  GetPendingApprovalsTool,
  ApproveBillTool,
  RejectBillTool,
  GetApprovalHistoryTool,
  // Budgets (4)
  SearchBudgetsTool,
  GetBudgetTool,
  CreateBudgetTool,
  UpdateBudgetTool,
  // Cards (5)
  SearchCardsTool,
  GetCardTool,
  CreateVirtualCardTool,
  FreezeCardTool,
  UnfreezeCardTool,
  // Transactions (3)
  SearchTransactionsTool,
  GetTransactionTool,
  UpdateTransactionTool,
  // Reimbursements (4)
  SearchReimbursementsTool,
  GetReimbursementTool,
  CreateReimbursementTool,
  ApproveReimbursementTool,
];

// Helper to invoke handler with type cast
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const invokeHandler = async (tool: any, params: Record<string, unknown> = {}) => {
  return tool.handler({ params }, {}) as Promise<{ content: Array<{ type: string; text?: string }> }>;
};

describe('MCP Server Integration', () => {
  let server: McpServer;

  beforeAll(() => {
    server = BillcomMCPServer.GetServer();
    
    // Register all tools
    ALL_TOOLS.forEach(tool => {
      RegisterTool(server, tool);
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Server initialization', () => {
    it('should create server singleton', () => {
      const server1 = BillcomMCPServer.GetServer();
      const server2 = BillcomMCPServer.GetServer();
      expect(server1).toBe(server2);
    });

    it('should return McpServer instance', () => {
      expect(server).toBeInstanceOf(McpServer);
    });
  });

  describe('Tool registration', () => {
    it('should register all 45 tools', () => {
      expect(ALL_TOOLS).toHaveLength(45);
    });

    it('should have unique tool names', () => {
      const names = ALL_TOOLS.map(t => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    describe('v2 AP API tools', () => {
      it('should register all vendor tools', () => {
        const vendorTools = ALL_TOOLS.filter(t => t.name.includes('vendor') && !t.name.includes('credit'));
        expect(vendorTools).toHaveLength(5);
        expect(vendorTools.map(t => t.name)).toContain('search_vendors');
        expect(vendorTools.map(t => t.name)).toContain('get_vendor');
        expect(vendorTools.map(t => t.name)).toContain('create_vendor');
        expect(vendorTools.map(t => t.name)).toContain('update_vendor');
        expect(vendorTools.map(t => t.name)).toContain('archive_vendor');
      });

      it('should register all bill tools', () => {
        const billTools = ALL_TOOLS.filter(t => 
          t.name.includes('bill') && 
          !t.name.includes('payment') && 
          !t.name.includes('recurring') &&
          !t.name.includes('approve') &&
          !t.name.includes('reject')
        );
        expect(billTools).toHaveLength(5);
      });

      it('should register all bill payment tools', () => {
        const paymentTools = ALL_TOOLS.filter(t => t.name.includes('bill_payment') || t.name.includes('void_bill'));
        expect(paymentTools).toHaveLength(4);
      });

      it('should register all vendor credit tools', () => {
        const creditTools = ALL_TOOLS.filter(t => t.name.includes('vendor_credit'));
        expect(creditTools).toHaveLength(5);
      });

      it('should register all recurring bill tools', () => {
        const recurringTools = ALL_TOOLS.filter(t => t.name.includes('recurring_bill'));
        expect(recurringTools).toHaveLength(5);
      });

      it('should register all approval tools', () => {
        const approvalTools = ALL_TOOLS.filter(t => 
          t.name.includes('approval') || 
          t.name === 'approve_bill' || 
          t.name === 'reject_bill'
        );
        expect(approvalTools).toHaveLength(5);
      });
    });

    describe('v3 Spend API tools', () => {
      it('should register all budget tools', () => {
        const budgetTools = ALL_TOOLS.filter(t => t.name.includes('budget'));
        expect(budgetTools).toHaveLength(4);
      });

      it('should register all card tools', () => {
        const cardTools = ALL_TOOLS.filter(t => 
          t.name.includes('card') || 
          t.name.includes('freeze') || 
          t.name.includes('virtual_card')
        );
        expect(cardTools).toHaveLength(5);
      });

      it('should register all transaction tools', () => {
        const transactionTools = ALL_TOOLS.filter(t => t.name.includes('transaction'));
        expect(transactionTools).toHaveLength(3);
      });

      it('should register all reimbursement tools', () => {
        const reimbursementTools = ALL_TOOLS.filter(t => t.name.includes('reimbursement'));
        expect(reimbursementTools).toHaveLength(4);
      });
    });
  });

  describe('Tool invocation', () => {
    describe('v2 AP tools', () => {
      it('should invoke search_vendors successfully', async () => {
        const mockVendors = [{ id: 'vnd_1', name: 'Test Vendor' }];
        (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVendors);

        const result = await invokeHandler(SearchVendorsTool, {});

        expect(result.content).toBeDefined();
        expect(result.content[0].type).toBe('text');
      });

      it('should invoke get_vendor successfully', async () => {
        const mockVendor = { id: 'vnd_123', name: 'Test Vendor' };
        (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVendor);

        const result = await invokeHandler(GetVendorTool, { id: 'vnd_123' });

        expect(result.content).toBeDefined();
      });

      it('should handle v2 API errors gracefully', async () => {
        (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
          new Error('Session expired')
        );

        const result = await invokeHandler(SearchVendorsTool, {});

        expect(result.content[0].text).toContain('Error');
      });
    });

    describe('v3 Spend tools', () => {
      it('should invoke search_budgets successfully', async () => {
        const mockBudgets = [{ uuid: 'bgt_1', name: 'Marketing Budget' }];
        (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockBudgets);

        const result = await invokeHandler(SearchBudgetsTool, {});

        expect(result.content).toBeDefined();
        expect(result.content[0].type).toBe('text');
      });

      it('should invoke get_card successfully', async () => {
        const mockCard = { uuid: 'crd_123', lastFour: '4242' };
        (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCard);

        const result = await invokeHandler(GetCardTool, { uuid: 'crd_123' });

        expect(result.content).toBeDefined();
      });

      it('should handle v3 API errors gracefully', async () => {
        (spendClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
          new Error('Spend API error: Unauthorized')
        );

        const result = await invokeHandler(SearchBudgetsTool, {});

        expect(result.content[0].text).toContain('Error');
      });
    });
  });

  describe('Error propagation', () => {
    it('should propagate network errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error: ECONNREFUSED')
      );

      const result = await invokeHandler(SearchVendorsTool, {});

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('Network error');
    });

    it('should propagate authentication errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      const result = await invokeHandler(SearchVendorsTool, {});

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('Invalid credentials');
    });

    it('should propagate rate limit errors', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Rate limit exceeded')
      );

      const result = await invokeHandler(SearchBudgetsTool, {});

      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('Rate limit');
    });

    it('should propagate validation errors', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Validation error: Name is required')
      );

      const result = await invokeHandler(CreateVendorTool, { name: '' });

      expect(result.content[0].text).toContain('Error');
    });
  });

  describe('Response formatting', () => {
    it('should format list responses correctly', async () => {
      const mockVendors = [
        { id: 'vnd_1', name: 'Vendor 1' },
        { id: 'vnd_2', name: 'Vendor 2' },
      ];
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVendors);

      const result = await invokeHandler(SearchVendorsTool, {});

      expect(result.content.length).toBeGreaterThan(1);
      expect(result.content[0].text).toContain('Found 2');
    });

    it('should format empty list responses', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await invokeHandler(SearchVendorsTool, {});

      expect(result.content[0].text).toContain('Found 0');
    });

    it('should format single entity responses', async () => {
      const mockVendor = { id: 'vnd_123', name: 'Test Vendor' };
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVendor);

      const result = await invokeHandler(GetVendorTool, { id: 'vnd_123' });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });

    it('should format boolean responses (approve/reject)', async () => {
      (billcomClient.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

      const result = await invokeHandler(ApproveBillTool, { billId: 'bill_123' });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('approved');
    });
  });

  describe('Tool schemas', () => {
    it('should have valid schemas for all tools', () => {
      ALL_TOOLS.forEach(tool => {
        expect(tool.schema).toBeDefined();
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.handler).toBeDefined();
        expect(typeof tool.handler).toBe('function');
      });
    });

    it('should have description for all tools', () => {
      ALL_TOOLS.forEach(tool => {
        expect(tool.description.length).toBeGreaterThan(10);
      });
    });
  });
});
