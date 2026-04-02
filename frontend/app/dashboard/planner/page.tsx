"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientAction } from "@/service/client";
import { UserAction } from "@/service/user";

/**
 * Landing page for /dashboard/planner (no standAloneId).
 *
 * For STANDALONE_USER: redirects to /dashboard/planner/:userId
 * For TRANSPORT_MANAGER: redirects to first approved client's planner
 */
export default function PlannerPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectBasedOnRole = async () => {
      try {
        const profileResp = await UserAction.getProfile();
        const userRole = profileResp.data?.role;
        const userId = profileResp.data?._id;

        if (userRole === "STANDALONE_USER") {
          if (!userId) {
            setError("Unable to load your profile. Please try again.");
            return;
          }
          router.replace(`/dashboard/planner/${userId}`);
          return;
        }

        const clientRes = await ClientAction.getClients({
          showPerPage: 25,
          pageNo: 1,
        });
        if (clientRes.status && clientRes.data?.data?.length) {
          const approvedClients = clientRes.data.data.filter(
            (row) => (row.status || "").toUpperCase() === "APPROVED",
          );

          if (approvedClients.length) {
            router.replace(
              `/dashboard/planner/${approvedClients[0].client._id}`,
            );
            return;
          }

          const firstClientId = clientRes.data.data[0].client._id;
          router.replace(`/dashboard/planner/${firstClientId}`);
          return;
        }

        setError("No clients found. Please add a client first.");
      } catch {
        setError("Failed to load clients. Please try again.");
      }
    };

    redirectBasedOnRole();
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
        <p className="text-muted-foreground">Loading planner items...</p>
      </div>
    </div>
  );
}
