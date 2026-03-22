import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import postsRouter from './routes/posts'
import { db } from './lib/prisma'

const app = new Hono()

app.use('*', logger())
app.use(
  '/api/*',
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
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
