"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientAction } from "@/service/client";
import { UserAction } from "@/service/user";

/**
 * Landing page for /dashboard/subcontractor-details (no standAloneId).
 *
 * For STANDALONE_USER: Uses their own user ID as standAloneId
 * For TRANSPORT_MANAGER: Fetches the client list and redirects to the first client's page
 */
export default function SubContractorRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectBasedOnRole = async () => {
      try {
        const profileResp = await UserAction.getProfile();
        const userRole = profileResp.data?.role;
        const userId = profileResp.data?._id;

        if (userRole === "STANDALONE_USER") {
          if (userId) {
            router.replace(`/dashboard/subcontractor-details/${userId}`);
          } else {
            setError("Unable to load your profile. Please try again.");
          }
        } else {
          const clientRes = await ClientAction.getClients({
            showPerPage: 1,
            pageNo: 1,
          });
          if (clientRes.status && clientRes.data?.data?.length) {
            const firstClientId = clientRes.data.data[0].client._id;
            router.replace(`/dashboard/subcontractor-details/${firstClientId}`);
          } else {
            setError("No clients found. Please add a client first.");
          }
        }
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error(err);
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
        <p className="text-muted-foreground">Loading subcontractors...</p>
      </div>
    </div>
  );
}
