import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { DehydratedState } from '@tanstack/react-query'
import type { Post } from '@synchro/shared'
import { client } from '~/lib/api'
import { formatUtcDateTime } from '~/lib/date'
import type { Route } from './+types/posts.$id'

type LoaderData = { id: number; dehydratedState: DehydratedState }

async function fetchPost(id: number): Promise<Post> {
  const res = await client.api.posts[':id'].$get({ param: { id: String(id) } })
  if (!res.ok) throw new Response('Not found', { status: 404 })
  return res.json() as unknown as Post
}

export async function loader({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({ queryKey: ['posts', id], queryFn: () => fetchPost(id) })
  return { id, dehydratedState: dehydrate(queryClient) as unknown } as unknown as LoaderData
}

export default function PostDetail({ loaderData }: Route.ComponentProps) {
  const { id, dehydratedState } = loaderData as unknown as LoaderData
  return (
    <HydrationBoundary state={dehydratedState}>
      <PostDetailView id={id} />
    </HydrationBoundary>
  )
}

function PostDetailView({ id }: { id: number }) {
  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ['posts', id],
    queryFn: () => fetchPost(id),
  })

  if (isLoading || !post) {
    return (
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem' }}>
        <p style={{ color: '#6b7280' }}>Loading…</p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem' }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#6b7280', fontSize: '0.875rem' }}>← All posts</Link>
        <Link to={`/posts/${post.id}/edit`}>
          <button
            style={{
              background: 'none',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              padding: '0.35rem 1rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
        </Link>
      </div>

      {/* Post */}
      <article
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <StatusBadge status={post.status} />
        </div>
        <h1 style={{ margin: '0 0 1rem', fontSize: '1.75rem', lineHeight: 1.2 }}>{post.title}</h1>
        <p
          style={{
            margin: '0 0 1.5rem',
            color: '#374151',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}
        >
          {post.body}
        </p>
        <small style={{ color: '#9ca3af' }}>
          Published {formatUtcDateTime(post.createdAt)} UTC
        </small>
      </article>
    </main>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const isDraft = status === 'draft'
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '0.2rem 0.6rem',
        borderRadius: 999,
        background: isDraft ? '#fef9c3' : '#dcfce7',
        color: isDraft ? '#92400e' : '#166534',
        border: `1px solid ${isDraft ? '#fde68a' : '#bbf7d0'}`,
      }}
    >
      {isDraft ? 'Draft' : 'Published'}
    </span>
  )
}
