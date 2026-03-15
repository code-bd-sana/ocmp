"use client";

import { AuthAction } from "@/service/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type GuardMode = "protected" | "guest";
const DEFAULT_GUEST_BLOCK_PATHS = ["/signin", "/signup"];

interface UseRouteGuardOptions {
  mode: GuardMode;
  redirectTo?: string;
  authenticatedRedirectTo?: string;
  applyGuestBlockOnPaths?: string[];
}

interface UseRouteGuardResult {
  isChecking: boolean;
  canRender: boolean;
}

/**
 * Route guard for client-side protected and guest-only pages.
 * - protected: requires auth token, otherwise redirects to redirectTo
 * - guest: allows all guests; for authenticated users redirects only on selected paths
 */
export function useRouteGuard({
  mode,
  redirectTo = "/signin",
  authenticatedRedirectTo = "/dashboard",
  applyGuestBlockOnPaths = DEFAULT_GUEST_BLOCK_PATHS,
}: UseRouteGuardOptions): UseRouteGuardResult {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const token = AuthAction.GetAuthToken();
    const isAuthenticated = Boolean(token);

    if (mode === "protected") {
      if (!isAuthenticated) {
        setCanRender(false);
        router.replace(redirectTo);
        return;
      }
      setCanRender(true);
      setIsChecking(false);
      return;
    }

    // mode === "guest"
    const shouldBlock = applyGuestBlockOnPaths.includes(pathname);
    if (isAuthenticated && shouldBlock) {
      setCanRender(false);
      router.replace(authenticatedRedirectTo);
      return;
    }

    setCanRender(true);
    setIsChecking(false);
  }, [
    mode,
    pathname,
    router,
    redirectTo,
    authenticatedRedirectTo,
    applyGuestBlockOnPaths,
  ]);

  return { isChecking, canRender };
}
