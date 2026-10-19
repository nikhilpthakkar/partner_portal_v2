'use client';

import { CalendarOff, FileX, LucideIcon, UserRound, UserRoundCheck, Users } from 'lucide-react';

import EndorsePolicyCard from '@/components/organisms/EndorsePolicyCard';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { EndorsePolicyIconName } from '@/lib/types/policy-management/policyDetails';
import { POLICY_ENDORSEMENT_HEADER } from '@/lib/constants/policyEndorsement.constants';
import { mapPolicyEndorsementDialogSections } from '@/lib/adapter/policy-details/policyEndorsementDialog.adapter';
import { usePolicyEndorsementTypeApplicableQuery } from '@/lib/query/policyDetails.queries';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import { trackEndorsePolicyDialogView } from '@/lib/segment/track/policy';
import { useEffect, useRef } from 'react';

const iconMap: Record<EndorsePolicyIconName, LucideIcon> = {
  'calendar-off': CalendarOff,
  'file-x': FileX,
  'user-round': UserRound,
  'user-round-check': UserRoundCheck,
  users: Users,
};

type EndorsePolicyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onEndorsementSuccess: () => Promise<void>;
  policyNumber: string;
  policyId: string;
  plan: string;
  insuredName: string;
};

export default function EndorsePolicyDialog({
  open,
  onOpenChange,
  onClose,
  onEndorsementSuccess,
  policyNumber,
  policyId,
  plan,
  insuredName,
}: EndorsePolicyDialogProps) {
  const segmentBase = useSegmentPartnerBase();
  const segmentBaseRef = useRef(segmentBase);
  segmentBaseRef.current = segmentBase;
  const policyNumberRef = useRef(policyNumber);
  policyNumberRef.current = policyNumber;
  const {
    data: endorsementTypeApplicableResponse,
    isLoading: isEndorsementTypeLoading,
    isError: isEndorsementTypeError,
  } = usePolicyEndorsementTypeApplicableQuery({
    policyId,
    plan,
    enabled: open,
  });

  const sections = mapPolicyEndorsementDialogSections(endorsementTypeApplicableResponse)
    .map((section) => ({
      ...section,
      actions: section.actions.filter((action) => action.applicable),
    }))
    .filter((section) => section.actions.length > 0);
  const isEndorsementTypeEmpty =
    !isEndorsementTypeLoading && !isEndorsementTypeError && sections.length === 0;

  useEffect(() => {
    if (open) {
      trackEndorsePolicyDialogView(segmentBaseRef.current, policyNumberRef.current);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="left-1/2 right-auto -translate-x-1/2 border-none bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">{POLICY_ENDORSEMENT_HEADER.title}</DialogTitle>
        <EndorsePolicyCard
          title={POLICY_ENDORSEMENT_HEADER.title}
          description={POLICY_ENDORSEMENT_HEADER.description}
          policyNumber={policyNumber}
          policyId={policyId}
          plan={plan}
          insuredName={insuredName}
          notice={POLICY_ENDORSEMENT_HEADER.notice}
          sections={sections.map((section) => ({
            ...section,
            actions: section.actions.map((action) => {
              const Icon = iconMap[action.icon as EndorsePolicyIconName];

              return {
                ...action,
                icon: <Icon className="h-4 w-4" />,
              };
            }),
          }))}
          isEndorsementTypeLoading={isEndorsementTypeLoading}
          isEndorsementTypeError={isEndorsementTypeError}
          isEndorsementTypeEmpty={isEndorsementTypeEmpty}
          onEndorsementSuccess={onEndorsementSuccess}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
