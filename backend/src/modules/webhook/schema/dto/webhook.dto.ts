import z from "zod";

export const tradingViewWebhookSchema = z.object({
  passphrase: z.string(),
  time: z.preprocess((value) => {
    if (typeof value === "number") {
      return new Date(value).toISOString();
    }
    return value;
  }, z.string().datetime()),
  ticker: z.string(),
  close: z.preprocess((value) => Number(value), z.number().positive()),
  strategy_signal: z.preprocess(
    (value) => (typeof value === "string" ? value.toUpperCase() : value),
    z.enum(["BUY", "SELL", "CLOSE"]),
  ),
  account_id: z.string().optional(),
  strategy_id: z.string().optional(),
  quantity: z.preprocess(
    (value) => (value === undefined ? undefined : Number(value)),
    z.number().positive().optional(),
  ),
});
