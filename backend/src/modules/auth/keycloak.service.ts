import axios from 'axios';
import { KeycloakToken, LoginData } from './auth.interface';
export const loginUser = async (data: LoginData): Promise<KeycloakToken> => {
  console.log(data, 'data ');
  try {
    // Form data for Keycloak token endpoint
    const params = new URLSearchParams();
    params.append('grant_type', 'password'); // Resource Owner Password Grant
    params.append('client_id', 'ocmpClient'); // confidential client
    params.append('client_secret', 'NoE04RYA5HVQm4k9zXZwBKmLhxnSaPem'); // from env
    params.append('username', data.email); // email/login
    params.append('password', data.password); // plain password

    // call Keycloak token endpoint
    const res = await axios.post(
      'http://127.0.0.1:8080/realms/ocmp/protocol/openid-connect/token',
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    // Return token object
    return res.data as KeycloakToken;
  } catch (err: any) {
    console.error('Keycloak login faileds:', err.response?.data || err.message);

    // Return more meaningful error
    const message = err.response?.data?.error_description || 'Invalid credentials';
    throw new Error(message);
  }
};
