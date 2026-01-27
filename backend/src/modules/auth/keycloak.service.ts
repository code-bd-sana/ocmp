import axios from 'axios';
import { KeycloakToken, LoginData } from './auth.interface';
export const loginUser = async (data: LoginData): Promise<KeycloakToken> => {
  console.log(data, 'data ');
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
    params.append('grant_type', 'password');
    params.append('client_id', process.env.KEYCLOAK_CLIENT_ID || '');
    params.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET || '');
    params.append('username', data.email);
    params.append('password', data.password);

    // call Keycloak token endpoint
    const res = await axios.post(
      `http://127.0.0.1:8080/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    // {
    //   res.data.access_token;
    // }
    // uuuid generated for user session
    // Set user token to the redis
    // await setUserToken(uuuid, res.data.access_token);

    // Return token object
    return res.data as KeycloakToken;
  } catch (err: any) {
    console.error('Keycloak login faileds:', err.response?.data || err.message);

    // Return more meaningful error
    const message = err.response?.data?.error_description || 'Invalid credentials';
    throw new Error(message);
  }
};
