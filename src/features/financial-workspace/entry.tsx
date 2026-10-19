'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function FinancialSimulatorEntry() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/demo/dashboard/overview');
  }, [router]);
  return (
    <div className="flex h-screen items-center justify-center gap-3 text-sm" role="status">
      <Loader2 className="size-5 animate-spin" />
      Opening the financial workspace…
    </div>
  );
}
