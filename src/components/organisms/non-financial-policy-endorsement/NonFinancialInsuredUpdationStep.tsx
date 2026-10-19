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
  MARITAL_STATUS_OPTIONS,
} from '@/lib/constants/policyEndorsement.constants';
import { DOCUMENT_UPLOAD_ACCEPT } from '@/lib/utils/documentUpload';

type NonFinancialInsuredUpdationStepProps = {
  insuredNameValue: string;
  insuredPhoneValue: string;
  insuredEmailValue: string;
  selectedDateOfBirth: Date | undefined;
  formattedDateOfBirth: string;
  selectedGender: string;
  selectedMaritalStatus: string;
  selectedFile: File | null;
  formErrors: {
    name?: string;
    dateOfBirth?: string;
    phone?: string;
    email?: string;
  };
  fileInputRef: RefObject<HTMLInputElement | null>;
  onInsuredNameChange: (value: string) => void;
  onInsuredPhoneChange: (value: string) => void;
  onInsuredEmailChange: (value: string) => void;
  onSelectDateOfBirth: (value: Date | undefined) => void;
  onSelectGender: (value: string) => void;
  onSelectMaritalStatus: (value: string) => void;
  onSupportingDocumentSelect: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const NonFinancialInsuredUpdationStep = ({
  insuredNameValue,
  insuredPhoneValue,
  insuredEmailValue,
  selectedDateOfBirth,
  formattedDateOfBirth,
  selectedGender,
  selectedMaritalStatus,
  selectedFile,
  formErrors,
  fileInputRef,
  onInsuredNameChange,
  onInsuredPhoneChange,
  onInsuredEmailChange,
  onSelectDateOfBirth,
  onSelectGender,
  onSelectMaritalStatus,
  onSupportingDocumentSelect,
}: NonFinancialInsuredUpdationStepProps) => (
  <div className="flex flex-col gap-4">
    <div className="grid gap-4 md:grid-cols-2">
      <LabeledEditableInput
        label="Name"
        value={insuredNameValue}
        onChange={onInsuredNameChange}
        error={formErrors.name}
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
        {formErrors.dateOfBirth ? (
          <p className="text-destructive text-xs leading-none">{formErrors.dateOfBirth}</p>
        ) : null}
      </div>
      <LabeledEditableInput
        label="Mobile number"
        value={insuredPhoneValue}
        onChange={onInsuredPhoneChange}
        error={formErrors.phone}
      />
      <LabeledSelectField
        label="Gender"
        value={selectedGender}
        placeholder="Select gender"
        onValueChange={onSelectGender}
        options={GENDER_OPTIONS}
      />
      <LabeledEditableInput
        label="Email"
        value={insuredEmailValue}
        onChange={onInsuredEmailChange}
        error={formErrors.email}
      />
      <LabeledSelectField
        label="Marital status"
        value={selectedMaritalStatus}
        placeholder="Select marital status"
        onValueChange={onSelectMaritalStatus}
        options={MARITAL_STATUS_OPTIONS}
      />
    </div>

    <div className="rounded-xl border border-endorse-policy-border bg-primary-foreground p-4">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium leading-none text-endorse-policy-text">
          {'Supporting documents (Optional)'}
        </p>
        <p className="text-endorse-policy-muted text-sm leading-5">
          {
            'For changes to mobile no., email, or marital status, you can upload a supporting document.'
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
        <p className="text-endorse-policy-text text-sm font-medium leading-none">{'Choose file'}</p>
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
  </div>
);

type SelectOption = {
  value: string;
  label: string;
};

type LabeledSelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
};

const LabeledSelectField = ({
  label,
  value,
  placeholder,
  options,
  onValueChange,
}: LabeledSelectFieldProps) => (
  <div className="flex flex-col gap-2">
    <Label className="text-sm leading-none font-medium text-endorse-policy-text">{label}</Label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 w-full border-endorse-policy-border bg-white px-3 text-sm shadow-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border-endorse-policy-border bg-white">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

type LabeledEditableInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

const LabeledEditableInput = ({ label, value, onChange, error }: LabeledEditableInputProps) => (
  <div className="flex flex-col gap-2">
    <Label className="text-sm leading-none font-medium text-endorse-policy-text">{label}</Label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 border-endorse-policy-border bg-white px-3 text-sm shadow-xs rounded-md"
    />
    {error ? <p className="text-destructive text-xs leading-none">{error}</p> : null}
  </div>
);
