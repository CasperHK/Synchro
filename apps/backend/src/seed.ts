import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

await db.post.createMany({
  data: [
    {
      title: 'Welcome to Synchro Stack',
      body: 'This is a zero-hallucination fullstack demo built with Hono RPC, React Router v7 SSR, TanStack Query, Prisma + SQLite, and shared Zod schemas. Every type flows from a single source of truth.',
      status: 'published',
    },
    {
      title: 'Why Shared Zod Schemas Matter',
      body: 'By defining PostSchema once in packages/shared, both the backend validator and the frontend form stay in sync automatically. Rename a field — every consumer breaks at the TypeScript level, not at runtime.',
      status: 'published',
    },
    {
      title: 'Hono RPC: No More Guessing',
      body: 'hc<AppType> gives you 100% typed path segments, HTTP methods, and request payloads. If you typo a route or pass the wrong body shape, tsc catches it before your code runs.',
      status: 'published',
    },
    {
      title: 'Draft post: Upcoming features',
      body: 'TODO: add pagination with cursor-based navigation, tag filtering, and an RSS feed endpoint. This post is intentionally left as a draft.',
      status: 'draft',
    },
  ],
})

console.log('✅ Seeded 4 posts')
await db.$disconnect()
