import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
export function ConfirmDeleteDialog({ open, title, pending = false, onConfirm, onCancel, }) {
    if (!open)
        return null;
    return (_jsx("div", { role: "dialog", "aria-modal": "true", "aria-label": "Confirm delete", style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
            zIndex: 1000,
        }, onClick: onCancel, children: _jsxs("div", { style: {
                width: 'min(460px, 100%)',
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                padding: '1rem 1rem 0.9rem',
            }, onClick: (e) => e.stopPropagation(), children: [_jsx("h2", { style: { margin: '0 0 0.5rem', fontSize: '1.1rem' }, children: "Delete post?" }), _jsxs("p", { style: { margin: 0, color: '#4b5563', lineHeight: 1.5 }, children: ["This action cannot be undone.", title ? (_jsxs(_Fragment, { children: [' ', "Delete ", _jsx("strong", { children: title }), "?"] })) : null] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }, children: [_jsx("button", { type: "button", onClick: onCancel, disabled: pending, style: {
                                background: 'none',
                                border: '1px solid #d1d5db',
                                borderRadius: 8,
                                padding: '0.45rem 0.8rem',
                                cursor: pending ? 'default' : 'pointer',
                            }, children: "Cancel" }), _jsx("button", { type: "button", onClick: () => void onConfirm(), disabled: pending, style: {
                                background: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '0.45rem 0.8rem',
                                cursor: pending ? 'default' : 'pointer',
                                opacity: pending ? 0.8 : 1,
                            }, children: pending ? 'Deleting...' : 'Delete' })] })] }) }));
}
