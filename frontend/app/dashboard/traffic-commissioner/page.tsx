"use client";

import { ClientAction } from "@/service/client";
import {
  getCurrentUserRole,
  isStandaloneRole,
} from "@/service/shared/role-scope";
import { UserAction } from "@/service/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TrafficCommissionerPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const handleRedirect = async () => {
      try {
        const profileRes = await UserAction.getProfile();
        if (!isActive) return;

        if (!profileRes.status || !profileRes.data) {
          setError("Failed to load user profile.");
          return;
        }

        const userRole = await getCurrentUserRole();
        const userId = profileRes.data._id;

        if (isStandaloneRole(userRole)) {
          router.replace(`/dashboard/traffic-commissioner/${userId}`);
          return;
        }

        const clientsRes = await ClientAction.getClients({
          showPerPage: 1,
          pageNo: 1,
        });
        if (!isActive) return;

        if (clientsRes.status && clientsRes.data?.data?.length) {
          const firstClientId = clientsRes.data.data[0].client._id;
          router.replace(`/dashboard/traffic-commissioner/${firstClientId}`);
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
        <p className="text-muted-foreground">
          Loading Traffic Commissioner Communication...
        </p>
      </div>
    </div>
  );
}
