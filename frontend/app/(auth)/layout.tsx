"use client";

import { useRouteGuard } from "@/hooks/useRouteGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isChecking, canRender } = useRouteGuard({
    mode: "guest",
    authenticatedRedirectTo: "/dashboard",
    applyGuestBlockOnPaths: ["/signin", "/signup"],
  });

  if (isChecking || !canRender) {
    return null;
  }

  return <>{children}</>;
}
