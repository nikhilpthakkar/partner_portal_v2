import { clsx, type ClassValue } from 'clsx';
import { format } from 'date-fns';
import qs from 'qs';
import { DateRange } from 'react-day-picker';
import { twMerge } from 'tailwind-merge';
import { ViewDocumentsData } from '../types/claims-management/claimDetails';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDefaultDateRange(): DateRange {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  return { from: nextMonth, to: today };
}

export const getVar = (name: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

export function roundUpToNiceNumber(value: number): number {
  if (!value || value <= 0) return 0;
  if (value < 10) return value;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  let step: number;
  if (magnitude < 100) step = magnitude;
  else step = magnitude / 2;
  return Math.ceil(value / step) * step;
}

export function formatNumber(value: number, decimals = 0): string {
  if (!value || typeof value !== 'number') {
    return '0';
  }
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatIndianShort(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  const num = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (num >= 10000000) {
    return `${sign}${(num / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
  }
  if (num >= 100000) {
    return `${sign}${(num / 100000).toFixed(2).replace(/\.00$/, '')}L`;
  }
  if (num >= 1000) {
    return `${sign}${(num / 1000).toFixed(2).replace(/\.00$/, '')}K`;
  }
  return `${sign}${num.toString()}`;
}

export function formatEnum(value: string) {
  if (!value || typeof value !== 'string') {
    return '-';
  }
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const downloadFileFromS3Url = async (url: string, fileName: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const downloadFileFromUrl = (url: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadMultipleFiles = async (documents: ViewDocumentsData[]) => {
  if (!documents?.length) return;
  for (const doc of documents) {
    const safeName = doc.label.replace(/[<>:"/\\|?*]+/g, '_');
    const link = document.createElement('a');
    link.href = doc.previewUrl;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
};

export const serializeParams = (params: Record<string, unknown>) =>
  qs.stringify(params, { arrayFormat: 'repeat' });

export function formatDate(value: string | Date) {
  return format(new Date(value), 'MMM dd, yyyy');
}

export const formatCurrency = (amount: number | undefined) => {
  if (typeof amount !== 'number') {
    return '-';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatExactRefundAmount = (value?: number | null): string => {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }

  const sign = value < 0 ? '-' : '';
  const absoluteValue = Math.abs(value);
  const [integerPart, decimalPart] = absoluteValue.toString().split('.');
  const formattedInteger = Number(integerPart).toLocaleString('en-IN');
  const formattedAmount =
    decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;

  return `₹ ${sign}${formattedAmount}`;
};

export const getFileTypeFromFilename = (filename?: string): string => {
  if (!filename) return '-';
  const ext = filename.split('.').pop()?.toUpperCase();
  return ext ?? '-';
};

export const sanitizeFileName = (fileName: string): string => {
  if (!fileName) return '';
  const parts = fileName.split('.');
  const extension = parts.pop();
  const name = parts.join('.');
  const cleanedName = name.replace(/[^a-zA-Z0-9]/g, '');
  return extension ? `${cleanedName}.${extension}` : cleanedName;
};

const BYTES_PER_MB = 1024 * 1024;

export function formatFileSizeMb(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0.00 MB';
  }
  const mb = bytes / BYTES_PER_MB;
  return `${mb.toFixed(2)} MB`;
}

export function isFileAllowedByAcceptAttribute(file: File, accept: string[]): boolean {
  const nameLower = file.name.toLowerCase();

  for (const extension of accept) {
    if (nameLower.endsWith(extension.toLowerCase())) {
      return true;
    }
  }
  return false;
}

export type PolicyBulkUploadCommitResult =
  | { kind: 'ready'; file: File }
  | { kind: 'unsupported_format' }
  | { kind: 'empty_file' }
  | { kind: 'oversized'; bytes: number };

export function getPolicyBulkUploadCommitResult(
  file: File,
  allowedExtensions: string[],
  maxFileBytes: number,
): PolicyBulkUploadCommitResult {
  if (!isFileAllowedByAcceptAttribute(file, allowedExtensions)) {
    return { kind: 'unsupported_format' };
  }
  if (file.size === 0) {
    return { kind: 'empty_file' };
  }
  if (file.size > maxFileBytes) {
    return { kind: 'oversized', bytes: file.size };
  }
  return { kind: 'ready', file };
}
