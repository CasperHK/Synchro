import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Link } from 'react-router'
import { useState, useTransition } from 'react'
import type { Post } from '@synchro/shared'
import { client } from '~/lib/api'
import { formatUtcDateTime } from '~/lib/date'
import { StatusBadge } from './posts.$id'
import type { Route } from './+types/home'

// ── Shared fetch function ─────────────────────────────────────────────────
async function fetchPosts(q?: string, status?: string): Promise<Post[]> {
  const res = await client.api.posts.$get({
    query: {
      ...(q ? { q } : {}),
      ...(status ? { status } : {}),
    },
  })
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json() as unknown as Promise<Post[]>
}

// ── SSR Loader ────────────────────────────────────────────────────────────
export async function loader() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({ queryKey: ['posts', '', ''], queryFn: () => fetchPosts() })
  return { dehydratedState: dehydrate(queryClient) }
}

// ── Page component ────────────────────────────────────────────────────────
export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <HydrationBoundary state={loaderData.dehydratedState}>
      <PostList />
    </HydrationBoundary>
  )
}

// ── Post list ─────────────────────────────────────────────────────────────
function PostList() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [, startTransition] = useTransition()

  // Debounce search via React's low-priority startTransition
  const [debouncedSearch, setDebouncedSearch] = useState('')
  function handleSearch(value: string) {
    setSearch(value)
    startTransition(() => setDebouncedSearch(value))
  }

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', debouncedSearch, statusFilter],
    queryFn: () => fetchPosts(debouncedSearch || undefined, statusFilter || undefined),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await client.api.posts[':id'].$delete({ param: { id: String(id) } })
      if (!res.ok) throw new Error('Delete failed')
    },
    // Optimistic update: remove card instantly, roll back on error
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['posts'] })
      const previous = qc.getQueriesData<Post[]>({ queryKey: ['posts'] })
      qc.setQueriesData<Post[]>({ queryKey: ['posts'] }, (old) =>
        old ? old.filter((p) => p.id !== id) : []
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        for (const [key, data] of ctx.previous) qc.setQueryData(key, data)
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}
      >
        <h1 style={{ margin: 0 }}>📝 Synchro Blog</h1>
        <Link to="/posts/new">
          <button
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.5rem 1.25rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + New Post
          </button>
        </Link>
      </div>

      {/* Toolbar: search + status filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <input
          type="search"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '0.5rem 0.875rem',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: '0.9375rem',
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: '0.9375rem',
            background: '#fff',
          }}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <p style={{ color: '#6b7280' }}>Loading…</p>
      ) : posts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e5e7eb',
          }}
        >
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            {debouncedSearch || statusFilter ? 'No posts match your filters.' : 'No posts yet.'}
          </p>
          {!debouncedSearch && !statusFilter && (
            <Link to="/posts/new" style={{ color: '#2563eb', fontWeight: 600 }}>
              Create the first one →
            </Link>
          )}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {posts.map((post) => (
            <li
              key={post.id}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: '1.25rem 1.5rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <StatusBadge status={post.status} />
                  </div>
                  <Link to={`/posts/${post.id}`}>
                    <h2
                      style={{
                        margin: '0 0 0.5rem',
                        fontSize: '1.125rem',
                        color: '#1d4ed8',
                        textDecoration: 'underline',
                        textUnderlineOffset: 3,
                      }}
                    >
                      {post.title}
                    </h2>
                  </Link>
                  <p
                    style={{
                      margin: '0 0 0.75rem',
                      color: '#374151',
                      lineHeight: 1.6,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {post.body}
                  </p>
                  <small style={{ color: '#9ca3af' }}>
                    {formatUtcDateTime(post.createdAt)} UTC
                  </small>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'flex-start' }}>
                  <Link to={`/posts/${post.id}/edit`}>
                    <button
                      style={{
                        background: 'none',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => deleteMutation.mutate(post.id)}
                    disabled={deleteMutation.isPending}
                    style={{
                      background: 'none',
                      border: '1px solid #fca5a5',
                      color: '#ef4444',
                      borderRadius: 6,
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

