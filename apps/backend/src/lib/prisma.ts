import { PrismaClient } from '@prisma/client'

// Singleton — prevents multiple PrismaClient instances during hot-reload
const globalForPrisma = globalThis as unknown as { db: PrismaClient }

export const db = globalForPrisma.db ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.db = db
}
