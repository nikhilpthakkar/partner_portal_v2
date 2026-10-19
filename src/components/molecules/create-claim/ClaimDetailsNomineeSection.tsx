'use client';

import { useCallback, useState } from 'react';
import { Phone } from 'lucide-react';
import { SingleDatePopoverField } from '@/components/molecules/SingleDatePopoverField';
import { Input } from '@/components/ui/input';
import {
  CREATE_CLAIM_NOMINEE_FORM_LABELS,
  CREATE_CLAIM_DATE_CALENDAR_FROM_YEAR,
} from '@/lib/constants/createClaim.constants';
import {
  getCreateClaimCalendarToYear,
  isCreateClaimFutureCalendarDay,
  parseCreateClaimStoredDate,
  serializeCreateClaimStoredDate,
} from '@/lib/utils/createClaim';
import { VALIDATION_MESSAGES, isValidEmail, isValidIndianMobile } from '@/lib/utils/validation';
import { LabeledInput } from '../LabeledInput';

export type ClaimDetailsNomineeSectionProps = {
  nomineeName: string;
  nomineePhone: string;
  nomineeEmail: string;
  nomineeDateOfBirth: string;
  onNomineeNameChange: (value: string) => void;
  onNomineePhoneChange: (value: string) => void;
  onNomineeEmailChange: (value: string) => void;
  onNomineeDobChange: (value: string) => void;
};

export function ClaimDetailsNomineeSection({
  nomineeName,
  nomineePhone,
  nomineeEmail,
  nomineeDateOfBirth,
  onNomineeNameChange,
  onNomineePhoneChange,
  onNomineeEmailChange,
  onNomineeDobChange,
}: ClaimDetailsNomineeSectionProps) {
  const [nomineePhoneError, setNomineePhoneError] = useState('');
  const [nomineeEmailError, setNomineeEmailError] = useState('');

  const validateNomineePhoneOnBlur = useCallback(() => {
    const v = nomineePhone.trim();
    setNomineePhoneError(
      v !== '' && !isValidIndianMobile(nomineePhone) ? VALIDATION_MESSAGES.MOBILE_REQUIRED : '',
    );
  }, [nomineePhone]);

  const validateNomineeEmailOnBlur = useCallback(() => {
    const v = nomineeEmail.trim();
    setNomineeEmailError(
      v !== '' && !isValidEmail(nomineeEmail) ? VALIDATION_MESSAGES.EMAIL_REQUIRED : '',
    );
  }, [nomineeEmail]);

  const handleNomineePhoneChange = useCallback(
    (next: string) => {
      onNomineePhoneChange(next.replace(/\D/g, '').slice(0, 10));
      setNomineePhoneError('');
    },
    [onNomineePhoneChange],
  );

  const handleNomineeEmailChange = useCallback(
    (v: string) => {
      onNomineeEmailChange(v);
      setNomineeEmailError('');
    },
    [onNomineeEmailChange],
  );

  return (
    <div className="border-t border-pagination-border px-6 py-6 -mx-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <LabeledInput
            label={CREATE_CLAIM_NOMINEE_FORM_LABELS.nomineeName}
            value={nomineeName}
            onChange={onNomineeNameChange}
            placeholder="Enter nominee full name"
            aria-required
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <LabeledInput
            label={CREATE_CLAIM_NOMINEE_FORM_LABELS.nomineePhone}
            value={nomineePhone}
            onChange={handleNomineePhoneChange}
            onBlur={validateNomineePhoneOnBlur}
            inputMode="tel"
            placeholder="Enter mobile number"
            aria-required
            aria-invalid={nomineePhoneError ? true : undefined}
            aria-describedby={nomineePhoneError ? 'nominee-phone-create-claim-error' : undefined}
            required
          />
          {nomineePhoneError ? (
            <p
              id="nominee-phone-create-claim-error"
              className="text-destructive text-xs leading-snug"
            >
              {nomineePhoneError}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <LabeledInput
            label={CREATE_CLAIM_NOMINEE_FORM_LABELS.nomineeEmail}
            value={nomineeEmail}
            onChange={handleNomineeEmailChange}
            onBlur={validateNomineeEmailOnBlur}
            type="email"
            placeholder="nominee@gmail.com"
            aria-required
            required
          />
          {nomineeEmailError ? (
            <p
              id="nominee-email-create-claim-error"
              className="text-destructive text-xs leading-snug"
            >
              {nomineeEmailError}
            </p>
          ) : null}
        </div>
        <SingleDatePopoverField
          triggerId="nominee-dob-create-claim"
          label={
            <>
              {CREATE_CLAIM_NOMINEE_FORM_LABELS.nomineeDateOfBirth}
              <span className="text-destructive">*</span>
            </>
          }
          selected={parseCreateClaimStoredDate(nomineeDateOfBirth)}
          onSelect={(d) => onNomineeDobChange(serializeCreateClaimStoredDate(d))}
          fromYear={CREATE_CLAIM_DATE_CALENDAR_FROM_YEAR}
          toYear={getCreateClaimCalendarToYear()}
          disabled={isCreateClaimFutureCalendarDay}
          calendarRequired
          required
        />
      </div>
    </div>
  );
}
