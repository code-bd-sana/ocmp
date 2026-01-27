import KcAdminClient from '@keycloak/keycloak-admin-client';

const kcAdmin = new KcAdminClient({
  baseUrl: process.env.KEYCLOAK_HOST || 'http://127.0.0.1:8080',
  realmName: 'master',
});

export const initKeycloak = async () => {
  try {
    await kcAdmin.auth({
      /**
       * Keycloak admin authentication settings
       *
       * - username: Admin username from environment variables
       * - password: Admin password from environment variables
       * - grantType: Grant type, defaulting to 'password'
       * - clientId: Client ID for admin CLI
       */
      username: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
      password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
      grantType: (process.env.KEYCLOAK_GRANT_TYPE ??
        'password') as import('@keycloak/keycloak-admin-client/lib/utils/auth').GrantTypes,
      clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
    });

    console.log('✅ Keycloak admin authenticated');
  } catch (err: any) {
    // <--- important
    console.log(err);
    console.error('❌ Keycloak auth failed:', err.response?.data || err.message);
  }
};

export default kcAdmin;
