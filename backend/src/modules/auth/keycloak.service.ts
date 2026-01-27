import axios from 'axios';
import config from '../../config/config';
import { KeycloakToken, LoginData } from './auth.interface';

/**
 * Function to login a user via Keycloak.
 *
 * @param {LoginData} data - The login data containing email and password.
 * @returns {Promise<KeycloakToken>} - The Keycloak token response.
 */
export const loginUser = async (data: LoginData): Promise<KeycloakToken> => {
  try {
    // Form data for Keycloak token endpoint
    const params = new URLSearchParams();

    /**
     * Parameters for Keycloak token request
     *
     * - grant_type: 'password' (indicates password grant type)
     * - client_id: Client ID from environment variables
     * - client_secret: Client secret from environment variables
     * - username: User's email
     * - password: User's password
     */
    params.append('grant_type', config.KEYCLOAK_GRANT_TYPE || 'password');
    params.append('client_id', config.KEYCLOAK_CLIENT_ID || '');
    params.append('client_secret', config.KEYCLOAK_CLIENT_SECRET || '');
    params.append('username', data.email);
    params.append('password', data.password);

    // call Keycloak token endpoint
    const res = await axios.post(
      `${config.KEYCLOAK_HOST}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    return res.data as KeycloakToken;
  } catch (err: any) {
    console.error('Keycloak login faileds:', err.response?.data || err.message);

    // Return more meaningful error
    const message = err.response?.data?.error_description || 'Invalid credentials';
    throw new Error(message);
  }
};
