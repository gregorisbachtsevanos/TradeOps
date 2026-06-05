import fs from "node:fs";
import path from "node:path";

type ModelName = "user" | "account" | "strategy" | "signal" | "trade" | "riskState";
type JsonRecord = Record<string, any>;
type QueryArgs = {
  where?: JsonRecord;
  data?: JsonRecord;
  orderBy?: JsonRecord;
  skip?: number;
  take?: number;
  include?: JsonRecord;
  create?: JsonRecord;
  update?: JsonRecord;
};

const modelFiles: Record<ModelName, string> = {
  user: "users.json",
  account: "accounts.json",
  strategy: "strategies.json",
  signal: "signals.json",
  trade: "trades.json",
  riskState: "riskStates.json",
};

const dateFields = new Set([
  "createdAt",
  "updatedAt",
  "timestamp",
  "processedAt",
  "entryTime",
  "exitTime",
  "date",
]);

class MockPrismaDelegate {
  constructor(
    private readonly modelName: ModelName,
    private readonly store: MockPrismaClient,
  ) {}

  async findUnique(args: QueryArgs): Promise<JsonRecord | null> {
    const item = this.getRows().find((row) => this.matchesWhere(row, args.where));
    return item ? this.withIncludes(item, args.include) : null;
  }

  async findFirst(args: QueryArgs): Promise<JsonRecord | null> {
    const rows = this.applyQuery(this.getRows(), args);
    return rows.length > 0 ? this.withIncludes(rows[0], args.include) : null;
  }

  async findMany(args: QueryArgs = {}): Promise<JsonRecord[]> {
    return this.applyQuery(this.getRows(), args).map((row) =>
      this.withIncludes(row, args.include),
    );
  }

  async count(args: QueryArgs = {}): Promise<number> {
    return this.applyQuery(this.getRows(), { where: args.where }).length;
  }

  async create(args: QueryArgs): Promise<JsonRecord> {
    const now = new Date();
    const row = {
      id: this.createId(this.modelName),
      ...this.defaultsForModel(now),
      ...args.data,
    };

    this.getRows().push(row);
    this.store.save(this.modelName);
    return this.withIncludes(row, args.include);
  }

  async update(args: QueryArgs): Promise<JsonRecord> {
    const rows = this.getRows();
    const index = rows.findIndex((row) => this.matchesWhere(row, args.where));

    if (index === -1) {
      throw new Error(`${this.modelName} record not found`);
    }

    rows[index] = {
      ...rows[index],
      ...this.applyUpdateOperators(rows[index], args.data || {}),
      ...(this.hasUpdatedAt() && { updatedAt: new Date() }),
    };

    this.store.save(this.modelName);
    return this.withIncludes(rows[index], args.include);
  }

  async delete(args: QueryArgs): Promise<JsonRecord> {
    const rows = this.getRows();
    const index = rows.findIndex((row) => this.matchesWhere(row, args.where));

    if (index === -1) {
      throw new Error(`${this.modelName} record not found`);
    }

    const [deleted] = rows.splice(index, 1);
    this.store.save(this.modelName);
    return deleted;
  }

  async upsert(args: QueryArgs): Promise<JsonRecord> {
    const existing = await this.findUnique({ where: args.where });

    if (existing) {
      return this.update({ where: args.where, data: args.update });
    }

    return this.create({ data: args.create });
  }

  private getRows() {
    return this.store.data[this.modelName];
  }

  private applyQuery(rows: JsonRecord[], args: QueryArgs) {
    let result = rows.filter((row) => this.matchesWhere(row, args.where));

    if (args.orderBy) {
      const [[field, direction]] = Object.entries(args.orderBy);
      result = [...result].sort((left, right) => {
        const leftValue = left[field];
        const rightValue = right[field];
        const comparison =
          leftValue instanceof Date && rightValue instanceof Date
            ? leftValue.getTime() - rightValue.getTime()
            : leftValue > rightValue
              ? 1
              : leftValue < rightValue
                ? -1
                : 0;

        return direction === "desc" ? -comparison : comparison;
      });
    }

    if (args.skip) {
      result = result.slice(args.skip);
    }

    if (args.take !== undefined) {
      result = result.slice(0, args.take);
    }

    return result;
  }

  private matchesWhere(row: JsonRecord, where: JsonRecord = {}): boolean {
    if (where.accountId_strategyId_date) {
      return this.matchesWhere(row, where.accountId_strategyId_date);
    }

    return Object.entries(where).every(([field, expected]) => {
      const actual = row[field];

      if (expected && typeof expected === "object" && !(expected instanceof Date)) {
        if ("gte" in expected && !this.compareDateOrValue(actual, expected.gte, ">=")) {
          return false;
        }
        if ("lte" in expected && !this.compareDateOrValue(actual, expected.lte, "<=")) {
          return false;
        }
        return true;
      }

      return actual === expected;
    });
  }

  private compareDateOrValue(actual: any, expected: any, operator: ">=" | "<=") {
    const actualValue = actual instanceof Date ? actual.getTime() : actual;
    const expectedValue = expected instanceof Date ? expected.getTime() : expected;
    return operator === ">=" ? actualValue >= expectedValue : actualValue <= expectedValue;
  }

  private withIncludes(row: JsonRecord, include?: JsonRecord) {
    const result = { ...row };

    if (!include) {
      return result;
    }

    if (include.strategy && this.modelName === "trade") {
      result.strategy =
        this.store.data.strategy.find((strategy) => strategy.id === row.strategyId) || null;
    }

    if (include.signal && this.modelName === "trade") {
      result.signal =
        this.store.data.signal.find((signal) => signal.id === row.signalId) || null;
    }

    if (include.account && this.modelName === "trade") {
      result.account =
        this.store.data.account.find((account) => account.id === row.accountId) || null;
    }

    if (include._count && this.modelName === "strategy") {
      result._count = {
        trades: this.store.data.trade.filter((trade) => trade.strategyId === row.id).length,
        signals: this.store.data.signal.filter((signal) => signal.strategyId === row.id).length,
      };
    }

    return result;
  }

  private applyUpdateOperators(row: JsonRecord, data: JsonRecord) {
    return Object.fromEntries(
      Object.entries(data).map(([field, value]) => {
        if (value && typeof value === "object" && "increment" in value) {
          return [field, row[field] + value.increment];
        }

        if (value && typeof value === "object" && "decrement" in value) {
          return [field, row[field] - value.decrement];
        }

        return [field, value];
      }),
    );
  }

  private defaultsForModel(now: Date) {
    if (this.modelName === "account") {
      return { exposure: 0, isActive: true, createdAt: now, updatedAt: now };
    }

    if (this.modelName === "strategy") {
      return { isActive: true, riskPercent: 2, createdAt: now, updatedAt: now };
    }

    if (this.modelName === "signal") {
      return { isDuplicate: false, processedAt: null, createdAt: now };
    }

    if (this.modelName === "trade") {
      return { commission: 0, pnl: null, pnlPercent: null, createdAt: now, updatedAt: now };
    }

    if (this.modelName === "riskState") {
      return {
        dailyPnL: 0,
        openTrades: 0,
        maxExposure: 0,
        breachedLimit: false,
        createdAt: now,
        updatedAt: now,
      };
    }

    return { createdAt: now, updatedAt: now };
  }

  private hasUpdatedAt() {
    return ["user", "account", "strategy", "trade", "riskState"].includes(this.modelName);
  }

  private createId(modelName: ModelName) {
    return `${modelName}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export class MockPrismaClient {
  readonly data: Record<ModelName, JsonRecord[]>;
  readonly user = new MockPrismaDelegate("user", this);
  readonly account = new MockPrismaDelegate("account", this);
  readonly strategy = new MockPrismaDelegate("strategy", this);
  readonly signal = new MockPrismaDelegate("signal", this);
  readonly trade = new MockPrismaDelegate("trade", this);
  readonly riskState = new MockPrismaDelegate("riskState", this);

  private readonly dataDir = path.resolve(process.cwd(), "mock-data");

  constructor() {
    this.ensureFiles();
    this.data = Object.fromEntries(
      Object.entries(modelFiles).map(([modelName, fileName]) => [
        modelName,
        this.readFile(fileName),
      ]),
    ) as Record<ModelName, JsonRecord[]>;
  }

  save(modelName: ModelName) {
    const filePath = path.join(this.dataDir, modelFiles[modelName]);
    fs.writeFileSync(filePath, `${JSON.stringify(this.data[modelName], null, 2)}\n`);
  }

  private ensureFiles() {
    fs.mkdirSync(this.dataDir, { recursive: true });

    for (const fileName of Object.values(modelFiles)) {
      const filePath = path.join(this.dataDir, fileName);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]\n");
      }
    }
  }

  private readFile(fileName: string) {
    const filePath = path.join(this.dataDir, fileName);
    const rows = JSON.parse(fs.readFileSync(filePath, "utf8")) as JsonRecord[];
    return rows.map((row) => this.deserializeDates(row));
  }

  private deserializeDates(row: JsonRecord) {
    return Object.fromEntries(
      Object.entries(row).map(([field, value]) => [
        field,
        dateFields.has(field) && value ? new Date(value) : value,
      ]),
    );
  }
}
