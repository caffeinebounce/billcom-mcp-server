import { createRecurringBill } from "../handlers/create-recurring-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_recurring_bill";
const toolDescription = "Create a new recurring bill in Bill.com.";

const lineItemSchema = z.object({
  amount: z.string().describe("Line item amount"),
  chartOfAccountId: z.string().optional().describe("Chart of account ID"),
  departmentId: z.string().optional().describe("Department ID"),
  locationId: z.string().optional().describe("Location ID"),
  description: z.string().optional().describe("Line item description"),
});

const toolSchema = z.object({
  vendorId: z.string().describe("The vendor ID (required)"),
  timePeriod: z.enum(['0', '1', '2', '3', '4']).describe(
    "Frequency period: '0' = None, '1' = Day, '2' = Week, '3' = Month, '4' = Year"
  ),
  frequencyPerTimePeriod: z.string().describe("How often within the time period (e.g., '1' for monthly)"),
  nextDueDate: z.string().describe("Next due date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("End date for recurrence (YYYY-MM-DD)"),
  daysInAdvance: z.string().optional().describe("Days in advance to create the bill"),
  description: z.string().optional().describe("Description"),
  recurringBillLineItems: z.array(lineItemSchema).optional().describe("Line items"),
});

export const CreateRecurringBillTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await createRecurringBill(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error creating recurring bill: ${response.error}`,
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully created recurring bill:`,
        },
        {
          type: "text" as const,
          text: JSON.stringify(response.result, null, 2),
        },
      ],
    };
  },
};
