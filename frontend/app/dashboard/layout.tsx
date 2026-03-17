"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/dashboard/header";
import DashboardContent from "@/components/dashboard/dashboard-content";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { UserAction } from "@/service/user";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isChecking, canRender } = useRouteGuard({
    mode: "protected",
    redirectTo: "/signin",
  });

  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleChecking, setIsRoleChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const profileResp = await UserAction.getProfile();
        const role = profileResp.data?.role;
        if (!isMounted) return;
        setUserRole(role || null);
      } catch {
        // Route guard handles auth failures.
      } finally {
        if (isMounted) {
          setIsRoleChecking(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isChecking || !canRender || isRoleChecking) {
    return null;
  }

  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col">
          {/* Header */}
          <div className="sticky top-0 z-50">
            <Header />
          </div>

          {/* Main area */}
          <div className="relative flex flex-1">
            {userRole !== "STANDALONE_USER" && <AppSidebar />}
            <DashboardContent userRole={userRole}>{children}</DashboardContent>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
