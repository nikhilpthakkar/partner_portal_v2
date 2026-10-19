import { HealthCardData } from '@/lib/types/policy-management/policyHealthCardApi';
import { PolicyHealthCard as PolicyHealthCardType } from '@/lib/types/policy-management/policyDetails';
import { format } from 'date-fns';

type HealthCardWithMeta = {
  uhid: string;
  card: PolicyHealthCardType;
};

const formatDate = (date: string): string => format(date, 'dd MMM yyyy');

export const mapHealthCardDataToCard = (card: HealthCardData): HealthCardWithMeta => ({
  uhid: card.uhid,
  card: {
    title: card.name,
    primaryLogoSrc: '/images/acko-logo.svg',
    primaryLogoAlt: 'ACKO',
    secondaryLogoSrc: '/images/fhpl.svg',
    secondaryLogoAlt: 'FHPL',
    actions: [
      { type: 'download', label: 'Download' },
      { type: 'share', label: 'Share' },
    ],
    items: [
      [
        {
          id: 'health-card-start-date',
          label: 'Start date',
          value: `Period: ${formatDate(card.startDate)}`,
        },
        {
          id: 'health-card-end-date',
          label: 'End date',
          value: formatDate(card.endDate),
        },
        {
          id: 'health-card-uhid',
          label: 'UHID',
          value: card.uhid,
        },
        {
          id: 'health-card-policy-number',
          label: 'Policy number',
          value: card.policyNumber,
        },
        {
          id: 'health-card-relationship',
          label: 'Relation with primary insured',
          value: card.relationship,
        },
      ],
    ],
  },
});
