import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PeriodNavigatorProps = {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
};

export default function PeriodNavigator({
  label,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
  className,
}: PeriodNavigatorProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={previousDisabled}
        aria-label="Previous period"
        className="bg-pagination-background hover:bg-avatar-background"
      >
        <ChevronLeft className="!h-5 !w-5" />
      </Button>
      <p className="text-xs leading-6 text-card-foreground font-medium text-nowrap">{label}</p>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={nextDisabled}
        aria-label="Next period"
        className="bg-pagination-background hover:bg-avatar-background"
      >
        <ChevronRight className="!h-5 !w-5" />
      </Button>
    </div>
  );
}
