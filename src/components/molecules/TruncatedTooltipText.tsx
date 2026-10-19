'use client';

import { useEffect, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type TruncatedTooltipTextProps = {
  text: string;
  className?: string;
  tooltipClassName?: string;
  alwaysShowTooltip?: boolean;
};

export default function TruncatedTooltipText({
  text,
  className,
  tooltipClassName,
  alwaysShowTooltip = false,
}: TruncatedTooltipTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) {
      setIsTruncated(false);
      return;
    }

    const updateTruncation = () => {
      setIsTruncated(textElement.scrollWidth > textElement.clientWidth);
    };

    const rafId = window.requestAnimationFrame(updateTruncation);

    const resizeObserver = new ResizeObserver(updateTruncation);
    resizeObserver.observe(textElement);
    if (textElement.parentElement) {
      resizeObserver.observe(textElement.parentElement);
    }
    window.addEventListener('resize', updateTruncation);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateTruncation);
    };
  }, [text]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          ref={textRef}
          className={cn('block overflow-hidden text-ellipsis whitespace-nowrap', className)}
        >
          {text}
        </span>
      </TooltipTrigger>
      {text.length > 0 && (isTruncated || alwaysShowTooltip) && (
        <TooltipContent
          side="top"
          className={cn(
            'bg-tooltip-callout-bg text-tooltip-callout-text max-w-80 break-words',
            tooltipClassName,
          )}
          arrowClassName="fill-tooltip-callout-bg"
        >
          {text}
        </TooltipContent>
      )}
    </Tooltip>
  );
}
