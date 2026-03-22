import { hc } from 'hono/client'
import type { AppType } from '@synchro/backend'

// On the server (SSR loader) we must use an absolute URL.
// On the client (browser) we use the origin so Vite's proxy forwards /api to port 3001.
const BASE_URL =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:3001')
    : window.location.origin

export const client = hc<AppType>(BASE_URL)
