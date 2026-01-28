import jwt from 'jsonwebtoken';
import config from '../../config/config';
import { UserRole } from '../../models';

/**
 * Generates a JWT token for a user based on their email and user ID.
 *
 * @param _id - The user's unique ID.
 * @param email - The user's email.
 * @param fullName - The user's full name.
 * @param role - The user's role.
 * @param isEmailVerified - Whether the user's email is verified.
 * @param loginAt - The login timestamp.
 * @returns {Promise<string>} - A promise that resolves to the signed JWT token.
 */
const EncodeToken = async (
  email: string,
  userId: string,
  fullName: string,
  role: UserRole,
  isEmailVerified: boolean,
  loginAt: Date = new Date()
): Promise<string> => {
  const KEY: string = config.JWT_SECRET;
  const EXPIRE: jwt.SignOptions = { expiresIn: config.JWT_EXPIRATION_TIME };
  const PAYLOAD = { _id: userId, email, fullName, role, isEmailVerified, loginAt };
  return jwt.sign(PAYLOAD, KEY, EXPIRE);
};

export default EncodeToken;
