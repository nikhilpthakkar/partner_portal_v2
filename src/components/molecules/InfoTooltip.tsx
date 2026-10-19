'use client';

import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type InfoTooltipProps = {
  infoText?: string;
  className?: string;
  iconClassName?: string;
  arrowClassName?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
};

export default function InfoTooltip({
  infoText,
  className,
  iconClassName,
  arrowClassName,
  side = 'right',
}: InfoTooltipProps) {
  const icon = <Info className={cn(iconClassName)} />;

  if (!infoText) return icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{icon}</TooltipTrigger>

      <TooltipContent
        side={side}
        className={cn(
          'relative overflow-visible px-3 py-1.5 text-left text-xs leading-4 shadow-none',
          className,
        )}
        arrowClassName={cn(arrowClassName)}
      >
        {infoText}
      </TooltipContent>
    </Tooltip>
  );
}
