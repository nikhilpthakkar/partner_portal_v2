'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { DateRange } from 'react-day-picker';
import { format, subMonths } from 'date-fns';
import { CircleAlert, Download } from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '@/components/atoms/Pagination';
import ErrorCard from '@/components/molecules/ErrorCard';
import PolicyManagementTableSkelton from '@/components/molecules/skeltons/PolicyManagementTableSkelton';
import UnderlineTabs from '@/components/molecules/UnderlineTabs';
import Filters from '@/components/organisms/Filters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROWS_PER_PAGE_OPTIONS } from '@/lib/constants/global.constants';
import type { SelectOption } from '@/lib/types/Global';
import { usePartnerStore } from '@/lib/store/partner.store';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import { cn, formatEnum } from '@/lib/utils';
import {
  BULK_FILTERS_LABELS,
  BULK_OPERATION_DOWNLOAD_MENU_LABELS,
  BULK_OPERATION_LIST_STATE_MESSAGES,
  BULK_OPERATION_TABLE_LABELS,
  statusStyles,
  TAB_VALUE_TO_BULK_LIST_STATUS,
} from '@/lib/constants/policyBulkOperations.constants';
import {
  useBulkActionListQuery,
  BULK_ACTION_STATUS_SUMMARY_QUERY_KEY,
  useBulkActionStatusSummaryQuery,
  useBulkActionUploadedByQuery,
} from '@/lib/query/policyBulkOperations.queries';
import {
  trackBulkActionListException,
  trackBulkDownloadError,
  trackBulkDownloadInput,
  trackBulkDownloadSuccess,
} from '@/lib/segment/track/policy';
import type {
  BulkActionListItem,
  BulkOperationAction,
  BulkOperationRow,
  BulkOperationStatus,
} from '@/lib/types/policy-bulk-operations';
import TruncatedTooltipText from '../molecules/TruncatedTooltipText';

const BULK_FILTERS_CONFIG_IDS = {
  planName: 'planName',
  uploadedBy: 'uploadedBy',
} as const;

const API_STATUS_TO_DISPLAY: Record<string, BulkOperationStatus> = {
  successful: 'successful',
  processing: 'processing',
  partial_successful: 'partially_successful',
  failed: 'failed',
};

function mapApiActionToDisplay(action: string): BulkOperationAction {
  const normalized = action.trim().toLowerCase();
  if (normalized === 'issue' || normalized === 'issuance') {
    return 'Issuance';
  }
  if (normalized === 'cancel' || normalized === 'cancellation') {
    return 'Cancellation';
  }
  if (normalized === 'endorse' || normalized === 'endorsement') {
    return 'Endorsement';
  }
  return 'Issuance';
}

function mapListItemToRow(
  item: BulkActionListItem,
  planNameLabel: string,
  rowIndex: number,
): BulkOperationRow {
  const uploadedAt = new Date(item.uploadedOn);
  const displayStatus = API_STATUS_TO_DISPLAY[item.status] ?? 'SUCCESSFUL';
  return {
    id: `${item.uploadedOn}::${item.fileName}::${String(rowIndex)}`,
    fileName: item.fileName,
    planName: planNameLabel,
    totalRecords: item.totalRecords,
    action: mapApiActionToDisplay(item.action),
    status: displayStatus,
    uploadedOn: Number.isNaN(uploadedAt.getTime())
      ? item.uploadedOn
      : format(uploadedAt, 'MMM dd, yyyy, h:mm a'),
    uploadedOnDate: uploadedAt,
    uploadedBy: item?.uploadedByDetails?.first_name
      ? `${item?.uploadedByDetails?.first_name} ${item?.uploadedByDetails?.last_name}`
      : (item?.uploadedBy ?? '—'),
    successFileUrl: item.resultFiles.successFile,
    errorFileUrl: item.resultFiles.errorFile,
    inputFileUrl: item.resultFiles.inputFile,
  };
}

function openBulkResultDownload(
  url: string | undefined,
  row: BulkOperationRow,
  kind: 'error' | 'success' | 'input',
) {
  let label = '';
  switch (kind) {
    case 'error':
      label = BULK_OPERATION_DOWNLOAD_MENU_LABELS.errorFile;
      break;
    case 'success':
      label = BULK_OPERATION_DOWNLOAD_MENU_LABELS.successFile;
      break;
    case 'input':
      label = BULK_OPERATION_DOWNLOAD_MENU_LABELS.inputFile;
      break;
    default:
      label = '';
  }
  if (url === undefined || url.trim() === '') {
    toast.error(`${label} is not available for ${row.fileName}`);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function PolicyBulkOperations() {
  const segmentBase = useSegmentPartnerBase();
  const { productIds, productOptions } = usePartnerStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('all-uploads');
  const [appliedFilterValues, setAppliedFilterValues] = useState<Record<string, string[]>>(() => ({
    [BULK_FILTERS_CONFIG_IDS.planName]: [],
    [BULK_FILTERS_CONFIG_IDS.uploadedBy]: [],
  }));
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const [page, setPage] = useState<number>(1);
  const [uploadedByOptions, setUploadedByOptions] = useState<SelectOption[]>([]);
  const [hasLoadedUploadedByOptions, setHasLoadedUploadedByOptions] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });

  const selectedPlans = useMemo(() => {
    const stored = appliedFilterValues[BULK_FILTERS_CONFIG_IDS.planName] ?? [];
    if (stored.length === 0) {
      return [...productIds];
    }
    const idSet = new Set(productIds);
    if (stored.every((id) => idSet.has(id))) {
      return [...stored];
    }
    return [...productIds];
  }, [appliedFilterValues, productIds]);

  const selectedUploadedBy = useMemo(
    () => appliedFilterValues[BULK_FILTERS_CONFIG_IDS.uploadedBy] ?? [],
    [appliedFilterValues],
  );

  const appliedValuesForFilters = useMemo(
    () => ({
      ...appliedFilterValues,
      [BULK_FILTERS_CONFIG_IDS.planName]: selectedPlans,
    }),
    [appliedFilterValues, selectedPlans],
  );

  const fromParam = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
  const toParam = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;
  const uploadedByStartDate = fromParam ? `${fromParam}T00:00:00Z` : undefined;
  const uploadedByEndDate = toParam ? `${toParam}T23:59:59Z` : undefined;

  const { data: uploadedByResponse } = useBulkActionUploadedByQuery({
    startDate: uploadedByStartDate,
    endDate: uploadedByEndDate,
    planIds: productIds,
    enabled: !hasLoadedUploadedByOptions,
  });

  const { data: statusSummaryResponse, isPending: isStatusSummaryPending } =
    useBulkActionStatusSummaryQuery({
      from: fromParam,
      to: toParam,
      plan: selectedPlans,
      uploadedBy: selectedUploadedBy,
    });

  const listStatus = TAB_VALUE_TO_BULK_LIST_STATUS[activeTab];

  const {
    data: listResponse,
    isPending: isListPending,
    isFetching: isListFetching,
    isPlaceholderData: isListPlaceholderData,
    isError: isListError,
    error: listError,
  } = useBulkActionListQuery({
    from: fromParam,
    to: toParam,
    plan: selectedPlans,
    uploadedBy: selectedUploadedBy,
    page,
    size: rowsPerPage,
    listStatus,
  });

  useEffect(() => {
    if (!isListError) {
      return;
    }
    trackBulkActionListException(
      segmentBase,
      listError?.message || 'Unable to load bulk uploads list',
    );
  }, [isListError, listError?.message, segmentBase]);

  const pagination = listResponse?.pagination;
  const reportedTotalPages = pagination?.totalPages;
  const totalPages = Math.max(
    1,
    reportedTotalPages !== undefined && reportedTotalPages > 0 ? reportedTotalPages : 1,
  );
  const safePage = Math.min(Math.max(1, page), totalPages);

  const planNameColumnLabel = useMemo(() => {
    if (selectedPlans.length === 0) {
      return '—';
    }
    if (selectedPlans.length === 1) {
      const id = selectedPlans[0];
      return productOptions.find((option) => option.value === id)?.label ?? id;
    }
    return selectedPlans
      .map((id) => productOptions.find((option) => option.value === id)?.label ?? id)
      .join(', ');
  }, [selectedPlans, productOptions]);

  useEffect(() => {
    if (hasLoadedUploadedByOptions) {
      return;
    }
    const users = uploadedByResponse?.data ?? [];
    if (users.length === 0) {
      return;
    }
    const mappedOptions = users
      .map((user) => {
        const value = user.email ?? user.user_id;
        if (value === undefined || value.trim() === '') {
          return null;
        }
        const fullName = [user.first_name, user.last_name]
          .filter((name): name is string => Boolean(name && name.trim().length > 0))
          .join(' ');
        const label = fullName.length > 0 ? fullName : value;
        return {
          value,
          label,
        };
      })
      .filter((option): option is SelectOption => option !== null);

    const uniqueOptions = Array.from(
      new Map(mappedOptions.map((option) => [option.value, option])).values(),
    ).sort((a, b) => a.label.localeCompare(b.label));

    setUploadedByOptions(uniqueOptions);
    setHasLoadedUploadedByOptions(true);
  }, [uploadedByResponse, hasLoadedUploadedByOptions]);

  const uploadedByFilterOptions = useMemo(() => {
    const optionByValue = new Map(uploadedByOptions.map((option) => [option.value, option.label]));
    const selectedOptions = selectedUploadedBy.map((value) => ({
      value,
      label: optionByValue.get(value) ?? value,
    }));
    return Array.from(
      new Map(
        [...uploadedByOptions, ...selectedOptions].map((option) => [option.value, option]),
      ).values(),
    );
  }, [uploadedByOptions, selectedUploadedBy]);

  const tabs = useMemo<SelectOption[]>(() => {
    const counts = statusSummaryResponse?.data.counts;
    const total = statusSummaryResponse?.data.total;
    const labelCount = (value: number | undefined) =>
      isStatusSummaryPending ? '' : `(${String(value ?? 0)})`;

    return [
      { value: 'all-uploads', label: `All uploads ${labelCount(total)}` },
      { value: 'processing', label: `Processing ${labelCount(counts?.processing)}` },
      { value: 'completed', label: `Completed ${labelCount(counts?.successful)}` },
      {
        value: 'partially-successful',
        label: `Partially successful ${labelCount(counts?.partial_successful)}`,
      },
      { value: 'failed', label: `Failed ${labelCount(counts?.failed)}` },
    ];
  }, [statusSummaryResponse, isStatusSummaryPending]);

  const filtersConfig = useMemo(
    () => [
      {
        id: BULK_FILTERS_CONFIG_IDS.planName,
        placeholder: BULK_OPERATION_TABLE_LABELS.planName,
        options: productIds.map((productId) => ({
          value: productId,
          label: productOptions.find((option) => option.value === productId)?.label ?? productId,
        })),
      },
      {
        id: BULK_FILTERS_CONFIG_IDS.uploadedBy,
        placeholder: BULK_OPERATION_TABLE_LABELS.uploadedBy,
        options: uploadedByFilterOptions,
      },
    ],
    [productIds, productOptions, uploadedByFilterOptions],
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
    void queryClient.invalidateQueries({ queryKey: BULK_ACTION_STATUS_SUMMARY_QUERY_KEY });
  };

  const handleApplyFilters = (values: Record<string, string[]>) => {
    setAppliedFilterValues(values);
    setPage(1);
  };

  const handleDateRangeChange = (value: DateRange) => {
    setDateRange(value);
    setPage(1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setPage(1);
  };

  const visibleRows = useMemo(() => {
    const items = listResponse?.data ?? [];
    return items.map((item, index) => mapListItemToRow(item, planNameColumnLabel, index));
  }, [listResponse?.data, planNameColumnLabel]);

  const showTableSkeleton = isListPending || isListPlaceholderData;
  const hasRows = visibleRows.length > 0;
  const isTableReady = !showTableSkeleton && !isListError && hasRows;
  const showEmptyState = !showTableSkeleton && !isListError && !hasRows;

  const skeletonRowCount = Math.min(Math.max(rowsPerPage, 5), 12);

  return (
    <div className="w-full">
      <div className="border-claims-management-table-border rounded-claims-management-table w-full overflow-hidden border bg-white">
        <div className="border-claims-management-table-border border-b flex items-center justify-between">
          <UnderlineTabs value={activeTab} onValueChange={handleTabChange} tabs={tabs} />
          <div className="border-claims-management-table-border pr-4 py-2">
            <Filters
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              config={filtersConfig}
              labels={BULK_FILTERS_LABELS}
              onApply={handleApplyFilters}
              appliedValues={appliedValuesForFilters}
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-transparent">
          <Table className="table-fixed w-full">
            <TableHeader className="bg-claims-management-table-header-bg sticky top-0 z-20">
              <TableRow className="border-claims-management-table-border h-10">
                <TableHead className="w-width-200">
                  <TruncatedTooltipText text={BULK_OPERATION_TABLE_LABELS.fileName} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={BULK_OPERATION_TABLE_LABELS.planName} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={BULK_OPERATION_TABLE_LABELS.totalRecords} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={BULK_OPERATION_TABLE_LABELS.action} />
                </TableHead>
                <TableHead className="w-width-150">
                  <TruncatedTooltipText text={BULK_OPERATION_TABLE_LABELS.status} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={BULK_OPERATION_TABLE_LABELS.uploadedOn} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={BULK_OPERATION_TABLE_LABELS.uploadedBy} />
                </TableHead>
                <TableHead className="text-right">
                  <TruncatedTooltipText text={BULK_OPERATION_TABLE_LABELS.actions} />
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          <div className="h-[50vh] overflow-y-auto overflow-x-hidden always-scrollbar">
            {showTableSkeleton ? (
              <PolicyManagementTableSkelton rowCount={skeletonRowCount} />
            ) : null}
            {isListError ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-full max-w-md">
                  <ErrorCard
                    icon={<CircleAlert className="size-8" />}
                    title={BULK_OPERATION_LIST_STATE_MESSAGES.errorTitle}
                    description={listError?.message || ''}
                    className="border-none shadow-none"
                  />
                </div>
              </div>
            ) : null}
            {isTableReady ? (
              <Table
                className={cn(
                  'table-fixed w-full',
                  isListFetching && !showTableSkeleton && hasRows && 'opacity-80',
                )}
              >
                <TableBody>
                  {visibleRows.map((row) => {
                    const isProcessing = row.status === 'processing';
                    const hasSuccessUrl =
                      row.successFileUrl !== undefined && row.successFileUrl.trim() !== '';
                    const hasErrorUrl =
                      row.errorFileUrl !== undefined && row.errorFileUrl.trim() !== '';

                    return (
                      <TableRow key={row.id} className="border-claims-management-table-border h-10">
                        <TableCell className="w-width-200">
                          <TruncatedTooltipText text={row.fileName} />
                        </TableCell>
                        <TableCell className="text-sm">
                          <TruncatedTooltipText text={row.planName} />
                        </TableCell>
                        <TableCell className="text-sm">
                          <TruncatedTooltipText text={String(row.totalRecords)} />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="border-transparent px-2 py-0.5 text-xs font-medium"
                          >
                            <TruncatedTooltipText text={row.action} />
                          </Badge>
                        </TableCell>
                        <TableCell className="w-width-150">
                          <Badge
                            className={cn(
                              'border-transparent px-2 py-0.5 text-xs font-medium capitalize',
                              statusStyles[row.status],
                            )}
                          >
                            <TruncatedTooltipText text={formatEnum(row.status)} />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <TruncatedTooltipText text={row.uploadedOn} />
                        </TableCell>
                        <TableCell className="text-sm capitalize">
                          <TruncatedTooltipText text={row.uploadedBy} />{' '}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 text-recent-searches-action"
                                  aria-label="Download files for this upload"
                                  aria-haspopup="menu"
                                  disabled={isProcessing || (!hasSuccessUrl && !hasErrorUrl)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                sideOffset={4}
                                className="min-w-max w-max border border-border bg-popover p-1 text-sm text-popover-foreground shadow-md"
                              >
                                {(row?.status === 'successful' ||
                                  row?.status === 'partially_successful') && (
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-sm px-2 py-1.5 focus:bg-accent"
                                    onSelect={() => {
                                      trackBulkDownloadSuccess(segmentBase, row.fileName);
                                      openBulkResultDownload(row.successFileUrl, row, 'success');
                                    }}
                                  >
                                    {BULK_OPERATION_DOWNLOAD_MENU_LABELS.successFile}
                                  </DropdownMenuItem>
                                )}
                                {(row?.status === 'failed' ||
                                  row?.status === 'partially_successful') && (
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-sm px-2 py-1.5 focus:bg-accent"
                                    onSelect={() => {
                                      trackBulkDownloadError(segmentBase, row.fileName);
                                      openBulkResultDownload(row.errorFileUrl, row, 'error');
                                    }}
                                  >
                                    {BULK_OPERATION_DOWNLOAD_MENU_LABELS.errorFile}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="cursor-pointer rounded-sm px-2 py-1.5 focus:bg-accent"
                                  onSelect={() => {
                                    trackBulkDownloadInput(segmentBase, row.fileName);
                                    openBulkResultDownload(row.inputFileUrl, row, 'input');
                                  }}
                                >
                                  {BULK_OPERATION_DOWNLOAD_MENU_LABELS.inputFile}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : null}
            {showEmptyState ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-full max-w-md">
                  <ErrorCard
                    icon={<CircleAlert className="size-8" />}
                    title={BULK_OPERATION_LIST_STATE_MESSAGES.emptyTitle}
                    className="border-none shadow-none"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {!showTableSkeleton && !isListError ? (
          <Pagination
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            onRowsPerPageChange={handleRowsPerPageChange}
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </div>
    </div>
  );
}
