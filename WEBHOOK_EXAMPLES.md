# TradingView Webhook Examples

This file contains example payloads that TradingView sends to the webhook endpoint.

## Pine Script Alert Configuration

Add this to your TradingView Pine Script strategy:

```pinescript
strategy("Example Strategy", overlay=true)

// ... your strategy logic ...

// Send alert when conditions are met
alertMessage = '{"passphrase": "your-secret-key", "time": "' + str.tostring(timenow) + '", "ticker": "' + syminfo.tickerid + '", "close": ' + str.tostring(close) + ', "strategy_signal": "BUY"}'
alert(alertMessage, alert.freq_once_per_bar_close)

// Alert webhook URL
// POST http://your-domain.com/webhook/tradingview?account_id=ACC123&strategy_id=STRAT123
// Message: {json}
```

## Example Payloads

### BUY Signal

```json
{
  "passphrase": "your-secret-key",
  "time": "2024-05-25T14:30:00.000Z",
  "ticker": "EURUSD",
  "close": 1.0850,
  "strategy_signal": "BUY",
  "account_id": "ACC123",
  "quantity": 1000
}
```

### SELL Signal

```json
{
  "passphrase": "your-secret-key",
  "time": "2024-05-25T15:45:00.000Z",
  "ticker": "EURUSD",
  "close": 1.0875,
  "strategy_signal": "SELL",
  "account_id": "ACC123",
  "quantity": 1000
}
```

### CLOSE Signal

```json
{
  "passphrase": "your-secret-key",
  "time": "2024-05-25T16:00:00.000Z",
  "ticker": "EURUSD",
  "close": 1.0865,
  "strategy_signal": "CLOSE",
  "account_id": "ACC123"
}
```

### Multiple Symbols

```json
[
  {
    "passphrase": "your-secret-key",
    "time": "2024-05-25T14:30:00.000Z",
    "ticker": "EURUSD",
    "close": 1.0850,
    "strategy_signal": "BUY"
  },
  {
    "passphrase": "your-secret-key",
    "time": "2024-05-25T14:31:00.000Z",
    "ticker": "GBPUSD",
    "close": 1.2750,
    "strategy_signal": "BUY"
  }
]
```

## Testing with cURL

```bash
# Test BUY signal
curl -X POST http://localhost:3000/webhook/tradingview?account_id=ACC123&strategy_id=STRAT123 \
  -H "Content-Type: application/json" \
  -d '{
    "passphrase": "your-secret-key",
    "time": "2024-05-25T14:30:00Z",
    "ticker": "EURUSD",
    "close": 1.0850,
    "strategy_signal": "BUY"
  }'

# Expected response
{
  "success": true,
  "data": {
    "signalId": "sig_abc123xyz"
  },
  "timestamp": "2024-05-25T14:30:01.000Z"
}
```

## Testing with Postman

1. Open Postman
2. Create new POST request
3. URL: `http://localhost:3000/webhook/tradingview?account_id=ACC123&strategy_id=STRAT123`
4. Headers:
   - `Content-Type: application/json`
5. Body (raw JSON):
   ```json
   {
     "passphrase": "your-secret-key",
     "time": "2024-05-25T14:30:00Z",
     "ticker": "EURUSD",
     "close": 1.0850,
     "strategy_signal": "BUY"
   }
   ```
6. Send request

## Troubleshooting

### 401 Unauthorized
- Check that passphrase matches `TRADING_VIEW_WEBHOOK_SECRET` environment variable
- Verify the exact string match (case-sensitive)

### 400 Bad Request
- Ensure JSON is valid
- Check all required fields are present
- Verify timestamp is ISO 8601 format

### 404 Not Found
- Check URL path is correct: `/webhook/tradingview`
- Verify query parameters are included

### 500 Internal Server Error
- Check backend logs
- Verify database is running
- Ensure account_id and strategy_id exist in database

## Security Notes

1. **Never commit real secrets** - Use environment variables
2. **Use HTTPS in production** - Webhooks should use encrypted connections
3. **Validate timestamps** - Check webhook time is reasonable (within seconds)
4. **Rate limit webhooks** - Prevent abuse with rate limiting
5. **Deduplication** - Platform automatically deduplicates signals within 5-minute window
