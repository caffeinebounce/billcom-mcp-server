import { updateRecurringBill } from "../handlers/update-recurring-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_recurring_bill";
const toolDescription = "Update an existing recurring bill in Bill.com.";

const lineItemSchema = z.object({
  amount: z.string(),
  chartOfAccountId: z.string().optional(),
  departmentId: z.string().optional(),
  locationId: z.string().optional(),
  description: z.string().optional(),
});

const toolSchema = z.object({
  id: z.string().describe("The recurring bill ID to update (required)"),
  timePeriod: z.enum(['0', '1', '2', '3', '4']).optional().describe(
    "Frequency period: '0' = None, '1' = Day, '2' = Week, '3' = Month, '4' = Year"
  ),
  frequencyPerTimePeriod: z.string().optional().describe("How often within the time period"),
  nextDueDate: z.string().optional().describe("Next due date (YYYY-MM-DD)"),
  endDate: z.string().optional().describe("End date for recurrence (YYYY-MM-DD)"),
  daysInAdvance: z.string().optional().describe("Days in advance to create the bill"),
  description: z.string().optional().describe("Description"),
  recurringBillLineItems: z.array(lineItemSchema).optional().describe("Updated line items"),
});

export const UpdateRecurringBillTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await updateRecurringBill(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error updating recurring bill: ${response.error}`,
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated recurring bill:`,
        },
        {
          type: "text" as const,
          text: JSON.stringify(response.result, null, 2),
        },
      ],
    };
  },
};
