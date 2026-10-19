'use client';

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  CREATE_CLAIM_CLAIM_REQUEST_NUMBER_QUERY_PARAM,
  CREATE_CLAIM_CLAIM_TYPE_QUERY_PARAM,
  CREATE_CLAIM_MACHINE_INSTANCE_ID_QUERY_PARAM,
  CREATE_CLAIM_POLICY_NUMBER_QUERY_PARAM,
  CREATE_CLAIM_SESSION_QUERY_PARAM,
  CREATE_CLAIM_STATE_QUERY_PARAM,
  CreateClaimFlowStepId,
} from '@/lib/constants/createClaim.constants';

export type CreateClaimPostStepIdentifiers = Partial<{
  claimRequestNumber: string;
  machineInstanceId: string;
}>;

export function useCreateClaimUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { partner } = useParams<{ partner: string }>();

  const urlPolicyNumber = searchParams.get(CREATE_CLAIM_POLICY_NUMBER_QUERY_PARAM)?.trim() ?? '';
  const urlClaimType = searchParams.get(CREATE_CLAIM_CLAIM_TYPE_QUERY_PARAM)?.trim() ?? '';
  const urlClaimSession = searchParams.get(CREATE_CLAIM_SESSION_QUERY_PARAM)?.trim() ?? '';
  const urlState = searchParams.get(CREATE_CLAIM_STATE_QUERY_PARAM)?.trim() ?? '';
  const urlClaimRequestNumber =
    searchParams.get(CREATE_CLAIM_CLAIM_REQUEST_NUMBER_QUERY_PARAM)?.trim() ?? '';
  const urlMachineInstanceId =
    searchParams.get(CREATE_CLAIM_MACHINE_INSTANCE_ID_QUERY_PARAM)?.trim() ?? '';

  const goToClaimsManagement = () => {
    router.push(`/${partner}/dashboard/claims-management`);
  };

  const clearCreateClaimUrl = () => {
    router.replace(pathname, { scroll: false });
  };

  const replaceWithPolicyOnly = (policyNumber: string) => {
    const params = new URLSearchParams({
      [CREATE_CLAIM_POLICY_NUMBER_QUERY_PARAM]: policyNumber,
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const replacePostClaimTypeStep = (
    policyNumber: string,
    claimType: string,
    step: CreateClaimFlowStepId,
    options?: {
      claimSession?: string;
      dropClaimSession?: boolean;
      identifiers?: CreateClaimPostStepIdentifiers;
      preserveExistingIdentifiers?: boolean;
    },
  ) => {
    const params = new URLSearchParams({
      [CREATE_CLAIM_POLICY_NUMBER_QUERY_PARAM]: policyNumber,
      [CREATE_CLAIM_CLAIM_TYPE_QUERY_PARAM]: claimType,
      [CREATE_CLAIM_STATE_QUERY_PARAM]: step,
    });
    const claimSession = options?.claimSession ?? urlClaimSession;
    if (!options?.dropClaimSession && claimSession) {
      params.set(CREATE_CLAIM_SESSION_QUERY_PARAM, claimSession);
    }
    const shouldPreserveExistingIdentifiers = options?.preserveExistingIdentifiers ?? true;
    const claimRequestNumber =
      options?.identifiers?.claimRequestNumber?.trim() ||
      (shouldPreserveExistingIdentifiers ? urlClaimRequestNumber : '');
    const machineInstanceId =
      options?.identifiers?.machineInstanceId?.trim() ||
      (shouldPreserveExistingIdentifiers ? urlMachineInstanceId : '');
    if (claimRequestNumber) {
      params.set(CREATE_CLAIM_CLAIM_REQUEST_NUMBER_QUERY_PARAM, claimRequestNumber);
    }
    if (machineInstanceId) {
      params.set(CREATE_CLAIM_MACHINE_INSTANCE_ID_QUERY_PARAM, machineInstanceId);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return {
    clearCreateClaimUrl,
    goToClaimsManagement,
    pathname,
    replacePostClaimTypeStep,
    replaceWithPolicyOnly,
    router,
    urlClaimRequestNumber,
    urlClaimSession,
    urlClaimType,
    urlMachineInstanceId,
    urlPolicyNumber,
    urlState,
  };
}

export type CreateClaimUrlState = ReturnType<typeof useCreateClaimUrlState>;
