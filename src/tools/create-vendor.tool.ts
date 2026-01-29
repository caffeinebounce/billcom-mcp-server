import { createVendor } from "../handlers/create-vendor.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_vendor";
const toolDescription = "Create a new vendor in Bill.com.";

const toolSchema = z.object({
  name: z.string().describe("The vendor name (required)"),
  shortName: z.string().optional().describe("Short name for the vendor"),
  nameOnCheck: z.string().optional().describe("Name to print on checks"),
  companyName: z.string().optional().describe("Company name"),
  accNumber: z.string().optional().describe("Account number"),
  taxId: z.string().optional().describe("Tax ID (SSN or EIN)"),
  track1099: z.enum(['0', '1']).optional().describe("Track for 1099: '0' = no, '1' = yes"),
  address1: z.string().optional().describe("Address line 1"),
  address2: z.string().optional().describe("Address line 2"),
  address3: z.string().optional().describe("Address line 3"),
  address4: z.string().optional().describe("Address line 4"),
  addressCity: z.string().optional().describe("City"),
  addressState: z.string().optional().describe("State (2-letter code)"),
  addressZip: z.string().optional().describe("ZIP code"),
  addressCountry: z.string().optional().describe("Country"),
  email: z.string().optional().describe("Email address"),
  phone: z.string().optional().describe("Phone number"),
  fax: z.string().optional().describe("Fax number"),
  payBy: z.enum(['0', '1', '2']).optional().describe("Payment method: '0' = check, '1' = ACH, '2' = other"),
  description: z.string().optional().describe("Description or notes"),
  contactFirstName: z.string().optional().describe("Contact first name"),
  contactLastName: z.string().optional().describe("Contact last name"),
});

export const CreateVendorTool: ToolDefinition<typeof toolSchema> = {
  name: toolName,
  description: toolDescription,
  schema: toolSchema,
  handler: async (args) => {
    const params = (args.params ?? {}) as z.infer<typeof toolSchema>;
    const response = await createVendor(params);

    if (response.isError) {
      return {
        content: [{
          type: "text" as const,
          text: `Error creating vendor: ${response.error}`,
        }],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully created vendor:`,
        },
        {
          type: "text" as const,
          text: JSON.stringify(response.result, null, 2),
        },
      ],
    };
  },
};
