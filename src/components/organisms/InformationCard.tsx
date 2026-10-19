'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type InformationAction = {
  label: string;
  onClick: () => void;
};

type InformationItem = {
  label: string;
  value: string;
  action?: InformationAction;
};

type InformationColumn = {
  id: string;
  items: InformationItem[];
};

type InformationCardProps = {
  title: string;
  columns: InformationColumn[];
  onActionClick?: (value: string) => void | undefined;
  className?: string;
};

export default function InformationCard({
  title,
  columns,
  onActionClick = undefined,
  className,
}: InformationCardProps) {
  const [copiedKeys, setCopiedKeys] = useState<Record<string, boolean>>({});

  const handleCopy = (key: string, onCopy: () => void) => {
    onCopy();
    setCopiedKeys((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <Card
      className={cn(
        'border-policy-info-border bg-policy-info-bg rounded-policy-info-card shadow-policy-info-card flex w-full flex-col gap-4 p-6 font-sans',
        className,
      )}
    >
      <p className="text-policy-info-title text-xl font-semibold leading-7">{title}</p>
      <div className="grid w-full gap-2 grid-cols-2">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            {column.items.map((item) => {
              const itemKey = `${column.id}-${item.label}`;
              const isCopied = !!copiedKeys[itemKey];
              return (
                <div key={itemKey} className="flex flex-col gap-2 py-1 text-sm leading-5">
                  <p className="text-policy-info-label font-normal">{item.label}</p>
                  <div className="text-policy-info-value flex items-center gap-2 font-semibold whitespace-nowrap">
                    {item.action ? (
                      <>
                        <button
                          className={cn(
                            'text-sm font-semibold',
                            !!onActionClick ? 'cursor-pointer text-blue-600' : '',
                          )}
                          type="button"
                          onClick={() => onActionClick?.(item.value)}
                        >
                          {item.value}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(itemKey, item.action?.onClick ?? (() => {}))}
                          className="cursor-pointer font-sans text-policy-info-icon hover:text-policy-info-icon-hover"
                          aria-label={item.action.label}
                        >
                          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </>
                    ) : (
                      <span className="font-semibold">{item.value}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
