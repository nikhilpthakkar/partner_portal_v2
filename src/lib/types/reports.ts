export type ReportsEmbedUrl = {
  dashboardKey: string;
  dashboardId: string;
  embedUrl: string;
  expiresAtEpochSeconds: number;
};

export type ReportsFilters = {
  lob: string;
  dashboardKey: string;
  partnerId: string;
  productIds: string[];
};
