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
  op: 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge' | 'in' | 'nin' | 'sw' | 'ew' | 'ct';
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
