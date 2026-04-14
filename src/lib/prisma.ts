// Lazy Prisma client — nothing from `@prisma/client` or `@prisma/adapter-pg`
// is imported at the top level, so this file has zero side effects at
// module-load time. Next.js's "Collecting page data" build step can import
// API route modules without ever instantiating Prisma (or its pg adapter),
// which avoids "Failed to collect page data" errors when DATABASE_URL is
// absent at build time.
//
// Real construction happens on first property access at runtime.

import type { PrismaClient as PrismaClientType } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

function getClient(): PrismaClientType {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // Dynamic require keeps these out of the build-time import graph for routes.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg") as typeof import("@prisma/adapter-pg");

  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://placeholder:placeholder@localhost:5432/placeholder";

  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });

  globalForPrisma.prisma = client;
  return client;
}

export const prisma: PrismaClientType = new Proxy({} as PrismaClientType, {
  get(_target, prop) {
    const c = getClient() as unknown as Record<string | symbol, unknown>;
    const value = c[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(c)
      : value;
  },
});
