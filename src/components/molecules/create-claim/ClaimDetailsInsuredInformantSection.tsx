'use client';

import { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LabeledInput } from '@/components/molecules/LabeledInput';
import { CREATE_CLAIM_INSURED_FORM_LABELS } from '@/lib/constants/createClaim.constants';
import { VALIDATION_MESSAGES, isValidEmail, isValidIndianMobile } from '@/lib/utils/validation';
import { cn } from '@/lib/utils';
import { Phone } from 'lucide-react';

export type ClaimDetailsInsuredInformantSectionProps = {
  insuredNameField: string;
  informantName: string;
  informantPhone: string;
  informantEmail: string;
  onInsuredNameChange: (value: string) => void;
  onInformantNameChange: (value: string) => void;
  onInformantPhoneChange: (value: string) => void;
  onInformantEmailChange: (value: string) => void;
};

function requiredLabel(text: string) {
  return (
    <>
      {text}
      <span className="text-destructive">*</span>
    </>
  );
}

export function ClaimDetailsInsuredInformantSection({
  insuredNameField,
  informantName,
  informantPhone,
  informantEmail,
  onInsuredNameChange,
  onInformantNameChange,
  onInformantPhoneChange,
  onInformantEmailChange,
}: ClaimDetailsInsuredInformantSectionProps) {
  const [informantPhoneError, setInformantPhoneError] = useState('');
  const [informantEmailError, setInformantEmailError] = useState('');

  const validateInformantPhoneOnBlur = useCallback(() => {
    const v = informantPhone.trim();
    setInformantPhoneError(
      v !== '' && !isValidIndianMobile(informantPhone) ? VALIDATION_MESSAGES.MOBILE_REQUIRED : '',
    );
  }, [informantPhone]);

  const validateInformantEmailOnBlur = useCallback(() => {
    const v = informantEmail.trim();
    setInformantEmailError(
      v !== '' && !isValidEmail(informantEmail) ? VALIDATION_MESSAGES.EMAIL_REQUIRED : '',
    );
  }, [informantEmail]);

  const handleInformantPhoneChange = useCallback(
    (raw: string) => {
      onInformantPhoneChange(raw.replace(/\D/g, '').slice(0, 10));
      setInformantPhoneError('');
    },
    [onInformantPhoneChange],
  );

  const handleInformantEmailChange = useCallback(
    (v: string) => {
      onInformantEmailChange(v);
      setInformantEmailError('');
    },
    [onInformantEmailChange],
  );

  return (
    <div className="border-t border-pagination-border px-6 py-6 -mx-6">
      <div className="grid gap-6 md:grid-cols-2">
        <LabeledInput
          label={requiredLabel(CREATE_CLAIM_INSURED_FORM_LABELS.insuredName)}
          value={insuredNameField}
          onChange={onInsuredNameChange}
          aria-required
          placeholder="Enter insured full name"
        />
        <LabeledInput
          label={requiredLabel(CREATE_CLAIM_INSURED_FORM_LABELS.informantName)}
          value={informantName}
          onChange={onInformantNameChange}
          placeholder="Enter informant full name"
          aria-required
        />
        <div className="flex flex-col gap-2">
          <LabeledInput
            label={requiredLabel(CREATE_CLAIM_INSURED_FORM_LABELS.informantPhone)}
            value={informantPhone}
            onChange={handleInformantPhoneChange}
            onBlur={validateInformantPhoneOnBlur}
            inputMode="tel"
            placeholder="Enter mobile number"
            aria-required
            aria-invalid={informantPhoneError ? true : undefined}
            aria-describedby={
              informantPhoneError ? 'informant-phone-create-claim-error' : undefined
            }
          />
          {informantPhoneError ? (
            <p
              id="informant-phone-create-claim-error"
              className="text-destructive text-xs leading-snug"
            >
              {informantPhoneError}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <LabeledInput
            label={requiredLabel(CREATE_CLAIM_INSURED_FORM_LABELS.informantEmail)}
            value={informantEmail}
            onChange={handleInformantEmailChange}
            onBlur={validateInformantEmailOnBlur}
            type="email"
            placeholder="name@example.com"
            aria-required
            aria-invalid={informantEmailError ? true : undefined}
            aria-describedby={
              informantEmailError ? 'informant-email-create-claim-error' : undefined
            }
          />
          {informantEmailError ? (
            <p
              id="informant-email-create-claim-error"
              className="text-destructive text-xs leading-snug"
            >
              {informantEmailError}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
