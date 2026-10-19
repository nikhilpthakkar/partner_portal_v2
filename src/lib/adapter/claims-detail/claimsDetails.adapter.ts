import { ClaimDetailsData } from '@/lib/types/claims-management/claimDetails';
import { ClaimsDetailData } from '@/lib/types/claims-management/claimsDetailApi';
import { isHospitalizationIpdFhplCover } from '@/lib/constants/claimsDetail.constants';
import { formatCurrency, formatDate, formatEnum } from '@/lib/utils';
import { mapStatusToClaimStatus } from '../overview/claimsTable.adapter';

export const mapClaimToViewModel = (claim: ClaimsDetailData): ClaimDetailsData => {
  const primaryClaimant = claim.claimUsers?.claimants?.[0];
  const primaryPayment = claim.payments?.[0];
  const referenceNumber = claim.claimRequestNumber || '-';
  const policyNumber = claim.policyNumber || '-';
  const claimantName = primaryClaimant?.name || '-';
  const approvedAmount = claim?.deductionDetails?.totalAdmissibleAmount || 0;
  const claimedAmount = primaryPayment?.claimedAmount;
  const showClaimedAmount = isHospitalizationIpdFhplCover(claim.coverId);

  const amountSummaryItem = showClaimedAmount
    ? {
        id: 'claimed-amount',
        label: 'Claimed amount',
        value: formatCurrency(claimedAmount),
      }
    : {
        id: 'approved-amount',
        label: 'Approved amount',
        value: formatCurrency(approvedAmount),
      };

  return {
    breadcrumbs: [],
    header: {
      title: `Claim: ${referenceNumber}`,
      statusLabel: mapStatusToClaimStatus(claim.statusGroup || claim.detailedStatus || ''),
      actionLabel: 'Share claim status',
    },
    panels: {
      'claim-overview': {
        id: 'claim-overview',
        summary: {
          id: 'claim-overview-summary',
          title: 'Claim overview',
          columns: [
            [
              {
                id: 'claim-type',
                label: 'Claim type',
                value: formatEnum(claim?.coverId || '-') || '-',
              },
              {
                id: 'plan-name',
                label: 'Plan name',
                value: formatEnum(claim.planId || '-') || '-',
              },
              { id: 'claim-source', label: 'Source', value: 'Customer' },
              { id: 'payment-utr', label: 'Payment UTR', value: primaryPayment?.utrNumber || '-' },
            ],
            [
              {
                id: 'policy-number',
                label: 'Policy number',
                value: policyNumber,
                isLink: true,
                copyValue: policyNumber,
              },
              amountSummaryItem,
              {
                id: 'settled-amount',
                label: 'Settled amount',
                value: formatCurrency(primaryPayment?.amount),
              },
              {
                id: 'created-on',
                label: 'Created on',
                value: formatDate(claim.fnolCompletedOn),
              },
            ],
          ],
        },
      },
      'claimant-information': {
        id: 'claimant-information',
        summary: {
          id: 'claimant-information-summary',
          title: 'Claimant information',
          columns: [
            [
              { id: 'claimant-name', label: 'Claimant name', value: claimantName },
              { id: 'claimant-dob', label: 'Date of birth', value: primaryClaimant?.dob || '-' },
              { id: 'claimant-phone', label: 'Phone number', value: primaryClaimant?.phone || '-' },
            ],
            [
              {
                id: 'claimant-email',
                label: 'Email address',
                value: primaryClaimant?.email || '-',
              },
              { id: 'claimant-city', label: 'City', value: primaryClaimant?.city || '-' },
              { id: 'claimant-state', label: 'State', value: primaryClaimant?.state || '-' },
            ],
          ],
        },
      },
    },
    shareClaim: {
      title: 'Share claim updates',
      searchPlaceholder: 'Search for claim number',
      searchValue: referenceNumber,
      claimSummary: `Claim ID ${referenceNumber} | ${claimantName}`,
      recipients: [{ id: 'recipient-customer', title: 'Customer', subtitle: claimantName }],
      selectedRecipientId: 'recipient-customer',
      channels: [],
      cancelLabel: 'Cancel',
      shareLabel: 'Share claim status',
    },
  };
};
