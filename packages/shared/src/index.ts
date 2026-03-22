import { z } from 'zod'

// ── Shared enums ──────────────────────────────────────────────────────────────

export const PostStatusSchema = z.enum(['draft', 'published'])
export type PostStatus = z.infer<typeof PostStatusSchema>

// ── Post ─────────────────────────────────────────────────────────────────────

export const PostSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  status: PostStatusSchema,
  createdAt: z.coerce.date(),
})

export type Post = z.infer<typeof PostSchema>

// ── CreatePost ────────────────────────────────────────────────────────────────

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  status: PostStatusSchema.default('published'),
})

export type CreatePost = z.infer<typeof CreatePostSchema>

// ── UpdatePost ────────────────────────────────────────────────────────────────

export const UpdatePostSchema = CreatePostSchema.partial()
export type UpdatePost = z.infer<typeof UpdatePostSchema>
