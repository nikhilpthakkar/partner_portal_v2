import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InsuredOption } from '@/lib/types/policy-endorsement';

type NonFinancialSelectInsuredStepProps = {
  isLoading: boolean;
  selectedInsured: string;
  insuredOptions: InsuredOption[];
  onSelectInsured: (value: string) => void;
};

export const NonFinancialSelectInsuredStep = ({
  isLoading,
  selectedInsured,
  insuredOptions,
  onSelectInsured,
}: NonFinancialSelectInsuredStepProps) => {
  if (isLoading) {
    return (
      <div className="flex min-h-26 flex-col gap-4">
        <div className="flex h-9 items-center justify-center">
          <Loader2 className="text-endorse-policy-muted h-4 w-4 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-26 flex-col gap-4">
      <Select value={selectedInsured} onValueChange={onSelectInsured}>
        <SelectTrigger className="h-9 w-full justify-between border-endorse-policy-border bg-white px-4 text-sm font-medium shadow-xs">
          <SelectValue placeholder="Select an insured" />
        </SelectTrigger>
        <SelectContent className="max-h-50 min-w-policy-details-select-width border-endorse-policy-border bg-white p-1 shadow-md">
          {insuredOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="focus:bg-simple-select-accent-bg focus:text-simple-select-accent data-[state=checked]:bg-simple-select-accent-bg data-[state=checked]:text-simple-select-accent [&>span]:hidden rounded-simple-select-item px-2 py-1.5 text-sm text-simple-select-text"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
