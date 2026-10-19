export type ManualRefundDetailsDialogViewModel = {
  policyNumber: string;
  refundStatusLabel: string;
  refundStatusBadgeClassName: string;
  refundId: string;
  refundAmount: string;
  initiatedOn: string;
  completedOn: string;
  utrReference: string;
  destinationKind: 'customer' | 'partner' | '';
  destinationTypeLabel: string;
  destinationTypeBadgeClassName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  canEditDetails: boolean;
};
