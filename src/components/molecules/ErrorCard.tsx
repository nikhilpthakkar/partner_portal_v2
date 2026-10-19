import { InfoIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '../ui/card';

type ErrorCardProps = {
  title?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
};

export default function ErrorCard({ title, description, className, icon }: ErrorCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col justify-center items-center gap-4 text-center w-full h-full rounded-error-card bg-error-card-bg shadow-error-card ring-0 border border-error-card-border',
        className,
      )}
    >
      <CardHeader className="flex size-12 items-center justify-center rounded-md bg-card shadow-xs">
        <span className="text-error-card-title fill-error-card-title">
          {icon ?? <InfoIcon className="size-8" />}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        <p className="text-lg font-medium leading-7 text-error-card-title">{title}</p>
        <p className="text-sm leading-5 text-error-card-description">{description}</p>
      </CardContent>
    </Card>
  );
}
