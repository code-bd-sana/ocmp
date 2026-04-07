"use client";

import { AuthAction } from "@/service/auth";
import { UserAction } from "@/service/user";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const isGuardedAuthPath = pathname === "/signin" || pathname === "/signup";

    if (!isGuardedAuthPath) {
      setCanRender(true);
      setIsChecking(false);
      return;
    }

    const token = AuthAction.GetAuthToken();
    if (!token) {
      setCanRender(true);
      setIsChecking(false);
      return;
    }

    const cachedRole = AuthAction.GetUserRole();
    if (cachedRole) {
      router.replace(cachedRole === "SUPER_ADMIN" ? "/admin" : "/dashboard");
      setIsChecking(false);
      return;
    }

    setCanRender(false);

    (async () => {
      try {
        const profileResp = await UserAction.getProfile();
        const role = profileResp.data?.role;
        if (role) {
          AuthAction.SetUserRole(role);
        }
        router.replace(role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
      } catch {
        router.replace("/dashboard");
      } finally {
        setIsChecking(false);
      }
    })();
  }, [pathname, router]);

  if (isChecking || !canRender) {
    return null;
  }

  return <>{children}</>;
}
