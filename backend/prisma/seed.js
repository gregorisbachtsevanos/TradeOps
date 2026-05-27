import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: "hashed_password_here", // In production, use proper hashing
    },
  });

  console.log("Created user:", user);

  // Create trading strategies
  const buyAndHoldStrategy = await prisma.strategy.upsert({
    where: { id: "strat_buy_hold" },
    update: {},
    create: {
      id: "strat_buy_hold",
      userId: user.id,
      name: "Buy and Hold",
      description: "Simple buy and hold strategy",
      riskPercent: 2,
      isActive: true,
    },
  });

  const scalperStrategy = await prisma.strategy.upsert({
    where: { id: "strat_scalper" },
    update: {},
    create: {
      id: "strat_scalper",
      userId: user.id,
      name: "Scalper",
      description: "Short-term scalping strategy",
      riskPercent: 1,
      isActive: true,
    },
  });

  console.log("Created strategies:", buyAndHoldStrategy, scalperStrategy);

  // Create trading account
  const account = await prisma.account.upsert({
    where: { externalId: "MT5_123456" },
    update: {},
    create: {
      externalId: "MT5_123456",
      userId: user.id,
      balance: 100000,
      equity: 102500,
      exposure: 35000,
      isActive: true,
    },
  });

  console.log("Created account:", account);

  // Create sample signals
  const signal1 = await prisma.signal.create({
    data: {
      accountId: account.id,
      strategyId: buyAndHoldStrategy.id,
      symbol: "EURUSD",
      action: "BUY",
      price: 1.085,
      timestamp: new Date("2024-05-25T14:00:00Z"),
      rawPayload: {
        passphrase: "secret",
        time: "2024-05-25T14:00:00Z",
        ticker: "EURUSD",
        close: 1.085,
        strategy_signal: "BUY",
      },
      isDuplicate: false,
      processedAt: new Date("2024-05-25T14:00:01Z"),
    },
  });

  const signal2 = await prisma.signal.create({
    data: {
      accountId: account.id,
      strategyId: scalperStrategy.id,
      symbol: "GBPUSD",
      action: "BUY",
      price: 1.275,
      timestamp: new Date("2024-05-25T14:15:00Z"),
      rawPayload: {
        passphrase: "secret",
        time: "2024-05-25T14:15:00Z",
        ticker: "GBPUSD",
        close: 1.275,
        strategy_signal: "BUY",
      },
      isDuplicate: false,
      processedAt: new Date("2024-05-25T14:15:01Z"),
    },
  });

  console.log("Created signals:", signal1, signal2);

  // Create sample trades
  const trade1 = await prisma.trade.create({
    data: {
      accountId: account.id,
      signalId: signal1.id,
      strategyId: buyAndHoldStrategy.id,
      externalTradeId: "MT5_12345_67890",
      symbol: "EURUSD",
      direction: "BUY",
      entryPrice: 1.085,
      entryTime: new Date("2024-05-25T14:00:00Z"),
      exitPrice: 1.0875,
      exitTime: new Date("2024-05-25T15:30:00Z"),
      quantity: 100,
      status: "CLOSED",
      pnl: 250, // (1.0875 - 1.0850) * 100 * 100
      pnlPercent: 0.23,
      commission: 10,
    },
  });

  const trade2 = await prisma.trade.create({
    data: {
      accountId: account.id,
      signalId: signal2.id,
      strategyId: scalperStrategy.id,
      externalTradeId: "MT5_12346_67891",
      symbol: "GBPUSD",
      direction: "BUY",
      entryPrice: 1.275,
      entryTime: new Date("2024-05-25T14:15:00Z"),
      quantity: 50,
      status: "OPEN",
      commission: 5,
    },
  });

  console.log("Created trades:", trade1, trade2);

  // Create risk state
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const riskState = await prisma.riskState.upsert({
    where: {
      accountId_strategyId_date: {
        accountId: account.id,
        strategyId: buyAndHoldStrategy.id,
        date: today,
      },
    },
    update: {},
    create: {
      accountId: account.id,
      strategyId: buyAndHoldStrategy.id,
      date: today,
      dailyPnL: 2500,
      openTrades: 1,
      maxExposure: 35000,
      breachedLimit: false,
    },
  });

  console.log("Created risk state:", riskState);

  console.log("✓ Database seeding completed");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
