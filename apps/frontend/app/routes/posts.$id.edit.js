import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Form, redirect, useNavigation } from 'react-router';
import { dehydrate, HydrationBoundary, QueryClient, useQuery } from '@tanstack/react-query';
import { UpdatePostSchema } from '@synchro/shared';
import { client } from '~/lib/api';
async function fetchPost(id) {
    const res = await client.api.posts[':id'].$get({ param: { id: String(id) } });
    if (!res.ok)
        throw new Response('Not found', { status: 404 });
    return res.json();
}
// ── Loader ────────────────────────────────────────────────────────────────
export async function loader({ params }) {
    const id = Number(params.id);
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({ queryKey: ['posts', id], queryFn: () => fetchPost(id) });
    return { id, dehydratedState: dehydrate(queryClient) };
}
// ── Action ────────────────────────────────────────────────────────────────
export async function action({ request, params }) {
    const id = Number(params.id);
    const formData = await request.formData();
    const raw = {
        title: formData.get('title'),
        body: formData.get('body'),
        status: formData.get('status'),
    };
    const result = UpdatePostSchema.safeParse(raw);
    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors };
    }
    await client.api.posts[':id'].$put({ param: { id: String(id) }, json: result.data });
    return redirect(`/posts/${id}`);
}
// ── Page ──────────────────────────────────────────────────────────────────
export default function EditPost({ loaderData }) {
    const { id, dehydratedState } = loaderData;
    return (_jsx(HydrationBoundary, { state: dehydratedState, children: _jsx(EditPostForm, { id: id }) }));
}
function EditPostForm({ id }) {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';
    const { data: post } = useQuery({
        queryKey: ['posts', id],
        queryFn: () => fetchPost(id),
    });
    // actionData is only available via the outer component props — use a helper
    const errors = undefined;
    if (!post)
        return _jsx("p", { style: { padding: '2rem', color: '#6b7280' }, children: "Loading\u2026" });
    return (_jsxs("main", { style: { maxWidth: 640, margin: '0 auto', padding: '2rem' }, children: [_jsx("a", { href: `/posts/${id}`, style: { color: '#6b7280', fontSize: '0.875rem' }, children: "\u2190 Back to post" }), _jsx("h1", { style: { marginTop: '1rem' }, children: "Edit Post" }), _jsxs(Form, { method: "post", style: {
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: '1.5rem',
                }, children: [_jsxs("div", { style: { marginBottom: '1.25rem' }, children: [_jsx("label", { htmlFor: "title", style: { display: 'block', fontWeight: 600, marginBottom: '0.375rem' }, children: "Title" }), _jsx("input", { id: "title", name: "title", type: "text", defaultValue: post.title, style: {
                                    width: '100%',
                                    padding: '0.625rem 0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: 8,
                                    fontSize: '1rem',
                                } }), errors?.title && (_jsx("p", { style: { color: '#ef4444', margin: '0.25rem 0 0', fontSize: '0.875rem' }, children: errors.title[0] }))] }), _jsxs("div", { style: { marginBottom: '1.25rem' }, children: [_jsx("label", { htmlFor: "body", style: { display: 'block', fontWeight: 600, marginBottom: '0.375rem' }, children: "Body" }), _jsx("textarea", { id: "body", name: "body", rows: 7, defaultValue: post.body, style: {
                                    width: '100%',
                                    padding: '0.625rem 0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: 8,
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                } }), errors?.body && (_jsx("p", { style: { color: '#ef4444', margin: '0.25rem 0 0', fontSize: '0.875rem' }, children: errors.body[0] }))] }), _jsxs("div", { style: { marginBottom: '1.5rem' }, children: [_jsx("label", { htmlFor: "status", style: { display: 'block', fontWeight: 600, marginBottom: '0.375rem' }, children: "Status" }), _jsxs("select", { id: "status", name: "status", defaultValue: post.status, style: {
                                    padding: '0.625rem 0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: 8,
                                    fontSize: '1rem',
                                    background: '#fff',
                                }, children: [_jsx("option", { value: "published", children: "Published" }), _jsx("option", { value: "draft", children: "Draft" })] })] }), _jsxs("div", { style: { display: 'flex', gap: '0.75rem' }, children: [_jsx("button", { type: "submit", disabled: isSubmitting, style: {
                                    background: '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '0.625rem 1.5rem',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    opacity: isSubmitting ? 0.7 : 1,
                                    cursor: 'pointer',
                                }, children: isSubmitting ? 'Saving…' : 'Save changes' }), _jsx("a", { href: `/posts/${id}`, children: _jsx("button", { type: "button", style: {
                                        background: 'none',
                                        border: '1px solid #d1d5db',
                                        borderRadius: 8,
                                        padding: '0.625rem 1.25rem',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                    }, children: "Cancel" }) })] })] })] }));
}
