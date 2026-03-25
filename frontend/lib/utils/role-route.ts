import { STANDALONE_ROLE } from "@/service/shared/role-scope";

interface ResolveRoleRouteOptions {
  role?: string;
  userId?: string;
  standAloneId: string;
  basePath: string;
}

interface ResolveRoleRouteResult {
  redirectTo?: string;
  error?: string;
}

export const resolveRoleScopedRoute = ({
  role,
  userId,
  standAloneId,
  basePath,
}: ResolveRoleRouteOptions): ResolveRoleRouteResult => {
  if (role === STANDALONE_ROLE) {
    if (!userId) {
      return { error: "Unable to load your profile. Please sign in again." };
    }

    if (standAloneId !== userId) {
      return { redirectTo: `${basePath}/${userId}` };
    }
  }

  if (role === "TRANSPORT_MANAGER") {
    if (!standAloneId || standAloneId === "null" || standAloneId === "undefined") {
      return { redirectTo: basePath };
    }
  }

  return {};
};
