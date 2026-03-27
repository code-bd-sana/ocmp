import { AuthAction } from "@/service/auth";
import { UserAction } from "@/service/user";

export const STANDALONE_ROLE = "STANDALONE_USER";

let cachedUserRole: string | null = null;
let cachedRoleToken: string | null = null;

export const isStandaloneRole = (role: string): boolean =>
  role === STANDALONE_ROLE;

export const getCurrentUserRole = async (): Promise<string> => {
  const token = AuthAction.GetAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  if (cachedUserRole && cachedRoleToken === token) {
    return cachedUserRole;
  }

  try {
    const profileResp = await UserAction.getProfile();
    const resolvedRole = profileResp.data?.role || null;

    if (!resolvedRole) {
      throw new Error("Unable to determine current user role");
    }

    cachedUserRole = resolvedRole;
    cachedRoleToken = token;

    return cachedUserRole;
  } catch {
    cachedUserRole = null;
    cachedRoleToken = null;
    throw new Error("Unable to determine user role. Please sign in again.");
  }
};

export const requireScopedClientId = (
  role: string,
  standAloneId?: string,
): void => {
  if (!isStandaloneRole(role) && !standAloneId) {
    throw new Error("standAloneId is required for transport manager");
  }
};

export const buildRoleScopedQuery = <T extends Record<string, unknown>>(
  role: string,
  standAloneId: string | undefined,
  params: T,
): T | (T & { standAloneId: string }) => {
  if (isStandaloneRole(role)) {
    return params;
  }

  requireScopedClientId(role, standAloneId);
  return {
    ...params,
    standAloneId: standAloneId as string,
  };
};
