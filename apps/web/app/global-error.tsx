'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html dir="rtl" lang="ar">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>حدث خطأ غير متوقع</h2>
          <p>Something went wrong</p>
          <button onClick={reset}>حاول مرة أخرى</button>
        </div>
      </body>
    </html>
  );
}
