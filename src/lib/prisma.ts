import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  // Prisma 7 requires either a driver adapter OR a `url` in the schema.
  // Our schema has no url, so we always pass an adapter. A placeholder
  // connection string keeps construction from throwing at module-load on
  // Vercel's "collecting page data" step when DATABASE_URL isn't injected;
  // any real query will only succeed once the env var is set at runtime.
  const adapter = new PrismaPg({
    connectionString: connectionString || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  });
  return new PrismaClient({ adapter });
}

// Lazy proxy so `new PrismaClient` isn't called until a property is accessed.
// This keeps `import { prisma }` side-effect free for Next.js's build-time
// route introspection.
function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const c = getClient() as unknown as Record<string | symbol, unknown>;
    const value = c[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(c)
      : value;
  },
});
