import { useMemo } from 'react';
import { useOverviewConfigQuery } from '@/lib/query/overview/overviewConfig.queries';
import type { OverviewLayout } from '@/lib/types/overview/config';
import { parseOverviewLayout } from '@/lib/utils/overview/overviewConfig.utils';

type UseOverviewLayoutResult = {
  layout: OverviewLayout;
  isLoading: boolean;
  isError: boolean;
  isReady: boolean;
};

export const useOverviewLayout = (): UseOverviewLayoutResult => {
  const { data, isLoading, isError, isSuccess } = useOverviewConfigQuery();

  const layout = useMemo(() => parseOverviewLayout(data), [data]);

  return {
    layout,
    isLoading,
    isError,
    isReady: isSuccess,
  };
};
