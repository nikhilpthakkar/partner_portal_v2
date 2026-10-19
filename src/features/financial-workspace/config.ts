/** Local development only. Production always keeps real auth and the existing API routes. */
export const FINANCIAL_SIMULATOR_ENABLED =
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_FINANCIAL_SIMULATOR === 'true';
