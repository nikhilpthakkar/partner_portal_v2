export type OverviewCardCtaAction = 'SEND_COMMS';

export type OverviewCardConfig = {
  title: string;
  description: string;
  cta: {
    label: string;
    action: OverviewCardCtaAction;
  };
};

export type OverviewCardStatus = 'ACTIVE' | 'INACTIVE' | 'COMING_SOON';

export type OverviewCardApiItem = {
  id: string;
  config: OverviewCardConfig;
  status: OverviewCardStatus;
  source: string;
  card_id: string;
  partner_id: string;
  created_at: string;
};
