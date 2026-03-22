import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { CreatePostSchema } from '@synchro/shared'
import { db } from '../lib/prisma'

// Method-chaining preserves the full type for Hono RPC inference
const posts = new Hono()
  .get('/', async (c) => {
    const rows = await db.post.findMany({ orderBy: { createdAt: 'desc' } })
    return c.json(rows)
  })
  .post('/', zValidator('json', CreatePostSchema), async (c) => {
    const data = c.req.valid('json')
    const post = await db.post.create({ data })
    return c.json(post, 201)
  })
  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    await db.post.delete({ where: { id } })
    return c.json({ ok: true })
  })

export default posts
