import { useEffect, useMemo, useState } from 'react';
import type { ApiResponse } from '@/lib/types/Global';
import type {
  PolicyDetailsFilters,
  PolicyDetailsResponse,
} from '@/lib/types/policy-management/policyDetailsApi';

type UseInsuredSelectParams = {
  policyDetailsResponse?: ApiResponse<PolicyDetailsResponse, PolicyDetailsFilters>;
  isLoading?: boolean;
};

type UseInsuredSelectResult = {
  insuredOptions: Array<{ label: string; value: string }>;
  selectedInsured: string;
  setSelectedInsured: (value: string) => void;
  isDisabled: boolean;
  placeholder: string;
};

export const useInsuredSelect = ({
  policyDetailsResponse,
  isLoading = false,
}: UseInsuredSelectParams): UseInsuredSelectResult => {
  const insuredOptions = useMemo(
    () =>
      policyDetailsResponse?.data?.policies?.[0]?.persons?.length
        ? policyDetailsResponse.data.policies[0].persons.map((person, index) => ({
            value: person.insured?.id ?? `insured-${index + 1}`,
            label: person.insured?.name ?? `Insured ${index + 1}`,
          }))
        : [],
    [policyDetailsResponse?.data?.policies],
  );
  const [selectedInsured, setSelectedInsured] = useState<string>('');

  useEffect(() => {
    if (!insuredOptions.length) {
      return;
    }

    if (!selectedInsured || !insuredOptions.some((option) => option.value === selectedInsured)) {
      setSelectedInsured(insuredOptions[0].value);
    }
  }, [insuredOptions, selectedInsured]);

  const showNoInsured = !isLoading && !insuredOptions.length;
  const isDisabled = isLoading || showNoInsured;
  const placeholder = isLoading
    ? 'Loading insured...'
    : showNoInsured
      ? 'No insured values available'
      : 'Select insured';

  return {
    insuredOptions,
    selectedInsured,
    setSelectedInsured,
    isDisabled,
    placeholder,
  };
};
