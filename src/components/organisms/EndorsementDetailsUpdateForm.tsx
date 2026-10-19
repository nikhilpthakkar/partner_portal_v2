'use client';

import { type ChangeEvent, useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LabeledInput } from '@/components/molecules/LabeledInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DOCUMENT_UPLOAD_ACCEPT, isDocumentUploadAllowed } from '@/lib/utils/documentUpload';
import {
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from '@/lib/constants/policyEndorsement.constants';

type EndorsementDetailsUpdateValues = {
  name: string;
  mobileNumber: string;
  email: string;
  passportNumber: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
};

type EndorsementDetailsUpdateFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policyNumber: string;
  defaultValues?: EndorsementDetailsUpdateValues;
  genderOptions?: { label: string; value: string }[];
  maritalStatusOptions?: { label: string; value: string }[];
  onBack: () => void;
  onSave: (values: EndorsementDetailsUpdateValues, file: File | null) => void;
  className?: string;
};

const DEFAULT_VALUES: EndorsementDetailsUpdateValues = {
  name: 'Aman Kumar Saini',
  mobileNumber: '9904320031',
  email: 'suresh@example.com',
  passportNumber: 'AF0034333',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
};

export default function EndorsementDetailsUpdateForm({
  open,
  onOpenChange,
  policyNumber,
  defaultValues = DEFAULT_VALUES,
  genderOptions = GENDER_OPTIONS,
  maritalStatusOptions = MARITAL_STATUS_OPTIONS,
  onBack,
  onSave,
  className,
}: EndorsementDetailsUpdateFormProps) {
  const [values, setValues] = useState<EndorsementDetailsUpdateValues>(defaultValues);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidatingFile, setIsValidatingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileSelectGenerationRef = useRef(0);
  const fileInputId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(defaultValues);
    setSelectedFile(null);
    setIsValidatingFile(false);
    fileSelectGenerationRef.current += 1;
  }, [defaultValues, open]);

  const handleFieldChange = (field: keyof EndorsementDetailsUpdateValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      fileSelectGenerationRef.current += 1;
      setSelectedFile(null);
      setIsValidatingFile(false);
      return;
    }
    const generation = ++fileSelectGenerationRef.current;
    setIsValidatingFile(true);
    void (async () => {
      try {
        const allowed = await isDocumentUploadAllowed(file, event.target);
        if (generation !== fileSelectGenerationRef.current) return;
        if (!allowed) {
          setSelectedFile(null);
          return;
        }
        setSelectedFile(file);
      } finally {
        if (generation === fileSelectGenerationRef.current) {
          setIsValidatingFile(false);
        }
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'max-w-4xl mx-auto border border-border bg-background rounded-lg p-6 shadow-lg',
          className,
        )}
      >
        <div className="flex flex-col gap-6">
          <DialogTitle className="flex flex-col gap-1.5 pr-6">
            <p className="text-lg leading-none font-semibold text-foreground">Endorse policy</p>
            <p className="text-sm leading-5 text-muted-foreground">
              Selected policy <span className="text-foreground">{policyNumber}</span>
            </p>
          </DialogTitle>

          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput
              label="Name"
              value={values.name}
              onChange={(value) => handleFieldChange('name', value)}
              placeholder="Enter name"
            />
            <LabeledDateTrigger
              label="Date of birth"
              value={values.dateOfBirth}
              placeholder="Pick a date"
              onClick={() => {
                // Date picker interaction will be wired once the API is available.
              }}
            />
            <LabeledInput
              label="Mobile number"
              value={values.mobileNumber}
              onChange={(value) => handleFieldChange('mobileNumber', value)}
              placeholder="Enter mobile number"
            />
            <LabeledSelectField
              label="Gender"
              value={values.gender}
              options={genderOptions}
              placeholder="Select gender"
              onValueChange={(value) => handleFieldChange('gender', value)}
            />
            <LabeledInput
              label="Email"
              value={values.email}
              onChange={(value) => handleFieldChange('email', value)}
              placeholder="Enter email"
            />
            <LabeledSelectField
              label="Marital status"
              value={values.maritalStatus}
              options={maritalStatusOptions}
              placeholder="Select marital status"
              onValueChange={(value) => handleFieldChange('maritalStatus', value)}
            />
            <LabeledInput
              label="Passport number"
              value={values.passportNumber}
              onChange={(value) => handleFieldChange('passportNumber', value)}
              placeholder="Enter passport number"
            />
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm leading-none font-medium text-foreground">
                Supporting documents (Optional)
              </p>
              <p className="text-sm leading-5 text-muted-foreground">
                For changes to mobile, email, or marital status, you can upload a supporting
                document.
              </p>
            </div>
            <div className="mt-4 rounded-lg border border-dashed border-border p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-md border border-border bg-card p-3 shadow-xs">
                  <Upload className="h-6 w-6 text-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-xl leading-7 font-semibold text-foreground">Choose file</p>
                  <p className="text-sm leading-5 text-muted-foreground">
                    {selectedFile?.name ?? 'No file chosen'}
                  </p>
                </div>
                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={DOCUMENT_UPLOAD_ACCEPT}
                  disabled={isValidatingFile}
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  className="bg-primary text-primary-foreground hover:bg-primary/80"
                  disabled={isValidatingFile}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload document
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="button" onClick={() => onSave(values, selectedFile)}>
              Save changes
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}

type LabeledDateTriggerProps = {
  label: string;
  value: string;
  placeholder: string;
  onClick: () => void;
};

function LabeledDateTrigger({ label, value, placeholder, onClick }: LabeledDateTriggerProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm leading-none font-medium text-foreground">{label}</Label>
      <Button
        type="button"
        variant="outline"
        className="h-9 w-full justify-start gap-2 px-3 text-sm font-normal text-muted-foreground"
        onClick={onClick}
      >
        <CalendarDays className="h-4 w-4" />
        {value || placeholder}
      </Button>
    </div>
  );
}

type SelectOption = {
  label: string;
  value: string;
};

type LabeledSelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
};

function LabeledSelectField({
  label,
  value,
  placeholder,
  options,
  onValueChange,
}: LabeledSelectFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm leading-none font-medium text-foreground">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 w-full bg-white">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
