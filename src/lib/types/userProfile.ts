export type UserPrimaryCredential = {
  type: string;
  value: string;
};

export type UserProfileApiResponse = {
  id: string;
  enabled: boolean;
  realm: string;
  first_name: string;
  last_name: string;
  primary_credentials: UserPrimaryCredential[];
  created_on: string;
  updated_on: string;
};

export type UserProfile = {
  id: string;
  enabled: boolean;
  realm: string;
  firstName: string;
  lastName: string;
  email: string;
  createdOn: string;
  updatedOn: string;
};
