'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'sans-serif', padding: '16px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>WorkPulse hit an unexpected error</h1>
          <p style={{ maxWidth: '480px', color: '#474651' }}>
            Something went wrong at the application level. Please try again.
          </p>
          <button
            onClick={reset}
            style={{ background: '#1a146b', color: '#fff', borderRadius: '8px', padding: '8px 16px', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
