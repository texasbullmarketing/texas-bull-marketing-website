// Marketing homepage is public/index.html.
// middleware.ts + next.config.mjs rewrite / -> /index.html.
// This page is only a fallback if the rewrite is bypassed.
export default function Page() {
  return (
    <main style={{ minHeight: '100vh', background: '#161C2A', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <p>
        Loading Texas Bull Marketing… If this stays, open{' '}
        <a href="/index.html" style={{ color: '#C8102E' }}>
          /index.html
        </a>
        .
      </p>
    </main>
  )
}
