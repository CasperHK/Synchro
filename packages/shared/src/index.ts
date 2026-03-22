import { z } from 'zod'

// ── Post ─────────────────────────────────────────────────────────────────────

export const PostSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  createdAt: z.coerce.date(),
})

export type Post = z.infer<typeof PostSchema>

// ── CreatePost ────────────────────────────────────────────────────────────────

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
})

export type CreatePost = z.infer<typeof CreatePostSchema>
