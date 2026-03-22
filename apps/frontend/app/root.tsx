import {
  isRouteErrorResponse,
  Outlet,
} from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import type { Route } from './+types/root'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Synchro Blog</title>
        <style>{`
          * { box-sizing: border-box; }
          body { font-family: system-ui, sans-serif; margin: 0; background: #f9fafb; color: #111; }
          a { color: inherit; text-decoration: none; }
          button { cursor: pointer; }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}

export default function App() {
  // QueryClient is created in state so each SSR request gets a fresh instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Avoid refetch on hydration — trust the SSR-dehydrated data for 60 s
            staleTime: 60 * 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main style={{ maxWidth: 640, margin: '4rem auto', padding: '2rem' }}>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre style={{ overflowX: 'auto', background: '#f1f5f9', padding: '1rem', borderRadius: 8 }}>
          {stack}
        </pre>
      )}
    </main>
  )
}
