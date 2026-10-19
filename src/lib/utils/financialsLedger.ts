import type { LedgerEntry } from '@/lib/types/financials';

/** Forward-fill empty `date` strings so sub-rows inherit the parent date (for merge grouping). */
export function fillLedgerEntryDates(entries: LedgerEntry[]): LedgerEntry[] {
  let lastDate = '';
  return entries.map((entry) => {
    const trimmed = entry.date.trim();
    if (trimmed) lastDate = trimmed;
    return { ...entry, date: lastDate };
  });
}
