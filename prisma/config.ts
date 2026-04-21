import path from "node:path";
import type { PrismaConfig } from "prisma";

export default {
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
  },
} satisfies PrismaConfig;
