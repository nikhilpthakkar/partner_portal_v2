import PolicySearchBar from '@/components/molecules/PolicySearchBar';
import PolicyManagementTableSkelton from '@/components/molecules/skeltons/PolicyManagementTableSkelton';
import ErrorCard from '@/components/molecules/ErrorCard';
import TruncatedTooltipText from '@/components/molecules/TruncatedTooltipText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CREATE_CLAIM_FOOTER,
  CREATE_CLAIM_TABLE_LABELS,
} from '@/lib/constants/createClaim.constants';
import type { PolicyTableRow } from '@/lib/types/policy-management';
import { cn, formatEnum } from '@/lib/utils';
import { formatIssuedOnDisplay } from '@/lib/utils/createClaim';
import type { CreateClaimFilterOption } from '@/lib/types/claims-management/createClaim';
import { statusStyles } from '@/components/molecules/PolicyManagementTable';
import { AppImage } from '@/components/atoms/AppImage';

export type CreateClaimSearchPolicyStepProps = {
  filterValue: string;
  filterOptions: CreateClaimFilterOption[];
  onFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  isSearchLoading: boolean;
  isSearchError: boolean;
  tableRows: PolicyTableRow[];
  searchAttempted: boolean;
  selectedRowId: string | null;
  onToggleRow: (row: PolicyTableRow) => void;
  onSeePolicyDetails: () => void;
  onContinue: () => void;
  onBack: () => void;
};

export function CreateClaimSearchPolicyStep({
  filterValue,
  filterOptions,
  onFilterChange,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  isSearchLoading,
  isSearchError,
  tableRows,
  searchAttempted,
  selectedRowId,
  onToggleRow,
  onSeePolicyDetails,
  onContinue,
  onBack,
}: CreateClaimSearchPolicyStepProps) {
  const selectedLabel = filterOptions.find((option) => option.value === filterValue)?.label;
  const selectedRow = selectedRowId ? tableRows.find((row) => row.id === selectedRowId) : undefined;

  return (
    <>
      <PolicySearchBar
        filterValue={filterValue}
        filterOptions={filterOptions}
        onFilterChange={onFilterChange}
        query={searchQuery}
        onQueryChange={onSearchQueryChange}
        onSearch={onSearch}
        className="h-12 shrink-0"
        inputPlaceholder={selectedLabel ? `Search for ${selectedLabel.toLowerCase()}` : 'Search'}
      />
      <div className="flex flex-col space-between gap-4">
        <div className="border-claims-management-table-border rounded-claims-management-table bg-card overflow-hidden border">
          {isSearchLoading && (
            <div className="p-4">
              <PolicyManagementTableSkelton />
            </div>
          )}

          {!isSearchLoading && !isSearchError && tableRows.length > 0 && (
            <Table className="w-full table-fixed">
              <TableHeader className="bg-claims-management-table-header-bg">
                <TableRow className="border-claims-management-table-border h-10">
                  <TableHead className="w-11 bg-claims-management-table-header-bg px-2 py-2.5" />
                  <TableHead className="bg-claims-management-table-header-bg px-4 py-2.5 font-medium uppercase leading-none tracking-normal text-xs text-pagination-text-muted">
                    {CREATE_CLAIM_TABLE_LABELS.policyNumber}
                  </TableHead>
                  <TableHead className="bg-claims-management-table-header-bg px-4 py-2.5 font-medium uppercase leading-none tracking-normal text-xs capitalize text-pagination-text-muted">
                    {CREATE_CLAIM_TABLE_LABELS.insuredName}
                  </TableHead>
                  <TableHead className="bg-claims-management-table-header-bg px-4 py-2.5 font-medium uppercase leading-none tracking-normal text-xs text-pagination-text-muted">
                    {CREATE_CLAIM_TABLE_LABELS.productName}
                  </TableHead>
                  <TableHead className="bg-claims-management-table-header-bg px-4 py-2.5 font-medium uppercase leading-none tracking-normal text-xs text-pagination-text-muted">
                    {CREATE_CLAIM_TABLE_LABELS.issuedOn}
                  </TableHead>
                  <TableHead className="bg-claims-management-table-header-bg px-4 py-2.5 font-medium uppercase leading-none tracking-normal text-xs text-pagination-text-muted">
                    {CREATE_CLAIM_TABLE_LABELS.status}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row) => {
                  const checked = selectedRowId === row.id;
                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        'cursor-pointer border-claims-management-table-border h-claims-table-row-height border-b',
                        checked ? 'bg-labeled-select-accent-bg' : '',
                      )}
                      onClick={() => onToggleRow(row)}
                    >
                      <TableCell className="w-11 px-2 py-2.5 align-middle">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => {}}
                          aria-label={`Select policy ${row.policyNumber}`}
                        />
                      </TableCell>
                      <TableCell className="max-w-0 px-4 py-2 align-middle">
                        <TruncatedTooltipText text={row.policyNumber} className="text-sm" />
                      </TableCell>
                      <TableCell className="max-w-0 px-4 py-2 align-middle">
                        <TruncatedTooltipText
                          text={row.insuredName}
                          className="text-sm capitalize"
                        />
                      </TableCell>
                      <TableCell className="max-w-0 px-4 py-2 align-middle">
                        <TruncatedTooltipText
                          text={formatEnum(row.productName)}
                          className="text-sm"
                        />
                      </TableCell>
                      <TableCell className="max-w-0 px-4 py-2 align-middle">
                        <TruncatedTooltipText
                          text={formatIssuedOnDisplay(row.issuedOn)}
                          className="text-sm"
                        />
                      </TableCell>
                      <TableCell className="w-[140px] px-4 py-2 align-middle">
                        <Badge
                          className={cn(
                            'border-transparent px-2 py-0.5 text-xs font-medium capitalize',
                            statusStyles[row.status],
                          )}
                          variant="outline"
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {!isSearchLoading && !isSearchError && !searchAttempted && (
            <div className="flex flex-col items-center justify-center gap-4 text-sm text-pagination-text-muted h-[40vh]">
              <AppImage src="/images/table-icon.svg" alt="Table" width={64} height={64} />
              {'Policy details will appear here '}
            </div>
          )}

          {!isSearchLoading &&
            ((!isSearchError && searchAttempted && tableRows.length === 0) || isSearchError) && (
              <div className="flex justify-center h-[40vh]">
                <ErrorCard
                  title={`No results found for ${selectedLabel?.toLowerCase()} "${searchQuery}"  `}
                  className="border-none shadow-none"
                />
              </div>
            )}
        </div>

        {tableRows.length > 0 && !isSearchError && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-light text-sm leading-none text-pagination-text-muted sm:max-w-md">
              {selectedRow != null ? (
                <>
                  {'Selected: '}
                  <span className="font-medium">{selectedRow.insuredName}</span>
                  {` (${selectedRow.policyNumber})`}
                </>
              ) : (
                CREATE_CLAIM_FOOTER.selectPolicyHint
              )}
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-9 px-4 text-sm font-medium shadow-xs"
                onClick={onBack}
              >
                {CREATE_CLAIM_FOOTER.backCta}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!selectedRowId}
                className="h-9 px-4 text-sm font-medium shadow-xs disabled:opacity-50"
                onClick={onSeePolicyDetails}
              >
                {CREATE_CLAIM_FOOTER.seePolicyDetailsCta}
              </Button>
              <Button
                type="button"
                variant="default"
                disabled={!selectedRowId}
                onClick={onContinue}
                className="disabled:text-primary-foreground h-9 bg-create-claim-button px-4 text-sm font-medium text-create-claim-button-text shadow-xs hover:bg-create-claim-button-hover disabled:opacity-50"
              >
                {CREATE_CLAIM_FOOTER.continueCta}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
