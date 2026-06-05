import z from "zod";

export const createStrategySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  riskPercent: z.number().positive().max(100),
});

export const updateStrategySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  riskPercent: z.number().positive().max(100).optional(),
  isActive: z.boolean().optional(),
});
