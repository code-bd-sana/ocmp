"use client";

import TrainingRecordsContent from "@/components/dashboard/training-records/TrainingRecordsContent";
import { resolveRoleScopedRoute } from "@/lib/utils/role-route";
import { UserAction } from "@/service/user";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function TrainingRecordsByClientPage({ params }: PageProps) {
  const { standAloneId } = use(params);
  const router = useRouter();
  const [roleReady, setRoleReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const ensureRoleScopedRoute = async () => {
      try {
        const profileResp = await UserAction.getProfile();
        const userRole = profileResp.data?.role;
        const userId = profileResp.data?._id;

        if (!isActive) return;

        const routeResult = resolveRoleScopedRoute({
          role: userRole,
          userId,
          standAloneId,
          basePath: "/dashboard/training-records",
        });

        if (routeResult.error) {
          setError(routeResult.error);
          return;
        }

        if (routeResult.redirectTo) {
          router.replace(routeResult.redirectTo);
          return;
        }

        setRoleReady(true);
      } catch {
        if (!isActive) return;
        setError("Failed to load your profile. Please sign in again.");
      }
    };

    setRoleReady(false);
    ensureRoleScopedRoute();

    return () => {
      isActive = false;
    };
  }, [standAloneId, router]);

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!roleReady) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading training records...</p>
        </div>
      </div>
    );
  }

  return <TrainingRecordsContent standAloneId={standAloneId} />;
}
