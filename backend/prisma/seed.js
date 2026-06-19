import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash(process.env.DEMO_PASSWORD, 10);

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      name: "Demo User",
      password: hashedPassword,
    },
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: hashedPassword,
    },
  });

  console.log("Created user:", user);

  // Create professional trading strategies
  const ictStrategy = await prisma.strategy.upsert({
    where: { id: "strat_ict_silver_bullet" },
    update: {},
    create: {
      id: "strat_ict_silver_bullet",
      userId: user.id,
      name: "ICT Silver Bullet",
      description: "ICT Silver Bullet strategy targeting liquidity sweeps and FVG entries during London/NY killzones with precise risk management.",
      isActive: true,
      markets: ["forex"],
      instruments: ["EURUSD", "GBPUSD", "USDJPY"],
      analysisTimeframe: "H1",
      entryTimeframe: "M5",
      conditions: ["trending_bullish", "trending_bearish"],
      sessions: ["london", "new_york", "london_new_york_overlap"],
      riskPercent: 1,
      maxDailyLoss: 3,
      maxDrawdown: 6,
      maxOpenTrades: 2,
      maxDailyTrades: 4,
      entryRules: [
        { type: "level", name: "Liquidity Sweep", description: "Wait for sweep of recent swing high/low", required: true },
        { type: "pattern", name: "Market Structure Shift", description: "Break of structure in opposite direction after sweep", required: true },
        { type: "level", name: "FVG Entry", description: "Enter on retrace to Fair Value Gap", required: true },
      ],
      confirmations: [
        { type: "time", name: "Killzone Timing", description: "Trade only during London (3-5AM EST) or NY (7-10AM EST) killzones", required: true },
        { type: "price_action", name: "M15 Displacement", description: "Strong displacement candle on M15 confirming MSS", required: false },
      ],
      stopLoss: { type: "structure", structureLevel: "Beyond sweep swing point", description: "Place SL beyond the liquidity sweep point" },
      tpTargets: [
        { type: "risk_reward", riskReward: 2, description: "TP1 at 2R - nearest liquidity pool" },
        { type: "risk_reward", riskReward: 3, partialPercent: 50, description: "TP2 at 3R - move SL to breakeven, close 50%" },
      ],
      tradeManagement: {
        breakevenTrigger: 15,
        trailingStop: false,
        maxHoldTime: 4,
      },
      exitRules: [
        { type: "time_based", name: "Killzone Exit", description: "Close all positions by end of killzone" },
        { type: "condition_based", name: "MSS Against Position", description: "Exit on market structure shift against trade direction" },
      ],
      newsRules: {
        avoidHighImpact: true,
        minutesBefore: 30,
        minutesAfter: 30,
        closeBeforeNews: true,
      },
      checklist: [
        { name: "Liquidity sweep confirmed", required: true },
        { name: "MSS with displacement", required: true },
        { name: "FVG present on entry timeframe", required: true },
        { name: "Within killzone hours", required: true },
        { name: "No high-impact news within 1 hour", required: true },
        { name: "Daily loss limit not breached", required: true },
      ],
      backtestingMetrics: {
        totalTrades: 156,
        winRate: 64.1,
        avgWin: 285,
        avgLoss: 150,
        profitFactor: 1.92,
        maxDrawdown: 8.4,
        sharpeRatio: 1.35,
        avgRR: 2.1,
      },
      notes: "Best results on EURUSD during London open. Avoid trading during NFP, CPI, and FOMC announcements. Focus on quality over quantity - max 2 setups per day.",
    },
  });

  const trendStrategy = await prisma.strategy.upsert({
    where: { id: "strat_trend_following" },
    update: {},
    create: {
      id: "strat_trend_following",
      userId: user.id,
      name: "Trend Following Pullback",
      description: "Classic trend following strategy entering on pullbacks to EMA 50 in established trends with confluence from multiple timeframes.",
      isActive: true,
      markets: ["forex", "indices", "crypto"],
      instruments: ["EURUSD", "NAS100", "BTCUSD", "SPX500"],
      analysisTimeframe: "H4",
      entryTimeframe: "H1",
      conditions: ["trending_bullish", "trending_bearish"],
      sessions: ["london", "new_york"],
      riskPercent: 1.5,
      maxDailyLoss: 4.5,
      maxDrawdown: 10,
      maxOpenTrades: 3,
      maxDailyTrades: 3,
      entryRules: [
        { type: "indicator", name: "EMA Trend Filter", description: "Price above EMA 50 for longs, below for shorts on H4", required: true },
        { type: "indicator", name: "EMA 200 Alignment", description: "EMA 50 above EMA 200 for longs (below for shorts)", required: true },
        { type: "price_action", name: "Pullback Entry", description: "Wait for pullback to EMA 50 zone with rejection candle", required: true },
      ],
      confirmations: [
        { type: "indicator", name: "RSI Confirmation", description: "RSI (14) above 50 for longs, below 50 for shorts", required: true },
        { type: "volume", name: "Volume Spike", description: "Above average volume on entry candle", required: false },
      ],
      stopLoss: { type: "atr", atrMultiplier: 1.5, description: "1.5x ATR below pullback low (above for shorts)" },
      tpTargets: [
        { type: "risk_reward", riskReward: 1.5, partialPercent: 50, description: "TP1 at 1.5R - close 50%, move to BE" },
        { type: "risk_reward", riskReward: 3, description: "TP2 at 3R - trail remaining" },
      ],
      tradeManagement: {
        breakevenTrigger: 20,
        trailingStop: true,
        trailingStopPips: 25,
        trailingStopAt: 40,
        maxHoldTime: 72,
      },
      exitRules: [
        { type: "indicator", name: "EMA Cross Exit", description: "Close on price closing beyond EMA 50 against trend" },
        { type: "time_based", name: "Max Hold Time", description: "Force close after 72 hours if targets not hit" },
      ],
      newsRules: {
        avoidHighImpact: true,
        minutesBefore: 15,
        minutesAfter: 15,
        closeBeforeNews: false,
      },
      checklist: [
        { name: "H4 trend clearly defined", required: true },
        { name: "EMA 50/200 aligned with trend", required: true },
        { name: "Pullback to EMA 50 zone", required: true },
        { name: "Rejection candle on H1", required: true },
        { name: "RSI confirms trend direction", required: false },
      ],
      backtestingMetrics: {
        totalTrades: 243,
        winRate: 55.1,
        avgWin: 320,
        avgLoss: 180,
        profitFactor: 1.65,
        maxDrawdown: 12.3,
        sharpeRatio: 1.12,
        avgRR: 1.8,
      },
      notes: "Works best in strong trending markets. Avoid during ranging/consolidation periods. NAS100 and BTCUSD tend to give the best risk-reward setups.",
    },
  });

  const breakoutStrategy = await prisma.strategy.upsert({
    where: { id: "strat_breakout" },
    update: {},
    create: {
      id: "strat_breakout",
      userId: user.id,
      name: "Asian Range Breakout",
      description: "Breakout strategy trading the breakout of Asian session range during London open, targeting the NY session with defined risk.",
      isActive: true,
      markets: ["forex"],
      instruments: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"],
      analysisTimeframe: "H1",
      entryTimeframe: "M15",
      conditions: ["breakout", "ranging"],
      sessions: ["london", "london_new_york_overlap"],
      riskPercent: 1,
      maxDailyLoss: 3,
      maxDrawdown: 6,
      maxOpenTrades: 2,
      maxDailyTrades: 2,
      entryRules: [
        { type: "pattern", name: "Asian Range", description: "Identify high and low of Asian session (00:00-07:00 GMT)", required: true },
        { type: "price_action", name: "Breakout Candle", description: "Strong M15 close beyond Asian range boundary", required: true },
        { type: "price_action", name: "Retest Entry", description: "Enter on retest of broken level", required: true },
      ],
      confirmations: [
        { type: "volume", name: "Volume Confirmation", description: "Breakout candle has above-average volume", required: true },
        { type: "time", name: "London Open", description: "Breakout occurs within first 2 hours of London open", required: false },
      ],
      stopLoss: { type: "structure", structureLevel: "Mid-point of Asian range", description: "Place SL at mid-point of Asian range" },
      tpTargets: [
        { type: "risk_reward", riskReward: 1, partialPercent: 50, description: "TP1 at 1R - close 50%" },
        { type: "risk_reward", riskReward: 2, description: "TP2 at 2R - full close" },
      ],
      tradeManagement: {
        breakevenTrigger: 10,
        trailingStop: false,
        maxHoldTime: 6,
      },
      exitRules: [
        { type: "time_based", name: "NY Close Exit", description: "Close all positions by 4PM NY time" },
      ],
      newsRules: {
        avoidHighImpact: true,
        minutesBefore: 30,
        minutesAfter: 60,
        closeBeforeNews: true,
      },
      checklist: [
        { name: "Asian range clearly defined", required: true },
        { name: "Range width > 15 pips", required: true },
        { name: "Breakout candle is strong", required: true },
        { name: "Volume confirms breakout", required: true },
        { name: "No pending high-impact news", required: true },
      ],
      backtestingMetrics: {
        totalTrades: 189,
        winRate: 48.7,
        avgWin: 240,
        avgLoss: 150,
        profitFactor: 1.52,
        maxDrawdown: 9.1,
        sharpeRatio: 0.98,
        avgRR: 1.6,
      },
      notes: "Lower win rate but positive expectancy due to favorable R:R. Best on EURUSD and GBPUSD. Skip days with major news during London session.",
    },
  });

  const supplyDemandStrategy = await prisma.strategy.upsert({
    where: { id: "strat_supply_demand" },
    update: {},
    create: {
      id: "strat_supply_demand",
      userId: user.id,
      name: "Supply & Demand Zones",
      description: "Trade from fresh supply and demand zones on higher timeframes, entering on price return with confirmation candles.",
      isActive: true,
      markets: ["forex", "indices"],
      instruments: ["EURUSD", "GBPUSD", "US30", "NAS100"],
      analysisTimeframe: "H4",
      entryTimeframe: "H1",
      conditions: ["trending_bullish", "trending_bearish"],
      sessions: ["london", "new_york"],
      riskPercent: 1.5,
      maxDailyLoss: 4.5,
      maxDrawdown: 8,
      maxOpenTrades: 2,
      maxDailyTrades: 3,
      entryRules: [
        { type: "pattern", name: "Fresh Zone", description: "Identify fresh supply/demand zone (untested by price)", required: true },
        { type: "pattern", name: "Strong Move Origin", description: "Zone created by strong impulsive move (base -> rally/run)", required: true },
        { type: "price_action", name: "Confirmation Candle", description: "Wait for rejection candle at zone boundary", required: true },
      ],
      confirmations: [
        { type: "price_action", name: "MSS Confirmation", description: "Market structure shift on lower timeframe", required: false },
        { type: "level", name: "Premium/Discount", description: "Buy in discount (<50% of range), sell in premium (>50%)", required: true },
      ],
      stopLoss: { type: "structure", structureLevel: "Beyond supply/demand zone", description: "Place SL beyond the zone with 5-10 pip buffer" },
      tpTargets: [
        { type: "structure", structureLevel: "Next opposing zone", description: "Target next opposing supply/demand zone" },
        { type: "risk_reward", riskReward: 3, description: "Minimum 3R target" },
      ],
      tradeManagement: {
        breakevenTrigger: 30,
        trailingStop: false,
        maxHoldTime: 96,
      },
      exitRules: [
        { type: "condition_based", name: "Zone Breach", description: "Exit if price closes beyond SL zone" },
        { type: "time_based", name: "Weekly Review", description: "Review all open positions on Sunday" },
      ],
      newsRules: {
        avoidHighImpact: true,
        minutesBefore: 30,
        minutesAfter: 30,
        closeBeforeNews: false,
      },
      checklist: [
        { name: "Zone is fresh (untested)", required: true },
        { name: "Strong move originated from zone", required: true },
        { name: "Price in premium/discount area", required: true },
        { name: "Confirmation candle present", required: true },
        { name: "No major news pending", required: true },
      ],
      backtestingMetrics: {
        totalTrades: 124,
        winRate: 58.1,
        avgWin: 380,
        avgLoss: 160,
        profitFactor: 2.15,
        maxDrawdown: 7.2,
        sharpeRatio: 1.48,
        avgRR: 2.4,
      },
      notes: "Quality over quantity - only 1-2 setups per week per instrument. Fresh zones give best results. US30 and NAS100 can be volatile - reduce position size by 25%.",
    },
  });

  // Legacy strategies for backward compatibility
  const buyAndHoldStrategy = await prisma.strategy.upsert({
    where: { id: "strat_buy_hold" },
    update: {},
    create: {
      id: "strat_buy_hold",
      userId: user.id,
      name: "Buy and Hold",
      description: "Simple buy and hold strategy",
      riskPercent: 2,
      isActive: false,
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
      isActive: false,
    },
  });

  console.log("Created strategies:", ictStrategy, trendStrategy, breakoutStrategy, supplyDemandStrategy);

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
