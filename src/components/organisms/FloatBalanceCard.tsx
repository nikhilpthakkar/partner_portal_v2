'use client';

import {
  addDays,
  addMonths,
  compareAsc,
  differenceInCalendarDays,
  endOfMonth,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Skeleton from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { FloatMonthCoverage, FloatMonthCoverageMetrics } from '@/lib/types/financials';

type FloatBalanceCardProps = {
  data?: FloatMonthCoverage;
  isLoading?: boolean;
  className?: string;
};

type CoverageVariant =
  | 'full-two-months'
  | 'single-month-covered'
  | 'excess-spill'
  | 'recharge-split'
  | 'between-one-and-two-months';

type CoverageVariantResult = {
  variant: CoverageVariant;
  requiredNextMonthBudget: number;
};

function formatFloatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

function formatDayMonth(d: Date): string {
  return format(d, 'd MMM');
}

function getTwoMonthCoverageEndDate(reference: Date = new Date()): Date {
  return endOfMonth(addMonths(startOfDay(reference), 1));
}

function getRequiredBalanceForCurrentMonthRemainder(c: FloatMonthCoverageMetrics): number {
  if (Number.isFinite(c.requiredBalanceForMonth) && c.requiredBalanceForMonth > 0) {
    return c.requiredBalanceForMonth;
  }

  if (c.remainingDaysInMonth > 0 && c.averagePerDaySpend > 0) {
    return c.remainingDaysInMonth * c.averagePerDaySpend;
  }

  return 0;
}

function getRequiredBalanceForTwoMonths(c: FloatMonthCoverageMetrics): number {
  return (
    getRequiredBalanceForCurrentMonthRemainder(c) + getRequiredBalanceForNextCalendarMonth(c)
  );
}

function getDaysInNextCalendarMonth(reference: Date = new Date()): number {
  const base = startOfDay(reference);
  const nextStart = startOfMonth(addMonths(base, 1));
  const nextEnd = endOfMonth(nextStart);
  return Math.max(0, differenceInCalendarDays(nextEnd, nextStart) + 1);
}

function getRequiredBalanceForNextCalendarMonth(c: FloatMonthCoverageMetrics): number {
  const avg = c.averagePerDaySpend;
  if (!(avg > 0)) return 0;
  return avg * getDaysInNextCalendarMonth();
}

const MAX_COVERAGE_RUNWAY_DAYS = 3660;
const MIN_VALID_COVERAGE_YEAR = 2000;
const MAX_VALID_COVERAGE_YEAR = 2100;

function isReasonableCoverageYear(date: Date): boolean {
  const year = date.getFullYear();
  return year >= MIN_VALID_COVERAGE_YEAR && year <= MAX_VALID_COVERAGE_YEAR;
}

function getCoverageEndDateFromSpend(c: FloatMonthCoverageMetrics): Date | null {
  const { currentFloatBalance, averagePerDaySpend } = c;
  if (!(averagePerDaySpend > 0) || !Number.isFinite(averagePerDaySpend)) {
    return null;
  }

  const fullDaysFromBalance = Math.floor(currentFloatBalance / averagePerDaySpend);
  if (
    !Number.isFinite(fullDaysFromBalance) ||
    fullDaysFromBalance < 0 ||
    fullDaysFromBalance > MAX_COVERAGE_RUNWAY_DAYS
  ) {
    return null;
  }

  return addDays(startOfDay(new Date()), fullDaysFromBalance);
}

function parseCoverageTillDate(coverageTill: string | undefined): Date | null {
  if (!coverageTill?.trim()) {
    return null;
  }

  try {
    const parsed = startOfDay(parseISO(coverageTill));
    if (Number.isNaN(parsed.getTime()) || !isReasonableCoverageYear(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function resolveCoverageEndDateForVariant(c: FloatMonthCoverageMetrics): Date | null {
  const coverageTillFromApi = parseCoverageTillDate(c.coverageTill);
  if (coverageTillFromApi) {
    return coverageTillFromApi;
  }

  return getCoverageEndDateFromSpend(c);
}

function resolveDisplayCoverageEndDate(
  c: FloatMonthCoverageMetrics,
  variant: CoverageVariant,
): Date | null {
  const coverageTillFromApi = parseCoverageTillDate(c.coverageTill);
  if (coverageTillFromApi) {
    return coverageTillFromApi;
  }

  const computedFromSpend = getCoverageEndDateFromSpend(c);
  if (computedFromSpend) {
    return computedFromSpend;
  }

  const today = startOfDay(new Date());
  const twoMonthCoverageEnd = getTwoMonthCoverageEndDate(today);

  if (variant === 'full-two-months') {
    return twoMonthCoverageEnd;
  }

  if (variant === 'single-month-covered' || variant === 'excess-spill') {
    return endOfMonth(today);
  }

  if (c.remainingDaysInMonth > 0) {
    return addDays(today, c.remainingDaysInMonth);
  }

  return null;
}


function resolveCoverageVariant(c: FloatMonthCoverageMetrics): CoverageVariantResult {
  const today = startOfDay(new Date());
  const twoMonthCoverageEnd = getTwoMonthCoverageEndDate(today);
  const coversTill = resolveCoverageEndDateForVariant(c);

  const balance = c.currentFloatBalance;
  const reqCurr = getRequiredBalanceForCurrentMonthRemainder(c);
  const reqNext = getRequiredBalanceForNextCalendarMonth(c);
  const totalNeed = getRequiredBalanceForTwoMonths(c);

  const coversAtLeastThroughTwoMonthEnd =
    coversTill !== null &&
    compareAsc(startOfDay(coversTill), startOfDay(twoMonthCoverageEnd)) >= 0;

  const coversTwoMonthsFinancial = totalNeed > 0 && Number.isFinite(balance) && balance >= totalNeed;

  if (coversTwoMonthsFinancial || coversAtLeastThroughTwoMonthEnd) {
    return { variant: 'full-two-months', requiredNextMonthBudget: reqNext };
  }

  if (totalNeed > 0 && Number.isFinite(balance) && balance < totalNeed) {
    const spansMoreThanCurrentMonthNeed = balance > reqCurr && reqCurr > 0 && reqNext > 0;
    if (spansMoreThanCurrentMonthNeed) {
      return { variant: 'between-one-and-two-months', requiredNextMonthBudget: reqNext };
    }
    return { variant: 'recharge-split', requiredNextMonthBudget: reqNext };
  }

  if (!Number.isFinite(balance) || !Number.isFinite(c.requiredBalanceForMonth)) {
    return { variant: 'recharge-split', requiredNextMonthBudget: reqNext };
  }

  if (!(reqCurr > 0)) {
    return { variant: 'single-month-covered', requiredNextMonthBudget: reqNext };
  }

  const ratio = balance / reqCurr;
  if (!Number.isFinite(ratio)) {
    return { variant: 'recharge-split', requiredNextMonthBudget: reqNext };
  }

  if (ratio > 1) {
    return { variant: 'excess-spill', requiredNextMonthBudget: reqNext };
  }

  if (ratio >= 1) {
    return { variant: 'single-month-covered', requiredNextMonthBudget: reqNext };
  }

  return { variant: 'recharge-split', requiredNextMonthBudget: reqNext };
}

const CRITICAL_DAYS_REMAINING_THRESHOLD = 2;

type CoverageBanner = {
  message: string;
  tone: 'success' | 'warning' | 'critical';
};

function resolveBalanceRunOutDate(c: FloatMonthCoverageMetrics): Date | null {
  const coverageTillFromApi = parseCoverageTillDate(c.coverageTill);
  if (coverageTillFromApi) {
    return coverageTillFromApi;
  }

  const computedFromSpend = getCoverageEndDateFromSpend(c);
  if (computedFromSpend) {
    return computedFromSpend;
  }

  if (c.remainingDaysInMonth > 0) {
    return addDays(startOfDay(new Date()), c.remainingDaysInMonth);
  }

  return null;
}

function resolveRechargeAmount(
  c: FloatMonthCoverageMetrics,
  variant: CoverageVariant,
): number {
  if (variant === 'full-two-months') {
    return 0;
  }

  if (c.isTopUpNeeded && c.topUpAmount > 0) {
    return c.topUpAmount;
  }

  const totalNeed = getRequiredBalanceForTwoMonths(c);
  return Math.max(0, totalNeed - c.currentFloatBalance);
}

function buildCriticalBannerMessage(daysRemaining: number): string {
  if (daysRemaining <= 0) {
    return 'Balance will be exhausted today. Operations may be affected. Recharge now.';
  }

  return 'Balance will be exhausted in 1 day. Operations may be affected. Recharge now.';
}

function isCriticalDaysRemaining(daysRemaining: number | null): boolean {
  return daysRemaining !== null && daysRemaining < CRITICAL_DAYS_REMAINING_THRESHOLD;
}

function buildCoverageBanner(
  c: FloatMonthCoverageMetrics,
  variant: CoverageVariant,
  daysRemaining: number | null,
): CoverageBanner | null {
  const twoMonthCoverageEnd = getTwoMonthCoverageEndDate();

  if (variant === 'full-two-months') {
    return {
      tone: 'success',
      message:
        'Your current balance is sufficient to cover your operations for the next two months.',
    };
  }

  if (isCriticalDaysRemaining(daysRemaining)) {
    return {
      tone: 'critical',
      message: buildCriticalBannerMessage(daysRemaining ?? 0),
    };
  }

  const balanceRunOutDate = resolveBalanceRunOutDate(c);
  const rechargeAmount = resolveRechargeAmount(c, variant);

  if (balanceRunOutDate && rechargeAmount > 0) {
    return {
      tone: 'warning',
      message: `Balance runs out on ${format(balanceRunOutDate, 'MMMM d')}. Recharge ${formatFloatInr(rechargeAmount)} to stay covered till ${format(twoMonthCoverageEnd, 'MMMM d')}.`,
    };
  }

  if (balanceRunOutDate) {
    return {
      tone: 'warning',
      message: `Balance runs out on ${format(balanceRunOutDate, 'MMMM d')}.`,
    };
  }

  const rechargeAmountFallback = resolveRechargeAmount(c, variant);
  if (rechargeAmountFallback > 0) {
    return {
      tone: 'warning',
      message: `We recommend a recharge of ${formatFloatInr(rechargeAmountFallback)} to keep your operations running through ${format(twoMonthCoverageEnd, 'MMMM d')}.`,
    };
  }

  return {
    tone: 'warning',
    message: `Recharge to stay covered through ${format(twoMonthCoverageEnd, 'MMMM d')}.`,
  };
}

function resolveDaysRemaining(coversTillDate: Date | null): number | null {
  if (!coversTillDate) {
    return null;
  }

  const days = differenceInCalendarDays(startOfDay(coversTillDate), startOfDay(new Date()));
  if (!Number.isFinite(days) || days < 0 || days > MAX_COVERAGE_RUNWAY_DAYS) {
    return null;
  }

  return days;
}

function resolveDaysRemainingLabel(daysRemaining: number | null): string {
  if (daysRemaining === null) {
    return '-';
  }

  if (daysRemaining === 1) {
    return '1 day';
  }

  return `${daysRemaining} days`;
}

function resolveRechargeMetricLabel(needsRecharge: boolean, twoMonthCoverageEnd: Date): string {
  if (needsRecharge) {
    return `Recharge to cover till ${format(twoMonthCoverageEnd, 'MMM d')}`;
  }

  return 'Recharge needed';
}

function resolveRechargeNeededLabel(
  c: FloatMonthCoverageMetrics,
  variant: CoverageVariant,
): string {
  const amount = resolveRechargeAmount(c, variant);
  return amount > 0 ? formatFloatInr(amount) : '-';
}

function FloatBalanceBanner({ banner }: { banner: CoverageBanner }) {
  if (banner.tone === 'success') {
    return (
      <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-2">
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-green-800" aria-hidden />
        <p className="text-xs leading-normal text-green-800">{banner.message}</p>
      </div>
    );
  }

  if (banner.tone === 'critical') {
    return (
      <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2">
        <TriangleAlert className="size-5 shrink-0 text-red-800" aria-hidden />
        <p className="text-xs leading-none text-red-800">{banner.message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-2">
      <Info className="size-5 shrink-0 text-yellow-800" aria-hidden />
      <p className="text-xs leading-none text-yellow-800">{banner.message}</p>
    </div>
  );
}

type FloatBalanceMetricCardProps = {
  label: string;
  value: string;
  critical?: boolean;
};

function FloatBalanceMetricCard({ label, value, critical = false }: FloatBalanceMetricCardProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-xl border border-border bg-card p-4">
      <p className="text-sm leading-5 text-muted-foreground">{label}</p>
      <p
        className={cn(
          'text-2xl font-semibold leading-none',
          critical ? 'text-red-800' : 'text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function FloatBalanceCard({ data, isLoading, className }: FloatBalanceCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('rounded-xl border border-border bg-card p-6 shadow-none ring-0', className)}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-36 rounded-md bg-muted" />
            <Skeleton className="h-7 w-48 rounded-md bg-muted" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-[76px] flex-1 rounded-xl bg-muted" />
            <Skeleton className="h-[76px] flex-1 rounded-xl bg-muted" />
            <Skeleton className="h-[76px] flex-1 rounded-xl bg-muted" />
          </div>
          <Skeleton className="h-12 w-full rounded-md bg-muted" />
        </div>
      </Card>
    );
  }

  if (!data?.combined) return null;

  const c = data.combined;
  const { variant } = resolveCoverageVariant(c);
  const twoMonthCoverageEnd = getTwoMonthCoverageEndDate();
  const balanceRunOutDate = resolveBalanceRunOutDate(c);
  const coversTillDate =
    variant === 'full-two-months'
      ? twoMonthCoverageEnd
      : (balanceRunOutDate ?? resolveDisplayCoverageEndDate(c, variant));
  const daysRemaining = resolveDaysRemaining(coversTillDate);
  const isCritical = variant !== 'full-two-months' && isCriticalDaysRemaining(daysRemaining);
  const needsRecharge = variant !== 'full-two-months';
  const coverageBanner = buildCoverageBanner(c, variant, daysRemaining);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Card className="rounded-xl border border-border bg-card p-6 shadow-none ring-0">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm leading-5 text-muted-foreground">Current float balance</p>
            <p className="text-xl font-semibold leading-none text-foreground">
              {formatFloatInr(c.currentFloatBalance)}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <FloatBalanceMetricCard
              label="Covers you till"
              value={coversTillDate ? formatDayMonth(coversTillDate) : '-'}
              critical={isCritical}
            />
            <FloatBalanceMetricCard
              label="Days remaining"
              value={resolveDaysRemainingLabel(daysRemaining)}
              critical={isCritical}
            />
            <FloatBalanceMetricCard
              label={resolveRechargeMetricLabel(needsRecharge, twoMonthCoverageEnd)}
              value={resolveRechargeNeededLabel(c, variant)}
              critical={isCritical}
            />
          </div>

          {coverageBanner ? <FloatBalanceBanner banner={coverageBanner} /> : null}
        </div>
      </Card>

      {(data.breakDown?.length ?? 0) > 1 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            By product
          </p>
          <ul className="flex flex-col gap-2">
            {(data.breakDown ?? []).map((row) => (
              <li
                key={row.productId}
                className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border/80 pt-2 text-sm first:border-t-0 first:pt-0"
              >
                <span
                  className="max-w-[60%] truncate font-medium text-foreground"
                  title={row.productId}
                >
                  {row.productId}
                </span>
                <span className="tabular-nums text-foreground">
                  {formatFloatInr(row.currentFloatBalance)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
