'use client';

import type { ReactNode } from 'react';
import { LabeledInput } from '@/components/molecules/LabeledInput';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  POLICY_INITIATE_REFUND_DIALOG,
  POLICY_MANUAL_REFUND_DESTINATION_OPTIONS,
  POLICY_MANUAL_REFUND_PRIORITY_OPTIONS,
} from '@/lib/constants/policyAutoRefund.constants';
import type {
  PolicyManualRefundFormErrors,
  PolicyManualRefundFormValues,
} from '@/lib/types/policy-management/policyManualRefund';

type PolicyManualRefundDetailsStepProps = {
  formValues: PolicyManualRefundFormValues;
  formErrors: PolicyManualRefundFormErrors;
  onFieldChange: (field: keyof PolicyManualRefundFormValues, value: string) => void;
};

const endorsementDropdownTriggerStyles =
  'h-9 w-full justify-between rounded-md border-labeled-select-border bg-white px-4 py-2 text-sm font-medium text-labeled-select-text shadow-labeled-select-trigger';

const endorsementDropdownContentStyles =
  'rounded-md border border-labeled-select-border bg-white p-1 shadow-labeled-select';

const endorsementDropdownItemStyles =
  'focus:bg-labeled-select-accent-bg focus:text-labeled-select-accent data-[state=checked]:bg-labeled-select-accent-bg data-[state=checked]:text-labeled-select-accent [&>span]:hidden rounded-labeled-select-item px-2 py-1.5 text-sm text-labeled-select-text';

type ManualRefundFieldProps = {
  error?: string;
  children: ReactNode;
};

const ManualRefundField = ({ error, children }: ManualRefundFieldProps) => (
  <div className="flex flex-col gap-1">
    {children}
    {error ? <p className="text-xs text-destructive">{error}</p> : null}
  </div>
);

export function PolicyManualRefundDetailsStep({
  formValues,
  formErrors,
  onFieldChange,
}: PolicyManualRefundDetailsStepProps) {
  const fields = POLICY_INITIATE_REFUND_DIALOG.manualRefundFields;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium leading-none text-foreground">
        {POLICY_INITIATE_REFUND_DIALOG.stepTwoManualRefundLabel}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <ManualRefundField error={formErrors.policyNumber}>
            <LabeledInput
              label={fields.policyNumber.label}
              placeholder={fields.policyNumber.placeholder}
              value={formValues.policyNumber}
              onChange={(value) => onFieldChange('policyNumber', value)}
              aria-invalid={Boolean(formErrors.policyNumber)}
              className={formErrors.policyNumber ? 'border-destructive' : undefined}
              required
              disabled
            />
          </ManualRefundField>

          <ManualRefundField error={formErrors.accountHolderName}>
            <LabeledInput
              label={fields.accountHolderName.label}
              placeholder={fields.accountHolderName.placeholder}
              value={formValues.accountHolderName}
              onChange={(value) => onFieldChange('accountHolderName', value)}
              aria-invalid={Boolean(formErrors.accountHolderName)}
              className={formErrors.accountHolderName ? 'border-destructive' : undefined}
              required
            />
          </ManualRefundField>

          <LabeledInput
            label={fields.remark.label}
            placeholder={fields.remark.placeholder}
            value={formValues.remark}
            onChange={(value) => onFieldChange('remark', value)}
          />

          <LabeledInput
            label={fields.utr.label}
            placeholder={fields.utr.placeholder}
            value={formValues.utr}
            onChange={(value) => onFieldChange('utr', value)}
          />
        </div>

        <div className="flex flex-col gap-4">
          <ManualRefundField error={formErrors.bankAccountDetails || formErrors.ifsc}>
            <LabeledInput
              label={fields.bankAccountDetails.label}
              placeholder={fields.bankAccountDetails.placeholder}
              value={formValues.bankAccountDetails}
              onChange={(value) => onFieldChange('bankAccountDetails', value)}
              aria-invalid={Boolean(formErrors.bankAccountDetails)}
              className={formErrors.bankAccountDetails ? 'border-destructive' : undefined}
              required
            />
          </ManualRefundField>

          <ManualRefundField error={formErrors.refundAmount}>
            <LabeledInput
              label={fields.refundAmount.label}
              placeholder={fields.refundAmount.placeholder}
              value={formValues.refundAmount}
              onChange={(value) => onFieldChange('refundAmount', value)}
              inputMode="decimal"
              aria-invalid={Boolean(formErrors.refundAmount)}
              className={formErrors.refundAmount ? 'border-destructive' : undefined}
              required
            />
          </ManualRefundField>

          <ManualRefundField error={formErrors.priority}>
            <div className="flex flex-col gap-2">
              <Label className="text-sm leading-none font-medium text-foreground">
                {fields.priority.label}
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formValues.priority}
                onValueChange={(value) => onFieldChange('priority', value)}
              >
                <SelectTrigger
                  className={endorsementDropdownTriggerStyles}
                  aria-invalid={Boolean(formErrors.priority)}
                >
                  <SelectValue placeholder={fields.priority.placeholder} />
                </SelectTrigger>
                <SelectContent className={endorsementDropdownContentStyles}>
                  {POLICY_MANUAL_REFUND_PRIORITY_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={endorsementDropdownItemStyles}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ManualRefundField>

          <ManualRefundField error={formErrors.refundDestination}>
            <div className="flex flex-col gap-2">
              <Label className="text-sm leading-none font-medium text-foreground">
                {fields.refundDestination.label}
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formValues.refundDestination || undefined}
                onValueChange={(value) => onFieldChange('refundDestination', value)}
              >
                <SelectTrigger
                  className={endorsementDropdownTriggerStyles}
                  aria-invalid={Boolean(formErrors.refundDestination)}
                >
                  <SelectValue placeholder={fields.refundDestination.placeholder} />
                </SelectTrigger>
                <SelectContent className={endorsementDropdownContentStyles}>
                  {POLICY_MANUAL_REFUND_DESTINATION_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={endorsementDropdownItemStyles}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ManualRefundField>
        </div>
      </div>
    </div>
  );
}
