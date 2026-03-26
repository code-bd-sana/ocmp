"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientAction } from "@/service/client";
import { UserAction } from "@/service/user";
import { getCurrentUserRole, isStandaloneRole } from "@/service/shared/role-scope";

/**
 * Landing page for /dashboard/ocrs-plan (no standAloneId).
 * For standalone users: redirects to /dashboard/ocrs-plan/{userId}
 * For transport managers: fetches clients and redirects to first client's OCRS plan page
 */
export default function OcrsPlanRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const handleRedirect = async () => {
      try {
        // Get profile to determine role and userId
        const profileRes = await UserAction.getProfile();
        if (!isActive) return;

        if (!profileRes.status || !profileRes.data) {
          setError("Failed to load user profile.");
          return;
        }

        const userRole = await getCurrentUserRole();
        const userId = profileRes.data._id;

        // Standalone users redirect to their own ID
        if (isStandaloneRole(userRole)) {
          router.replace(`/dashboard/ocrs-plan/${userId}`);
          return;
        }

        // Transport managers: fetch first client and redirect
        const clientsRes = await ClientAction.getClients({
          showPerPage: 1,
          pageNo: 1,
        });
        if (!isActive) return;

        if (clientsRes.status && clientsRes.data?.data?.length) {
          const firstClientId = clientsRes.data.data[0].client._id;
          router.replace(`/dashboard/ocrs-plan/${firstClientId}`);
        } else {
          setError("No clients found. Please add a client first.");
        }
      } catch {
        if (!isActive) return;
        setError("Failed to load profile or clients. Please try again.");
      }
    };

    handleRedirect();
    return () => {
      isActive = false;
    };
  }, [router]);

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-10">
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading OCRS plans...</p>
      </div>
    </div>
  );
}
