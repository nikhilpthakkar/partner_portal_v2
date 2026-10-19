import type { ClaimSessionFormSnapshot } from '@/lib/types/claims-management/claimSession';

const SESSION_FORM_PREFIX = 'epp:create-claim:claimSession:';

export function createClaimSessionId(): string {
  return crypto.randomUUID();
}

function sessionFormKey(sessionId: string): string {
  return `${SESSION_FORM_PREFIX}${sessionId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isClaimSessionFormSnapshot(value: unknown): value is ClaimSessionFormSnapshot {
  if (!isRecord(value)) return false;
  const keys: (keyof ClaimSessionFormSnapshot)[] = [
    'insuredNameField',
    'informantName',
    'informantPhone',
    'informantEmail',
    'nomineeName',
    'nomineePhone',
    'nomineeEmail',
    'nomineeDateOfBirth',
    'dateOfIncident',
    'descriptionOfIncident',
  ];
  return (
    keys.every((k) => typeof value[k] === 'string') &&
    (value.dateOfIntimation === undefined || typeof value.dateOfIntimation === 'string')
  );
}

export function parseClaimSessionForm(raw: unknown): ClaimSessionFormSnapshot | null {
  if (!isClaimSessionFormSnapshot(raw)) return null;
  return {
    ...raw,
    dateOfIntimation: raw.dateOfIntimation ?? '',
  };
}

export function readClaimSessionForm(sessionId: string): ClaimSessionFormSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(sessionFormKey(sessionId));
    if (!raw) return null;
    return parseClaimSessionForm(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeClaimSessionForm(sessionId: string, form: ClaimSessionFormSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(sessionFormKey(sessionId), JSON.stringify(form));
  } catch {
    // Quota or private mode — ignore.
  }
}

export function clearClaimSessionForm(sessionId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(sessionFormKey(sessionId));
  } catch {
    /* ignore */
  }
}
