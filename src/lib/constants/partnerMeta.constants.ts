export type PartnerMeta = {
  name: string;
  iconSrc?: string;
};

export const PARTNER_META: Record<string, PartnerMeta> = {
  zomato_driver_renewed: { name: 'Zomato', iconSrc: '/images/partners/zomato.webp' },
  Blink_Commerce_Private_Limited: { name: 'Blinkit', iconSrc: '/images/partners/blinkit.svg' },
  hdb_combi: { name: 'HDB Financial Services', iconSrc: '/images/partners/hdb.svg' },
  progcap: { name: 'Progcap', iconSrc: '/images/partners/progcap.png' },
  freshalicious_gig: { name: 'Freshalicious', iconSrc: '/images/partners/freshalicious.webp' },
  mpokket: { name: 'mPokket', iconSrc: '/images/partners/mpokket.svg' },
  urban_company: { name: 'Urban Company', iconSrc: '/images/partners/urban_company.png' },
  flexiloan_ls: { name: 'Flexiloans', iconSrc: '/images/partners/flexiloan_ls.png' },
  zepto: { name: 'Zepto', iconSrc: '/images/partners/zepto.svg' },
  bajaj_finance: { name: 'Bajaj Finance', iconSrc: '/images/partners/bajaj_finserv.webp' },
  emt: { name: 'EaseMyTrip', iconSrc: '/images/partners/emt.jpg' },
  gommt: { name: 'MakeMyTrip', iconSrc: '/images/partners/makemytrip.png' },
  herofincorp: { name: 'Hero Fincorp', iconSrc: '/images/partners/hero-fincorp-logo.png' },
  rupeek: { name: 'Rupeek', iconSrc: '/images/partners/rupeek.png' },
  indmoney: { name: 'Indmoney', iconSrc: '/images/partners/indmoney.png' },
  indifi: { name: 'Indifi', iconSrc: '/images/partners/indifi.png' },
  visa2fly: { name: 'Visa2fly', iconSrc: '/images/partners/visa2fly.jpg' },
  Khatabook: { name: 'Khatabook', iconSrc: '/images/partners/khatabook.png' },
};

export const getPartnerApiLogoUrl = (
  partner?: { logo_url?: string | null; logoUrl?: string | null } | null,
): string | undefined => {
  const logoUrl = partner?.logo_url?.trim() || partner?.logoUrl?.trim();
  if (!logoUrl) {
    return undefined;
  }

  if (!/^https?:\/\//i.test(logoUrl)) {
    return logoUrl;
  }

  let pathname = '';
  try {
    pathname = new URL(logoUrl).pathname.toLowerCase();
  } catch {
    pathname = logoUrl.split(/[?#]/)[0]?.toLowerCase() ?? '';
  }

  if (!pathname.endsWith('.svg')) {
    return logoUrl;
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  return `${basePath}/api/partner-logo?url=${encodeURIComponent(logoUrl)}`;
};

export const getPartnerMeta = (
  partnerId: string,
  apiLogoUrl?: string | null,
): PartnerMeta => {
  const fallback = PARTNER_META[partnerId] ?? { name: 'Partner Portal' };

  return {
    name: fallback.name,
    iconSrc: apiLogoUrl?.trim() || fallback.iconSrc,
  };
};

export const getPartnerDisplayName = (partnerId: string, fallback?: string): string =>
  PARTNER_META[partnerId]?.name ?? fallback ?? partnerId;
