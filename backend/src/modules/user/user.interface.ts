/**
 * Interface representing a User object.
 */
export interface IUserResponse {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isEmailVerified: boolean;
  showInStandaloneUsersList?: boolean;
}

export interface GetAllUsersQueryInput {
  role?: 'all' | 'transport-manager' | 'standalone';
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}
