import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Link } from 'react-router'
import type { Post } from '@synchro/shared'
import { client } from '~/lib/api'
import type { Route } from './+types/home'

// ── Shared fetch function (used by both loader and useQuery) ─────────────
async function fetchPosts(): Promise<Post[]> {
  const res = await client.api.posts.$get()
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json() as Promise<Post[]>
}

// ── SSR Loader: prefetch posts so the page renders with data immediately ─
export async function loader() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({ queryKey: ['posts'], queryFn: fetchPosts })
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

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await client.api.posts[':id'].$delete({ param: { id: String(id) } })
      if (!res.ok) throw new Error('Delete failed')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}
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
            }}
          >
            + New Post
          </button>
        </Link>
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
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>No posts yet.</p>
          <Link to="/posts/new" style={{ color: '#2563eb', fontWeight: 600 }}>
            Create the first one →
          </Link>
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
                  <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem' }}>{post.title}</h2>
                  <p style={{ margin: '0 0 0.75rem', color: '#374151', lineHeight: 1.6 }}>{post.body}</p>
                  <small style={{ color: '#9ca3af' }}>
                    {new Date(post.createdAt).toLocaleString()}
                  </small>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(post.id)}
                  disabled={deleteMutation.isPending}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'none',
                    border: '1px solid #fca5a5',
                    color: '#ef4444',
                    borderRadius: 6,
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.875rem',
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
