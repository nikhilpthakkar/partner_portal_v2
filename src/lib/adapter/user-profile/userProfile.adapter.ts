import type {
  UserPrimaryCredential,
  UserProfile,
  UserProfileApiResponse,
} from '@/lib/types/userProfile';

const EMAIL_CREDENTIAL_TYPE = 'email-otp';

const unwrapProfileResponse = (payload: unknown): UserProfileApiResponse => {
  if (!payload || typeof payload !== 'object') {
    return payload as UserProfileApiResponse;
  }

  const record = payload as Record<string, unknown>;
  if ('first_name' in record || 'primary_credentials' in record) {
    return payload as UserProfileApiResponse;
  }

  const nested = record.data;
  if (nested && typeof nested === 'object') {
    return nested as UserProfileApiResponse;
  }

  return payload as UserProfileApiResponse;
};

const resolveEmail = (credentials: UserPrimaryCredential[] | undefined): string => {
  if (!credentials?.length) {
    return '';
  }

  const emailCredential =
    credentials.find((credential) => credential.type === EMAIL_CREDENTIAL_TYPE) ??
    credentials.find((credential) => credential.value?.includes('@')) ??
    credentials[0];

  return emailCredential?.value ?? '';
};

export const mapUserProfile = (payload: UserProfileApiResponse | unknown): UserProfile => {
  const response = unwrapProfileResponse(payload);

  return {
    id: response.id,
    enabled: response.enabled,
    realm: response.realm,
    firstName: response.first_name ?? '',
    lastName: response.last_name ?? '',
    email: resolveEmail(response.primary_credentials),
    createdOn: response.created_on,
    updatedOn: response.updated_on,
  };
};
