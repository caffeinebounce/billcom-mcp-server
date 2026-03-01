/**
 * Bill.com API Entity Types
 * Based on Bill.com Connect API v3
 */

// Common response wrapper
export interface BillcomResponse<T> {
  response_status: number;
  response_message: string;
  response_data: T;
}

// Vendor entity
export interface Vendor {
  id: string;
  isActive: string;
  name: string;
  shortName?: string;
  nameOnCheck?: string;
  companyName?: string;
  accNumber?: string;
  taxId?: string;
  track1099: string;
  address1?: string;
  address2?: string;
  address3?: string;
  address4?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  addressCountry?: string;
  email?: string;
  phone?: string;
  fax?: string;
  payBy?: string;
  description?: string;
  contactFirstName?: string;
  contactLastName?: string;
  createdTime: string;
  updatedTime: string;
}

// Bill entity
export interface Bill {
  id: string;
  isActive: string;
  vendorId: string;
  invoiceNumber?: string;
  invoiceDate: string;
  dueDate: string;
  glPostingDate?: string;
  amount: string;
  amountDue: string;
  paymentStatus: string;
  approvalStatus?: string;  // 0=Unassigned, 1=Pending, 2=Approving, 3=Approved, 4=Denied
  description?: string;
  poNumber?: string;
  createdTime: string;
  updatedTime: string;
  billLineItems?: BillLineItem[];
}

export interface BillLineItem {
  id: string;
  billId: string;
  amount: string;
  chartOfAccountId?: string;
  departmentId?: string;
  locationId?: string;
  jobId?: string;
  customerId?: string;
  jobBillable?: string;
  description?: string;
  lineType?: string;
  itemId?: string;
  quantity?: string;
  unitPrice?: string;
  employeeId?: string;
}


// Document entity
export interface Document {
  id: string;
  isActive?: string;
  name?: string;
  fileName?: string;
  contentType?: string;
  size?: string;
  folderId?: string;
  description?: string;
  createdTime?: string;
  updatedTime?: string;
}

// Bill Payment entity
export interface BillPayment {
  id: string;
  isActive: string;
  vendorId: string;
  amount: string;
  paymentType: string;
  status: string;
  toPrintCheck: string;
  processDate?: string;
  description?: string;
  chartOfAccountId?: string;
  createdTime: string;
  updatedTime: string;
}

// Vendor Credit entity
export interface VendorCredit {
  id: string;
  isActive: string;
  vendorId: string;
  creditDate: string;
  amount: string;
  appliedAmount: string;
  creditNumber?: string;
  description?: string;
  createdTime: string;
  updatedTime: string;
}

// Recurring Bill entity
export interface RecurringBill {
  id: string;
  isActive: string;
  vendorId: string;
  timePeriod: string;
  frequencyPerTimePeriod: string;
  nextDueDate: string;
  endDate?: string;
  daysInAdvance: string;
  amount: string;
  description?: string;
  createdTime: string;
  updatedTime: string;
}

// Approval entity
export interface Approval {
  id: string;
  objectId: string;
  objectType: string;
  status: string;
  approverUserId?: string;
  approvedTime?: string;
  createdTime: string;
  updatedTime: string;
}

// Search/List parameters
export interface SearchParams {
  start?: number;
  max?: number;
  filters?: SearchFilter[];
  sort?: SortOption[];
}

export interface SearchFilter {
  field: string;
  // Bill.com uses symbolic operators: =, <, >, <=, >=, !=, in, nin, sw
  op: '=' | '<' | '>' | '<=' | '>=' | '!=' | 'in' | 'nin' | 'sw' | 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge' | 'ew' | 'ct';
  value: string | string[];
}

export interface SortOption {
  field: string;
  asc: boolean;
}

// Session/Auth types
export interface SessionInfo {
  sessionId: string;
  orgId: string;
  userId: string;
  devKey: string;
  expiresAt: Date;
}

// =============================================================================
// V3 API Types (Bill Approvals)
// =============================================================================

/**
 * V3 Approval Policy - Full approval workflow configuration
 */
export interface V3ApprovalPolicy {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  approvalType: 'Bill' | 'VendorCredit' | 'Payment';
  rules: V3ApprovalRule[];
  createdTime: string;
  updatedTime: string;
}

export interface V3ApprovalRule {
  id: string;
  name: string;
  condition?: {
    field: string;
    operator: string;
    value: string | number;
  };
  approvers: V3Approver[];
  sequence: number;
}

export interface V3Approver {
  userId: string;
  userName?: string;
  email?: string;
  role?: string;
}

/**
 * V3 Pending User Approval - Bill awaiting user's approval action
 */
export interface V3PendingUserApproval {
  id: string;
  billId: string;
  vendorId: string;
  vendorName?: string;
  invoiceNumber?: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  currency?: string;
  description?: string;
  approvalPolicyId: string;
  approvalPolicyName?: string;
  currentApprovalStep: number;
  totalApprovalSteps: number;
  submittedBy?: string;
  submittedTime: string;
  approvalStatus: 'pending' | 'approved' | 'denied';
}

/**
 * V3 Approval Action - Approve or deny a bill
 */
export interface V3ApprovalAction {
  billId: string;
  action: 'approve' | 'deny';
  comment?: string;
}

export interface V3ApprovalActionResult {
  billId: string;
  action: 'approve' | 'deny';
  success: boolean;
  newStatus?: string;
  message?: string;
}

/**
 * V3 Approval History Entry
 */
export interface V3ApprovalHistoryEntry {
  id: string;
  billId: string;
  action: 'approve' | 'deny' | 'submit' | 'recall';
  userId: string;
  userName?: string;
  comment?: string;
  timestamp: string;
  approvalStep: number;
}
