import type { IApiResponse } from "@/service/auth";

const SUBSCRIPTION_DENIAL_PATTERNS = [
  "access denied. no active subscription or trial found",
  "access denied. subscription or trial has expired",
  "no active subscription",
  "subscription or trial has expired",
  "subscription has expired",
];

export function getApiErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "";

  const apiData = data as IApiResponse;

  if (typeof apiData.error === "string" && apiData.error.trim()) {
    return apiData.error.trim();
  }

  if (typeof apiData.message === "string" && apiData.message.trim()) {
    return apiData.message.trim();
  }

  return "";
}

export function isSubscriptionAccessDeniedMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return SUBSCRIPTION_DENIAL_PATTERNS.some((pattern) =>
    normalized.includes(pattern),
  );
}

/**
 * Ensures existing service catch blocks can read a useful message from `error`.
 */
export function normalizeApiErrorPayload(data: unknown): void {
  if (!data || typeof data !== "object") return;

  const apiData = data as IApiResponse;
  const message = getApiErrorMessage(apiData);
  if (!message) return;

  if (!apiData.error || typeof apiData.error !== "string") {
    apiData.error = message;
  }

  if (isSubscriptionAccessDeniedMessage(message)) {
    apiData.error =
      "Your account is currently in read-only mode. Please start a trial or buy a subscription to create, update, or delete data.";
  }
}
