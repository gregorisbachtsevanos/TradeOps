export interface TradingViewWebhookPayload {
  passphrase: string;
  time: string | number;
  ticker: string;
  close: number;
  strategy_signal: "BUY" | "SELL" | "CLOSE";
  account_id?: string;
  strategy_id?: string;
  quantity?: number;
}
