import z from "zod";

export const createAccountSchema = z.object({
  externalId: z.string(),
  balance: z.number().positive(),
  equity: z.number().positive(),
});
