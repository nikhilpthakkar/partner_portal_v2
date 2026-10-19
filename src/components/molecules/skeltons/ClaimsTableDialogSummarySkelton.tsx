import Skeleton from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ClaimsTableDialogSummarySkeltonProps = {
  className?: string;
};

export default function ClaimsTableDialogSummarySkelton({
  className,
}: ClaimsTableDialogSummarySkeltonProps) {
  return <Skeleton className={cn('h-4 w-96', className)} />;
}
