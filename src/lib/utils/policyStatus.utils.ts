export const isCancelledPolicyStatus = (status: string): boolean =>
  status.trim().toLowerCase() === 'cancelled';
