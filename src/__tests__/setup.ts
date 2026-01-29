/**
 * Test setup file for Bill.com MCP Server tests
 * Configures global mocks and test utilities
 */
import { vi, beforeEach, afterEach } from 'vitest';

// Set up environment variables for tests
process.env.BILLCOM_USERNAME = 'test-user';
process.env.BILLCOM_PASSWORD = 'test-password';
process.env.BILLCOM_ORG_ID = 'test-org-id';
process.env.BILLCOM_DEV_KEY = 'test-dev-key';
process.env.BILLCOM_ENVIRONMENT = 'sandbox';
process.env.BILLCOM_SPEND_API_TOKEN = 'test-spend-api-token';

// Store original fetch
const originalFetch = global.fetch;

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Restore fetch after each test
afterEach(() => {
  global.fetch = originalFetch;
});

/**
 * Helper to create a mock fetch response for v2 API (Bill.com AP API)
 */
export function mockV2Response<T>(data: T, status = 0, message = 'Success') {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      response_status: status,
      response_message: message,
      response_data: data,
    }),
    text: async () => JSON.stringify({
      response_status: status,
      response_message: message,
      response_data: data,
    }),
  };
}

/**
 * Helper to create a mock fetch error response for v2 API
 */
export function mockV2Error(message: string, status = 1) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      response_status: status,
      response_message: message,
      response_data: null,
    }),
    text: async () => JSON.stringify({
      response_status: status,
      response_message: message,
      response_data: null,
    }),
  };
}

/**
 * Helper to create a mock fetch response for v3 API (Spend API)
 */
export function mockV3Response<T>(data: T) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data }),
    text: async () => JSON.stringify({ data }),
  };
}

/**
 * Helper to create a mock fetch list response for v3 API
 */
export function mockV3ListResponse<T>(items: T[]) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ items }),
    text: async () => JSON.stringify({ items }),
  };
}

/**
 * Helper to create a mock fetch error response for v3 API
 */
export function mockV3Error(message: string, code = 'ERROR', statusCode = 400) {
  return {
    ok: false,
    status: statusCode,
    json: async () => ({
      error: { code, message },
    }),
    text: async () => JSON.stringify({
      error: { code, message },
    }),
  };
}

/**
 * Helper to create a network error
 */
export function mockNetworkError(message = 'Network error') {
  return () => {
    throw new Error(message);
  };
}

/**
 * Helper to create a mock HTTP error
 */
export function mockHttpError(status: number, message: string) {
  return {
    ok: false,
    status,
    json: async () => { throw new Error('Not JSON'); },
    text: async () => message,
  };
}

// Fixture factories

/**
 * Create a mock vendor object
 */
export function createMockVendor(overrides: Partial<{
  id: string;
  name: string;
  isActive: string;
}> = {}) {
  return {
    id: 'vnd_123456',
    isActive: '1',
    name: 'Test Vendor',
    shortName: 'TestV',
    companyName: 'Test Vendor Inc',
    email: 'vendor@test.com',
    phone: '555-1234',
    address1: '123 Test St',
    addressCity: 'Test City',
    addressState: 'CA',
    addressZip: '90210',
    addressCountry: 'USA',
    track1099: '0',
    createdTime: '2024-01-01T00:00:00Z',
    updatedTime: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create a mock bill object
 */
export function createMockBill(overrides: Partial<{
  id: string;
  vendorId: string;
  amount: string;
}> = {}) {
  return {
    id: 'bill_123456',
    isActive: '1',
    vendorId: 'vnd_123456',
    invoiceNumber: 'INV-001',
    invoiceDate: '2024-01-01',
    dueDate: '2024-02-01',
    amount: '1000.00',
    amountDue: '1000.00',
    paymentStatus: '1',
    description: 'Test bill',
    createdTime: '2024-01-01T00:00:00Z',
    updatedTime: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create a mock bill payment object
 */
export function createMockBillPayment(overrides: Partial<{
  id: string;
  vendorId: string;
  amount: string;
}> = {}) {
  return {
    id: 'pmt_123456',
    isActive: '1',
    vendorId: 'vnd_123456',
    amount: '500.00',
    paymentType: 'Check',
    status: '1',
    toPrintCheck: '0',
    processDate: '2024-01-15',
    description: 'Test payment',
    createdTime: '2024-01-01T00:00:00Z',
    updatedTime: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create a mock vendor credit object
 */
export function createMockVendorCredit(overrides: Partial<{
  id: string;
  vendorId: string;
  amount: string;
}> = {}) {
  return {
    id: 'vcr_123456',
    isActive: '1',
    vendorId: 'vnd_123456',
    creditDate: '2024-01-01',
    amount: '100.00',
    appliedAmount: '0.00',
    creditNumber: 'CR-001',
    description: 'Test credit',
    createdTime: '2024-01-01T00:00:00Z',
    updatedTime: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create a mock recurring bill object
 */
export function createMockRecurringBill(overrides: Partial<{
  id: string;
  vendorId: string;
  amount: string;
}> = {}) {
  return {
    id: 'rcb_123456',
    isActive: '1',
    vendorId: 'vnd_123456',
    timePeriod: 'Monthly',
    frequencyPerTimePeriod: '1',
    nextDueDate: '2024-02-01',
    daysInAdvance: '7',
    amount: '500.00',
    description: 'Monthly subscription',
    createdTime: '2024-01-01T00:00:00Z',
    updatedTime: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create a mock approval object
 */
export function createMockApproval(overrides: Partial<{
  id: string;
  objectId: string;
  status: string;
}> = {}) {
  return {
    id: 'apr_123456',
    objectId: 'bill_123456',
    objectType: 'Bill',
    status: '1',
    approverUserId: 'usr_123456',
    createdTime: '2024-01-01T00:00:00Z',
    updatedTime: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create a mock approval policy object
 */
export function createMockApprovalPolicy(overrides: Partial<{
  id: string;
  name: string;
}> = {}) {
  return {
    id: 'pol_123456',
    isActive: '1',
    name: 'Default Policy',
    description: 'Default approval policy',
    approvalType: 'Bill',
    createdTime: '2024-01-01T00:00:00Z',
    updatedTime: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create a mock budget object (v3)
 */
export function createMockBudget(overrides: Partial<{
  uuid: string;
  name: string;
  amount: string;
}> = {}) {
  return {
    uuid: 'bgt_123456',
    isActive: 'true',
    name: 'Marketing Budget',
    description: 'Q1 Marketing Budget',
    amount: '10000.00',
    spent: '2500.00',
    remaining: '7500.00',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    budgetType: 'expense',
    createdTime: '2024-01-01T00:00:00Z',
    updatedTime: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create a mock card object (v3)
 */
export function createMockCard(overrides: Partial<{
  uuid: string;
  lastFour: string;
  status: string;
}> = {}) {
  return {
    uuid: 'crd_123456',
    isActive: 'true',
    cardType: 'virtual',
    lastFour: '4242',
    status: 'active',
    cardholderName: 'Test User',
    userId: 'usr_123456',
    spendLimit: '5000.00',
    spendLimitPeriod: 'monthly',
    expirationDate: '2026-12',
    createdTime: '2024-01-01T00:00:00Z',
    updatedTime: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create a mock transaction object (v3)
 */
export function createMockTransaction(overrides: Partial<{
  uuid: string;
  cardId: string;
  amount: string;
}> = {}) {
  return {
    uuid: 'txn_123456',
    isActive: 'true',
    cardId: 'crd_123456',
    amount: '150.00',
    merchantName: 'Office Supplies Co',
    merchantCategory: 'Office Supplies',
    transactionDate: '2024-01-15',
    status: 'completed',
    receiptStatus: 'missing',
    description: 'Office supplies purchase',
    createdTime: '2024-01-15T00:00:00Z',
    updatedTime: '2024-01-15T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create a mock reimbursement object (v3)
 */
export function createMockReimbursement(overrides: Partial<{
  uuid: string;
  userId: string;
  amount: string;
}> = {}) {
  return {
    uuid: 'rmb_123456',
    isActive: 'true',
    userId: 'usr_123456',
    amount: '250.00',
    status: 'pending',
    submittedDate: '2024-01-10',
    description: 'Travel expenses',
    createdTime: '2024-01-10T00:00:00Z',
    updatedTime: '2024-01-10T00:00:00Z',
    ...overrides,
  };
}

// Export vi for convenience
export { vi };
