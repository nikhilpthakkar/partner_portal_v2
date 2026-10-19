'use client';

import ErrorCard from '@/components/molecules/ErrorCard';
import { AlertTriangle } from 'lucide-react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error }: GlobalErrorProps) {
  // Log global errors for debugging in development/runtime monitoring tools.
  console.error(error);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-muted px-6 py-12">
          <ErrorCard
            className="max-w-md"
            icon={<AlertTriangle className="size-8" />}
            title="Something went wrong"
            description="We're unable to load this page right now. Please try again in a moment."
          />
        </main>
      </body>
    </html>
  );
}
