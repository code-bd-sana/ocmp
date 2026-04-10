"use client";

import { useEffect, useState } from "react";
import { AuthAction } from "@/service/auth";
import { SubscriptionAction } from "@/service/subscription";

type UseSubscriptionWriteAccessResult = {
  canWrite: boolean;
  isChecking: boolean;
  reason: string;
};

const READ_ONLY_REASON =
  "You need to buy a subscription or claim your 7-day trial to create, update, or delete data.";

export function useSubscriptionWriteAccess(): UseSubscriptionWriteAccessResult {
  const [canWrite, setCanWrite] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAccess = async () => {
      try {
        const role = (AuthAction.GetUserRole() || "").toUpperCase();

        if (role === "SUPER_ADMIN") {
          if (mounted) {
            setCanWrite(true);
            setIsChecking(false);
          }
          return;
        }

        if (!AuthAction.GetAuthToken()) {
          if (mounted) {
            setCanWrite(false);
            setIsChecking(false);
          }
          return;
        }

        const response =
          await SubscriptionAction.getSubscriptionRemainingDays();
        const subscription = response.data;

        const hasWriteAccess = Boolean(
          subscription && (!subscription.expired || subscription.isLifetime),
        );

        if (mounted) {
          setCanWrite(hasWriteAccess);
          setIsChecking(false);
        }
      } catch {
        if (mounted) {
          setCanWrite(false);
          setIsChecking(false);
        }
      }
    };

    checkAccess();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    canWrite,
    isChecking,
    reason: READ_ONLY_REASON,
  };
}
