import KcAdminClient from '@keycloak/keycloak-admin-client';

const kcAdmin = new KcAdminClient({
  baseUrl: 'http://127.0.0.1:8080',
  realmName: 'master',
});

export const initKeycloak = async () => {
  try {
    await kcAdmin.auth({
      username: 'admin',
      password: 'admin',
      grantType: 'password',
      clientId: 'admin-cli',
    });
    console.log('✅ Keycloak admin authenticated');
  } catch (err: any) {
    // <--- important
    console.error('❌ Keycloak auth failed:', err.response?.data || err.message);
  }
};

export default kcAdmin;
