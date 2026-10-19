'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type LabeledInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> & {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  /** Defaults to a generated id when omitted (associates label with input). */
  id?: string;
  required?: boolean;
};

export function LabeledInput({
  label,
  value,
  onChange,
  id: idProp,
  className,
  required,
  ...inputProps
}: LabeledInputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm leading-none font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn('h-9 bg-white', className)}
        {...inputProps}
      />
    </div>
  );
}
