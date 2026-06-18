# Setup & Deployment Guide

## Local Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 14 or higher
- npm or yarn package manager
- Git

### Step 1: Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd "Trading Automation Platform"

# Backend setup
cd backend
npm install
cp .env.example .env

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
```

### Step 2: PostgreSQL Setup

```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Or Docker
docker run --name trading-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=trading_platform \
  -p 5432:5432 \
  -d postgres:14
```

### Step 3: Configure Backend Environment

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trading_platform"
PORT=3000
NODE_ENV=development
TRADING_VIEW_WEBHOOK_SECRET="your-secret-key-change-me"
MAX_DAILY_LOSS_PERCENT=5
MAX_OPEN_TRADES=10
POSITION_RISK_PERCENT=2
LOG_LEVEL=debug
```

### Step 4: Setup Database

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed sample data (optional)
npm run prisma:seed

# View database GUI (optional)
npm run prisma:studio
```

### Step 5: Start Backend

```bash
cd backend
npm run dev
```

Backend is now running at: `http://localhost:3000`

### Step 6: Configure Frontend Environment

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### Step 7: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend is now running at: `http://localhost:5173`

### Step 8: Access Application

1. Open browser: `http://localhost:5173`
2. Login with demo credentials (auto-populated)
3. Select trading account
4. View dashboard

## Testing Webhook Integration

### Option 1: Using cURL

```bash
# Send BUY signal
curl -X POST "http://localhost:3000/webhook/tradingview?account_id=ACC123&strategy_id=STRAT123" \
  -H "Content-Type: application/json" \
  -d '{
    "passphrase": "your-secret-key-change-me",
    "time": "2024-05-25T14:30:00Z",
    "ticker": "EURUSD",
    "close": 1.0850,
    "strategy_signal": "BUY"
  }'

# Expected response
{
  "success": true,
  "data": {
    "signalId": "sig_..."
  },
  "timestamp": "2024-05-25T14:30:00Z"
}
```

### Option 2: Using Postman

1. Create new POST request
2. URL: `http://localhost:3000/webhook/tradingview?account_id=ACC123&strategy_id=STRAT123`
3. Headers: `Content-Type: application/json`
4. Body (raw):
   ```json
   {
     "passphrase": "your-secret-key-change-me",
     "time": "2024-05-25T14:30:00Z",
     "ticker": "EURUSD",
     "close": 1.085,
     "strategy_signal": "BUY"
   }
   ```
5. Send

### Option 3: Using Webhook.site

1. Go to https://webhook.site
2. Copy your unique URL
3. Update TradingView alert URL
4. View incoming webhooks in real-time

## Building for Production

### Backend Build

```bash
cd backend

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Start production server
npm start
```

### Frontend Build

```bash
cd frontend

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Preview production build
npm run preview
```

## Docker Deployment

### Docker Compose (All Services)

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: trading_platform
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/trading_platform
      PORT: 3000
      NODE_ENV: production
      TRADING_VIEW_WEBHOOK_SECRET: ${TRADING_VIEW_WEBHOOK_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:3000"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npm run prisma:generate

COPY dist ./dist

EXPOSE 3000

CMD ["npm", "start"]
```

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Deploy with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## AWS Deployment

### Prerequisites

- AWS Account
- AWS CLI configured
- ECR repository created
- RDS PostgreSQL instance

### Step 1: Push to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t trading-backend .
docker tag trading-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/trading-backend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/trading-backend:latest

# Build and push frontend
cd ../frontend
docker build -t trading-frontend .
docker tag trading-frontend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/trading-frontend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/trading-frontend:latest
```

### Step 2: ECS Deployment

Create ECS cluster and tasks using the pushed images.

### Step 3: Database Migration

```bash
# Connect to RDS instance
PGPASSWORD=<DB_PASSWORD> psql -h <RDS_ENDPOINT> -U postgres -d trading_platform

# Run migrations
npm run prisma:migrate
```

## Environment Variables Reference

### Backend

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Server
PORT=3000
NODE_ENV=development|production

# Webhook Security
TRADING_VIEW_WEBHOOK_SECRET=your-secret-key

# Risk Management
MAX_DAILY_LOSS_PERCENT=5
MAX_OPEN_TRADES=10
POSITION_RISK_PERCENT=2

# Logging
LOG_LEVEL=debug|info|warn|error
```

### Frontend

```env
# API Configuration
VITE_API_URL=http://localhost:3000
```

## Monitoring & Logs

### Backend Logs

```bash
# View all logs
tail -f backend/logs/combined.log

# View errors only
tail -f backend/logs/error.log

# View real-time logs (development)
npm run dev 2>&1 | tee logs/dev.log
```

### Frontend Console

```bash
# Open browser dev tools
F12 or Cmd+Option+I

# View network tab
  - API requests to backend
  - Webhook responses
  - Error handling
```

### Database Monitoring

```bash
# Connect to PostgreSQL
psql postgresql://user:pass@localhost:5432/trading_platform

# Check tables
\dt

# Query recent trades
SELECT * FROM trades ORDER BY createdAt DESC LIMIT 10;

# Check risk states
SELECT * FROM risk_states WHERE date >= CURRENT_DATE;
```

## Troubleshooting

### Backend Won't Start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process using port
kill -9 <PID>

# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Check logs
npm run dev
```

### Frontend Can't Connect to Backend

```bash
# Check VITE_API_URL is correct
echo $VITE_API_URL

# Test API endpoint
curl http://localhost:3000/health

# Check CORS settings in backend
# Should allow your frontend origin
```

### Database Migration Fails

```bash
# Reset database (⚠️ loses data)
npm run prisma:migrate reset --force

# View pending migrations
npm run prisma:migrate status

# Create manual migration
npm run prisma:migrate dev --name migration_name
```

### Webhook Not Processing

```bash
# Check webhook secret matches
echo $TRADING_VIEW_WEBHOOK_SECRET

# Test webhook endpoint
curl -X POST "http://localhost:3000/webhook/tradingview?account_id=ACC123&strategy_id=STRAT123" \
  -H "Content-Type: application/json" \
  -d '{"passphrase":"...","time":"...","ticker":"EURUSD","close":1.0850,"strategy_signal":"BUY"}'

# Check account exists
# Use Prisma Studio: npm run prisma:studio
```

## Performance Tuning

### Database Optimization

```bash
# Enable query logging
# In .env: DATABASE_URL="postgresql://...?logStatements=true"

# Check slow queries
SELECT query, calls, total_time FROM pg_stat_statements
ORDER BY total_time DESC LIMIT 10;

# Create indexes for common queries
CREATE INDEX idx_trades_account_id ON trades(accountId);
CREATE INDEX idx_signals_timestamp ON signals(timestamp);
```

### Backend Optimization

```bash
# Enable compression
npm install compression

# Use caching
npm install redis

# Monitor performance
NODE_OPTIONS="--enable-source-maps" npm start
```

### Frontend Optimization

```bash
# Build analysis
npm run build
npm run preview

# Enable lazy loading
# React.lazy() for route-based code splitting
```

## CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Backend Tests
        run: |
          cd backend
          npm install
          npm run type-check
          npm run lint

      - name: Frontend Tests
        run: |
          cd frontend
          npm install
          npm run type-check
          npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Backend
        run: |
          cd backend
          npm install
          npm run build

      - name: Build Frontend
        run: |
          cd frontend
          npm install
          npm run build
```

## Rollback Procedure

```bash
# If deployment fails
docker-compose down

# Revert to previous version
git checkout previous-tag
docker-compose up -d

# Check status
docker-compose logs
```

## Backup & Recovery

```bash
# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_20240525_143000.sql

# Backup application data
tar -czf app_backup.tar.gz ./backend ./frontend

# Copy to remote storage
aws s3 cp backup_*.sql s3://my-backups/
```

## Support

For issues or questions:

1. Check logs: `backend/logs/`
2. Review README.md
3. Check TRADE_FLOW.md for process details
4. Check ARCHITECTURE.md for system design
