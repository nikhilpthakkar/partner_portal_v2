'use client';

import { useEffect } from 'react';
import { initDatadogRum } from '@/lib/utils/datadogRum';

const DatadogRumInit = () => {
  useEffect(() => {
    initDatadogRum();
  }, []);

  return null;
};

export default DatadogRumInit;