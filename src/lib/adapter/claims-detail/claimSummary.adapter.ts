import type { ClaimSummarySection } from '@/lib/types/claims-management/claimDetails';

export type InformationColumnAction = {
  label: string;
  onClick: () => void;
};

export type InformationColumnItem = {
  label: string;
  value: string;
  action?: InformationColumnAction;
};

export type InformationColumn = {
  id: string;
  items: InformationColumnItem[];
};

const EMPTY_DATA_VALUES = new Set(['', '-', '--', 'n/a', 'na']);

const hasDisplayValue = (value: string): boolean => {
  const normalizedValue = value.trim().toLowerCase();
  return !EMPTY_DATA_VALUES.has(normalizedValue);
};

export const mapClaimSummaryToInformationColumns = (
  summary?: ClaimSummarySection,
): InformationColumn[] => {
  if (!summary) return [];

  const filteredItems = summary.columns
    .flat()
    .filter((item) => hasDisplayValue(item.value))
    .map((item) => ({
      label: item.label,
      value: item.value,
      action: item.copyValue
        ? {
            label: `Copy ${item.label}`,
            onClick: () => navigator.clipboard.writeText(item.copyValue ?? item.value),
          }
        : undefined,
    }));

  if (filteredItems.length === 0) return [];

  const midpoint = Math.ceil(filteredItems.length / 2);
  const leftColumnItems = filteredItems.slice(0, midpoint);
  const rightColumnItems = filteredItems.slice(midpoint);

  return [
    {
      id: 'summary-column-0',
      items: leftColumnItems,
    },
    {
      id: 'summary-column-1',
      items: rightColumnItems,
    },
  ].filter((column) => column.items.length > 0);
};
