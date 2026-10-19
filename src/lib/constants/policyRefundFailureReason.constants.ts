import { POLICY_INITIATE_REFUND_DIALOG } from '@/lib/constants/policyAutoRefund.constants';

export const POLICY_REFUND_FAILURE_REASON_MESSAGES = {
  ACCOUNT_BLOCKED:
    'Refund retry failed because the bank account is blocked. Please use a different bank account or contact the bank.',
  'Not enough available balance in the account':
    'Refund retry failed because there is not enough balance available in the source account. Please use a different bank account or try again after ensuring sufficient balance.',
  'ifsc : Ifsc should be of 11 characters and 5th character should be 0':
    'Refund retry failed because the IFSC code format is incorrect. IFSC should be 11 characters long and the 5th character should be 0.',
  'ifsc should be at max 20':
    'Refund retry failed because the IFSC code entered is too long. Please enter a valid IFSC code.',
  IMPS_MODE_FAIL:
    'Refund retry failed because the refund could not be processed through the Immediate Payment Service. Please verify the bank details and try again.',
  'Ifsc should be of 11 characters and 5th character should be 0.':
    'Refund retry failed because the IFSC code format is incorrect. IFSC should be 11 characters long and the 5th character should be 0.',
  'Ifsc should be of 11 characters':
    'Refund retry failed because the IFSC code format is incorrect. IFSC should be 11 characters long and the 5th character should be 0.',
  INVALID_IFSC:
    'Refund retry failed because the IFSC code entered is invalid. Please check the IFSC code and try again.',
  'Internal Server Error':
    'Refund retry failed due to a temporary system issue. Please use a different bank account or try again after some time.',
  SUSPECTED_FAILED:
    'Refund retry could not be completed. Please verify the bank details and try again.',
  'Please provide a valid Bank IFSC code':
    'Refund retry failed because the IFSC code entered is invalid. Please check the IFSC code and try again.',
  'bankAccount can contain only alphabet and numbers':
    'Refund retry failed because the bank account number contains invalid characters. Please enter only letters and numbers.',
  WAIT_TIME_EXCEEDED: 'Refund retry failed because the request timed out. Please try again.',
  NRE_ACCOUNT_FAIL:
    'Refund retry failed because refunds cannot be processed to NRE accounts. Please use a different bank account or select a different payment method.',
  REJECTED:
    'Refund retry was rejected by the bank. Please verify the bank details or try again using a different payment method.',
  BANK_GATEWAY_ERROR:
    'Refund retry failed due to a bank gateway issue. Please try again after some time or try again using a different payment method.',
  'Bene Creation Failed':
    'Refund retry failed because beneficiary creation could not be completed. Please verify the bank account details and try again.',
  FAILED:
    'Refund retry could not be completed. Please review the bank details and try again or use a different payment method.',
  ANY_OTHER_REASON:
    'Refund retry failed due to an unexpected issue. Please review the bank details and try again or use a different payment method.',
  ACCOUNT_DOES_NOT_EXIST:
    'Refund retry failed because the bank account does not exist. Please verify the account details and try again.',
  INVALID_IFSC_FAIL:
    'Refund retry failed because the IFSC code entered is invalid. Please check the IFSC code and try again.',
  'Unknown error occurred!':
    'Refund retry failed due to an unknown issue. Please try again or use a different payment method.',
  'ifsc can contain only alphabet and numbers':
    'Refund retry failed because the IFSC code format is incorrect. IFSC should be 11 characters long and the 5th character should be 0.',
  INVALID_ACCOUNT_FAIL:
    'Refund retry failed because the bank account details are invalid. Please review and re-enter the details.',
  RETURNED_FROM_BENEFICIARY:
    'Refund retry failed because the refund was returned by the beneficiary bank. Please verify the bank details or use a different payment method.',
  BENE_BANK_DECLINED:
    'Refund retry failed because the source bank declined the refund. Please try again after some time or use a different payment method.',
  'VBA payout is not enabled':
    'Refund retry failed because payout is not enabled for this account. Please use a different payment method.',
  SOURCE_BANK_DECLINED:
    'Refund retry failed because the source bank declined the refund. Please try again after some time or use a different payment method.',
} as const;

export const POLICY_REFUND_FAILURE_REASON_TIMELINE_LABELS = {
  ACCOUNT_BLOCKED: 'Bank account is blocked',
  'Not enough available balance in the account': 'Insufficient source account balance',
  'ifsc : Ifsc should be of 11 characters and 5th character should be 0':
    'Invalid IFSC code format',
  'ifsc should be at max 20': 'IFSC code is too long',
  IMPS_MODE_FAIL: 'IMPS payment processing failed',
  'Ifsc should be of 11 characters and 5th character should be 0.':
    'Invalid IFSC code format',
  'Ifsc should be of 11 characters': 'Invalid IFSC code format',
  INVALID_IFSC: 'Invalid IFSC code entered',
  'Internal Server Error': 'Temporary system issue occurred',
  SUSPECTED_FAILED: 'Refund could not be completed',
  'Please provide a valid Bank IFSC code': 'Invalid IFSC code entered',
  'bankAccount can contain only alphabet and numbers': 'Invalid bank account characters',
  WAIT_TIME_EXCEEDED: 'Refund request timed out',
  NRE_ACCOUNT_FAIL: 'NRE accounts are not supported',
  REJECTED: 'Bank rejected the refund',
  BANK_GATEWAY_ERROR: 'Bank gateway issue occurred',
  'Bene Creation Failed': 'Beneficiary creation failed',
  FAILED: 'Refund could not be completed',
  ANY_OTHER_REASON: 'Unexpected refund issue occurred',
  ACCOUNT_DOES_NOT_EXIST: 'Bank account does not exist',
  INVALID_IFSC_FAIL: 'Invalid IFSC code entered',
  'Unknown error occurred!': 'Unknown refund error occurred',
  'ifsc can contain only alphabet and numbers': 'Invalid IFSC code format',
  INVALID_ACCOUNT_FAIL: 'Invalid bank account details',
  RETURNED_FROM_BENEFICIARY: 'Beneficiary bank returned refund',
  BENE_BANK_DECLINED: 'Beneficiary bank declined refund',
  'VBA payout is not enabled': 'Payout not enabled for account',
  SOURCE_BANK_DECLINED: 'Source bank declined refund',
} as const;

export const POLICY_REFUND_FAILURE_REASON_TIMELINE_DEFAULT_LABEL =
  'Refund could not be completed' as const;

export const POLICY_REFUND_FAILURE_REASON_DEFAULT_MESSAGE =
  POLICY_INITIATE_REFUND_DIALOG.cashfreeRetryModal.failedAlert.defaultDescription;
