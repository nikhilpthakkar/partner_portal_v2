import {
  DEFAULT_DATA_SOURCE,
  SOURCE_QUERY_PARAM,
  type DataSource,
} from '@/lib/constants/global.constants';

export function parseDataSource(value: string | null | undefined): DataSource {
  const normalized = value?.trim().toUpperCase();
  if (normalized === 'FINACKO' || normalized === 'LEDGER') {
    return normalized;
  }
  return DEFAULT_DATA_SOURCE;
}

export function appendSourceQueryParam(path: string, search: string, source: DataSource): string {
  const params = new URLSearchParams(search);
  params.set(SOURCE_QUERY_PARAM, source);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function getDataSourceFromSearch(search: string): DataSource {
  const params = new URLSearchParams(search);
  return parseDataSource(params.get(SOURCE_QUERY_PARAM));
}
