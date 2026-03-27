"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientAction } from "@/service/client";
import { UserAction } from "@/service/user";

export default function ContactLogRedirectPage() {
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
            router.replace(`/dashboard/contact-log/${userId}`);
          } else {
            setError("Unable to load your profile. Please try again.");
          }
          return;
        }

        const res = await ClientAction.getClients({
          showPerPage: 1,
          pageNo: 1,
        });
        if (res.status && res.data?.data?.length) {
          const firstClientId = res.data.data[0].client._id;
          router.replace(`/dashboard/contact-log/${firstClientId}`);
        } else {
          setError("No clients found. Please add a client first.");
        }
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
        <p className="text-muted-foreground">Loading contact logs...</p>
      </div>
    </div>
  );
}
