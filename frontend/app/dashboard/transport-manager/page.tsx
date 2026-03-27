"use client";

import { ClientAction } from "@/service/client";
import { UserAction } from "@/service/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TransportManagerTrainingRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const redirectBasedOnRole = async () => {
      try {
        const profileResp = await UserAction.getProfile();
        const userRole = profileResp.data?.role;
        const userId = profileResp.data?._id;

        if (!isActive) return;

        if (userRole === "STANDALONE_USER") {
          if (userId) {
            router.replace(`/dashboard/transport-manager/${userId}`);
          } else {
            setError("Unable to load your profile. Please try again.");
          }
          return;
        }

        const clientRes = await ClientAction.getClients({
          showPerPage: 1,
          pageNo: 1,
        });

        if (!isActive) return;

        if (clientRes.status && clientRes.data?.data?.length) {
          const firstClientId = clientRes.data.data[0].client._id;
          router.replace(`/dashboard/transport-manager/${firstClientId}`);
        } else {
          setError("No clients found. Please add a client first.");
        }
      } catch {
        if (!isActive) return;
        setError("Failed to load profile or clients. Please try again.");
      }
    };

    redirectBasedOnRole();

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
          Loading transport manager training...
        </p>
      </div>
    </div>
  );
}
