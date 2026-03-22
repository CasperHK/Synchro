import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Form, redirect, useNavigation } from 'react-router';
import { CreatePostSchema } from '@synchro/shared';
import { client } from '~/lib/api';
// ── Action (server-side): validate → create → redirect ───────────────────
export async function action({ request }) {
    const formData = await request.formData();
    const raw = {
        title: formData.get('title'),
        body: formData.get('body'),
    };
    // Shared Zod schema validates on the server before the API call
    const result = CreatePostSchema.safeParse(raw);
    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors };
    }
    await client.api.posts.$post({ json: result.data });
    return redirect('/');
}
// ── Page component ────────────────────────────────────────────────────────
export default function NewPost({ actionData }) {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';
    const errors = actionData?.errors;
    return (_jsxs("main", { style: { maxWidth: 640, margin: '0 auto', padding: '2rem' }, children: [_jsx("a", { href: "/", style: { color: '#6b7280', fontSize: '0.875rem' }, children: "\u2190 Back to posts" }), _jsx("h1", { style: { marginTop: '1rem' }, children: "New Post" }), _jsxs(Form, { method: "post", style: {
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: '1.5rem',
                }, children: [_jsxs("div", { style: { marginBottom: '1.25rem' }, children: [_jsx("label", { htmlFor: "title", style: { display: 'block', fontWeight: 600, marginBottom: '0.375rem' }, children: "Title" }), _jsx("input", { id: "title", name: "title", type: "text", placeholder: "Enter post title\u2026", style: {
                                    width: '100%',
                                    padding: '0.625rem 0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: 8,
                                    fontSize: '1rem',
                                    outline: 'none',
                                } }), errors?.title && (_jsx("p", { style: { color: '#ef4444', margin: '0.25rem 0 0', fontSize: '0.875rem' }, children: errors.title[0] }))] }), _jsxs("div", { style: { marginBottom: '1.5rem' }, children: [_jsx("label", { htmlFor: "body", style: { display: 'block', fontWeight: 600, marginBottom: '0.375rem' }, children: "Body" }), _jsx("textarea", { id: "body", name: "body", rows: 7, placeholder: "Write your post content\u2026", style: {
                                    width: '100%',
                                    padding: '0.625rem 0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: 8,
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                } }), errors?.body && (_jsx("p", { style: { color: '#ef4444', margin: '0.25rem 0 0', fontSize: '0.875rem' }, children: errors.body[0] }))] }), _jsxs("div", { style: { marginBottom: '1.5rem' }, children: [_jsx("label", { htmlFor: "status", style: { display: 'block', fontWeight: 600, marginBottom: '0.375rem' }, children: "Status" }), _jsxs("select", { id: "status", name: "status", defaultValue: "published", style: {
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
                                }, children: isSubmitting ? 'Publishing…' : 'Publish' }), _jsx("a", { href: "/", children: _jsx("button", { type: "button", style: {
                                        background: 'none',
                                        border: '1px solid #d1d5db',
                                        borderRadius: 8,
                                        padding: '0.625rem 1.25rem',
                                        fontSize: '1rem',
                                    }, children: "Cancel" }) })] })] })] }));
}
