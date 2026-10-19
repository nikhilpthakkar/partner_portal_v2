export const POLICY_AUTO_REFUND_FAILED_BANNER = {
  title: 'Policy cancelled but auto refund failed',
  description:
    'Your refund failed due to incorrect bank account details entered. Review them and re-initiate the refund.',
  actionLabel: 'Initiate refund manually',
} as const;

export const POLICY_AUTO_REFUND_FAILED_RETRYABLE_BANNER = {
  title: 'Policy cancelled but auto refund failed',
  description: 'Your refund could not be completed. Review them and re-initiate the refund.',
  actionLabel: 'Re-initiate refund',
} as const;

export const POLICY_REFUND_UI_STATE = {
  MANUAL_INITIATED: 'MANUAL_INITIATED',
  MANUAL_SETTLED: 'MANUAL_SETTLED',
  FAILED_RETRYABLE: 'FAILED_RETRYABLE',
  FAILED: 'FAILED',
  IN_PROGRESS: 'IN_PROGRESS',
  SUCCESS: 'SUCCESS',
  NONE: 'NONE',
} as const;

export const POLICY_AUTO_REFUND_SUCCESS_BANNER = {
  title: 'Refund status',
  settlementTypeLabel: {
    manual: 'manual',
    cashfree: 'Cashfree',
  },
  descriptionWithSettlement: (
    settlementType: 'manual' | 'Cashfree',
    completedDate: string,
    utr: string,
  ) =>
    `Your policy is now cancelled and the ${settlementType} refund settlement has been completed on ${completedDate}. The UTR for the refund transaction is ${utr}.`,
  description:
    'The refund settlement is complete. Your policy is now cancelled and your documents have been updated.',
  manualSettledDescription:
    'The manual refund settlement is complete. Your policy is now cancelled and your documents have been updated.',
} as const;

export const POLICY_AUTO_REFUND_IN_PROGRESS_BANNER = {
  title: 'Policy cancellation initiated',
  descriptionFallback: 'Your refund is being processed.',
  descriptionWithExpectedDate: (expectedDate: string) =>
    `Your refund is being processed and is expected by ${expectedDate}.`,
} as const;

export const POLICY_REFUND_IN_PROGRESS_BANNER = {
  title: 'Refund in progress',
  actionLabel: 'View status',
  descriptionPrefix: 'Your refund with ',
  requestIdLabel: (requestId: string) => `request ID ${requestId}`,
  descriptionSuffix: (initiatedDate: string) =>
    ` was initiated on ${initiatedDate} and is in progress.`,
  expectedCompletionSuffix: (expectedCompletionDate: string) =>
    ` We expect it to be completed by ${expectedCompletionDate}.`,
  descriptionFallback: 'Your refund is being processed.',
} as const;

export const POLICY_MANUAL_REFUND_INITIATED_BANNER = {
  title: 'Refund in progress',
  descriptionPrefix: (requestId: string) =>
    `Your manual refund with request ID ${requestId} has been acknowledged and registered. To update the UTR details, please use the `,
  manualRefundModuleLinkLabel: 'manual refund module',
  descriptionSuffix: '.',
  descriptionFallback:
    'Your manual refund has been acknowledged and registered. To update the UTR details, please use the manual refund module.',
  actionLabel: 'View status',
} as const;

export const MANUAL_REFUNDS_MODULE_ROUTE_SEGMENT = 'manual-refunds' as const;

export const POLICY_REFUND_DETAILS_SHEET = {
  title: 'Financial endorsement refund timeline',
  summaryTitle: 'Summary',
  summary: {
    cashfreeCompleted: (requestId: string) =>
      `Cashfree refund for ${requestId} completed. UTR recorded and status marked completed.`,
    manualCompleted: (requestId: string) =>
      `Manual refund for ${requestId} completed. UTR recorded and status marked completed.`,
    manualInProgress: (requestId: string) =>
      `Manual refund for ${requestId} has been registered and is being processed offline.`,
    allCashfreeAttemptsFailed: (attemptCount: number) =>
      `${attemptCount} cashfree refund ${attemptCount === 1 ? 'attempt' : 'attempts'} failed, please try again or use a different payment method`,
  },
  attemptGroups: {
    endorsementLed: 'Endorsement led refund',
    cashfreeLed: 'Cashfree led refund',
    manual: 'Manual refund',
  },
  payoutDescriptions: {
    initial: 'Payout sent to Cashfree',
    reinitiated: 'Payout re-initiated via Cashfree',
  },
  successAlert: (utr: string) => `UTR: ${utr} · Refund completed`,
  timelineTitle: 'Status timeline',
  requestIdLabel: 'Refund request ID',
  copySuccessMessage: 'Refund request ID copied to clipboard',
  loadingMessage: 'Loading refund details...',
  errorTitle: 'Unable to load refund details',
  timelineSteps: {
    requestSubmitted: {
      title: 'Request submitted',
      requestedBy: (userType: string) => `Requested by ${userType}`,
    },
    bankTransferInitiated: {
      title: 'Bank transfer initiated',
      description: 'Waiting for bank confirmation',
    },
    bankStatus: {
      title: 'Bank status',
      description: 'Settlement result received',
    },
    manualInitiated: {
      title: 'Manual refund initiated',
      defaultDescription: 'Refund initiated by KAM',
    },
    manualCompleted: {
      title: 'Manual refund completed',
      description: 'UTR recorded · status completed',
    },
  },
} as const;

export const POLICY_MANUAL_REFUND_PRIORITY_OPTIONS = [
  { value: 'P0', label: 'P0' },
  { value: 'P1', label: 'P1' },
  { value: 'P2', label: 'P2' },
  { value: 'P3', label: 'P3' },
] as const;

export const POLICY_MANUAL_REFUND_DESTINATION_OPTIONS = [
  { value: 'partner', label: 'Partner' },
  { value: 'customer', label: 'Customer' },
] as const;

export const POLICY_INITIATE_REFUND_DIALOG = {
  title: 'Initiate refund',
  selectedPolicyLabel: 'Selected policy',
  optionsToRetryRefundLabel: 'Please select the appropriate option to retry the refund:',
  retryRefundOptions: {
    correctBankDetails: {
      title: 'Update bank details',
    },
    addBankAccount: {
      title: 'Add a new bank account',
    },
    partnerBankAccount: {
      title: 'Select the partner bank account',
    },
  },
  stepOneLabel: 'Step 1 of 2: Select refund mode',
  stepTwoManualRefundLabel: 'Step 2 of 2: Enter refund details',
  stepTwoCashfreeLabel: 'Step 2 of 2: Select bank account',
  stepTwoBankLabel: 'Step 2 of 2: Select bank account',
  manualRefundFields: {
    policyNumber: {
      label: 'Enter policy number',
      placeholder: 'Enter policy number',
    },
    accountHolderName: {
      label: 'Name of account holder',
      placeholder: 'Enter account holder name',
    },
    remark: {
      label: 'Add remark',
      placeholder: 'Add remark',
    },
    utr: {
      label: 'Add UTR',
      placeholder: 'Enter UTR',
    },
    bankAccountDetails: {
      label: 'Bank account details',
      placeholder: 'Enter bank account number',
    },
    refundAmount: {
      label: 'Refund amount (₹)',
      placeholder: 'Enter refund amount',
    },
    priority: {
      label: 'Select priority',
      placeholder: 'Select priority',
    },
    refundDestination: {
      label: 'Refund destination',
      placeholder: 'Select refund destination',
    },
  },
  floatOption: {
    title: 'Refund Manually',
    description: 'Update the refund details post completion of manual refund',
  },
  bankOption: {
    title: 'Retry refund via Cashfree',
    description: 'Retry by updating bank details',
  },
  cashfreeRetryModal: {
    failedAlert: {
      defaultIssueLabel: 'Customer issue',
      defaultDescription:
        'Bank account is invalid. Review the highlighted field(s) and re-initiate.',
    },
  },
  failedRefundAlert: {
    title: 'Policy cancelled but auto refund failed',
    description: 'Your refund could not be completed. Review them and re-initiate the refund.',
  },
  backLabel: 'Back',
  nextLabel: 'Next',
  submitLabel: 'Submit request',
  reinitiateBankStepLabel: 'Step 2 of 2: Select bank account',
  reinitiateBankFields: {
    selectBankAccount: {
      label: 'Select bank account',
      placeholder: 'Select another bank account',
    },
    selectBank: {
      label: 'Select bank',
      placeholder: 'Bank name',
    },
    customerBankDetailsTitle: 'Customer bank account details',
    partnerBankDetailsTitle: 'Partner bank account details',
    accountNumber: {
      label: 'Account number',
      placeholder: 'Enter account number',
      invalidMessage: 'Bank account is invalid.',
    },
    confirmAccountNumber: {
      label: 'Confirm account number',
      placeholder: 'Enter account number',
      mismatchMessage: "The account numbers don't match.",
      matchMessage: 'Account numbers match!',
    },
    accountHolderName: {
      label: 'Account holder name',
      placeholder: 'Enter account holder name',
      mismatchMessage: 'Please check your Account Holder name',
    },
    ifscCode: {
      label: 'IFSC code',
      placeholder: 'Enter IFSC code',
      invalidFormatMessage: 'IFSC should be 11 characters long and the 5th character must be 0.',
    },
    transferNote: 'Note: Bank transfers may take up to 3-4 business days',
  },
} as const;
