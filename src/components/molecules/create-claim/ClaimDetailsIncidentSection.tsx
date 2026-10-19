import { Textarea } from '@/components/ui/textarea';
import { SingleDatePopoverField } from '@/components/molecules/SingleDatePopoverField';
import {
  CREATE_CLAIM_INCIDENT_DESCRIPTION_PLACEHOLDER,
  CREATE_CLAIM_INCIDENT_FORM_LABELS,
  CREATE_CLAIM_DATE_CALENDAR_FROM_YEAR,
} from '@/lib/constants/createClaim.constants';
import type { RecentSearchPolicy } from '@/lib/types/policy-management';
import {
  buildCreateClaimIncidentDateCalendarDisabled,
  getCreateClaimCalendarToYear,
  isCreateClaimFutureCalendarDay,
  parseCreateClaimStoredDate,
  serializeCreateClaimStoredDate,
} from '@/lib/utils/createClaim';

export type ClaimDetailsIncidentSectionProps = {
  selectedPolicy: RecentSearchPolicy;
  dateOfIncident: string;
  dateOfIntimation: string;
  descriptionOfIncident: string;
  incidentWordsRemaining: number;
  onDateIncidentChange: (value: string) => void;
  onDateIntimationChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export function ClaimDetailsIncidentSection({
  selectedPolicy,
  dateOfIncident,
  dateOfIntimation,
  descriptionOfIncident,
  incidentWordsRemaining,
  onDateIncidentChange,
  onDateIntimationChange,
  onDescriptionChange,
}: ClaimDetailsIncidentSectionProps) {
  return (
    <div className="border-t border-pagination-border px-6 py-6 -mx-6">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SingleDatePopoverField
            triggerId="date-incident-create-claim"
            label={
              <>
                {CREATE_CLAIM_INCIDENT_FORM_LABELS.dateOfIncident}
                <span className="text-destructive">*</span>
              </>
            }
            selected={parseCreateClaimStoredDate(dateOfIncident)}
            onSelect={(d) => onDateIncidentChange(serializeCreateClaimStoredDate(d))}
            fromYear={CREATE_CLAIM_DATE_CALENDAR_FROM_YEAR}
            toYear={getCreateClaimCalendarToYear()}
            disabled={buildCreateClaimIncidentDateCalendarDisabled(selectedPolicy)}
            calendarRequired
            required
          />
          <SingleDatePopoverField
            triggerId="date-intimation-create-claim"
            label={
              <>
                {CREATE_CLAIM_INCIDENT_FORM_LABELS.dateOfIntimation}
                <span className="text-destructive">*</span>
              </>
            }
            selected={parseCreateClaimStoredDate(dateOfIntimation)}
            onSelect={(d) => onDateIntimationChange(serializeCreateClaimStoredDate(d))}
            fromYear={CREATE_CLAIM_DATE_CALENDAR_FROM_YEAR}
            toYear={getCreateClaimCalendarToYear()}
            disabled={isCreateClaimFutureCalendarDay}
            calendarRequired
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="description-incident-create-claim"
            className="text-sm font-medium leading-none text-pagination-text"
          >
            {CREATE_CLAIM_INCIDENT_FORM_LABELS.descriptionOfIncident}
            {'  '}
            <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="description-incident-create-claim"
            className="placeholder:text-pagination-text-muted min-h-[76px] resize-y"
            value={descriptionOfIncident}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={CREATE_CLAIM_INCIDENT_DESCRIPTION_PLACEHOLDER}
            aria-required
          />
          <p className="text-sm text-pagination-text-muted">{`${incidentWordsRemaining} words remaining`}</p>
        </div>
      </div>
    </div>
  );
}
