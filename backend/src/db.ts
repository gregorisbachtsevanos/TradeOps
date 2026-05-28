import { createRequire } from "node:module";
import { MockPrismaClient } from "./mockPrisma.js";

const isMockDataMode = process.env.MOCK_DATA === "true";

const prismaClientSingleton = () => {
  if (isMockDataMode) {
    return new MockPrismaClient();
  }

  const require = createRequire(import.meta.url);
  const { PrismaClient } = require("@prisma/client");
  return new PrismaClient();
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma: MockPrismaClient = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
