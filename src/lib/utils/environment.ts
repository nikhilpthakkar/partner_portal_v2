import {
  AUTH_CLIENT_ID,
  AUTH_REALM,
  LIFE_AUTH_CLIENT_ID,
  LIFE_AUTH_REALM,
} from '@/lib/constants/auth.constants';

const DEPLOYMENT_TARGET_LIFE_PROD = 'life-prod';
const DEPLOYMENT_TARGET_PROD = 'prod';
const ENV_PRODUCTION = 'production';
const ACKO_DOMAIN = 'acko.com';
const ACKO_DEV_DOMAIN = 'ackodev.com';
const ACKO_LIFE_DOMAIN = 'ackolife.com';

function stripEnvQuotes(value: string | undefined): string {
  return value?.trim().replace(/^["']|["']$/g, '') ?? '';
}

const isLifeProdDeployment = (): boolean =>
  stripEnvQuotes(process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET) === DEPLOYMENT_TARGET_LIFE_PROD;

function isProductionDeployment(): boolean {
  const deploymentTarget = stripEnvQuotes(process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET);
  return (
    deploymentTarget === DEPLOYMENT_TARGET_PROD ||
    deploymentTarget === DEPLOYMENT_TARGET_LIFE_PROD ||
    process.env.NEXT_PUBLIC_ENV === ENV_PRODUCTION
  );
}

function resolvePartnerPortalDomain(): string {
  if (isLifeProdDeployment()) {
    return ACKO_LIFE_DOMAIN;
  }

  if (isProductionDeployment()) {
    return ACKO_DOMAIN;
  }

  return ACKO_DEV_DOMAIN;
}

function resolveAccountsDomain(): string {
  return isProductionDeployment() ? ACKO_DOMAIN : ACKO_DEV_DOMAIN;
}

export const getRedirectUriBase = (): string => {
  return `https://partner-portal.${resolvePartnerPortalDomain()}/`;
};

export const getAccountsBaseUrl = (): string => {
  return `https://accounts.${resolveAccountsDomain()}`;
};

export const getAuthRealm = (): string => {
  return isLifeProdDeployment() ? LIFE_AUTH_REALM : AUTH_REALM;
};

export const getAuthClientId = (): string => {
  return isLifeProdDeployment() ? LIFE_AUTH_CLIENT_ID : AUTH_CLIENT_ID;
};

export const getLoginUrl = (): string => {
  const redirectUri = encodeURIComponent(getRedirectUriBase());
  return `${getAccountsBaseUrl()}/v1/signin?realm=${getAuthRealm()}&response_type=code&scope=openid%20offline_access&client_id=${getAuthClientId()}&redirect_uri=${redirectUri}`;
};
