# Trade Flow Documentation

This document illustrates the complete flow from receiving a TradingView webhook signal to executing a trade.

## Trade Flow Diagram

```
┌─────────────────┐
│  TradingView    │
│  Pine Script    │
│  Strategy Alert │
└────────┬────────┘
         │
         │ Sends POST request with signal
         ▼
┌─────────────────────────────┐
│ Webhook Receiver            │
│ /webhook/tradingview        │
│ - Validate secret           │
│ - Validate content-type     │
│ - Parse JSON                │
└────────┬────────────────────┘
         │
         │ Valid?
         ├─ No ─► Return 401/400 Error
         │
         │ Yes
         ▼
┌─────────────────────────────┐
│ Signal Validation Layer     │
│ - Verify account exists     │
│ - Verify account is active  │
│ - Verify strategy exists    │
│ - Verify strategy is active │
└────────┬────────────────────┘
         │
         │ Valid?
         ├─ No ─► Mark as rejected ──► Return 200 (silent fail)
         │
         │ Yes
         ▼
┌─────────────────────────────┐
│ Deduplication Check         │
│ - Check last 5 min signals  │
│ - Same symbol + action?     │
└────────┬────────────────────┘
         │
         │ Duplicate?
         ├─ Yes ─► Store as isDuplicate:true ──► Return 200
         │
         │ No
         ▼
┌─────────────────────────────┐
│ Store Signal in Database    │
│ - Create signal record      │
│ - Set isDuplicate: false    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Trade Engine Processing     │
│ - Evaluate action (BUY/SELL)│
│ - Handle CLOSE action       │
└────────┬────────────────────┘
         │
         │ Action == CLOSE?
         ├─ Yes ─┐
         │       ▼
         │   ┌─────────────────────┐
         │   │ Close Position      │
         │   │ - Find open trade   │
         │   │ - Close via MT5     │
         │   │ - Update PnL        │
         │   └─────────────────────┘
         │
         │ No
         ▼
┌─────────────────────────────┐
│ Position Sizing             │
│ Formula:                    │
│ size = (balance × risk%)    │
│        / price_risk         │
│                             │
│ Example:                    │
│ size = (100k × 2%) / 0.5   │
│      = 4,000 units          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Risk Management Check       │
│ - Daily loss limit OK?      │
│ - Max open trades OK?       │
│ - Exposure limit OK?        │
└────────┬────────────────────┘
         │
         │ All checks pass?
         ├─ No ─► Mark trade REJECTED ──────────► End
         │
         │ Yes
         ▼
┌─────────────────────────────┐
│ Execute Trade on MT5        │
│ - Call executeTrade()       │
│ - Send: symbol, direction   │
│         price, quantity,    │
│         stopLoss, takeProfit│
│ - MT5 returns: tradeId      │
└────────┬────────────────────┘
         │
         │ Execution success?
         ├─ No ──► Mark REJECTED ───────────────► End
         │
         │ Yes
         ▼
┌─────────────────────────────┐
│ Record Trade in Database    │
│ - Create trade record       │
│ - Status: OPEN              │
│ - Store external trade ID   │
│ - Link to signal            │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Update Risk State           │
│ - Increment openTrades      │
│ - Update exposure           │
│ - Check daily limits        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Log All Decisions           │
│ - Info level: success       │
│ - Warn level: rejections    │
│ - Error level: exceptions   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Return Success Response     │
│ {                           │
│   "success": true,          │
│   "data": {                 │
│     "signalId": "sig_xyz"   │
│   },                        │
│   "timestamp": "2024..."    │
│ }                           │
└─────────────────────────────┘
```

## Detailed Step-by-Step Example

### Step 1: TradingView Sends Webhook

**Time: 14:30:00 UTC**

TradingView strategy fires and sends alert via webhook:

```json
POST /webhook/tradingview?account_id=ACC123&strategy_id=STRAT123
Content-Type: application/json

{
  "passphrase": "super-secret-key-123",
  "time": "2024-05-25T14:30:00Z",
  "ticker": "EURUSD",
  "close": 1.0850,
  "strategy_signal": "BUY"
}
```

### Step 2: Webhook Validation

**Backend receives request**

```typescript
// Middleware validates:
1. Content-Type: application/json ✓
2. Body is valid JSON ✓
3. Passphrase matches TRADING_VIEW_WEBHOOK_SECRET ✓

// Schema validation:
{
  passphrase: string ✓
  time: ISO 8601 datetime ✓
  ticker: string ✓
  close: positive number ✓
  strategy_signal: 'BUY' | 'SELL' | 'CLOSE' ✓
}
```

All checks pass → Continue to processing

### Step 3: Signal Validation

```typescript
// Check account exists
SELECT * FROM accounts WHERE id = 'ACC123'
Result: Found - MT5_123456 | Balance: $100,000

// Check account is active
account.isActive = true ✓

// Check strategy exists
SELECT * FROM strategies WHERE id = 'STRAT123'
Result: Found - "Buy & Hold" | Risk: 2%

// Check strategy is active
strategy.isActive = true ✓
```

All validations pass → Continue to deduplication

### Step 4: Deduplication Check

```typescript
// Check for signals in last 5 minutes
SELECT * FROM signals
WHERE accountId = 'ACC123'
  AND strategyId = 'STRAT123'
  AND symbol = 'EURUSD'
  AND action = 'BUY'
  AND timestamp > NOW() - INTERVAL 5 minutes

Result: No duplicate found ✓

// Proceed with new signal
```

### Step 5: Store Signal

```typescript
// Create signal record in database
INSERT INTO signals (
  accountId,
  strategyId,
  symbol,
  action,
  price,
  timestamp,
  rawPayload,
  isDuplicate
) VALUES (
  'ACC123',
  'STRAT123',
  'EURUSD',
  'BUY',
  1.0850,
  '2024-05-25T14:30:00Z',
  {...full payload...},
  false
)

Result: Signal created with ID: sig_abc123
```

### Step 6: Trade Engine Processing

```typescript
// Determine action
action = 'BUY' → Execute long trade

// Get account and strategy info
account = {
  id: 'ACC123',
  balance: 100000,
  equity: 102500,
  exposure: 30000, // Current exposure
  isActive: true
}

strategy = {
  riskPercent: 2,
  isActive: true
}

// Calculate position size
stopLoss = 1.0850 * 0.98 = 1.0633
priceRisk = 1.0850 - 1.0633 = 0.0217
riskAmount = 100000 * (2/100) = 2000
positionSize = 2000 / 0.0217 = 92,156 units

// Use reasonable size
actualSize = min(92156, 100) = 100 units
proposedExposure = 100 * 1.0850 = 108.50
```

### Step 7: Risk Management Check

```typescript
// Check 1: Daily loss limit
SELECT dailyPnL FROM risk_states
WHERE accountId = 'ACC123'
  AND date = TODAY()
LIMIT 1

Result: dailyPnL = $1500 (profit)
MaxAllowedLoss = 100000 * (5/100) = $5000
Check: 1500 > -5000 ✓ PASS

// Check 2: Max open trades
SELECT COUNT(*) FROM risk_states
WHERE accountId = 'ACC123'
  AND date = TODAY()

Result: openTrades = 3
MaxAllowed = 10
Check: 3 < 10 ✓ PASS

// Check 3: Exposure limit
currentExposure = 30000
proposedExposure = 108.50
totalExposure = 30,108.50
maxExposure = 100000 * 0.5 = $50,000
Check: 30,108.50 < 50,000 ✓ PASS

Result: All risk checks passed ✓
```

### Step 8: Trade Execution

```typescript
// Call MT5 connector
const result = await mt5ConnectorService.executeTrade(
  symbol: 'EURUSD',
  direction: 'BUY',
  price: 1.0850,
  quantity: 100,
  stopLoss: 1.0633,
  takeProfit: 1.1200
)

// MT5 response
{
  success: true,
  tradeId: 'trade_xyz789',
  externalTradeId: 'MT5_1716640200_abc12345',
  details: {
    executionPrice: 1.0850,
    timestamp: '2024-05-25T14:30:00.100Z',
    stopLoss: 1.0633,
    takeProfit: 1.1200
  }
}
```

### Step 9: Record Trade

```typescript
// Create trade record
INSERT INTO trades (
  accountId,
  signalId,
  strategyId,
  externalTradeId,
  symbol,
  direction,
  entryPrice,
  entryTime,
  quantity,
  status
) VALUES (
  'ACC123',
  'sig_abc123',
  'STRAT123',
  'MT5_1716640200_abc12345',
  'EURUSD',
  'BUY',
  1.0850,
  '2024-05-25T14:30:00Z',
  100,
  'OPEN'
)

Result: Trade created with ID: trade_xyz789
```

### Step 10: Update Risk State

```typescript
// Update risk metrics
UPDATE risk_states
SET
  openTrades = openTrades + 1,
  maxExposure = 30108.50
WHERE
  accountId = 'ACC123'
  AND date = TODAY()

Result: Risk state updated
openTrades: 3 → 4
maxExposure: 30000 → 30108.50
```

### Step 11: Success Response

**Time: 14:30:00.250 (250ms total)**

```json
HTTP 200 OK
{
  "success": true,
  "data": {
    "signalId": "sig_abc123"
  },
  "timestamp": "2024-05-25T14:30:00.250Z"
}
```

### Step 12: Monitoring Trade

Frontend polls for live price:

```bash
GET /trades/trade_xyz789/live-price

Response:
{
  "success": true,
  "data": {
    "currentPrice": 1.0860,
    "entryPrice": 1.0850,
    "pnl": 100,        // $100 profit
    "pnlPercent": 0.09 // 0.09% gain
  }
}
```

### Step 13: Close Trade (Manual or Via Signal)

When close signal received:

```bash
POST /trades/trade_xyz789/close

Response:
{
  "success": true,
  "data": {
    "id": "trade_xyz789",
    "exitPrice": 1.0890,
    "exitTime": "2024-05-25T15:00:00Z",
    "status": "CLOSED",
    "pnl": 400,
    "pnlPercent": 0.37
  }
}
```

Database updates:

```typescript
UPDATE trades
SET
  exitPrice = 1.0890,
  exitTime = NOW(),
  status = 'CLOSED',
  pnl = 400,
  pnlPercent = 0.37
WHERE id = 'trade_xyz789'

UPDATE risk_states
SET
  openTrades = openTrades - 1,
  dailyPnL = dailyPnL + 400
WHERE accountId = 'ACC123'
  AND date = TODAY()
```

## Error Scenarios

### Scenario 1: Invalid Passphrase

```
Webhook → Validate Secret → FAIL
Response: 401 Unauthorized
Body: { "error": "Invalid webhook secret", "success": false }
```

### Scenario 2: Account Not Found

```
Signal Validation → Check Account → NOT FOUND
Action: Mark as rejected
Database: Store signal with rejection reason
Response: 200 OK (silent fail - prevents TradingView retry)
```

### Scenario 3: Risk Limit Exceeded

```
Risk Check → Daily Loss Limit → EXCEEDED
Action: Reject trade
Database: Record trade with status REJECTED and reason
Response: 200 OK
Frontend: Shows rejected trades in UI
```

### Scenario 4: MT5 Execution Fails

```
Execute Trade → MT5 Response → Error
Action: Mark trade as REJECTED
Database: Store trade with error details
Response: 200 OK
Logging: WARN level with error details
```

## Performance Metrics

**Target Performance:**

- Webhook processing: < 500ms
- Database writes: < 100ms
- MT5 execution: < 200ms (mocked)
- Total round-trip: < 1 second

**Example trace:**

```
14:30:00.000 - Webhook received
14:30:00.050 - Validation complete
14:30:00.100 - Deduplication check
14:30:00.150 - Signal stored
14:30:00.200 - Risk check complete
14:30:00.250 - Trade execution
14:30:00.280 - Database updated
14:30:00.300 - Response sent
Total: 300ms ✓
```

## Monitoring & Alerting

**Metrics to track:**

- Webhook latency
- Execution success rate
- Risk check failures
- Trade win/loss ratio
- Daily PnL per account

**Alert conditions:**

- Webhook latency > 1 second
- Execution failure rate > 5%
- Daily loss limit breached
- Database connection errors
