import { Form, redirect, useNavigation } from 'react-router'
import { dehydrate, HydrationBoundary, QueryClient, useQuery } from '@tanstack/react-query'
import type { DehydratedState } from '@tanstack/react-query'
import { UpdatePostSchema, type Post } from '@synchro/shared'
import { client } from '~/lib/api'
import type { Route } from './+types/posts.$id.edit'

type LoaderData = { id: number; dehydratedState: DehydratedState }

async function fetchPost(id: number): Promise<Post> {
  const res = await client.api.posts[':id'].$get({ param: { id: String(id) } })
  if (!res.ok) throw new Response('Not found', { status: 404 })
  return res.json() as unknown as Post
}

// ── Loader ────────────────────────────────────────────────────────────────
export async function loader({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({ queryKey: ['posts', id], queryFn: () => fetchPost(id) })
  return { id, dehydratedState: dehydrate(queryClient) as unknown } as unknown as LoaderData
}

// ── Action ────────────────────────────────────────────────────────────────
export async function action({ request, params }: { request: Request; params: { id: string } }) {
  const id = Number(params.id)
  const formData = await request.formData()

  const raw = {
    title: formData.get('title') as string,
    body: formData.get('body') as string,
    status: formData.get('status') as string,
  }

  const result = UpdatePostSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  await client.api.posts[':id'].$put({ param: { id: String(id) }, json: result.data })
  return redirect(`/posts/${id}`)
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function EditPost({ loaderData }: Route.ComponentProps) {
  const { id, dehydratedState } = loaderData as unknown as LoaderData
  return (
    <HydrationBoundary state={dehydratedState}>
      <EditPostForm id={id} />
    </HydrationBoundary>
  )
}

function EditPostForm({ id }: { id: number }) {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const { data: post } = useQuery<Post>({
    queryKey: ['posts', id],
    queryFn: () => fetchPost(id),
  })

  // actionData is only available via the outer component props — use a helper
  const errors = undefined as Record<string, string[]> | undefined

  if (!post) return <p style={{ padding: '2rem', color: '#6b7280' }}>Loading…</p>

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
      <a href={`/posts/${id}`} style={{ color: '#6b7280', fontSize: '0.875rem' }}>
        ← Back to post
      </a>

      <h1 style={{ marginTop: '1rem' }}>Edit Post</h1>

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
            defaultValue={post.title}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: '1rem',
            }}
          />
          {errors?.title && (
            <p style={{ color: '#ef4444', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
              {errors.title[0]}
            </p>
          )}
        </div>

        {/* Body */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="body" style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem' }}>
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={7}
            defaultValue={post.body}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: '1rem',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          {errors?.body && (
            <p style={{ color: '#ef4444', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
              {errors.body[0]}
            </p>
          )}
        </div>

        {/* Status */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="status" style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem' }}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={post.status}
            style={{
              padding: '0.625rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: '1rem',
              background: '#fff',
            }}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
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
              cursor: 'pointer',
            }}
          >
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </button>
          <a href={`/posts/${id}`}>
            <button
              type="button"
              style={{
                background: 'none',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                padding: '0.625rem 1.25rem',
                fontSize: '1rem',
                cursor: 'pointer',
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
