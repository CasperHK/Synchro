import { Form, redirect, useNavigation } from 'react-router'
import { CreatePostSchema } from '@synchro/shared'
import { client } from '~/lib/api'
import type { Route } from './+types/posts.new'

// ── Action (server-side): validate → create → redirect ───────────────────
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()

  const raw = {
    title: formData.get('title') as string,
    body: formData.get('body') as string,
  }

  // Shared Zod schema validates on the server before the API call
  const result = CreatePostSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  await client.api.posts.$post({ json: result.data })
  return redirect('/')
}

// ── Page component ────────────────────────────────────────────────────────
export default function NewPost({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const errors = actionData?.errors

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
      <a href="/" style={{ color: '#6b7280', fontSize: '0.875rem' }}>
        ← Back to posts
      </a>

      <h1 style={{ marginTop: '1rem' }}>New Post</h1>

      <Form
        method="post"
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '1.5rem',
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="title" style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem' }}>
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Enter post title…"
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          {errors?.title && (
            <p style={{ color: '#ef4444', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
              {errors.title[0]}
            </p>
          )}
        </div>

        {/* Body */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="body" style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem' }}>
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={7}
            placeholder="Write your post content…"
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: '1rem',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          {errors?.body && (
            <p style={{ color: '#ef4444', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
              {errors.body[0]}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.625rem 1.5rem',
              fontWeight: 600,
              fontSize: '1rem',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Publishing…' : 'Publish'}
          </button>
          <a href="/">
            <button
              type="button"
              style={{
                background: 'none',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                padding: '0.625rem 1.25rem',
                fontSize: '1rem',
              }}
            >
              Cancel
            </button>
          </a>
        </div>
      </Form>
    </main>
  )
}
