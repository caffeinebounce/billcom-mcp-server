#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { BillcomMCPServer } from "./server/billcom-mcp-server.js";
import { RegisterTool } from "./helpers/register-tool.js";

// Vendor tools
import { SearchVendorsTool } from "./tools/search-vendors.tool.js";
import { GetVendorTool } from "./tools/get-vendor.tool.js";
import { CreateVendorTool } from "./tools/create-vendor.tool.js";
import { UpdateVendorTool } from "./tools/update-vendor.tool.js";
import { ArchiveVendorTool } from "./tools/archive-vendor.tool.js";

// Bill tools
import { SearchBillsTool } from "./tools/search-bills.tool.js";
import { GetBillTool } from "./tools/get-bill.tool.js";
import { CreateBillTool } from "./tools/create-bill.tool.js";
import { UpdateBillTool } from "./tools/update-bill.tool.js";
import { ArchiveBillTool } from "./tools/archive-bill.tool.js";

// Bill Payment tools
import { SearchBillPaymentsTool } from "./tools/search-bill-payments.tool.js";
import { GetBillPaymentTool } from "./tools/get-bill-payment.tool.js";
import { CreateBillPaymentTool } from "./tools/create-bill-payment.tool.js";
import { VoidBillPaymentTool } from "./tools/void-bill-payment.tool.js";

// Vendor Credit tools
import { SearchVendorCreditsTool } from "./tools/search-vendor-credits.tool.js";
import { GetVendorCreditTool } from "./tools/get-vendor-credit.tool.js";
import { CreateVendorCreditTool } from "./tools/create-vendor-credit.tool.js";
import { UpdateVendorCreditTool } from "./tools/update-vendor-credit.tool.js";
import { ArchiveVendorCreditTool } from "./tools/archive-vendor-credit.tool.js";

// Recurring Bill tools
import { SearchRecurringBillsTool } from "./tools/search-recurring-bills.tool.js";
import { GetRecurringBillTool } from "./tools/get-recurring-bill.tool.js";
import { CreateRecurringBillTool } from "./tools/create-recurring-bill.tool.js";
import { UpdateRecurringBillTool } from "./tools/update-recurring-bill.tool.js";
import { ArchiveRecurringBillTool } from "./tools/archive-recurring-bill.tool.js";

// Approval tools
import { GetApprovalPoliciesTool } from "./tools/get-approval-policies.tool.js";
import { GetPendingApprovalsTool } from "./tools/get-pending-approvals.tool.js";
import { ApproveBillTool } from "./tools/approve-bill.tool.js";
import { RejectBillTool } from "./tools/reject-bill.tool.js";
import { GetApprovalHistoryTool } from "./tools/get-approval-history.tool.js";

// Budget tools
import { SearchBudgetsTool } from "./tools/search-budgets.tool.js";
import { GetBudgetTool } from "./tools/get-budget.tool.js";
import { CreateBudgetTool } from "./tools/create-budget.tool.js";
import { UpdateBudgetTool } from "./tools/update-budget.tool.js";

// Card tools
import { SearchCardsTool } from "./tools/search-cards.tool.js";
import { GetCardTool } from "./tools/get-card.tool.js";
import { CreateVirtualCardTool } from "./tools/create-virtual-card.tool.js";
import { FreezeCardTool } from "./tools/freeze-card.tool.js";
import { UnfreezeCardTool } from "./tools/unfreeze-card.tool.js";

// Transaction tools
import { SearchTransactionsTool } from "./tools/search-transactions.tool.js";
import { GetTransactionTool } from "./tools/get-transaction.tool.js";
import { UpdateTransactionTool } from "./tools/update-transaction.tool.js";

// Reimbursement tools
import { SearchReimbursementsTool } from "./tools/search-reimbursements.tool.js";
import { GetReimbursementTool } from "./tools/get-reimbursement.tool.js";
import { CreateReimbursementTool } from "./tools/create-reimbursement.tool.js";
import { ApproveReimbursementTool } from "./tools/approve-reimbursement.tool.js";

const main = async () => {
  const server = BillcomMCPServer.GetServer();

  // Register Vendor tools
  RegisterTool(server, SearchVendorsTool);
  RegisterTool(server, GetVendorTool);
  RegisterTool(server, CreateVendorTool);
  RegisterTool(server, UpdateVendorTool);
  RegisterTool(server, ArchiveVendorTool);

  // Register Bill tools
  RegisterTool(server, SearchBillsTool);
  RegisterTool(server, GetBillTool);
  RegisterTool(server, CreateBillTool);
  RegisterTool(server, UpdateBillTool);
  RegisterTool(server, ArchiveBillTool);

  // Register Bill Payment tools
  RegisterTool(server, SearchBillPaymentsTool);
  RegisterTool(server, GetBillPaymentTool);
  RegisterTool(server, CreateBillPaymentTool);
  RegisterTool(server, VoidBillPaymentTool);

  // Register Vendor Credit tools
  RegisterTool(server, SearchVendorCreditsTool);
  RegisterTool(server, GetVendorCreditTool);
  RegisterTool(server, CreateVendorCreditTool);
  RegisterTool(server, UpdateVendorCreditTool);
  RegisterTool(server, ArchiveVendorCreditTool);

  // Register Recurring Bill tools
  RegisterTool(server, SearchRecurringBillsTool);
  RegisterTool(server, GetRecurringBillTool);
  RegisterTool(server, CreateRecurringBillTool);
  RegisterTool(server, UpdateRecurringBillTool);
  RegisterTool(server, ArchiveRecurringBillTool);

  // Register Approval tools
  RegisterTool(server, GetApprovalPoliciesTool);
  RegisterTool(server, GetPendingApprovalsTool);
  RegisterTool(server, ApproveBillTool);
  RegisterTool(server, RejectBillTool);
  RegisterTool(server, GetApprovalHistoryTool);

  // Register Budget tools
  RegisterTool(server, SearchBudgetsTool);
  RegisterTool(server, GetBudgetTool);
  RegisterTool(server, CreateBudgetTool);
  RegisterTool(server, UpdateBudgetTool);

  // Register Card tools
  RegisterTool(server, SearchCardsTool);
  RegisterTool(server, GetCardTool);
  RegisterTool(server, CreateVirtualCardTool);
  RegisterTool(server, FreezeCardTool);
  RegisterTool(server, UnfreezeCardTool);

  // Register Transaction tools
  RegisterTool(server, SearchTransactionsTool);
  RegisterTool(server, GetTransactionTool);
  RegisterTool(server, UpdateTransactionTool);

  // Register Reimbursement tools
  RegisterTool(server, SearchReimbursementsTool);
  RegisterTool(server, GetReimbursementTool);
  RegisterTool(server, CreateReimbursementTool);
  RegisterTool(server, ApproveReimbursementTool);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
