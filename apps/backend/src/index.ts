import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import postsRouter from './routes/posts'
import { db } from './lib/prisma'
import { getPrismaErrorCode, getPrismaFriendlyMessage } from './lib/prisma-error'

const app = new Hono()

app.onError((error, c) => {
  const prismaCode = getPrismaErrorCode(error)

  if (prismaCode) {
    if (prismaCode === 'P6001') {
      console.error('[Prisma:P6001] Prisma client/runtime mismatch. Regenerate client and restart dev server.')
    } else {
      console.error(`[Prisma:${prismaCode}]`, error)
    }

    return c.json(
      {
        ok: false,
        code: prismaCode,
        error: getPrismaFriendlyMessage(prismaCode),
      },
      500
    )
  }

  console.error('[UnhandledError]', error)
  return c.json({ ok: false, error: 'Internal server error' }, 500)
})

app.use('*', logger())
app.use(
  '/api/*',
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://127.0.0.1:5173',
    allowMethods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
  })
)

// ── API routes ─────────────────────────────────────────────────────────────
const routes = app
  .route('/api/posts', postsRouter)
  .get('/api/health', async (c) => {
    try {
      await db.$queryRaw`SELECT 1`
      return c.json({ ok: true, db: 'connected' })
    } catch {
      return c.json({ ok: false, db: 'disconnected' }, 503)
    }
  })

// ── Static frontend in production ──────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use('/assets/*', serveStatic({ root: './apps/frontend/build/client' }))
  app.get('*', serveStatic({ path: './apps/frontend/build/client/index.html' }))
}

// ── Export type for Hono RPC client ───────────────────────────────────────
export type AppType = typeof routes

const port = Number(process.env.PORT ?? 3001)
console.log(`🚀 Backend running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
