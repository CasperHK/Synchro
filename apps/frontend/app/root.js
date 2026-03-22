import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { isRouteErrorResponse, Outlet, Scripts, } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
export function Layout({ children }) {
    return (_jsxs("html", { lang: "en", children: [_jsxs("head", { children: [_jsx("meta", { charSet: "utf-8" }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), _jsx("title", { children: "Synchro Blog" }), _jsx("style", { children: `
          * { box-sizing: border-box; }
          body { font-family: system-ui, sans-serif; margin: 0; background: #f9fafb; color: #111; }
          a { color: inherit; text-decoration: none; }
          button { cursor: pointer; }
        ` })] }), _jsxs("body", { children: [children, _jsx(Scripts, {})] })] }));
}
export default function App() {
    // QueryClient is created in state so each SSR request gets a fresh instance
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Avoid refetch on hydration — trust the SSR-dehydrated data for 60 s
                staleTime: 60 * 1000,
            },
        },
    }));
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(Outlet, {}) }));
}
export function ErrorBoundary({ error }) {
    let message = 'Oops!';
    let details = 'An unexpected error occurred.';
    let stack;
    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? '404' : 'Error';
        details =
            error.status === 404
                ? 'The requested page could not be found.'
                : error.statusText || details;
    }
    else if (import.meta.env.DEV && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }
    return (_jsxs("main", { style: { maxWidth: 640, margin: '4rem auto', padding: '2rem' }, children: [_jsx("h1", { children: message }), _jsx("p", { children: details }), stack && (_jsx("pre", { style: { overflowX: 'auto', background: '#f1f5f9', padding: '1rem', borderRadius: 8 }, children: stack }))] }));
}
