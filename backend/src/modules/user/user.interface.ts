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
}
