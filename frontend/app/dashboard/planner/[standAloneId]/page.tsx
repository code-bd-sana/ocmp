"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CircleAlert,
  CircleCheck,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { resolveRoleScopedRoute } from "@/lib/utils/role-route";
import {
  PlannerRow,
  PlannerType,
  RequestStatus,
} from "@/lib/planner/planner.types";
import { PlannerAction } from "@/service/planner";
import { UserAction } from "@/service/user";
import { VehicleAction } from "@/service/vehicle";

type VehicleOption = {
  _id: string;
  vehicleRegId?: string;
  licensePlate?: string;
};

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

function getVehicleId(vehicleId: PlannerRow["vehicleId"]): string {
  if (typeof vehicleId === "string") return vehicleId;
  return vehicleId?._id || "";
}

function labelForPlannerType(type: PlannerType | string): string {
  return String(type)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function asInputDate(dateLike: string | Date): string {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function asDisplayDate(dateLike?: string): string {
  if (!dateLike) return "-";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const plannerTypeOptions: PlannerType[] = [
  PlannerType.INSPECTIONS,
  PlannerType.MOT,
  PlannerType.BRAKE_TEST,
  PlannerType.SERVICE,
  PlannerType.REPAIR,
  PlannerType.TACHO_RECALIBRATION,
  PlannerType.VED,
];

export default function PlannerDetailPage({ params }: PageProps) {
  const { standAloneId } = use(params);
  const router = useRouter();

  const [roleReady, setRoleReady] = useState(false);
  const [isStandaloneUser, setIsStandaloneUser] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plannerRows, setPlannerRows] = useState<PlannerRow[]>([]);
  const [requestedRows, setRequestedRows] = useState<PlannerRow[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("ALL");
  const [selectedPlannerType, setSelectedPlannerType] = useState("ALL");
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newVehicleId, setNewVehicleId] = useState("");
  const [newPlannerType, setNewPlannerType] = useState<PlannerType>(
    PlannerType.INSPECTIONS,
  );
  const [newPlannerDate, setNewPlannerDate] = useState(asInputDate(new Date()));

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const plannerResp = await PlannerAction.getPlanners(standAloneId, {
        showPerPage: 500,
        pageNo: 1,
      });

      const vehicleResp = await VehicleAction.getVehicles(standAloneId, {
        showPerPage: 500,
        pageNo: 1,
      });

      const planners = plannerResp.data?.planners || [];
      setPlannerRows(planners);

      const loadedVehicles = vehicleResp.data?.vehicles || [];
      setVehicles(loadedVehicles);

      if (!newVehicleId && loadedVehicles.length > 0) {
        setNewVehicleId(loadedVehicles[0]._id);
      }

      if (!isStandaloneUser) {
        try {
          const requestedResp =
            await PlannerAction.getRequestedPlanners(standAloneId);
          setRequestedRows(requestedResp.data || []);
        } catch {
          setRequestedRows([]);
        }
      } else {
        setRequestedRows([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load planner data",
      );
    } finally {
      setLoading(false);
    }
  }, [isStandaloneUser, newVehicleId, standAloneId]);

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
          basePath: "/dashboard/planner",
        });

        if (routeResult.error) {
          setError(routeResult.error);
          return;
        }

        if (routeResult.redirectTo) {
          router.replace(routeResult.redirectTo);
          return;
        }

        setIsStandaloneUser(userRole === "STANDALONE_USER");
        setRoleReady(true);
      } catch {
        if (!isActive) return;
        setError("Failed to load your profile. Please sign in again.");
      }
    };

    ensureRoleScopedRoute();

    return () => {
      isActive = false;
    };
  }, [router, standAloneId]);

  useEffect(() => {
    if (!roleReady) return;
    loadPageData();
  }, [roleReady, loadPageData]);

  const vehicleMap = useMemo(() => {
    return new Map(
      vehicles.map((vehicle) => [
        vehicle._id,
        vehicle.licensePlate || vehicle.vehicleRegId || vehicle._id,
      ]),
    );
  }, [vehicles]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return plannerRows.filter((row) => {
      const rowVehicleId = getVehicleId(row.vehicleId);
      const vehicleLabel = (vehicleMap.get(rowVehicleId) || "").toLowerCase();

      const matchVehicle =
        selectedVehicleId === "ALL" || rowVehicleId === selectedVehicleId;

      const matchType =
        selectedPlannerType === "ALL" ||
        row.plannerType === selectedPlannerType;

      const matchSearch =
        !q ||
        vehicleLabel.includes(q) ||
        String(row.plannerType).toLowerCase().includes(q) ||
        String(row.requestStatus || "")
          .toLowerCase()
          .includes(q);

      const matchDate =
        !selectedDate || asInputDate(row.plannerDate) === selectedDate;

      return matchVehicle && matchType && matchSearch && matchDate;
    });
  }, [
    plannerRows,
    searchQuery,
    selectedVehicleId,
    selectedPlannerType,
    selectedDate,
    vehicleMap,
  ]);

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday-first index
    const leading = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();
    const trailing = (7 - ((leading + totalDays) % 7 || 7)) % 7;

    const cells: Array<{ date: Date; inCurrentMonth: boolean }> = [];

    for (let i = leading; i > 0; i--) {
      cells.push({ date: new Date(year, month, 1 - i), inCurrentMonth: false });
    }

    for (let day = 1; day <= totalDays; day++) {
      cells.push({ date: new Date(year, month, day), inCurrentMonth: true });
    }

    for (let i = 1; i <= trailing; i++) {
      cells.push({
        date: new Date(year, month, totalDays + i),
        inCurrentMonth: false,
      });
    }

    return cells;
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, PlannerRow[]>();

    for (const row of plannerRows) {
      const key = asInputDate(row.plannerDate);
      const existing = map.get(key);
      if (existing) {
        existing.push(row);
      } else {
        map.set(key, [row]);
      }
    }

    return map;
  }, [plannerRows]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsByDate.get(selectedDate) || [];
  }, [eventsByDate, selectedDate]);

  const stats = useMemo(() => {
    const byType = plannerTypeOptions.reduce(
      (acc, type) => {
        acc[type] = plannerRows.filter(
          (row) => row.plannerType === type,
        ).length;
        return acc;
      },
      {} as Record<PlannerType, number>,
    );

    const dueCount = plannerRows.filter(
      (row) => row.PlannerStatus === "DUE",
    ).length;

    return {
      total: plannerRows.length,
      dueCount,
      byType,
    };
  }, [plannerRows]);

  const handleCreatePlanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newVehicleId) {
      toast.error("Select a vehicle first");
      return;
    }

    if (!newPlannerDate) {
      toast.error("Select planner date");
      return;
    }

    try {
      setCreating(true);
      await PlannerAction.createPlanner({
        vehicleId: newVehicleId,
        plannerType: newPlannerType,
        plannerDate: new Date(newPlannerDate).toISOString(),
        standAloneId,
      });

      toast.success("Planner event created");
      await loadPageData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create planner",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleQuickReschedule = async (row: PlannerRow) => {
    const currentValue = asInputDate(row.plannerDate);
    const selected = window.prompt(
      "Enter new planner date (YYYY-MM-DD)",
      currentValue,
    );
    if (!selected) return;

    const normalized = new Date(selected);
    if (Number.isNaN(normalized.getTime())) {
      toast.error("Invalid date format");
      return;
    }

    try {
      await PlannerAction.updatePlanner(row._id, standAloneId, {
        plannerDate: normalized.toISOString(),
      });
      toast.success("Planner updated");
      await loadPageData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update planner",
      );
    }
  };

  const handleRequestChange = async (row: PlannerRow) => {
    const selectedDate = window.prompt(
      "Requested new date (YYYY-MM-DD)",
      asInputDate(row.plannerDate),
    );
    if (!selectedDate) return;

    const reason = window.prompt("Why are you requesting this date change?");
    if (!reason) {
      toast.error("Reason is required");
      return;
    }

    const parsed = new Date(selectedDate);
    if (Number.isNaN(parsed.getTime())) {
      toast.error("Invalid date format");
      return;
    }

    try {
      await PlannerAction.requestChangePlannerDate(row._id, {
        requestedDate: parsed.toISOString(),
        requestedReason: reason,
      });
      toast.success("Change request submitted");
      await loadPageData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send request",
      );
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await PlannerAction.approvePlannerRequest(id);
      toast.success("Request approved");
      await loadPageData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await PlannerAction.rejectPlannerRequest(id);
      toast.success("Request rejected");
      await loadPageData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this planner item? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await PlannerAction.deletePlanner(id, standAloneId);
      toast.success("Planner item deleted");
      await loadPageData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete planner",
      );
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-destructive border-destructive/30 bg-destructive/10 rounded-2xl border px-6 py-8">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="bg-card border-border relative overflow-hidden rounded-3xl border p-6 shadow-sm">
        <div className="bg-primary/10 absolute -top-12 -right-10 h-44 w-44 rounded-full blur-2xl" />
        <div className="bg-secondary/20 absolute -bottom-16 left-12 h-36 w-36 rounded-full blur-2xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-primary text-2xl font-bold sm:text-3xl">
              Planner Command Center
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Track inspections, MOT, services, repairs, and due work in one
              place.
            </p>
          </div>

          <button
            onClick={loadPageData}
            className="bg-background text-foreground border-input hover:bg-muted inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-4">
          <p className="text-xs tracking-wider uppercase opacity-80">Total</p>
          <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-destructive rounded-2xl px-4 py-4 text-white">
          <p className="text-xs tracking-wider uppercase opacity-80">Due</p>
          <p className="mt-1 text-2xl font-semibold">{stats.dueCount}</p>
        </div>
        {plannerTypeOptions.slice(0, 4).map((type) => (
          <div
            key={type}
            className="bg-card border-border rounded-2xl border px-4 py-4"
          >
            <p className="text-muted-foreground text-xs tracking-wider uppercase">
              {labelForPlannerType(type)}
            </p>
            <p className="text-primary mt-1 text-2xl font-semibold">
              {stats.byType[type] || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleCreatePlanner}
          className="bg-card border-border rounded-2xl border p-5 shadow-sm lg:col-span-1"
        >
          <div className="mb-4 flex items-center gap-2">
            <Plus className="text-primary h-4 w-4" />
            <h2 className="text-primary text-lg font-semibold">
              Add Planner Event
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium tracking-wider uppercase">
                Vehicle
              </label>
              <select
                className="bg-background text-foreground focus:ring-primary/30 border-input w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring"
                value={newVehicleId}
                onChange={(e) => setNewVehicleId(e.target.value)}
                required
              >
                {vehicles.length === 0 && (
                  <option value="">No vehicle found</option>
                )}
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.licensePlate ||
                      vehicle.vehicleRegId ||
                      vehicle._id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium tracking-wider uppercase">
                Planner Type
              </label>
              <select
                className="bg-background text-foreground focus:ring-primary/30 border-input w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring"
                value={newPlannerType}
                onChange={(e) =>
                  setNewPlannerType(e.target.value as PlannerType)
                }
              >
                {plannerTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {labelForPlannerType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium tracking-wider uppercase">
                Planner Date
              </label>
              <input
                type="date"
                className="bg-background text-foreground focus:ring-primary/30 border-input w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring"
                value={newPlannerDate}
                onChange={(e) => setNewPlannerDate(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={creating || vehicles.length === 0}
              className="bg-primary text-primary-foreground inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {creating ? "Saving..." : "Create Planner Event"}
            </button>
          </div>
        </form>

        <div className="bg-card border-border rounded-2xl border p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="text-primary h-4 w-4" />
              <h2 className="text-primary text-lg font-semibold">
                Planner Calendar
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by vehicle, type, request status"
                className="bg-background text-foreground focus:ring-primary/30 border-input w-60 rounded-xl border px-3 py-2 text-sm outline-none focus:ring"
              />
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="bg-background text-foreground focus:ring-primary/30 border-input rounded-xl border px-3 py-2 text-sm outline-none focus:ring"
              >
                <option value="ALL">All Vehicles</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.licensePlate ||
                      vehicle.vehicleRegId ||
                      vehicle._id}
                  </option>
                ))}
              </select>

              <select
                value={selectedPlannerType}
                onChange={(e) => setSelectedPlannerType(e.target.value)}
                className="bg-background text-foreground focus:ring-primary/30 border-input rounded-xl border px-3 py-2 text-sm outline-none focus:ring"
              >
                <option value="ALL">All Types</option>
                {plannerTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {labelForPlannerType(type)}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setSelectedDate(null)}
                className="text-foreground border-input hover:bg-muted rounded-xl border px-3 py-2 text-sm transition"
              >
                Clear Day
              </button>
            </div>
          </div>

          <div className="border-border rounded-xl border">
            <div className="border-border flex items-center justify-between border-b px-4 py-3">
              <button
                onClick={() =>
                  setCurrentMonth(
                    (prev) =>
                      new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                  )
                }
                className="text-primary border-input hover:bg-muted rounded-lg border p-1.5 transition"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <h3 className="text-primary text-base font-semibold">
                {currentMonth.toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>

              <button
                onClick={() =>
                  setCurrentMonth(
                    (prev) =>
                      new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                  )
                }
                className="text-primary border-input hover:bg-muted rounded-lg border p-1.5 transition"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-muted text-muted-foreground border-border grid grid-cols-7 border-b text-center text-[11px] font-semibold tracking-wide uppercase">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="px-2 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarCells.map(({ date, inCurrentMonth }) => {
                const key = asInputDate(date);
                const dayEvents = eventsByDate.get(key) || [];
                const isSelected = selectedDate === key;
                const isToday = asInputDate(new Date()) === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    className={`border-border/70 min-h-24 border-r border-b px-2 py-2 text-left transition ${
                      isSelected
                        ? "bg-primary/10"
                        : inCurrentMonth
                          ? "bg-background hover:bg-muted/60"
                          : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          isToday
                            ? "bg-primary text-primary-foreground rounded-full px-2 py-0.5"
                            : "text-foreground"
                        }`}
                      >
                        {date.getDate()}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className="bg-secondary text-secondary-foreground rounded-full px-1.5 py-0.5 text-[10px]">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      {dayEvents.slice(0, 3).map((evt) => (
                        <div
                          key={evt._id}
                          className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            evt.PlannerStatus === "DUE"
                              ? "bg-destructive text-white"
                              : "bg-success text-white"
                          }`}
                        >
                          {labelForPlannerType(evt.plannerType)}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-muted-foreground text-[10px]">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="bg-muted/30 border-border mt-4 rounded-xl border p-4">
              <h4 className="text-primary mb-3 text-sm font-semibold">
                Events on {asDisplayDate(selectedDate)}
              </h4>

              {selectedDateEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No events for this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDateEvents.map((row) => {
                    const vehicleId = getVehicleId(row.vehicleId);
                    const vehicleLabel =
                      vehicleMap.get(vehicleId) || "Unknown vehicle";

                    return (
                      <div
                        key={row._id}
                        className="bg-background border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                      >
                        <div>
                          <p className="text-foreground text-sm font-medium">
                            {vehicleLabel} -{" "}
                            {labelForPlannerType(row.plannerType)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Status: {row.PlannerStatus || "SCHEDULED"}
                            {row.requestStatus
                              ? ` | Request: ${row.requestStatus}`
                              : ""}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleQuickReschedule(row)}
                            className="text-foreground border-input hover:bg-muted rounded-lg border px-2.5 py-1 text-xs font-medium transition"
                          >
                            Reschedule
                          </button>

                          {isStandaloneUser && (
                            <button
                              onClick={() => handleRequestChange(row)}
                              className="bg-warning rounded-lg px-2.5 py-1 text-xs font-medium text-white transition hover:opacity-90"
                            >
                              Request Change
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(row._id)}
                            className="bg-destructive inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-white transition hover:opacity-90"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted-foreground text-xs tracking-wider uppercase">
                <tr>
                  <th className="border-border border-b px-3 py-2">Vehicle</th>
                  <th className="border-border border-b px-3 py-2">Type</th>
                  <th className="border-border border-b px-3 py-2">
                    Planner Date
                  </th>
                  <th className="border-border border-b px-3 py-2">Status</th>
                  <th className="border-border border-b px-3 py-2">
                    Requested Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-muted-foreground px-3 py-8 text-center"
                    >
                      Loading planner items...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-muted-foreground px-3 py-8 text-center"
                    >
                      No planner items found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const vehicleId = getVehicleId(row.vehicleId);
                    const vehicleLabel =
                      vehicleMap.get(vehicleId) || "Unknown vehicle";

                    return (
                      <tr key={row._id} className="hover:bg-muted/50">
                        <td className="text-foreground border-border border-b px-3 py-3 font-medium">
                          {vehicleLabel}
                        </td>
                        <td className="text-foreground border-border border-b px-3 py-3">
                          {labelForPlannerType(row.plannerType)}
                        </td>
                        <td className="text-foreground border-border border-b px-3 py-3">
                          {asDisplayDate(row.plannerDate)}
                        </td>
                        <td className="border-border border-b px-3 py-3">
                          <span className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                            <Clock3 className="h-3.5 w-3.5" />
                            {row.PlannerStatus || "SCHEDULED"}
                          </span>
                          {row.requestStatus && (
                            <span className="bg-warning/20 text-foreground ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                              {row.requestStatus}
                            </span>
                          )}
                        </td>
                        <td className="text-foreground border-border border-b px-3 py-3">
                          {asDisplayDate(row.requestedDate)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {!isStandaloneUser && requestedRows.length > 0 && (
        <div className="bg-card border-border mt-6 rounded-2xl border p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CircleAlert className="text-warning h-4 w-4" />
            <h2 className="text-primary text-lg font-semibold">
              Pending Change Requests
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {requestedRows
              .filter((row) => row.requestStatus === RequestStatus.PENDING)
              .map((row) => {
                const vehicleId = getVehicleId(row.vehicleId);
                const vehicleLabel =
                  vehicleMap.get(vehicleId) || "Unknown vehicle";

                return (
                  <div
                    key={row._id}
                    className="bg-warning/10 border-warning/40 rounded-xl border p-4"
                  >
                    <p className="text-foreground text-sm font-semibold">
                      {vehicleLabel}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {labelForPlannerType(row.plannerType)}
                    </p>

                    <div className="text-foreground mt-3 space-y-1 text-xs">
                      <p>
                        Current Date:{" "}
                        <strong>{asDisplayDate(row.plannerDate)}</strong>
                      </p>
                      <p>
                        Requested Date:{" "}
                        <strong>{asDisplayDate(row.requestedDate)}</strong>
                      </p>
                      <p className="text-muted-foreground line-clamp-2">
                        Reason: {row.requestedReason || "No reason provided"}
                      </p>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleApprove(row._id)}
                        className="bg-success inline-flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                      >
                        <CircleCheck className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(row._id)}
                        className="bg-destructive flex-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
