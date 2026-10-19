export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('pino');
    // @ts-expect-error next-logger does not ship TypeScript types
    await import('next-logger');
  }
}
