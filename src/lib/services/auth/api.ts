import axios from 'axios';
import {
  getAccountsBaseUrl,
  getAuthClientId,
  getAuthRealm,
  getRedirectUriBase,
} from '@/lib/utils/environment';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const response = await axios.post<TokenResponse>(
    `${getAccountsBaseUrl()}/platform/api/realms/${getAuthRealm()}/protocol/openid-connect/token`,
    new URLSearchParams({
      client_id: getAuthClientId(),
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: `${getRedirectUriBase()}`,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  return response.data;
}
