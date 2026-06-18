# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     TradingView Platform                    │
│              (Sends webhook alerts on signals)              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS POST /webhook/tradingview
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js)                    │
│                                                             │
│  ┌─────────────────┐   ┌──────────────────────────────────┐ │
│  │   Middleware    │   │      Express Routes              │ │
│  │ - Auth/Logging  │   │ - /webhook (Signal receiver)     │ │
│  │ - Error Handler │   │ - /trades (Trade management)     │ │
│  │ - Validation    │   │ - /strategies (Strategy CRUD)    │ │
│  └─────────────────┘   │ - /accounts (Account mgmt)       │ │
│                        │ - /analytics (Metrics)           │ │
│                        └──────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Core Modules                            │   │
│  │                                                      │   │
│  │  ┌─────────────────┐ ┌──────────────────────────┐    │   │
│  │  │  Webhook        │ │  Trade Engine            │    │   │
│  │  │  Receiver       │ │  - Position sizing       │    │   │
│  │  │ ┌─────────────┐ │ │  - Signal → Trade logic  │    │   │
│  │  │ │ Dedup Check │ │ │  - Action routing        │    │   │
│  │  │ └─────────────┘ │ │  - Trade rejection       │    │   │
│  │  │ ┌─────────────┐ │ │                          │    │   │
│  │  │ │ Validation  │ │ └──────────────────────────┘    │   │
│  │  │ └─────────────┘ │                                 │   │
│  │  └─────────────────┘                                 │   │
│  │                                                      │   │
│  │  ┌──────────────────┐ ┌─────────────────────────┐    │   │
│  │  │  Risk Management │ │  Execution Layer        │    │   │
│  │  │  - Daily limit   │ │  - MT5 Connector        │    │   │
│  │  │  - Max trades    │ │  - Order execution      │    │   │
│  │  │  - Exposure cap  │ │  - Position tracking    │    │   │
│  │  │  - Position size │ │  (Mock for now)         │    │   │
│  │  └──────────────────┘ └─────────────────────────┘    │   │
│  │                                                      │   │
│  │  ┌──────────────────┐ ┌─────────────────────────┐    │   │
│  │  │  Analytics       │ │  Services               │    │   │
│  │  │  Service         │ │  - Database abstraction │    │   │
│  │  │ ┌────────────┐   │ │  - Business logic       │    │   │
│  │  │ │Win Rate    │   │ │  - Data transforms      │    │   │
│  │  │ └────────────┘   │ │                         │    │   │
│  │  │ ┌────────────┐   │ └─────────────────────────┘    │   │
│  │  │ │Drawdown    │   │                                │   │
│  │  │ └────────────┘   │                                │   │
│  │  │ ┌────────────┐   │                                │   │
│  │  │ │PnL Report  │   │                                │   │
│  │  │ └────────────┘   │                                │   │
│  │  └──────────────────┘                                │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│                    ┌────────────────┐                       │
│                    │  Prisma ORM    │                       │
│                    │ (Type-safe DB) │                       │
│                    └────────────────┘                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
        ┌────────────────────────────────┐
        │   PostgreSQL Database          │
        │                                │
        │ - Users, Accounts, Strategies  │
        │ - Signals, Trades, Risk States │
        │                                │
        └────────────────────────────────┘
                         ▲
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐            ┌──────────────────┐
│  Frontend (Vite) │            │  MT5 Platform    │
│  React + TS      │            │  (Real in prod)  │
│                  │            │                  │
│ ┌──────────────┐ │            │ - Execute trades │
│ │ Dashboard    │ │            │ - Get prices     │
│ │ - Trades     │ │            │ - Manage accounts│
│ │ - Analytics  │ │            │                  │
│ │ - Risk Panel │ │            └──────────────────┘
│ └──────────────┘ │
└──────────────────┘
```

## Component Breakdown

### 1. Webhook Receiver Module

**Purpose:** Ingress point for TradingView signals

**Responsibilities:**

- Validate incoming webhook signatures
- Parse and validate JSON payload
- Implement deduplication (prevent duplicate trades within 5 min)
- Store raw signal in database
- Route to Trade Engine

**Key Files:**

- `src/modules/webhook/webhookHandler.ts`
- `src/middleware/webhookValidation.ts`
- `src/controllers/webhookController.ts`

**Process:**

```
Webhook → Signature Check → Schema Validation → Dedup Check → Store Signal → Engine
```

### 2. Trade Engine Module

**Purpose:** Convert signals to trades with intelligent routing

**Responsibilities:**

- Determine trade action (BUY/SELL/CLOSE)
- Calculate position size based on risk management
- Apply trade-specific rules
- Route to Execution Layer
- Handle CLOSE actions
- Update database with results

**Key Files:**

- `src/modules/trades/tradeEngine.ts`
- `src/controllers/tradeController.ts`

**Logic Flow:**

```
Signal → Get Account/Strategy → Validate State → Calc Position Size
  → Risk Check → Execute → Record → Update Risk State
```

### 3. Risk Management Module

**Purpose:** Enforce trading constraints and risk limits

**Responsibilities:**

- Check daily loss limit (5% default)
- Check max open trades (10 default)
- Check exposure limit (50% of balance)
- Calculate position sizing
- Update risk metrics daily
- Trigger risk alerts/breaches

**Key Files:**

- `src/modules/risk/riskManagement.ts`

**Key Rules:**

- Daily Loss Limit: -5% of account balance → all trades rejected
- Max Open Trades: 10 per account → new trades rejected
- Exposure Cap: 50% of balance → position sizing limits
- Position Size: 2% risk per trade (configurable)

**Database:** `RiskState` table tracks daily metrics per account/strategy

### 4. Execution Layer (MT5 Connector)

**Purpose:** Abstract interface for trade execution

**Responsibilities:**

- Execute orders (BUY/SELL)
- Close positions
- Get account info
- Get position details
- Mock implementation for testing

**Key Files:**

- `src/modules/execution/mt5Connector.ts`

**API:**

```typescript
executeTrade(symbol, direction, price, quantity, stopLoss, takeProfit);
closeTrade(externalTradeId, exitPrice);
getAccountInfo(externalAccountId);
getPositionInfo(externalTradeId);
getOpenTrades(externalAccountId);
```

**Current:** Mock implementation (returns realistic test data)
**Future:** Replace with real MT5 API integration

### 5. Analytics Module

**Purpose:** Provide trading metrics and performance analysis

**Responsibilities:**

- Calculate win rate
- Compute profit factor
- Determine max drawdown
- Track average win/loss
- Provide daily PnL charts
- Generate performance reports

**Key Files:**

- `src/modules/analytics/analyticsService.ts`
- `src/controllers/analyticsController.ts`

**Metrics Calculated:**

```
Win Rate = (Winning Trades / Total Trades) × 100
Profit Factor = Total Profit / Total Loss
Max Drawdown = Largest peak-to-trough decline
Avg Win/Loss = Sum / Count of profitable/losing trades
```

### 6. Database Layer (Prisma ORM)

**Purpose:** Type-safe database abstraction

**Models:**

- `User` - Platform users
- `Account` - MT5 trading accounts
- `Strategy` - Trading strategies
- `Signal` - Incoming webhook signals
- `Trade` - Executed trades
- `RiskState` - Daily risk metrics

**Key Features:**

- Full TypeScript type safety
- Automatic migrations
- Transaction support
- Relationship management

### 7. Frontend (React + TypeScript)

**Purpose:** Real-time monitoring dashboard

**Features:**

- Account selector with balance display
- Live trades table with P&L
- Equity and performance overview
- Risk status panel with exposure gauge
- Daily PnL chart
- Trade filtering and pagination

**Architecture:**

- React Query for server state management
- Zustand for client state (user, selections)
- Component-based structure
- CSS modules for styling

**Key Files:**

```
frontend/src/
├── pages/Dashboard.tsx
├── features/
│   ├── AccountSelector
│   ├── LiveTradesTable
│   ├── EquityOverview
│   ├── RiskPanel
│   └── StrategyPerformance
├── hooks/
│   ├── useApi.ts (React Query hooks)
│   └── useStore.ts (Zustand store)
├── services/api.ts (API client)
└── types/index.ts (Type definitions)
```

## Data Flow Examples

### Signal Reception Flow

```
1. TradingView sends webhook
   ↓
2. Middleware validates:
   - Content-Type: application/json
   - Passphrase matches
   ↓
3. Controller receives request
   ↓
4. Zod schema validates payload
   ↓
5. Webhook handler checks:
   - Account exists and is active
   - Strategy exists and is active
   - No duplicate (5 min window)
   ↓
6. Signal stored in database
   ↓
7. Trade Engine called asynchronously
   ↓
8. Response sent immediately
```

### Trade Execution Flow

```
1. Trade Engine receives signal
   ↓
2. Determines action (BUY/SELL/CLOSE)
   ↓
3. For BUY/SELL:
   a. Calculate position size
   b. Check risk limits
   c. Get MT5 execution
   d. Record trade
   e. Update risk state
   ↓
4. For CLOSE:
   a. Find open position
   b. Close via MT5
   c. Calculate PnL
   d. Update risk state
   ↓
5. Log all decisions
```

## Key Design Patterns

### 1. Async Processing

Webhook responses are sent immediately, processing happens async:

- Fast response times < 1 second
- Trade Engine runs in background
- Prevents timeout errors
- Better reliability

### 2. Fail-Closed for Risk

Risk checks reject trades on any error:

- Never let an unknown risk state through
- Better safe than sorry
- Prevents catastrophic losses
- Conservative approach

### 3. Deduplication

Prevent duplicate signals within 5-minute window:

- Same symbol + same action = duplicate
- Configurable window
- Stored separately for analysis
- Reduces unnecessary trades

### 4. Abstraction Layers

Each component is independent:

- Trade Engine doesn't know about MT5 details
- Risk Management is separate concern
- Analytics independent of execution
- Easy to test and modify

### 5. Type Safety

Full TypeScript throughout:

- Frontend: React + TS
- Backend: Node + TS
- Database: Prisma types
- API: Zod validation

## Scalability Considerations

### Current Architecture Limitations

1. **Synchronous Processing**
   - Current: Trades executed inline
   - Bottleneck: MT5 execution time
   - Solution: Add job queue (Bull, RabbitMQ)

2. **Single Database**
   - Current: Single PostgreSQL instance
   - Bottleneck: High write volume
   - Solution: Database replication, read replicas

3. **In-Memory State**
   - Current: Risk state queried every trade
   - Bottleneck: Database queries
   - Solution: Redis caching

### Future Improvements

1. **Message Queue**

   ```
   Webhook → Queue → Worker Pool
   - Decouples ingestion from processing
   - Handles traffic spikes
   - Enables retry logic
   ```

2. **Caching Layer**

   ```
   Redis for:
   - Account info
   - Strategy config
   - Risk state
   - Reduces DB queries
   ```

3. **Read Replicas**

   ```
   Write: Primary DB
   Read: Replica DBs
   - Separation of concerns
   - Better query performance
   ```

4. **Monitoring & Observability**
   ```
   Metrics:
   - Prometheus for metrics
   - ELK stack for logs
   - Grafana for dashboards
   ```

## Security Architecture

### Input Validation

```typescript
// All inputs validated with Zod
- Webhook signatures verified
- JSON schema validation
- Type checking at compile time
- Runtime validation on all inputs
```

### Authentication/Authorization

```
Current: None (demo mode)
Future:
- JWT tokens for API
- User authentication
- Per-account isolation
- Admin roles
```

### Secret Management

```
Production:
- Never hardcode secrets
- Use environment variables
- Rotate secrets regularly
- Audit secret access
```

### Database Security

```
- Prepared statements (Prisma)
- Escaped user inputs
- Principle of least privilege
- Encrypted sensitive data
```

## Monitoring & Observability

### Logging Strategy

```
Level    | Use Case
---------|------------------------------------------
DEBUG    | Detailed flow, variable values
INFO     | Successful operations, milestones
WARN     | Risk violations, trade rejections
ERROR    | Exceptions, system failures
```

### Key Metrics

```
Business:
- Trades per day
- Win rate
- PnL per account
- Risk limit breaches

Technical:
- Webhook latency
- Trade execution time
- Database query time
- API response time
- Error rates
```

### Alerts

```
Critical:
- Database down
- Webhook receiver down
- Daily loss limit breached
- Risk check failures

Warning:
- High latency (> 1 sec)
- High error rate (> 5%)
- Connection issues
```

## Deployment Strategy

### Development

```bash
# Local setup
docker run postgres
npm install (backend & frontend)
npm run dev (both)
```

### Staging

```
- AWS EC2 for backend
- RDS PostgreSQL
- S3 for frontend
- CloudFront CDN
```

### Production

```
- ECS/Kubernetes for backend
- RDS Multi-AZ PostgreSQL
- S3 + CloudFront for frontend
- Application Load Balancer
- Auto-scaling groups
```

## Conclusion

This architecture prioritizes:

1. **Safety** - Risk checks, fail-closed design
2. **Speed** - Fast webhook processing
3. **Scalability** - Queue-ready design
4. **Maintainability** - Clear separation of concerns
5. **Testability** - Independent modules
