import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { dehydrate, HydrationBoundary, QueryClient, useMutation, useQuery, useQueryClient, } from '@tanstack/react-query';
import { Link } from 'react-router';
import { useState, useTransition } from 'react';
import { client } from '~/lib/api';
import { ConfirmDeleteDialog } from '~/components/ConfirmDeleteDialog';
import { formatUtcDateTime } from '~/lib/date';
import { StatusBadge } from './posts.$id';
// ── Shared fetch function ─────────────────────────────────────────────────
async function fetchPosts(q, status) {
    const res = await client.api.posts.$get({
        query: {
            ...(q ? { q } : {}),
            ...(status ? { status } : {}),
        },
    });
    if (!res.ok)
        throw new Error('Failed to fetch posts');
    return res.json();
}
// ── SSR Loader ────────────────────────────────────────────────────────────
export async function loader() {
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({ queryKey: ['posts', '', ''], queryFn: () => fetchPosts() });
    return { dehydratedState: dehydrate(queryClient) };
}
// ── Page component ────────────────────────────────────────────────────────
export default function Home({ loaderData }) {
    return (_jsx(HydrationBoundary, { state: loaderData.dehydratedState, children: _jsx(PostList, {}) }));
}
// ── Post list ─────────────────────────────────────────────────────────────
function PostList() {
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [deleteError, setDeleteError] = useState(null);
    const [postPendingDelete, setPostPendingDelete] = useState(null);
    const [, startTransition] = useTransition();
    // Debounce search via React's low-priority startTransition
    const [debouncedSearch, setDebouncedSearch] = useState('');
    function handleSearch(value) {
        setSearch(value);
        startTransition(() => setDebouncedSearch(value));
    }
    const { data: posts = [], isLoading } = useQuery({
        queryKey: ['posts', debouncedSearch, statusFilter],
        queryFn: () => fetchPosts(debouncedSearch || undefined, statusFilter || undefined),
    });
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await client.api.posts[':id'].$delete({ param: { id: String(id) } });
            if (!res.ok) {
                let message = `Delete failed (status ${res.status})`;
                try {
                    const contentType = res.headers.get('content-type') ?? '';
                    if (contentType.includes('application/json')) {
                        const payload = await res.json();
                        if (payload.error)
                            message = payload.error;
                    }
                    else {
                        const text = await res.text();
                        if (text)
                            message = text;
                    }
                }
                catch {
                    // Keep fallback message when response parsing fails.
                }
                throw new Error(message);
            }
        },
        // Optimistic update: remove card instantly, roll back on error
        onMutate: async (id) => {
            setDeleteError(null);
            await qc.cancelQueries({ queryKey: ['posts'] });
            const previous = qc.getQueriesData({ queryKey: ['posts'] });
            qc.setQueriesData({ queryKey: ['posts'] }, (old) => old ? old.filter((p) => p.id !== id) : []);
            return { previous };
        },
        onError: (err, _id, ctx) => {
            setDeleteError(err instanceof Error ? err.message : 'Delete failed');
            if (ctx?.previous) {
                for (const [key, data] of ctx.previous)
                    qc.setQueryData(key, data);
            }
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ['posts'] }),
    });
    async function handleDelete(event, id) {
        event.preventDefault();
        event.stopPropagation();
        const post = posts.find((p) => p.id === id);
        if (!post)
            return;
        setPostPendingDelete({ id: post.id, title: post.title });
    }
    async function confirmDelete() {
        if (!postPendingDelete)
            return;
        await deleteMutation.mutateAsync(postPendingDelete.id);
        setPostPendingDelete(null);
    }
    return (_jsxs("main", { style: { maxWidth: 680, margin: '0 auto', padding: '2rem' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }, children: [_jsx("h1", { style: { margin: 0 }, children: "\uD83D\uDCDD Synchro Blog" }), _jsx(Link, { to: "/posts/new", children: _jsx("button", { type: "button", style: {
                                background: '#2563eb',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '0.5rem 1.25rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }, children: "+ New Post" }) })] }), _jsxs("div", { style: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }, children: [_jsx("input", { type: "search", placeholder: "Search posts\u2026", value: search, onChange: (e) => handleSearch(e.target.value), style: {
                            flex: 1,
                            padding: '0.5rem 0.875rem',
                            border: '1px solid #d1d5db',
                            borderRadius: 8,
                            fontSize: '0.9375rem',
                        } }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), style: {
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: 8,
                            fontSize: '0.9375rem',
                            background: '#fff',
                        }, children: [_jsx("option", { value: "", children: "All statuses" }), _jsx("option", { value: "published", children: "Published" }), _jsx("option", { value: "draft", children: "Draft" })] })] }), deleteError && (_jsx("p", { style: {
                    color: '#b91c1c',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: 8,
                    padding: '0.625rem 0.75rem',
                    marginBottom: '1rem',
                }, children: deleteError })), isLoading ? (_jsx("p", { style: { color: '#6b7280' }, children: "Loading\u2026" })) : posts.length === 0 ? (_jsxs("div", { style: {
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                }, children: [_jsx("p", { style: { color: '#6b7280', fontSize: '1.125rem' }, children: debouncedSearch || statusFilter ? 'No posts match your filters.' : 'No posts yet.' }), !debouncedSearch && !statusFilter && (_jsx(Link, { to: "/posts/new", style: { color: '#2563eb', fontWeight: 600 }, children: "Create the first one \u2192" }))] })) : (_jsx("ul", { style: { listStyle: 'none', padding: 0, margin: 0 }, children: posts.map((post) => (_jsx("li", { style: {
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 12,
                        padding: '1.25rem 1.5rem',
                        marginBottom: '1rem',
                    }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: '1rem' }, children: [_jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.375rem' }, children: _jsx(StatusBadge, { status: post.status }) }), _jsx(Link, { to: `/posts/${post.id}`, children: _jsx("h2", { style: {
                                                margin: '0 0 0.5rem',
                                                fontSize: '1.125rem',
                                                color: '#1d4ed8',
                                                textDecoration: 'underline',
                                                textUnderlineOffset: 3,
                                            }, children: post.title }) }), _jsx("p", { style: {
                                            margin: '0 0 0.75rem',
                                            color: '#374151',
                                            lineHeight: 1.6,
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }, children: post.body }), _jsxs("small", { style: { color: '#9ca3af' }, children: [formatUtcDateTime(post.createdAt), " UTC"] })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'flex-start' }, children: [_jsx(Link, { to: `/posts/${post.id}/edit`, children: _jsx("button", { type: "button", style: {
                                                background: 'none',
                                                border: '1px solid #d1d5db',
                                                borderRadius: 6,
                                                padding: '0.25rem 0.75rem',
                                                fontSize: '0.875rem',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                            }, children: "Edit" }) }), _jsx("button", { type: "button", onClick: (e) => void handleDelete(e, post.id), disabled: deleteMutation.isPending, style: {
                                            background: 'none',
                                            border: '1px solid #fca5a5',
                                            color: '#ef4444',
                                            borderRadius: 6,
                                            padding: '0.25rem 0.75rem',
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                        }, children: deleteMutation.isPending ? 'Deleting...' : 'Delete' })] })] }) }, post.id))) })), _jsx(ConfirmDeleteDialog, { open: Boolean(postPendingDelete), title: postPendingDelete?.title, pending: deleteMutation.isPending, onCancel: () => {
                    if (deleteMutation.isPending)
                        return;
                    setPostPendingDelete(null);
                }, onConfirm: confirmDelete })] }));
}
