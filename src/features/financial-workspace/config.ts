/** Explicit synthetic review build; normal production keeps real authentication and APIs. */
export const FINANCIAL_REVIEW_BUILD =
  process.env.NEXT_PUBLIC_FINANCIAL_REVIEW === 'true' &&
  process.env.NEXT_PUBLIC_FINANCIAL_SIMULATOR === 'true';

export const FINANCIAL_SIMULATOR_ENABLED =
  FINANCIAL_REVIEW_BUILD ||
  (process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_FINANCIAL_SIMULATOR === 'true');
