import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { CreatePostSchema, UpdatePostSchema } from '@synchro/shared'
import { db } from '../lib/prisma'

// Method-chaining preserves the full type for Hono RPC inference
const posts = new Hono()
  // List — optional ?q=search and ?status=draft|published filters
  .get('/', async (c) => {
    const q = c.req.query('q')?.trim()
    const status = c.req.query('status')
    const rows = await db.post.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { body: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
    return c.json(rows)
  })
  // Single post
  .get('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    const post = await db.post.findUnique({ where: { id } })
    if (!post) return c.json({ error: 'Not found' }, 404)
    return c.json(post)
  })
  // Create
  .post('/', zValidator('json', CreatePostSchema), async (c) => {
    const data = c.req.valid('json')
    const post = await db.post.create({ data })
    return c.json(post, 201)
  })
  // Update
  .put('/:id', zValidator('json', UpdatePostSchema), async (c) => {
    const id = Number(c.req.param('id'))
    const data = c.req.valid('json')
    const post = await db.post.update({ where: { id }, data })
    return c.json(post)
  })
  // Delete
  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'))
    await db.post.delete({ where: { id } })
    return c.json({ ok: true })
  })

export default posts
