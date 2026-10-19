import type { PromoCardData } from '@/lib/types/overview';
import { OVERVIEW_CARD_CAPABILITY_NAME } from '@/lib/constants/overview.constants';
import type { OverviewCardApiItem, OverviewCardStatus } from '@/lib/types/overview/cards';

const STATUS_BADGE: Record<
  OverviewCardStatus,
  { badgeLabel: string; badgeTone: PromoCardData['badgeTone'] }
> = {
  ACTIVE: { badgeLabel: 'Available', badgeTone: 'success' },
  COMING_SOON: { badgeLabel: 'Coming soon', badgeTone: 'warning' },
  INACTIVE: { badgeLabel: 'Unavailable', badgeTone: 'info' },
};

export const mapOverviewCardsToPromoCards = (
  cards: OverviewCardApiItem[] | undefined,
): PromoCardData[] => {
  if (!cards?.length) {
    return [];
  }

  return cards.map((card) => {
    const badge = STATUS_BADGE[card.status] ?? STATUS_BADGE.INACTIVE;

    return {
      id: card.id,
      cardId: card.card_id,
      capabilityId: OVERVIEW_CARD_CAPABILITY_NAME[card.card_id] ?? card.card_id,
      title: card.config.title,
      description: card.config.description,
      ctaLabel: card.config.cta.label,
      badgeLabel: badge.badgeLabel,
      badgeTone: badge.badgeTone,
    };
  });
};
