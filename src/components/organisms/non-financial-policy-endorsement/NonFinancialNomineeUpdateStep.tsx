import { useEffect, useState } from 'react';
import { Plus, SquarePen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConfirmationPopup } from '@/components/molecules/ConfirmationPopup';

export type UpdatableMemberType = 'nominee' | 'dependent';

export type UpdatableMemberOption = {
  id: string;
  title: string;
  subtitle: string;
  name: string;
  mobileNumber: string;
  email: string;
  gender?: string;
  dateOfBirth: string;
  relationship: string;
};

type NonFinancialNomineeUpdateStepProps = {
  memberType: UpdatableMemberType;
  options: UpdatableMemberOption[];
  selectedOptionId: string;
  errorMessage?: string;
  onSelectOption: (id: string) => void;
  onEditOption?: (id: string) => void;
  onAddMember?: () => void;
  onDeleteOption?: (id: string) => void;
  onDeleteConfirmationVisibilityChange?: (isVisible: boolean) => void;
};

export const NonFinancialNomineeUpdateStep = ({
  memberType,
  options,
  selectedOptionId,
  errorMessage,
  onSelectOption,
  onEditOption,
  onAddMember,
  onDeleteOption,
  onDeleteConfirmationVisibilityChange,
}: NonFinancialNomineeUpdateStepProps) => {
  const canAddMember = Boolean(onAddMember) && (memberType === 'dependent' || options.length === 0);
  const [deleteCandidate, setDeleteCandidate] = useState<UpdatableMemberOption | null>(null);

  const handleAddMember = () => {
    onAddMember?.();
  };

  const handleEditOption = (id: string) => {
    onSelectOption(id);
    onEditOption?.(id);
  };

  const handleDeleteClick = (option: UpdatableMemberOption) => {
    if (!onDeleteOption) {
      return;
    }
    if (memberType !== 'dependent') {
      onDeleteOption(option.id);
      return;
    }
    setDeleteCandidate(option);
  };

  const handleDeleteCancel = () => {
    setDeleteCandidate(null);
  };

  const handleConfirmDelete = () => {
    if (!onDeleteOption || !deleteCandidate) {
      return;
    }
    onDeleteOption(deleteCandidate.id);
    setDeleteCandidate(null);
  };

  const isDeleteConfirmationView = memberType === 'dependent' && deleteCandidate !== null;

  useEffect(() => {
    onDeleteConfirmationVisibilityChange?.(isDeleteConfirmationView);
  }, [isDeleteConfirmationView, onDeleteConfirmationVisibilityChange]);

  if (isDeleteConfirmationView) {
    return (
      <ConfirmationPopup
        title="Delete dependent?"
        subtitle="Are you sure you want to remove this dependent from this policy?"
        confirmButtonLabel="Yes, delete dependent"
        cancelButtonLabel="Back"
        onBack={handleDeleteCancel}
        onConfirm={handleConfirmDelete}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="text-endorse-policy-text text-lg font-semibold leading-none">
          {`Select ${memberType}`}
        </p>
        <p className="text-endorse-policy-muted text-sm leading-5">
          {`Select one of the ${memberType}s for endorsement`}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {options.length ? (
          <div className="flex flex-col gap-3">
            {options.map((option) => {
              const isSelected = option.id === selectedOptionId;
              return (
                <div
                  key={option.id}
                  className={cn(
                    'rounded-lg border p-3 transition-colors',
                    isSelected
                      ? 'border-simple-select-accent bg-simple-select-accent-bg'
                      : 'border-endorse-policy-border bg-white',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectOption(option.id)}
                      className="flex-1 text-left"
                    >
                      <p className="text-endorse-policy-text text-sm font-medium leading-none">
                        {option.title}
                      </p>
                      <p className="text-endorse-policy-muted mt-1.5 text-xs leading-none">
                        {option.subtitle}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleEditOption(option.id)}
                        aria-label={`Edit ${option.title}`}
                        className="p-2 text-endorse-policy-muted hover:text-endorse-policy-text transition-colors"
                      >
                        <SquarePen className="h-4 w-4" />
                      </button>
                      {onDeleteOption ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(option)}
                          aria-label={`Delete ${option.title}`}
                          className="p-2 text-endorse-policy-muted hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-endorse-policy-border bg-white p-3">
            <p className="text-endorse-policy-muted text-sm leading-5">
              {`No ${memberType}s found. Add a ${memberType} to continue.`}
            </p>
          </div>
        )}
        {errorMessage ? (
          <p className="text-destructive text-xs leading-none">{errorMessage}</p>
        ) : null}

        {canAddMember ? (
          <button
            type="button"
            onClick={handleAddMember}
            className="cursor-pointer text-endorse-policy-text hover:bg-primary-foreground flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-endorse-policy-border py-2.5 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{`Add ${memberType}`}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};
