import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { client } from '~/lib/api';
import { formatUtcDateTime } from '~/lib/date';
async function fetchPost(id) {
    const res = await client.api.posts[':id'].$get({ param: { id: String(id) } });
    if (!res.ok)
        throw new Response('Not found', { status: 404 });
    return res.json();
}
export async function loader({ params }) {
    const id = Number(params.id);
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({ queryKey: ['posts', id], queryFn: () => fetchPost(id) });
    return { id, dehydratedState: dehydrate(queryClient) };
}
export default function PostDetail({ loaderData }) {
    const { id, dehydratedState } = loaderData;
    return (_jsx(HydrationBoundary, { state: dehydratedState, children: _jsx(PostDetailView, { id: id }) }));
}
function PostDetailView({ id }) {
    const { data: post, isLoading } = useQuery({
        queryKey: ['posts', id],
        queryFn: () => fetchPost(id),
    });
    if (isLoading || !post) {
        return (_jsx("main", { style: { maxWidth: 680, margin: '0 auto', padding: '2rem' }, children: _jsx("p", { style: { color: '#6b7280' }, children: "Loading\u2026" }) }));
    }
    return (_jsxs("main", { style: { maxWidth: 680, margin: '0 auto', padding: '2rem' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }, children: [_jsx(Link, { to: "/", style: { color: '#6b7280', fontSize: '0.875rem' }, children: "\u2190 All posts" }), _jsx(Link, { to: `/posts/${post.id}/edit`, children: _jsx("button", { style: {
                                background: 'none',
                                border: '1px solid #d1d5db',
                                borderRadius: 8,
                                padding: '0.35rem 1rem',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                            }, children: "Edit" }) })] }), _jsxs("article", { style: {
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: '2rem',
                }, children: [_jsx("div", { style: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }, children: _jsx(StatusBadge, { status: post.status }) }), _jsx("h1", { style: { margin: '0 0 1rem', fontSize: '1.75rem', lineHeight: 1.2 }, children: post.title }), _jsx("p", { style: {
                            margin: '0 0 1.5rem',
                            color: '#374151',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap',
                        }, children: post.body }), _jsxs("small", { style: { color: '#9ca3af' }, children: ["Published ", formatUtcDateTime(post.createdAt), " UTC"] })] })] }));
}
export function StatusBadge({ status }) {
    const isDraft = status === 'draft';
    return (_jsx("span", { style: {
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            borderRadius: 999,
            background: isDraft ? '#fef9c3' : '#dcfce7',
            color: isDraft ? '#92400e' : '#166534',
            border: `1px solid ${isDraft ? '#fde68a' : '#bbf7d0'}`,
        }, children: isDraft ? 'Draft' : 'Published' }));
}
