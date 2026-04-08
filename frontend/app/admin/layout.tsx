"use client";

import { AppSidebar } from "../../components/app-sidebar";
import DashboardContent from "@/components/dashboard/dashboard-content";
import Header from "@/components/dashboard/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { AuthAction } from "@/service/auth";
import { UserAction } from "@/service/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isChecking, canRender } = useRouteGuard({
    mode: "protected",
    redirectTo: "/signin",
  });

  const [isRoleChecking, setIsRoleChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const cachedRole = AuthAction.GetUserRole();
    if (cachedRole) {
      if (cachedRole !== "SUPER_ADMIN") {
        router.replace("/dashboard");
      }
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

        if (role !== "SUPER_ADMIN") {
          router.replace("/dashboard");
          return;
        }
      } catch {
        if (isMounted) {
          router.replace("/signin");
        }
        return;
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

  if (isChecking || !canRender || isRoleChecking) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <div className="sticky top-0 z-50">
          <Header />
        </div>

        <div className="relative flex flex-1">
          <AppSidebar mode="super-admin" />
          <DashboardContent userRole="SUPER_ADMIN" showTopNav={false}>
            {children}
          </DashboardContent>
        </div>
      </div>
    </SidebarProvider>
  );
}
