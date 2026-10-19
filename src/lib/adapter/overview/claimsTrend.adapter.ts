import { PAGE_SIZE } from '@/lib/constants/overview.constants';
import type { ClaimsTrendData } from '@/lib/types/overview';
import type { OverviewClaimsChartComponentResponse } from '@/lib/types/overview/components';
import type { ClaimTrendApiStatus, ClaimTrendData } from '@/lib/types/overview/graphs';
import { formatGraphPeriodLabel } from '@/lib/utils/graphDateFormats';

const emptyClaimsTrendData: ClaimsTrendData = {
  title: 'Claims trend (GPA)',
  categories: [],
  periodStarts: [],
  periodEnds: [],
  periodType: 'DAILY',
  paidAmount: [],
  paid: [],
  inprogress: [],
  rejected: [],
  closed: [],
  totalClaims: [],
  infoText: '',
  hasData: false,
  pagination: {
    currentPage: 1,
    pageSize: PAGE_SIZE,
    hasPrev: false,
    hasNext: false,
  },
};

const CLAIM_TREND_STATUS_MATCHERS: Record<ClaimTrendApiStatus, string[]> = {
  ONGOING: ['ONGOING', 'IN_PROGRESS', 'INPROGRESS'],
  COMPLETED: ['COMPLETED', 'PAID'],
  REJECTED: ['REJECTED'],
  CLOSED: ['CLOSED', 'WITHDRAWN'],
};

const normalizeClaimTrendStatus = (status: string): string =>
  status.trim().toUpperCase().replace(/\s+/g, '_');

const getClaimsByStatusEntries = (item: ClaimTrendData) =>
  item.claimsByStatus ?? item.claims_by_status ?? [];

const getClaimStatusCount = (item: ClaimTrendData, status: ClaimTrendApiStatus): number =>
  getClaimsByStatusEntries(item)
    .filter((entry) =>
      CLAIM_TREND_STATUS_MATCHERS[status].includes(normalizeClaimTrendStatus(String(entry.status))),
    )
    .reduce((sum, entry) => sum + (entry.count ?? 0), 0);

export const mapClaimsChartComponentToCard = (
  response: OverviewClaimsChartComponentResponse | undefined,
): ClaimsTrendData => {
  if (!response?.payload?.data?.claimTrend?.length) {
    return emptyClaimsTrendData;
  }

  const claimTrend = response.payload.data.claimTrend;
  const title = response.label || emptyClaimsTrendData.title;
  const periodType = claimTrend[0].periodType;
  const periodStarts = claimTrend.map((item) => item.periodStart);
  const periodEnds = claimTrend.map((item) => item.periodEnd);
  const categories = claimTrend.map((item) =>
    formatGraphPeriodLabel(periodType, item.periodStart, item.periodEnd),
  );

  const paid = claimTrend.map((item) => getClaimStatusCount(item, 'COMPLETED'));
  const paidAmount = claimTrend.map((item) => item.paidAmount ?? 0);
  const inprogress = claimTrend.map((item) => getClaimStatusCount(item, 'ONGOING'));
  const rejected = claimTrend.map((item) => getClaimStatusCount(item, 'REJECTED'));
  const closed = claimTrend.map((item) => getClaimStatusCount(item, 'CLOSED'));
  const totalClaims = claimTrend.map((item) => item.totalClaims);

  const infoText =
    periodType === 'WEEKLY'
      ? 'Weekly trends of the claims raised in respective statuses'
      : periodType === 'MONTHLY'
        ? 'Monthly trends of the claims raised in respective month'
        : periodType === 'QUARTERLY'
          ? 'Quarterly trends of the claims raised in respective quarter'
          : 'Daily trends of the claims raised in respective day';

  const pagination = response.payload.meta?.pagination;
  const pageSize = pagination?.pageSize ?? PAGE_SIZE;
  const currentPage = pagination?.currentPage ?? 1;

  return {
    title,
    categories,
    periodStarts,
    periodEnds,
    periodType,
    paidAmount,
    paid,
    inprogress,
    rejected,
    closed,
    totalClaims,
    infoText,
    hasData: claimTrend.length > 0,
    pagination: {
      currentPage,
      pageSize,
      hasPrev: pagination?.hasPrev ?? currentPage > 1,
      hasNext: pagination?.hasNext ?? false,
    },
  };
};
