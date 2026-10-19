'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { BarClickPayload } from '@/lib/types/overview';

type TooltipCalloutProps = {
  selected: BarClickPayload | null;
  onAction?: () => void;
  onClose?: () => void;
  className?: string;
  arrowClassName?: string;
  actionClassName?: string;
};

export default function TooltipCallout({
  selected,
  onAction,
  onClose,
  className,
  arrowClassName,
  actionClassName,
}: TooltipCalloutProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!selected) return;

    const handlePointerDown = (event: PointerEvent) => {
      const node = contentRef.current;
      if (!node?.contains(event.target as Node)) {
        onCloseRef.current?.();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [selected]);

  if (!selected) return null;

  const hasClientCoords =
    typeof selected.clientX === 'number' && typeof selected.clientY === 'number';
  return (
    <Tooltip open>
      <TooltipTrigger asChild>
        <span
          style={{
            position: hasClientCoords ? 'fixed' : 'absolute',
            left: hasClientCoords ? selected.clientX : selected.x,
            top: hasClientCoords ? selected.clientY : selected.y,
            width: 1,
            height: 1,
          }}
          className="absolute pointer-events-none"
        />
      </TooltipTrigger>
      <TooltipContent
        ref={contentRef}
        side="top"
        align="center"
        showArrow={true}
        className={cn(
          'bg-tooltip-callout-bg max-w-xs relative z-20 animate-popup flex items-center gap-3 overflow-visible rounded-md p-3',
          className,
        )}
        arrowClassName={cn('fill-tooltip-callout-bg rounded-tooltip-callout-arrow', arrowClassName)}
      >
        <div className="flex items-center gap-1 pointer-events-auto">
          <p className="max-w-tooltip-callout-text-max text-tooltip-callout-text text-xs font-medium leading-4">
            {selected.value} claims are &apos;{selected.state}&apos; state for &apos;
            {selected.name}&apos;
          </p>
          {selected.actionLabel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAction}
              className={cn(
                'border-tooltip-callout-button-border bg-tooltip-callout-button-bg text-tooltip-callout-button-text shadow-tooltip-callout-button hover:bg-tooltip-callout-button-hover h-7 rounded-md px-2.5 text-xs font-medium',
                actionClassName,
              )}
            >
              {selected.actionLabel}
            </Button>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-tooltip-callout-close text-tooltip-callout-close pointer-events-auto flex h-4 w-4 shrink-0 items-center justify-center hover:text-tooltip-callout-close-hover cursor-pointer"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
