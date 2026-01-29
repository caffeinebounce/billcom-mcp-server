# Bill.com MCP Server

MCP server implementation for Bill.com API integration, providing accounts payable and spend management functionality.

## Features

### Core AP (v2 API)
- **Vendors**: Search, get, create, update, archive
- **Bills**: Search, get, create, update, archive
- **Bill Payments**: Search, get, create, void
- **Vendor Credits**: Search, get, create, update, archive
- **Recurring Bills**: Search, get, create, update, archive
- **Approvals**: Get policies, pending approvals, approve/reject bills, history

### Spend & Expense (v3 API)
- **Budgets**: Search, get, create, update
- **Cards**: Search, get, create virtual, freeze, unfreeze
- **Transactions**: Search, get, update
- **Reimbursements**: Search, get, create, approve

## API Architecture

This server uses **two different Bill.com APIs**:

### v2 AP API
- **Base URLs**: 
  - Production: `https://api.bill.com/api/v2`
  - Sandbox: `https://api-sandbox.bill.com/api/v2`
- **Authentication**: Session-based (username/password/devKey)
- **Entities**: Vendors, Bills, Bill Payments, Vendor Credits, Recurring Bills, Approvals

### v3 Spend & Expense API
- **Base URLs**:
  - Production: `https://gateway.bill.com/connect/v3/spend`
  - Sandbox: `https://gateway.stage.bill.com/connect/v3/spend`
- **Authentication**: Token-based (`apiToken` header)
- **Entities**: Budgets, Cards, Transactions, Reimbursements

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Build:

```bash
npm run build
```

## Configuration

Add to your Claude Code MCP configuration:

```json
{
  "billcom": {
    "command": "node",
    "args": ["/path/to/billcom-mcp-server/dist/index.js"],
    "env": {
      "BILLCOM_USERNAME": "your-email@example.com",
      "BILLCOM_PASSWORD": "your-password",
      "BILLCOM_ORG_ID": "your-org-id",
      "BILLCOM_DEV_KEY": "your-dev-key",
      "BILLCOM_SPEND_API_TOKEN": "your-spend-api-token",
      "BILLCOM_ENVIRONMENT": "production"
    }
  }
}
```

## Environment Variables

| Variable | Description | Required | Used By |
|----------|-------------|----------|---------|
| `BILLCOM_USERNAME` | Bill.com login email | Yes (for AP) | v2 API |
| `BILLCOM_PASSWORD` | Bill.com password | Yes (for AP) | v2 API |
| `BILLCOM_ORG_ID` | Organization ID | Yes (for AP) | v2 API |
| `BILLCOM_DEV_KEY` | Developer API key | Yes (for AP) | v2 API |
| `BILLCOM_SPEND_API_TOKEN` | Spend & Expense API token | Yes (for Spend) | v3 API |
| `BILLCOM_ENVIRONMENT` | `sandbox` or `production` | No (defaults to sandbox) | Both APIs |

**Note**: You can use just the v2 credentials if you only need AP features, or just the v3 token if you only need Spend & Expense features.

## Available Tools

### Vendors (v2 API)
- `search_vendors` - Search vendors with filters
- `get_vendor` - Get vendor by ID
- `create_vendor` - Create new vendor
- `update_vendor` - Update vendor
- `archive_vendor` - Archive (deactivate) vendor

### Bills (v2 API)
- `search_bills` - Search bills with filters
- `get_bill` - Get bill by ID
- `create_bill` - Create new bill
- `update_bill` - Update bill
- `archive_bill` - Archive bill

### Bill Payments (v2 API)
- `search_bill_payments` - Search payments
- `get_bill_payment` - Get payment by ID
- `create_bill_payment` - Create payment for bills
- `void_bill_payment` - Void unprocessed payment

### Vendor Credits (v2 API)
- `search_vendor_credits` - Search credits
- `get_vendor_credit` - Get credit by ID
- `create_vendor_credit` - Create credit
- `update_vendor_credit` - Update credit
- `archive_vendor_credit` - Archive credit

### Recurring Bills (v2 API)
- `search_recurring_bills` - Search recurring bills
- `get_recurring_bill` - Get recurring bill by ID
- `create_recurring_bill` - Create recurring bill
- `update_recurring_bill` - Update recurring bill
- `archive_recurring_bill` - Archive recurring bill

### Approvals (v2 API)
- `get_approval_policies` - Get all approval policies
- `get_pending_approvals` - Get items pending your approval
- `approve_bill` - Approve a pending bill
- `reject_bill` - Reject a pending bill
- `get_approval_history` - Get approval history for an object

### Budgets (v3 API)
- `search_budgets` - Search budgets
- `get_budget` - Get budget by UUID
- `create_budget` - Create new budget
- `update_budget` - Update budget

### Cards (v3 API)
- `search_cards` - Search cards
- `get_card` - Get card by UUID
- `create_virtual_card` - Create virtual card
- `freeze_card` - Freeze a card
- `unfreeze_card` - Unfreeze a card

### Transactions (v3 API)
- `search_transactions` - Search card transactions
- `get_transaction` - Get transaction by UUID
- `update_transaction` - Update transaction (categorize, add memo)

### Reimbursements (v3 API)
- `search_reimbursements` - Search reimbursement requests
- `get_reimbursement` - Get reimbursement by UUID
- `create_reimbursement` - Create reimbursement request
- `approve_reimbursement` - Approve reimbursement

## Filter Operators (v2 API)

v2 API search tools support these filter operators:

| Operator | Description |
|----------|-------------|
| `eq` | Equals |
| `ne` | Not equals |
| `lt` | Less than |
| `le` | Less than or equal |
| `gt` | Greater than |
| `ge` | Greater than or equal |
| `in` | In list |
| `nin` | Not in list |
| `sw` | Starts with |
| `ew` | Ends with |
| `ct` | Contains |

## Example Usage

### Search for active vendors (v2 API)
```json
{
  "filters": [
    { "field": "isActive", "op": "eq", "value": "1" }
  ]
}
```

### Search bills by vendor (v2 API)
```json
{
  "filters": [
    { "field": "vendorId", "op": "eq", "value": "00000ABC123" }
  ],
  "sort": [
    { "field": "dueDate", "asc": true }
  ]
}
```

### Search cards (v3 API)
```json
{
  "cardType": "virtual",
  "status": "active",
  "limit": 10
}
```

### Search transactions by date range (v3 API)
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "limit": 50
}
```

## Authentication

### v2 AP API
- Uses session-based authentication
- Sessions are automatically managed
- Sessions expire after 35 minutes of inactivity
- The client automatically refreshes sessions before expiry

### v3 Spend & Expense API
- Uses token-based authentication via `apiToken` header
- No session management required
- Token should be obtained from Bill.com Spend & Expense portal

## Troubleshooting

### "BILLCOM_USERNAME, BILLCOM_PASSWORD, BILLCOM_ORG_ID, and BILLCOM_DEV_KEY must be set"
You're trying to use v2 AP API features without the required credentials. Set all four environment variables.

### "BILLCOM_SPEND_API_TOKEN must be set in environment variables for Spend & Expense API access"
You're trying to use v3 Spend & Expense features without the API token. Set `BILLCOM_SPEND_API_TOKEN`.

### "Spend API error: 401"
Your Spend API token is invalid or expired. Generate a new token from the Bill.com Spend & Expense portal.

## License

MIT
