import { type ChangeEvent, type RefObject } from 'react';
import { Calendar, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarView } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GENDER_OPTIONS,
  NOMINEE_RELATIONSHIP_OPTIONS,
} from '@/lib/constants/policyEndorsement.constants';
import type { SelectOption } from '@/lib/types/Global';
import type { UpdatableMemberType } from './NonFinancialNomineeUpdateStep';
import { DOCUMENT_UPLOAD_ACCEPT } from '@/lib/utils/documentUpload';

type NonFinancialNomineeFormStepProps = {
  memberType: UpdatableMemberType;
  memberName: string;
  memberMobileNumber: string;
  memberEmail: string;
  memberGender?: string;
  selectedDateOfBirth: Date | undefined;
  formattedDateOfBirth: string;
  memberRelationship: string;
  formErrors?: {
    name?: string;
    mobileNumber?: string;
    email?: string;
    gender?: string;
    dateOfBirth?: string;
    relationship?: string;
  };
  selectedFile: File | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onMemberNameChange: (value: string) => void;
  onMemberMobileNumberChange: (value: string) => void;
  onMemberEmailChange: (value: string) => void;
  onMemberGenderChange?: (value: string) => void;
  onSelectDateOfBirth: (value: Date | undefined) => void;
  onMemberRelationshipChange: (value: string) => void;
  memberRelationshipOptions?: SelectOption[];
  onSupportingDocumentSelect?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const NonFinancialNomineeFormStep = ({
  memberType,
  memberName,
  memberMobileNumber,
  memberEmail,
  memberGender,
  selectedDateOfBirth,
  formattedDateOfBirth,
  memberRelationship,
  formErrors,
  selectedFile,
  fileInputRef,
  onMemberNameChange,
  onMemberMobileNumberChange,
  onMemberEmailChange,
  onMemberGenderChange,
  onSelectDateOfBirth,
  onMemberRelationshipChange,
  memberRelationshipOptions,
  onSupportingDocumentSelect,
}: NonFinancialNomineeFormStepProps) => {
  const relationshipOptions =
    memberType === 'dependent' ? (memberRelationshipOptions ?? []) : NOMINEE_RELATIONSHIP_OPTIONS;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <LabeledInput
          label={`${capitalizeMemberType(memberType)} name`}
          placeholder={`Enter ${memberType} name`}
          value={memberName}
          onChange={onMemberNameChange}
          error={formErrors?.name}
        />
        <div className="flex flex-col gap-2">
          <Label className="text-sm leading-none font-medium text-endorse-policy-text">
            {'Date of birth'}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full justify-start gap-2 border-endorse-policy-border bg-white px-3 text-sm font-normal shadow-xs"
              >
                <Calendar className="h-4 w-4" />
                <span
                  className={
                    formattedDateOfBirth ? 'text-endorse-policy-text' : 'text-endorse-policy-muted'
                  }
                >
                  {formattedDateOfBirth || 'Pick a date'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-auto p-0">
              <CalendarView
                mode="single"
                selected={selectedDateOfBirth}
                onSelect={onSelectDateOfBirth}
                captionLayout="dropdown"
                fromYear={1960}
                toYear={new Date().getFullYear()}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
          {formErrors?.dateOfBirth ? (
            <p className="text-destructive text-xs leading-none">{formErrors.dateOfBirth}</p>
          ) : null}
        </div>
        <LabeledInput
          label="Mobile number"
          placeholder="Enter mobile number"
          value={memberMobileNumber}
          onChange={onMemberMobileNumberChange}
          error={formErrors?.mobileNumber}
        />
        <LabeledInput
          label="Email"
          placeholder="Enter email"
          value={memberEmail}
          onChange={onMemberEmailChange}
          error={formErrors?.email}
        />
        <div className="flex flex-col gap-2">
          <Label className="text-sm leading-none font-medium text-endorse-policy-text">
            {'Gender'}
          </Label>
          <Select
            value={memberGender ?? ''}
            onValueChange={(value) => onMemberGenderChange?.(value)}
          >
            <SelectTrigger className="h-9 w-full border-endorse-policy-border bg-white px-3 text-sm shadow-xs">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="border-endorse-policy-border bg-white">
              {GENDER_OPTIONS.map((genderOption) => (
                <SelectItem key={genderOption.value} value={genderOption.value}>
                  {genderOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors?.gender ? (
            <p className="text-destructive text-xs leading-none">{formErrors.gender}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-sm leading-none font-medium text-endorse-policy-text">
            {`${capitalizeMemberType(memberType)} relationship`}
          </Label>
          <Select
            value={memberRelationship}
            onValueChange={onMemberRelationshipChange}
            disabled={relationshipOptions.length === 0}
          >
            <SelectTrigger className="h-9 w-full border-endorse-policy-border bg-white px-3 text-sm shadow-xs">
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent className="border-endorse-policy-border bg-white">
              {relationshipOptions.map((relationshipOption) => (
                <SelectItem key={relationshipOption.value} value={relationshipOption.value}>
                  {relationshipOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors?.relationship ? (
            <p className="text-destructive text-xs leading-none">{formErrors.relationship}</p>
          ) : null}
        </div>
      </div>

      {memberType === 'dependent' ? (
        <div className="rounded-xl border border-endorse-policy-border bg-primary-foreground p-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium leading-none text-endorse-policy-text">
              {'Supporting documents (Optional)'}
            </p>
            <p className="text-endorse-policy-muted text-sm leading-5">
              {
                'For changes to mobile, email, or marital status, you can upload a supporting document.'
              }
            </p>
          </div>
          <button
            type="button"
            className="mt-4 flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-endorse-policy-border p-6 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="rounded-md border border-endorse-policy-border bg-background p-2 shadow-xs">
              <Upload className="h-6 w-6 text-endorse-policy-text" />
            </span>
            <p className="text-endorse-policy-text text-sm font-medium leading-none">
              {'Select file'}
            </p>
            <p className="text-endorse-policy-muted text-xs leading-none">
              {selectedFile?.name ?? 'No file chosen'}
            </p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={DOCUMENT_UPLOAD_ACCEPT}
            onChange={onSupportingDocumentSelect}
          />
        </div>
      ) : null}
    </div>
  );
};

const capitalizeMemberType = (memberType: UpdatableMemberType) =>
  memberType.charAt(0).toUpperCase() + memberType.slice(1);

type LabeledInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

const LabeledInput = ({ label, placeholder, value, onChange, error }: LabeledInputProps) => (
  <div className="flex flex-col gap-2">
    <Label className="text-sm leading-none font-medium text-endorse-policy-text">{label}</Label>
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-9 border-endorse-policy-border bg-white px-3 text-sm shadow-xs rounded-md"
    />
    {error ? <p className="text-destructive text-xs leading-none">{error}</p> : null}
  </div>
);
