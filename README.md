# Trading Automation Platform

A production-ready automated trading platform that receives TradingView webhook alerts and executes trades with risk management.

## System Architecture

### Components

1. **Webhook Receiver** - Receives and validates TradingView alerts
2. **Trade Engine** - Converts signals to trades with risk management
3. **Execution Layer** - Mock MT5 connector (abstraction for real MT5)
4. **Risk Management** - Enforces daily loss limits, position sizing, exposure caps
5. **Analytics** - Provides performance metrics and trade history
6. **Dashboard** - React frontend for monitoring and management

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Update .env with your PostgreSQL connection
DATABASE_URL="postgresql://user:password@localhost:5432/trading_platform"
TRADING_VIEW_WEBHOOK_SECRET="your-secret-key"

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Webhook

- `POST /webhook/tradingview?account_id=xxx&strategy_id=yyy` - Receive TradingView alerts
- `GET /webhook/status` - Health check

### Trades

- `GET /trades?account_id=xxx` - List trades
- `GET /trades/:tradeId` - Get trade details
- `GET /trades/:tradeId/live-price` - Get current price & P&L
- `POST /trades/:tradeId/close` - Close trade

### Strategies

- `POST /strategies?user_id=xxx` - Create strategy
- `GET /strategies?user_id=xxx` - List user strategies
- `GET /strategies/:strategyId` - Get strategy details
- `PATCH /strategies/:strategyId` - Update strategy
- `DELETE /strategies/:strategyId` - Delete strategy

### Accounts

- `POST /accounts?user_id=xxx` - Create account
- `GET /accounts?user_id=xxx` - List user accounts
- `GET /accounts/:accountId` - Get account details
- `GET /accounts/:accountId/info` - Get live account info (from MT5)
- `PATCH /accounts/:accountId` - Update account
- `DELETE /accounts/:accountId` - Delete account

### Analytics

- `GET /analytics/strategy/:strategyId/metrics` - Strategy performance metrics
- `GET /analytics/account/:accountId/metrics` - Account performance metrics
- `GET /analytics/account/:accountId/trades` - Recent trades
- `GET /analytics/account/:accountId/daily-pnl?days=30` - Daily P&L data

## TradingView Webhook Integration

### Setup in TradingView

1. Create a strategy in TradingView Pine Script
2. Add alert on strategy completion:
   - URL: `http://your-domain.com/webhook/tradingview?account_id=ACC123&strategy_id=STRAT123`
   - Method: POST
   - Content-Type: application/json
   - Message:
     ```json
     {
       "passphrase": "your-secret-key",
       "time": "{{timenow}}",
       "ticker": "{{ticker}}",
       "close": "{{close}}",
       "strategy_signal": "{{strategy.order.action}}"
     }
     ```

### Example Webhook Payload

```json
{
  "passphrase": "your-secret-key",
  "time": "2024-05-25T14:30:00Z",
  "ticker": "EURUSD",
  "close": 1.085,
  "strategy_signal": "BUY",
  "account_id": "ACC123",
  "quantity": 1000
}
```

## Trade Flow Example

### Scenario: Buy Signal Received

```
1. TradingView sends webhook alert:
   {
     "time": "2024-05-25T14:30:00Z",
     "ticker": "EURUSD",
     "close": 1.0850,
     "strategy_signal": "BUY"
   }

2. Backend validates:
   ✓ Secret matches
   ✓ Account is active
   ✓ Strategy is active
   ✓ Not a duplicate (within 5 min window)

3. Signal stored in database

4. Trade Engine processes:
   - Get account balance: $100,000
   - Get strategy risk %: 2%
   - Calculate position size: 100 EUR (2% risk at 1% SL)
   - Apply risk management:
     ✓ Daily loss limit: -$5,000 (5% of balance)
     ✓ Max open trades: 5 (currently 2)
     ✓ Max exposure: $50,000 (50% of balance, currently $35,000)

5. Trade execution:
   - Call MT5 connector
   - Create order: BUY 100 EURUSD @ 1.0850
   - MT5 returns: tradeId = "MT5_1716640200_abc12345"

6. Trade recorded in database:
   - Status: OPEN
   - Entry Price: 1.0850
   - Entry Time: 2024-05-25T14:30:00Z
   - Quantity: 100

7. Risk state updated:
   - Open Trades: +1
   - Current Exposure: +108,500

8. Response sent to TradingView:
   {
     "success": true,
     "signalId": "sig_xyz789",
     "data": { "signalId": "sig_xyz789" },
     "timestamp": "2024-05-25T14:30:01Z"
   }
```

## Risk Management Rules

### Daily Loss Limit

- Max Daily Loss: 5% of account balance
- If breached: All trades rejected for the day

### Max Open Trades

- Limit: 10 concurrent open trades per account
- If exceeded: New trades rejected

### Position Sizing

- Risk per trade: 2% of account balance (configurable)
- Formula: Position Size = (Balance × Risk %) / Price Risk
- Example: ($100,000 × 2%) / 0.5 = 4,000 units

### Exposure Limit

- Max Exposure: 50% of account balance
- Sum of all open position values must stay below limit

## Database Schema

### Core Models

**Users** - Platform users

- id, email, name, password, timestamps

**Accounts** - Trading accounts connected to MT5

- id, userId, externalId (MT5 ID), balance, equity, exposure, isActive

**Strategies** - Trading strategies

- id, userId, name, description, riskPercent, isActive

**Signals** - Incoming webhook signals

- id, accountId, strategyId, symbol, action (BUY/SELL/CLOSE), price, timestamp, rawPayload, isDuplicate, processedAt

**Trades** - Executed trades

- id, accountId, signalId, strategyId, externalTradeId (MT5 ID), symbol, direction, entryPrice, entryTime, exitPrice, exitTime, quantity, status (OPEN/CLOSED/REJECTED), pnl, pnlPercent, commission, reason

**RiskState** - Daily risk tracking

- id, accountId, strategyId, date, dailyPnL, openTrades, maxExposure, breachedLimit

## Frontend Features

### Dashboard

- Account selector and overview
- Live equity and P&L display
- Risk status panel with exposure percentage
- Interactive trades table with sorting/filtering
- Real-time price updates for open trades
- Trade close functionality

### Analytics

- Win rate percentage
- Profit factor
- Max drawdown
- Average win/loss
- Daily P&L chart (last 30 days)
- Trade history with filtering

## Configuration

### Backend Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/trading_platform

# Server
PORT=3000
NODE_ENV=development

# Webhook Security
TRADING_VIEW_WEBHOOK_SECRET=your-secret-key

# Risk Management
MAX_DAILY_LOSS_PERCENT=5
MAX_OPEN_TRADES=10
POSITION_RISK_PERCENT=2

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:3000
```

## Development

### Project Structure

**Backend:**

```
backend/
├── src/
│   ├── modules/
│   │   ├── webhook/          # Webhook handler
│   │   ├── trades/           # Trade engine
│   │   ├── execution/        # MT5 connector
│   │   ├── analytics/        # Analytics service
│   │   └── risk/             # Risk management
│   ├── controllers/          # API route handlers
│   ├── routes/               # API routes
│   ├── middleware/           # Express middleware
│   ├── services/             # Business logic
│   ├── utils/                # Helpers and validation
│   ├── types/                # TypeScript types
│   ├── config/               # Configuration
│   ├── db.ts                 # Prisma client
│   └── index.ts              # Express app entry
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.js               # Database seed
└── package.json
```

**Frontend:**

```
frontend/
├── src/
│   ├── pages/                # Page components
│   ├── components/           # Reusable components
│   ├── features/             # Feature modules
│   ├── services/             # API client
│   ├── hooks/                # Custom hooks
│   ├── types/                # TypeScript types
│   ├── App.tsx               # Main component
│   ├── main.tsx              # Entry point
│   └── App.css               # Global styles
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
└── package.json
```

## Testing

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Production Deployment

### Backend

1. Build TypeScript:

   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run database migrations:

   ```bash
   npm run prisma:migrate
   ```

4. Start server:
   ```bash
   npm start
   ```

### Frontend

1. Build for production:

   ```bash
   npm run build
   ```

2. Deploy `dist/` folder to static hosting

3. Configure API endpoint to production backend

## MT5 Integration

Currently, the execution layer uses a mock MT5 connector. To integrate with real MT5:

1. Replace mock methods in `src/modules/execution/mt5Connector.ts`
2. Install MT5 API library (e.g., `mt5-api`)
3. Implement actual trade execution calls
4. Add authentication/connection management

## Monitoring

### Logs

Logs are written to:

- `logs/combined.log` - All logs
- `logs/error.log` - Errors only
- Console - In development mode

### Metrics to Monitor

- Webhook processing latency
- Trade execution success rate
- Risk check violations
- Database query performance
- API response times

## Security Considerations

1. **Webhook Security**: All webhooks verify passphrase/secret
2. **Input Validation**: All inputs validated with Zod
3. **Database**: Use prepared statements (Prisma handles this)
4. **Authentication**: Add JWT auth before production use
5. **HTTPS**: Use HTTPS for all webhooks in production
6. **Rate Limiting**: Implement rate limiting on webhook endpoint
7. **Secrets**: Never commit `.env` files, use environment variables

## Common Issues

### Database Connection Fails

- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure database exists

### Webhook Not Processing

- Verify webhook secret matches
- Check request body format (must be valid JSON)
- Review backend logs for errors

### Trades Not Executing

- Check account is active
- Verify strategy is active
- Review risk management logs
- Check MT5 connector (currently mocked)

## Future Enhancements

- [ ] Real MT5 integration
- [ ] Authentication (JWT/OAuth)
- [ ] WebSocket support for real-time updates
- [ ] Advanced charting with TradingView Lightweight Charts
- [ ] Backtesting module
- [ ] Strategy builder UI
- [ ] Discord/Telegram notifications
- [ ] Email alerts
- [ ] Multi-account portfolio view
- [ ] Advanced analytics and reporting

## Support & Documentation

- Backend API: See `/swagger` endpoint (add swagger docs)
- Database: See `prisma/schema.prisma`
- TradingView Integration: See webhook examples above
- Frontend Components: See React component documentation

## License

MIT
