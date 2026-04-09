"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/dashboard/header";
import DashboardContent from "@/components/dashboard/dashboard-content";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { AuthAction } from "@/service/auth";
import { UserAction } from "@/service/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isChecking, canRender } = useRouteGuard({
    mode: "protected",
    redirectTo: "/signin",
  });

  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleChecking, setIsRoleChecking] = useState(true);
  const [canAccessDashboard, setCanAccessDashboard] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const cachedRole = AuthAction.GetUserRole();
    if (cachedRole) {
      if (cachedRole === "SUPER_ADMIN") {
        router.replace("/admin");
        setCanAccessDashboard(false);
        setIsRoleChecking(false);
        return () => {
          isMounted = false;
        };
      }

      setUserRole(cachedRole);
      setCanAccessDashboard(true);
      setIsRoleChecking(false);
      return () => {
        isMounted = false;
      };
    }

    (async () => {
      try {
        const profileResp = await UserAction.getProfile();
        const role = profileResp.data?.role;
        if (!isMounted) return;

        if (role) {
          AuthAction.SetUserRole(role);
        }

        if (role === "SUPER_ADMIN") {
          setCanAccessDashboard(false);
          router.replace("/admin");
          return;
        }

        setUserRole(role || null);
        setCanAccessDashboard(true);
      } catch {
        if (isMounted) {
          setCanAccessDashboard(false);
          router.replace("/signin");
        }
      } finally {
        if (isMounted) {
          setIsRoleChecking(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isChecking || !canRender || isRoleChecking || !canAccessDashboard) {
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
