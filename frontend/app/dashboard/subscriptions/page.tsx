"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SubscriptionAction,
  SubscriptionPricing,
  RemainingSubscriptionInfo,
} from "@/service/subscription";
import { UserAction } from "@/service/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

type PlanGroup = {
  planName: string;
  planType: string;
  accountType: string;
  pricings: SubscriptionPricing[];
  minPrice: number;
};

const formatCurrency = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value} ${currency || "GBP"}`;
  }
};

const formatDuration = (days: number) => {
  if (days === 1) return "1 day";
  if (days % 365 === 0) {
    const years = days / 365;
    return years === 1 ? "1 year" : `${years} years`;
  }
  if (days % 30 === 0) {
    const months = days / 30;
    return months === 1 ? "1 month" : `${months} months`;
  }
  return `${days} days`;
};

export default function DashboardSubscriptionsPage() {
  const [pricingRows, setPricingRows] = useState<SubscriptionPricing[]>([]);
  const [remainingInfo, setRemainingInfo] =
    useState<RemainingSubscriptionInfo | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBuyingId, setIsBuyingId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [pricingResponse, remainingResponse] = await Promise.all([
        SubscriptionAction.getSubscriptionPricings(),
        SubscriptionAction.getSubscriptionRemainingDays(),
      ]);

      const profileResponse = await UserAction.getProfile();

      const rows = pricingResponse.data?.subscriptionPricings || [];
      setPricingRows(rows);
      setRemainingInfo(remainingResponse.data || null);
      setUserRole(profileResponse.data?.role || null);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load subscription data";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visiblePricings = useMemo(
    () =>
      pricingRows.filter((row) => {
        const normalizedUserRole = (userRole || "").toUpperCase();
        const normalizedAccountType = (
          row.applicableAccountType || ""
        ).toUpperCase();

        const isTransportManagerRole =
          normalizedUserRole === "TRANSPORT_MANAGER";
        const isStandaloneRole =
          normalizedUserRole === "STANDALONE_USER" ||
          normalizedUserRole === "STANDALONE";

        const isStandalonePlan =
          normalizedAccountType === "STANDALONE" ||
          normalizedAccountType === "STANDALONE_USER";
        const isTransportManagerPlan =
          normalizedAccountType === "TRANSPORT_MANAGER";
        const isBothPlan = normalizedAccountType === "BOTH";

        const isPlanVisibleToRole =
          isBothPlan ||
          (isTransportManagerRole && isTransportManagerPlan) ||
          (isStandaloneRole && isStandalonePlan);

        return (
          isPlanVisibleToRole &&
          row.isActive &&
          row.subscriptionPlanStatus !== false &&
          row.subscriptionDurationStatus !== false
        );
      }),
    [pricingRows, userRole],
  );

  const planGroups = useMemo<PlanGroup[]>(() => {
    const map = new Map<string, PlanGroup>();

    visiblePricings.forEach((row) => {
      const key = row.subscriptionPlanName.toUpperCase();
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          planName: row.subscriptionPlanName,
          planType: row.subscriptionPlanType,
          accountType: row.applicableAccountType,
          pricings: [row],
          minPrice: row.price,
        });
        return;
      }

      existing.pricings.push(row);
      existing.minPrice = Math.min(existing.minPrice, row.price);
    });

    return Array.from(map.values()).sort((a, b) => a.minPrice - b.minPrice);
  }, [visiblePricings]);

  useEffect(() => {
    if (!planGroups.length) {
      setSelectedPlanName("");
      return;
    }

    if (
      !selectedPlanName ||
      !planGroups.some((p) => p.planName === selectedPlanName)
    ) {
      setSelectedPlanName(planGroups[0].planName);
    }
  }, [planGroups, selectedPlanName]);

  const selectedPlanRows = useMemo(() => {
    if (!selectedPlanName) return [];
    return visiblePricings
      .filter((row) => row.subscriptionPlanName === selectedPlanName)
      .sort((a, b) => a.subscriptionDuration - b.subscriptionDuration);
  }, [selectedPlanName, visiblePricings]);

  const currentStatus = useMemo(() => {
    if (!remainingInfo || remainingInfo.expired) {
      return { label: "No active subscription", variant: "secondary" as const };
    }

    return { label: "Active subscription", variant: "default" as const };
  }, [remainingInfo]);

  const handleBuy = async (pricingId: string, useTrial = false) => {
    try {
      setIsBuyingId(pricingId);

      if (useTrial) {
        await SubscriptionAction.createSubscriptionTrial({
          subscriptionPricingId: pricingId,
        });
        toast.success("Trial activated successfully");
        await loadData();
        return;
      }

      const response = await SubscriptionAction.createSubscriptionCheckout({
        subscriptionPricingId: pricingId,
        coupon: couponCode.trim() || undefined,
      });

      const checkoutUrl = response.data?.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error("Checkout URL was not returned by the server");
      }

      window.location.assign(checkoutUrl);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to start subscription checkout";
      toast.error(message);
    } finally {
      setIsBuyingId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="rounded-2xl border bg-linear-to-r from-blue-50 via-sky-50 to-cyan-50 p-6">
        <p className="text-sm font-semibold tracking-wide text-slate-600 uppercase">
          Subscription management
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
          Choose the best plan for your transport operation
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
          Compare plans, pick your billing duration, and continue to secure
          checkout.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Current status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Days remaining
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {remainingInfo?.isLifetime
              ? "Lifetime"
              : Math.max(0, Number(remainingInfo?.daysRemaining || 0))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Available plans
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {planGroups.length}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Plans</h2>
        {isLoading ? (
          <div className="text-muted-foreground py-8 text-sm">
            Loading plans...
          </div>
        ) : planGroups.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {planGroups.map((group) => {
              const isSelected = selectedPlanName === group.planName;

              return (
                <button
                  key={group.planName}
                  type="button"
                  onClick={() => setSelectedPlanName(group.planName)}
                  className={`rounded-2xl border p-5 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "hover:border-primary/40 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {group.planName}
                      </p>
                      <p className="text-xs text-slate-500 uppercase">
                        {group.planType}
                      </p>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="text-primary h-5 w-5" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <p className="mt-4 text-sm text-slate-600">
                    Starts from{" "}
                    {formatCurrency(
                      group.minPrice,
                      group.pricings[0]?.currency || "GBP",
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {group.pricings.length} billing option
                    {group.pricings.length > 1 ? "s" : ""} available
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
            No active subscription plans are available right now.
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedPlanName
              ? `${selectedPlanName} pricing options`
              : "Pricing options"}
          </CardTitle>
          <div className="flex flex-col gap-2 pt-2 sm:max-w-sm">
            <label className="text-xs font-medium text-slate-500 uppercase">
              Coupon code (optional)
            </label>
            <Input
              value={couponCode}
              onChange={(event) =>
                setCouponCode(event.target.value.toUpperCase())
              }
              placeholder="Enter coupon code"
            />
          </div>
        </CardHeader>
        <CardContent>
          {!selectedPlanRows.length ? (
            <p className="text-muted-foreground text-sm">
              Select a plan to see durations and pricing.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Duration</TableHead>
                  <TableHead>Account type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedPlanRows.map((row) => {
                  const isBuying = isBuyingId === row._id;
                  const isTrialPlan = row.subscriptionPlanType === "FREE";

                  return (
                    <TableRow key={row._id}>
                      <TableCell className="font-medium">
                        {formatDuration(row.subscriptionDuration)}
                      </TableCell>
                      <TableCell>{row.applicableAccountType}</TableCell>
                      <TableCell>
                        {formatCurrency(row.price, row.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleBuy(row._id, isTrialPlan)}
                          disabled={isBuying}
                          size="sm"
                        >
                          {isBuying ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Redirecting
                            </>
                          ) : isTrialPlan ? (
                            "Start trial"
                          ) : (
                            "Buy now"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
