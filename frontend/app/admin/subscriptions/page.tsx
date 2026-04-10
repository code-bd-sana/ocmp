"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApplicableAccountType,
  SubscriptionAction,
  SubscriptionCoupon,
  SubscriptionDuration,
  SubscriptionPlan,
  SubscriptionPlanType,
} from "@/service/subscription";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Ban, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";

type PricingRow = {
  _id: string;
  subscriptionPlanId?: string;
  subscriptionDurationId?: string;
  subscriptionPlanName: string;
  subscriptionPlanType: SubscriptionPlanType;
  applicableAccountType: ApplicableAccountType;
  subscriptionName: string;
  subscriptionDuration: number;
  price: number;
  currency: string;
  isActive: boolean;
  subscriptionPlanStatus?: boolean;
  subscriptionDurationStatus?: boolean;
};

type CreateFormState = {
  planName: string;
  planType: SubscriptionPlanType;
  accountType: ApplicableAccountType;
  description: string;
  planStatus: boolean;
  durationMode: "existing" | "new";
  selectedDurationId: string;
  durationName: string;
  durationDays: string;
  priceMode: "existing" | "new";
  selectedPriceTemplateKey: string;
  newPrice: string;
  newCurrency: string;
  pricingStatus: boolean;
};

type CouponFormState = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  selectedPricingId: string;
  isActive: boolean;
};

const defaultCreateForm: CreateFormState = {
  planName: "",
  planType: "PAID",
  accountType: "BOTH",
  description: "",
  planStatus: true,
  durationMode: "existing",
  selectedDurationId: "",
  durationName: "MONTHLY",
  durationDays: "30",
  priceMode: "existing",
  selectedPriceTemplateKey: "",
  newPrice: "0",
  newCurrency: "GBP",
  pricingStatus: true,
};

const defaultCouponForm: CouponFormState = {
  code: "",
  discountType: "percentage",
  discountValue: "0",
  selectedPricingId: "",
  isActive: true,
};

const demoExemptions = [
  {
    userName: "John Doe",
    email: "john@example.com",
    plan: "FREE",
    reason: "Full access for 30 days",
    startDate: "12/12/2025",
  },
  {
    userName: "Sarah Miller",
    email: "sarah@example.com",
    plan: "BASIC",
    reason: "Manual exemption due to special case",
    startDate: "12/12/2025",
  },
  {
    userName: "Mike Johnson",
    email: "mike@example.com",
    plan: "ENTERPRISE",
    reason: "Signed agreement, full access granted",
    startDate: "12/12/2025",
  },
];

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [durations, setDurations] = useState<SubscriptionDuration[]>([]);
  const [pricingRows, setPricingRows] = useState<PricingRow[]>([]);
  const [coupons, setCoupons] = useState<SubscriptionCoupon[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const [planCount, setPlanCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [isCouponSaving, setIsCouponSaving] = useState(false);
  const [formState, setFormState] =
    useState<CreateFormState>(defaultCreateForm);
  const [couponForm, setCouponForm] =
    useState<CouponFormState>(defaultCouponForm);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [plansResponse, durationResponse, pricingResponse, couponResponse] =
        await Promise.all([
          SubscriptionAction.getSubscriptionPlans({
            searchKey: searchValue,
            showPerPage: 100,
            pageNo: 1,
          }),
          SubscriptionAction.getSubscriptionDurations(),
          SubscriptionAction.getSubscriptionPricings(),
          SubscriptionAction.getSubscriptionCoupons({
            showPerPage: 100,
            pageNo: 1,
          }),
        ]);

      const plansPayload = plansResponse.data;
      if (!plansPayload)
        throw new Error(plansResponse.message || "Failed to load plans");

      setPlans(plansPayload.subscriptionPlans || []);
      setDurations(durationResponse.data?.subscriptionDurations || []);
      setPricingRows(
        (pricingResponse.data?.subscriptionPricings || []) as PricingRow[],
      );
      setCoupons(couponResponse.data?.subscriptionCoupons || []);
      setPlanCount(plansPayload.totalData || 0);
      setTotalPages(plansPayload.totalPages || 1);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load subscription data";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [searchValue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!plans.length) {
      setSelectedPlanId(null);
      return;
    }

    if (!selectedPlanId || !plans.some((plan) => plan._id === selectedPlanId)) {
      setSelectedPlanId(plans[0]._id);
    }
  }, [plans, selectedPlanId]);

  useEffect(() => {
    if (
      formState.durationMode === "existing" &&
      durations.length &&
      !formState.selectedDurationId
    ) {
      setFormState((prev) => ({
        ...prev,
        selectedDurationId: durations[0]._id,
      }));
    }
  }, [durations, formState.durationMode, formState.selectedDurationId]);

  useEffect(() => {
    if (pricingRows.length && !couponForm.selectedPricingId) {
      setCouponForm((prev) => ({
        ...prev,
        selectedPricingId: pricingRows[0]._id,
      }));
    }
  }, [pricingRows, couponForm.selectedPricingId]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan._id === selectedPlanId) || null,
    [plans, selectedPlanId],
  );

  const selectedPlanPricing = useMemo(
    () =>
      pricingRows.filter(
        (item) =>
          item.subscriptionPlanName.toLowerCase() ===
          (selectedPlan?.name || "").toLowerCase(),
      ),
    [pricingRows, selectedPlan?.name],
  );

  const activePlans = useMemo(
    () => plans.filter((plan) => Boolean(plan.isActive)).length,
    [plans],
  );

  const freePlans = useMemo(
    () => plans.filter((plan) => plan.planType === "FREE"),
    [plans],
  );

  const freePricingRows = useMemo(
    () => pricingRows.filter((row) => row.subscriptionPlanType === "FREE"),
    [pricingRows],
  );

  const isTrialEnabled = useMemo(
    () => freePricingRows.some((row) => row.isActive),
    [freePricingRows],
  );

  const selectedDurationLabel = useMemo(() => {
    if (formState.durationMode === "new") {
      return `${formState.durationName.trim() || "NEW"} (${formState.durationDays || "0"} days)`;
    }

    const duration = durations.find(
      (item) => item._id === formState.selectedDurationId,
    );

    return duration
      ? `${duration.name} (${duration.durationInDays} days)`
      : "Not selected";
  }, [
    durations,
    formState.durationDays,
    formState.durationMode,
    formState.durationName,
    formState.selectedDurationId,
  ]);

  const existingDurationPricingOptions = useMemo(() => {
    if (formState.durationMode !== "existing") return [];

    const durationId = formState.selectedDurationId;
    if (!durationId) return [];

    const seen = new Set<string>();

    return pricingRows
      .filter((item) => item.subscriptionDurationId === durationId)
      .sort((a, b) => a.price - b.price)
      .filter((item) => {
        const key = `${item.currency.toUpperCase()}-${item.price}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [formState.durationMode, formState.selectedDurationId, pricingRows]);

  const selectedPriceTemplate = useMemo(
    () =>
      existingDurationPricingOptions.find(
        (item) =>
          `${item.currency.toUpperCase()}-${item.price}` ===
          formState.selectedPriceTemplateKey,
      ) || null,
    [existingDurationPricingOptions, formState.selectedPriceTemplateKey],
  );

  useEffect(() => {
    if (
      formState.durationMode === "new" &&
      formState.priceMode === "existing"
    ) {
      setFormState((prev) => ({
        ...prev,
        priceMode: "new",
        selectedPriceTemplateKey: "",
      }));
      return;
    }

    if (formState.priceMode !== "existing") return;

    const hasCurrentSelection = existingDurationPricingOptions.some(
      (item) =>
        `${item.currency.toUpperCase()}-${item.price}` ===
        formState.selectedPriceTemplateKey,
    );

    if (!existingDurationPricingOptions.length) {
      setFormState((prev) => ({
        ...prev,
        priceMode: "new",
        selectedPriceTemplateKey: "",
      }));
      return;
    }

    if (!hasCurrentSelection) {
      const first = existingDurationPricingOptions[0];
      setFormState((prev) => ({
        ...prev,
        selectedPriceTemplateKey: `${first.currency.toUpperCase()}-${first.price}`,
      }));
    }
  }, [
    existingDurationPricingOptions,
    formState.durationMode,
    formState.priceMode,
    formState.selectedPriceTemplateKey,
  ]);

  const requirements = useMemo(
    () => [
      {
        label: "Plan name is provided",
        ok: formState.planName.trim().length >= 2,
      },
      {
        label:
          formState.durationMode === "existing"
            ? "Existing duration selected"
            : "New duration details provided",
        ok:
          formState.durationMode === "existing"
            ? Boolean(formState.selectedDurationId)
            : formState.durationName.trim().length >= 2 &&
              Number(formState.durationDays) > 0,
      },
      {
        label:
          formState.priceMode === "existing"
            ? "Existing price selected"
            : "New price is valid",
        ok:
          formState.priceMode === "existing"
            ? Boolean(formState.selectedPriceTemplateKey)
            : !Number.isNaN(Number(formState.newPrice)) &&
              Number(formState.newPrice) >= 0,
      },
      {
        label: "Review all settings before creating",
        ok: true,
      },
    ],
    [
      formState.durationDays,
      formState.durationMode,
      formState.durationName,
      formState.newPrice,
      formState.planName,
      formState.priceMode,
      formState.selectedPriceTemplateKey,
      formState.selectedDurationId,
    ],
  );

  const isWarningSuccessMessage = (message: string) =>
    /deactivated|activated|re-activated|currently in use/i.test(message);

  const safeToggleMessage = async (
    message: string,
    fallbackError: () => void,
  ) => {
    if (isWarningSuccessMessage(message)) {
      toast.warning(message);
      await loadData();
      return true;
    }

    fallbackError();
    return false;
  };

  const handleCreatePricing = async () => {
    if (formState.planName.trim().length < 2) {
      toast.error("Plan name must be at least 2 characters");
      return;
    }

    if (
      formState.durationMode === "existing" &&
      !formState.selectedDurationId
    ) {
      toast.error("Please select an existing duration");
      return;
    }

    if (
      formState.durationMode === "new" &&
      (formState.durationName.trim().length < 2 ||
        Number.isNaN(Number(formState.durationDays)) ||
        Number(formState.durationDays) <= 0)
    ) {
      toast.error("Please provide a valid new duration name and days");
      return;
    }

    if (formState.priceMode === "existing" && !selectedPriceTemplate) {
      toast.error("Please select an existing price");
      return;
    }

    if (
      formState.priceMode === "new" &&
      (Number.isNaN(Number(formState.newPrice)) ||
        Number(formState.newPrice) < 0)
    ) {
      toast.error("Please provide a valid new price");
      return;
    }

    try {
      setIsSaving(true);

      const createdPlan = await SubscriptionAction.createSubscriptionPlan({
        name: formState.planName.trim(),
        planType: formState.planType,
        applicableAccountType: formState.accountType,
        description: formState.description.trim() || undefined,
        isActive: formState.planStatus,
      });

      const planId = createdPlan.data?._id || "";

      let durationId = formState.selectedDurationId;
      if (formState.durationMode === "new") {
        const createdDuration =
          await SubscriptionAction.createSubscriptionDuration({
            name: formState.durationName.trim().toUpperCase(),
            durationInDays: Number(formState.durationDays),
            isActive: true,
          });

        durationId = createdDuration.data?._id || "";
      }

      if (!planId) throw new Error("Plan is required");
      if (!durationId) throw new Error("Duration is required");

      const resolvedPrice =
        formState.priceMode === "existing"
          ? selectedPriceTemplate!.price
          : Number(formState.newPrice);

      const resolvedCurrency =
        formState.priceMode === "existing"
          ? selectedPriceTemplate!.currency.toUpperCase()
          : formState.newCurrency.trim().toUpperCase() || "GBP";

      await SubscriptionAction.createSubscriptionPricing({
        subscriptionPlanId: planId,
        subscriptionDurationId: durationId,
        price: resolvedPrice,
        currency: resolvedCurrency,
        isActive: formState.pricingStatus,
      });

      toast.success("Subscription pricing created successfully");
      setFormState(defaultCreateForm);
      setIsDialogOpen(false);
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create subscription pricing";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlanStatusToggle = async (plan: SubscriptionPlan) => {
    try {
      await SubscriptionAction.updateSubscriptionPlan(plan._id, {
        isActive: !plan.isActive,
      });
      toast.success(
        `Plan ${plan.isActive ? "disabled" : "enabled"} successfully.`,
      );
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update plan status";
      await safeToggleMessage(message, () => toast.error(message));
    }
  };

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!window.confirm(`Delete plan ${plan.name}?`)) return;

    try {
      await SubscriptionAction.deleteSubscriptionPlan(plan._id);
      toast.success("Plan deleted successfully");
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete plan";
      toast.error(message);
    }
  };

  const handleDurationStatusToggle = async (duration: SubscriptionDuration) => {
    try {
      await SubscriptionAction.updateSubscriptionDuration(duration._id, {
        isActive: !duration.isActive,
      });
      toast.success(
        `Duration ${duration.isActive ? "disabled" : "enabled"} successfully.`,
      );
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update duration status";
      await safeToggleMessage(message, () => toast.error(message));
    }
  };

  const handleDeleteDuration = async (duration: SubscriptionDuration) => {
    if (!window.confirm(`Delete duration ${duration.name}?`)) return;

    try {
      await SubscriptionAction.deleteSubscriptionDuration(duration._id);
      toast.success("Duration deleted successfully");
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete duration";
      toast.error(message);
    }
  };

  const handlePricingStatusToggle = async (pricing: PricingRow) => {
    try {
      await SubscriptionAction.updateSubscriptionPricing(pricing._id, {
        isActive: !pricing.isActive,
      });
      toast.success(
        `Pricing ${pricing.isActive ? "disabled" : "enabled"} successfully.`,
      );
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update pricing status";
      await safeToggleMessage(message, () => toast.error(message));
    }
  };

  const handleDeletePricing = async (pricing: PricingRow) => {
    if (!window.confirm(`Delete pricing for ${pricing.subscriptionPlanName}?`))
      return;

    try {
      await SubscriptionAction.deleteSubscriptionPricing(pricing._id);
      toast.success("Pricing deleted successfully");
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete pricing";
      toast.error(message);
    }
  };

  const handleToggleTrialAvailability = async () => {
    try {
      if (!freePricingRows.length) {
        toast.error(
          "Trial toggle unavailable. Create at least one FREE pricing first.",
        );
        return;
      }

      const nextState = !isTrialEnabled;

      setIsLoading(true);

      await Promise.all(
        freePricingRows.map((pricing) =>
          SubscriptionAction.updateSubscriptionPricing(pricing._id, {
            isActive: nextState,
          }),
        ),
      );

      toast.success(
        nextState
          ? "Trial has been enabled. Users can now claim trial manually."
          : "Trial has been disabled. Users can no longer claim trial.",
      );

      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update trial availability";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!couponForm.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    if (Number(couponForm.discountValue) <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    try {
      setIsCouponSaving(true);

      await SubscriptionAction.createSubscriptionCoupon({
        code: couponForm.code.trim().toUpperCase(),
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        isActive: couponForm.isActive,
        subscriptionPricings: couponForm.selectedPricingId
          ? [couponForm.selectedPricingId]
          : [],
      });

      toast.success("Coupon created successfully");
      setCouponForm(defaultCouponForm);
      setIsCouponDialogOpen(false);
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create coupon";
      toast.error(message);
    } finally {
      setIsCouponSaving(false);
    }
  };

  const handleToggleCouponStatus = async (coupon: SubscriptionCoupon) => {
    try {
      await SubscriptionAction.updateSubscriptionCoupon(coupon._id, {
        isActive: !coupon.isActive,
      });
      toast.success(
        `Coupon ${coupon.isActive ? "disabled" : "enabled"} successfully.`,
      );
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update coupon";
      toast.error(message);
    }
  };

  const handleDeleteCoupon = async (coupon: SubscriptionCoupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;

    try {
      await SubscriptionAction.deleteSubscriptionCoupon(coupon._id);
      toast.success("Coupon deleted successfully");
      await loadData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete coupon";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 bg-white p-4 md:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold text-[#0d4b9f] md:text-4xl">
          Subscription Management
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9B9B9B]" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search plans"
              className="w-48 pl-9"
            />
          </div>

          <Button onClick={loadData} variant="outline" disabled={isLoading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={handleToggleTrialAvailability}
            variant={isTrialEnabled ? "destructive" : "default"}
            disabled={isLoading || !freePricingRows.length}
            className={
              isTrialEnabled ? "" : "bg-[#0d4b9f] text-white hover:bg-[#0b3e84]"
            }
            title={
              !freePricingRows.length
                ? "Create FREE pricing to control trial availability"
                : undefined
            }
          >
            <Ban className="mr-2 h-4 w-4" />
            {isTrialEnabled ? "Disable Trial" : "Enable Trial"}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0d4b9f] text-white hover:bg-[#0b3e84]">
                <Plus className="mr-2 h-4 w-4" />
                Add New Subscription Plan
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#0d4b9f]">
                  Create Subscription Pricing
                </DialogTitle>
                <DialogDescription>
                  Create a new plan, then choose existing or new duration and
                  existing or new price.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-5 lg:col-span-2">
                  <section className="rounded-lg border border-[#EDEDED] p-4">
                    <h3 className="mb-4 text-sm font-semibold text-[#0d4b9f]">
                      1. Plan
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-medium text-[#3F3F3F]">
                          Plan Name
                        </label>
                        <Input
                          value={formState.planName}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              planName: event.target.value,
                            }))
                          }
                          placeholder="e.g. Basic"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#3F3F3F]">
                          Plan Type
                        </label>
                        <Select
                          value={formState.planType}
                          onValueChange={(value) =>
                            setFormState((prev) => ({
                              ...prev,
                              planType: value as SubscriptionPlanType,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Plan type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FREE">FREE</SelectItem>
                            <SelectItem value="PAID">PAID</SelectItem>
                            <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#3F3F3F]">
                          Visibility
                        </label>
                        <Select
                          value={formState.accountType}
                          onValueChange={(value) =>
                            setFormState((prev) => ({
                              ...prev,
                              accountType: value as ApplicableAccountType,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Visibility" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BOTH">BOTH</SelectItem>
                            <SelectItem value="STANDALONE">
                              STANDALONE
                            </SelectItem>
                            <SelectItem value="TRANSPORT_MANAGER">
                              TRANSPORT_MANAGER
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-medium text-[#3F3F3F]">
                          Description
                        </label>
                        <Textarea
                          value={formState.description}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              description: event.target.value,
                            }))
                          }
                          placeholder="Optional plan description"
                          rows={3}
                        />
                      </div>
                    </div>
                  </section>

                  <section className="rounded-lg border border-[#EDEDED] p-4">
                    <h3 className="mb-4 text-sm font-semibold text-[#0d4b9f]">
                      2. Duration
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-medium text-[#3F3F3F]">
                          Duration Source
                        </label>
                        <Select
                          value={formState.durationMode}
                          onValueChange={(value) =>
                            setFormState((prev) => ({
                              ...prev,
                              durationMode: value as "existing" | "new",
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select duration source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="existing">
                              Use Existing Duration
                            </SelectItem>
                            <SelectItem value="new">
                              Create New Duration
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formState.durationMode === "existing" ? (
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-medium text-[#3F3F3F]">
                            Existing Duration
                          </label>
                          <Select
                            value={formState.selectedDurationId}
                            onValueChange={(value) =>
                              setFormState((prev) => ({
                                ...prev,
                                selectedDurationId: value,
                              }))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              {durations.map((duration) => (
                                <SelectItem
                                  key={duration._id}
                                  value={duration._id}
                                >
                                  {duration.name} ({duration.durationInDays}{" "}
                                  days)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#3F3F3F]">
                              Duration Name
                            </label>
                            <Input
                              value={formState.durationName}
                              onChange={(event) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  durationName: event.target.value,
                                }))
                              }
                              placeholder="e.g. MONTHLY"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#3F3F3F]">
                              Duration in Days
                            </label>
                            <Input
                              type="number"
                              min={1}
                              value={formState.durationDays}
                              onChange={(event) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  durationDays: event.target.value,
                                }))
                              }
                              placeholder="30"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </section>

                  <section className="rounded-lg border border-[#EDEDED] p-4">
                    <h3 className="mb-4 text-sm font-semibold text-[#0d4b9f]">
                      3. Pricing
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-medium text-[#3F3F3F]">
                          Price Source
                        </label>
                        <Select
                          value={formState.priceMode}
                          onValueChange={(value) =>
                            setFormState((prev) => ({
                              ...prev,
                              priceMode: value as "existing" | "new",
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select price source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="existing"
                              disabled={!existingDurationPricingOptions.length}
                            >
                              Use Existing Price
                            </SelectItem>
                            <SelectItem value="new">
                              Create New Price
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formState.priceMode === "existing" ? (
                        <>
                          <div className="space-y-2 md:col-span-2">
                            <p className="text-xs font-medium text-[#3F3F3F]">
                              Existing prices for selected duration
                            </p>

                            {existingDurationPricingOptions.length ? (
                              <div className="flex flex-wrap gap-2">
                                {existingDurationPricingOptions.map((item) => (
                                  <Badge
                                    key={`${item.subscriptionDurationId}-${item.currency}-${item.price}`}
                                    className="bg-[#EEF4FF] text-[#1F4E95]"
                                  >
                                    {item.currency.toUpperCase()} {item.price}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#7A8499]">
                                No existing price found for this duration yet.
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-medium text-[#3F3F3F]">
                              Existing Price
                            </label>
                            <Select
                              value={formState.selectedPriceTemplateKey}
                              onValueChange={(value) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  selectedPriceTemplateKey: value,
                                }))
                              }
                              disabled={!existingDurationPricingOptions.length}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select existing price" />
                              </SelectTrigger>
                              <SelectContent>
                                {existingDurationPricingOptions.map((item) => {
                                  const key = `${item.currency.toUpperCase()}-${item.price}`;
                                  return (
                                    <SelectItem key={key} value={key}>
                                      {item.currency.toUpperCase()} {item.price}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#3F3F3F]">
                              Price
                            </label>
                            <Input
                              type="number"
                              min={0}
                              value={formState.newPrice}
                              onChange={(event) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  newPrice: event.target.value,
                                }))
                              }
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#3F3F3F]">
                              Currency
                            </label>
                            <Input
                              value={formState.newCurrency}
                              onChange={(event) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  newCurrency: event.target.value,
                                }))
                              }
                              placeholder="GBP"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </section>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreatePricing}
                      disabled={isSaving}
                    >
                      {isSaving ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </div>

                <aside className="space-y-4 rounded-lg bg-[#F8FAFF] p-4">
                  <h3 className="text-base font-semibold text-[#0d4b9f]">
                    Review Summary
                  </h3>

                  <div className="space-y-2 text-sm text-[#2F2F2F]">
                    <div className="flex items-center justify-between gap-2 border-b border-[#E8ECF8] pb-2">
                      <span>Plan Name</span>
                      <span className="font-medium">
                        {formState.planName.trim() || "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-b border-[#E8ECF8] pb-2">
                      <span>Plan Type</span>
                      <span className="font-medium">{formState.planType}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-b border-[#E8ECF8] pb-2">
                      <span>Duration</span>
                      <span className="font-medium">
                        {selectedDurationLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-b border-[#E8ECF8] pb-2">
                      <span>Price</span>
                      <span className="font-medium">
                        {formState.priceMode === "existing"
                          ? selectedPriceTemplate
                            ? `${selectedPriceTemplate.currency.toUpperCase()} ${selectedPriceTemplate.price}`
                            : "Not set"
                          : `${(formState.newCurrency || "GBP").toUpperCase()} ${formState.newPrice || "0"}`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-[#0d4b9f]">
                      Requirements
                    </h4>
                    <ul className="space-y-2 text-xs text-[#3F3F3F]">
                      {requirements.map((item) => (
                        <li key={item.label} className="flex items-start gap-2">
                          <span
                            className={
                              item.ok ? "text-green-600" : "text-amber-500"
                            }
                          >
                            {item.ok ? "✓" : "▶"}
                          </span>
                          <span>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCouponDialogOpen}
            onOpenChange={setIsCouponDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-[#0d4b9f] text-[#0d4b9f]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Coupon
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#0d4b9f]">
                  Create Coupon
                </DialogTitle>
                <DialogDescription>
                  Create coupon and link it with subscription pricing so users
                  can use it during checkout.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-[#3F3F3F]">
                    Coupon Code
                  </label>
                  <Input
                    value={couponForm.code}
                    onChange={(event) =>
                      setCouponForm((prev) => ({
                        ...prev,
                        code: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. WELCOME10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#3F3F3F]">
                    Discount Type
                  </label>
                  <Select
                    value={couponForm.discountType}
                    onValueChange={(value) =>
                      setCouponForm((prev) => ({
                        ...prev,
                        discountType: value as "percentage" | "fixed",
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#3F3F3F]">
                    Discount Value
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={couponForm.discountValue}
                    onChange={(event) =>
                      setCouponForm((prev) => ({
                        ...prev,
                        discountValue: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-[#3F3F3F]">
                    Linked Pricing
                  </label>
                  <Select
                    value={couponForm.selectedPricingId}
                    onValueChange={(value) =>
                      setCouponForm((prev) => ({
                        ...prev,
                        selectedPricingId: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select pricing" />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingRows.map((pricing) => (
                        <SelectItem key={pricing._id} value={pricing._id}>
                          {pricing.subscriptionPlanName} -{" "}
                          {pricing.subscriptionName} (
                          {pricing.subscriptionDuration} days) -{" "}
                          {pricing.currency} {pricing.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCouponDialogOpen(false)}
                  disabled={isCouponSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCoupon} disabled={isCouponSaving}>
                  {isCouponSaving ? "Creating..." : "Create Coupon"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-[#E8EFFC] bg-[#F8FAFF] p-4">
          <p className="text-xs font-medium text-[#5F6E8A]">Total Plans</p>
          <p className="mt-2 text-2xl font-bold text-[#0d4b9f]">{planCount}</p>
        </div>
        <div className="rounded-lg border border-[#E8EFFC] bg-[#F8FAFF] p-4">
          <p className="text-xs font-medium text-[#5F6E8A]">Active Plans</p>
          <p className="mt-2 text-2xl font-bold text-[#0d4b9f]">
            {activePlans}
          </p>
        </div>
        <div className="rounded-lg border border-[#E8EFFC] bg-[#F8FAFF] p-4">
          <p className="text-xs font-medium text-[#5F6E8A]">Pages</p>
          <p className="mt-2 text-2xl font-bold text-[#0d4b9f]">{totalPages}</p>
        </div>
      </div>

      <div className="rounded-lg border border-[#E8EFFC] bg-[#F8FAFF] p-4">
        <p className="text-xs font-medium text-[#5F6E8A]">Trial Status</p>
        <p className="mt-2 text-sm font-semibold text-[#0d4b9f]">
          {isTrialEnabled
            ? "Enabled - users can claim trial from dashboard subscriptions"
            : "Disabled - users cannot claim trial"}
        </p>
      </div>

      <div className="rounded-lg border border-[#EBEEF7] bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-[#0d4b9f]">
          Plans (Grid View)
        </h2>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan._id;

                return (
                  <button
                    key={plan._id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan._id)}
                    className={`rounded-lg border p-4 text-left transition ${
                      isSelected
                        ? "border-[#0d4b9f] bg-[#F4F8FF]"
                        : "border-[#E7ECF8] bg-white hover:border-[#BCD0F3]"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-[#1E2740]">
                        {plan.name}
                      </h3>
                      <Badge
                        className={
                          plan.isActive
                            ? "bg-[#EAF9EF] text-[#249E58]"
                            : "bg-[#F4F5F7] text-[#636A75]"
                        }
                      >
                        {plan.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#5F6E8A]">
                      Type: {plan.planType}
                    </p>
                    <p className="mt-1 text-xs text-[#5F6E8A]">
                      Visibility: {plan.applicableAccountType}
                    </p>
                  </button>
                );
              })}

              {!plans.length && (
                <div className="col-span-full rounded-lg border border-dashed border-[#D8E2F5] py-10 text-center text-sm text-[#8F98AB]">
                  {isLoading ? "Loading plans..." : "No plans found"}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#E7ECF8] bg-[#FBFCFF] p-4">
            <h3 className="mb-3 text-base font-semibold text-[#0d4b9f]">
              Plan Details
            </h3>

            {selectedPlan ? (
              <>
                <div className="space-y-2 text-sm text-[#2F3A56]">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedPlan.name}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {selectedPlan.planType}
                  </p>
                  <p>
                    <span className="font-medium">Visibility:</span>{" "}
                    {selectedPlan.applicableAccountType}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {selectedPlan.isActive ? "Active" : "Disabled"}
                  </p>
                  <p>
                    <span className="font-medium">Description:</span>{" "}
                    {selectedPlan.description || "No description"}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold text-[#5F6E8A] uppercase">
                    Durations & Pricing
                  </p>
                  <div className="space-y-2">
                    {selectedPlanPricing.length ? (
                      selectedPlanPricing.map((item) => (
                        <div
                          key={item._id}
                          className="rounded-md border border-[#E8EDF9] bg-white px-3 py-2 text-xs text-[#3F4B67]"
                        >
                          {item.subscriptionName} ({item.subscriptionDuration}{" "}
                          days): {item.currency} {item.price}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#8F98AB]">
                        No pricing rows found for this plan.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePlanStatusToggle(selectedPlan)}
                  >
                    <Ban className="mr-1 h-3.5 w-3.5" />
                    {selectedPlan.isActive ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeletePlan(selectedPlan)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#8F98AB]">
                Select a plan card to see details.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#EBEEF7] bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-[#0d4b9f]">Durations</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#EEF2FA] text-left text-xs text-[#6D7A94] uppercase">
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Days</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {durations.map((duration) => (
                <tr key={duration._id} className="border-b border-[#F2F5FB]">
                  <td className="px-2 py-3 font-medium text-[#1E2740]">
                    {duration.name}
                  </td>
                  <td className="px-2 py-3 text-[#3F4B67]">
                    {duration.durationInDays}
                  </td>
                  <td className="px-2 py-3">
                    <Badge
                      className={
                        duration.isActive
                          ? "bg-[#EAF9EF] text-[#249E58]"
                          : "bg-[#F4F5F7] text-[#636A75]"
                      }
                    >
                      {duration.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDurationStatusToggle(duration)}
                      >
                        <Ban className="mr-1 h-3.5 w-3.5" />
                        {duration.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteDuration(duration)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-[#EBEEF7] bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-[#0d4b9f]">
          Durations & Pricing
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#EEF2FA] text-left text-xs text-[#6D7A94] uppercase">
                <th className="px-2 py-2">Plan</th>
                <th className="px-2 py-2">Duration</th>
                <th className="px-2 py-2">Account Type</th>
                <th className="px-2 py-2">Price</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pricingRows.map((item) => (
                <tr key={item._id} className="border-b border-[#F2F5FB]">
                  <td className="px-2 py-3 font-medium text-[#1E2740]">
                    {item.subscriptionPlanName}
                  </td>
                  <td className="px-2 py-3 text-[#3F4B67]">
                    {item.subscriptionName} ({item.subscriptionDuration} days)
                  </td>
                  <td className="px-2 py-3 text-[#3F4B67]">
                    {item.applicableAccountType}
                  </td>
                  <td className="px-2 py-3 text-[#3F4B67]">
                    {item.currency} {item.price}
                  </td>
                  <td className="px-2 py-3">
                    <Badge
                      className={
                        item.isActive
                          ? "bg-[#EAF9EF] text-[#249E58]"
                          : "bg-[#F4F5F7] text-[#636A75]"
                      }
                    >
                      {item.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePricingStatusToggle(item)}
                      >
                        <Ban className="mr-1 h-3.5 w-3.5" />
                        {item.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePricing(item)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-[#EBEEF7] bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-[#0d4b9f]">Coupons</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#EEF2FA] text-left text-xs text-[#6D7A94] uppercase">
                <th className="px-2 py-2">Code</th>
                <th className="px-2 py-2">Discount</th>
                <th className="px-2 py-2">Linked Pricing</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-[#F2F5FB]">
                  <td className="px-2 py-3 font-medium text-[#1E2740]">
                    {coupon.code}
                  </td>
                  <td className="px-2 py-3 text-[#3F4B67]">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `${coupon.discountValue} GBP`}
                  </td>
                  <td className="px-2 py-3 text-[#3F4B67]">
                    {coupon.subscriptionPricings?.length
                      ? coupon.subscriptionPricings
                          .map(
                            (pricing) =>
                              `${pricing.planName || "Plan"} ${pricing.duration ? `(${pricing.duration})` : ""}`,
                          )
                          .join(", ")
                      : "All"}
                  </td>
                  <td className="px-2 py-3">
                    <Badge
                      className={
                        coupon.isActive
                          ? "bg-[#EAF9EF] text-[#249E58]"
                          : "bg-[#F4F5F7] text-[#636A75]"
                      }
                    >
                      {coupon.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleCouponStatus(coupon)}
                      >
                        <Ban className="mr-1 h-3.5 w-3.5" />
                        {coupon.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCoupon(coupon)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!coupons.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-2 py-6 text-center text-sm text-[#8F98AB]"
                  >
                    No coupons found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-[#EBEEF7] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0d4b9f]">
            Subscription Exemption
          </h2>
          <Button variant="ghost" size="sm" className="text-[#0d4b9f]">
            View All
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#EEF2FA] text-left text-xs text-[#6D7A94] uppercase">
                <th className="px-2 py-2">User Name</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Plan</th>
                <th className="px-2 py-2">Reason</th>
                <th className="px-2 py-2">Start Date</th>
              </tr>
            </thead>
            <tbody>
              {demoExemptions.map((row) => (
                <tr
                  key={`${row.userName}-${row.email}`}
                  className="border-b border-[#F2F5FB]"
                >
                  <td className="px-2 py-3 text-[#1E2740]">{row.userName}</td>
                  <td className="px-2 py-3 text-[#3F4B67]">{row.email}</td>
                  <td className="px-2 py-3 text-[#3F4B67]">{row.plan}</td>
                  <td className="px-2 py-3 text-[#3F4B67]">{row.reason}</td>
                  <td className="px-2 py-3 text-[#3F4B67]">{row.startDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
