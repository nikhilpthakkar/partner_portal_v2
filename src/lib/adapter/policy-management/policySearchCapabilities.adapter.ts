import type { PolicySearchFieldCapability } from '@/lib/types/policy-management';

type PolicySearchFieldCapabilityApiItem = {
  field?: string;
  displayName?: string;
  multiValued?: boolean;
};

export const mapPolicySearchCapabilities = (response: unknown): PolicySearchFieldCapability[] => {
  if (!Array.isArray(response)) {
    return [];
  }

  return response.reduce<PolicySearchFieldCapability[]>((capabilities, item) => {
    if (item == null || typeof item !== 'object') {
      return capabilities;
    }

    const raw = item as PolicySearchFieldCapabilityApiItem;
    const field = typeof raw.field === 'string' ? raw.field.trim() : '';
    if (!field) {
      return capabilities;
    }

    capabilities.push({
      field,
      displayName:
        typeof raw.displayName === 'string' && raw.displayName.trim() !== ''
          ? raw.displayName.trim()
          : field,
      multiValued: Boolean(raw.multiValued),
    });

    return capabilities;
  }, []);
};
