"use client";

import { ClientAction } from "@/service/client";
import { UserAction } from "@/service/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WheelRetorquePage() {
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
            router.replace(`/dashboard/wheel-retorque/${userId}`);
          } else {
            setError("Unable to load your profile. Please try again.");
          }
        } else {
          const res = await ClientAction.getClients({ showPerPage: 1, pageNo: 1 });
          if (res.status && res.data?.data?.length) {
            const firstClientId = res.data.data[0].client._id;
            router.replace(`/dashboard/wheel-retorque/${firstClientId}`);
          } else {
            setError("No clients found. Please add a client first.");
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch clients.",
        );
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
        <p className="text-muted-foreground">Loading Wheel Re-torque Policy...</p>
      </div>
    </div>
  );
}
