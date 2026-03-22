type PrismaLikeError = {
  code?: string
  message?: string
}

export function getPrismaErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null
  const maybe = error as PrismaLikeError
  return typeof maybe.code === 'string' ? maybe.code : null
}

export function getPrismaFriendlyMessage(code: string): string {
  if (code === 'P6001') {
    return 'Prisma client/runtime mismatch detected. Stop dev servers and run: bun run db:generate, then restart bun run dev.'
  }

  return `Prisma error: ${code}`
}
