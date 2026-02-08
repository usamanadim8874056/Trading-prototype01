import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Vercel Workaround for SQLite
let prismaClient: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const tmpDbPath = "/tmp/dev.db";

  // If running on Vercel and using SQLite, copoy DB to /tmp
  if (fs.existsSync(dbPath)) {
    try {
      if (!fs.existsSync(tmpDbPath)) {
        fs.copyFileSync(dbPath, tmpDbPath);
        console.log("Copied dev.db to /tmp/dev.db");
      }
      process.env.DATABASE_URL = `file:${tmpDbPath}`;
    } catch (error) {
      console.error("Failed to copy db to /tmp:", error);
    }
  }

  prismaClient = new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
} else {
  // Local development
  prismaClient = new PrismaClient({
    log: ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
