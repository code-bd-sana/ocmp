"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Settings2,
  Truck,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Send,
  Filter,
  RefreshCw,
  Car,
  Wrench,
  Shield,
  Activity,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type VehicleOption = {
  _id: string;
  vehicleRegId?: string;
  licensePlate?: string;
  make?: string;
  model?: string;
};

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

type EventType = "completed" | "in-progress" | "booked" | "overdue";

const EVENT_COLORS = {
  completed: {
    bg: "bg-gradient-to-br from-green-500 to-green-600",
    light: "bg-green-50 border-green-200",
    text: "text-green-700",
    icon: CheckCircle,
  },
  "in-progress": {
    bg: "bg-gradient-to-br from-orange-500 to-orange-600",
    light: "bg-orange-50 border-orange-200",
    text: "text-orange-700",
    icon: Activity,
  },
  booked: {
    bg: "bg-gradient-to-br from-blue-500 to-blue-600",
    light: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    icon: Calendar,
  },
  overdue: {
    bg: "bg-gradient-to-br from-pink-500 to-pink-600",
    light: "bg-pink-50 border-pink-200",
    text: "text-pink-700",
    icon: AlertCircle,
  },
};

const PLANNER_TYPE_COLORS: Record<
  PlannerType,
  { dayBg: string; accent: string }
> = {
  [PlannerType.INSPECTIONS]: {
    dayBg: "bg-blue-100",
    accent: "border-blue-300",
  },
  [PlannerType.SERVICE]: {
    dayBg: "bg-orange-100",
    accent: "border-orange-300",
  },
  [PlannerType.MOT]: { dayBg: "bg-green-100", accent: "border-green-300" },
  [PlannerType.BRAKE_TEST]: {
    dayBg: "bg-purple-100",
    accent: "border-purple-300",
  },
  [PlannerType.REPAIR]: { dayBg: "bg-red-100", accent: "border-red-300" },
  [PlannerType.TACHO_RECALIBRATION]: {
    dayBg: "bg-cyan-100",
    accent: "border-cyan-300",
  },
  [PlannerType.VED]: { dayBg: "bg-amber-100", accent: "border-amber-300" },
};

function getVehicleId(vehicleId: PlannerRow["vehicleId"]): string {
  if (typeof vehicleId === "string") return vehicleId;
  return vehicleId?._id || "";
}

function asInputDate(dateLike: string | Date): string {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mergeDateWithOriginalTime(
  dateInput: string,
  originalDateLike: string,
): Date | null {
  const dateOnly = new Date(dateInput);
  const original = new Date(originalDateLike);

  if (Number.isNaN(dateOnly.getTime()) || Number.isNaN(original.getTime())) {
    return null;
  }

  dateOnly.setHours(
    original.getHours(),
    original.getMinutes(),
    original.getSeconds(),
    original.getMilliseconds(),
  );

  return dateOnly;
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

function labelForPlannerType(type: PlannerType | string): string {
  return String(type)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function plannerEventType(row: PlannerRow): EventType {
  if (row.PlannerStatus === "DUE") return "overdue";
  if (row.requestStatus === RequestStatus.PENDING) return "in-progress";
  if (row.requestStatus === RequestStatus.APPROVED) return "completed";
  return "booked";
}

function getPlannerTypeIcon(type: PlannerType) {
  switch (type) {
    case PlannerType.INSPECTIONS:
      return <Search size={14} />;
    case PlannerType.SERVICE:
      return <Wrench size={14} />;
    case PlannerType.MOT:
      return <Shield size={14} />;
    case PlannerType.BRAKE_TEST:
      return <Activity size={14} />;
    default:
      return <Settings2 size={14} />;
  }
}

export default function PlannerDetailPage({ params }: PageProps) {
  const { standAloneId } = use(params);
  const router = useRouter();

  const [isStandaloneUser, setIsStandaloneUser] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plannerRows, setPlannerRows] = useState<PlannerRow[]>([]);
  const [requestedRows, setRequestedRows] = useState<PlannerRow[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("ALL");
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<PlannerType | "ALL">("ALL");

  const [newVehicleId, setNewVehicleId] = useState("");
  const [newPlannerType, setNewPlannerType] = useState<PlannerType>(
    PlannerType.INSPECTIONS,
  );
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState(asInputDate(new Date()));

  const [addOpen, setAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);

  const [eventOpen, setEventOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<PlannerRow | null>(null);
  const [editDate, setEditDate] = useState("");
  const [reqDate, setReqDate] = useState("");
  const [reqReason, setReqReason] = useState("");
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "request">("edit");

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [plannerResp, vehicleResp] = await Promise.all([
        PlannerAction.getPlanners(standAloneId, {
          showPerPage: 500,
          pageNo: 1,
        }),
        VehicleAction.getVehicles(standAloneId, {
          showPerPage: 500,
          pageNo: 1,
        }),
      ]);

      const planners = plannerResp.data?.planners || [];
      const loadedVehicles = vehicleResp.data?.vehicles || [];

      setPlannerRows(planners);
      setVehicles(loadedVehicles);

      if (loadedVehicles.length) {
        setNewVehicleId((prev) => prev || loadedVehicles[0]._id);
      }

      if (!isStandaloneUser) {
        try {
          const reqResp =
            await PlannerAction.getRequestedPlanners(standAloneId);
          setRequestedRows(reqResp.data || []);
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
  }, [isStandaloneUser, standAloneId]);

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
    loadPageData();
  }, [loadPageData]);

  useEffect(() => {
    if (selectedVehicleId !== "ALL") {
      setNewVehicleId(selectedVehicleId);
    }
  }, [selectedVehicleId]);

  const openAddEventModal = (date?: Date) => {
    if (selectedVehicleId !== "ALL") {
      setNewVehicleId(selectedVehicleId);
    } else if (!newVehicleId && vehicles.length) {
      setNewVehicleId(vehicles[0]._id);
    }

    if (date) {
      const inputDate = asInputDate(date);
      setDateInput(inputDate);
      setSelectedDates(inputDate ? [inputDate] : []);
    } else {
      setDateInput(asInputDate(new Date()));
      setSelectedDates([]);
    }

    setAddOpen(true);
  };

  const handleAddDate = () => {
    if (!dateInput) {
      toast.error("Please select a date");
      return;
    }

    if (selectedDates.includes(dateInput)) {
      toast.error("This date is already added");
      return;
    }

    setSelectedDates((prev) => [...prev, dateInput]);
    setDateInput("");
  };

  const handleRemoveDate = (index: number) => {
    setSelectedDates((prev) => prev.filter((_, i) => i !== index));
  };

  const vehicleMap = useMemo(() => {
    return new Map(
      vehicles.map((vehicle) => [
        vehicle._id,
        {
          label: vehicle.licensePlate || vehicle.vehicleRegId || vehicle._id,
          make: vehicle.make,
          model: vehicle.model,
        },
      ]),
    );
  }, [vehicles]);

  const daysInMonth = useMemo(() => {
    return new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    ).getDate();
  }, [currentMonth]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    ).getDay();
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const days: Array<{
      type: "prev" | "current" | "next";
      day: number;
      date: Date;
    }> = [];
    const totalDays = firstDayOfMonth + daysInMonth;
    const prevMonthDays = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0,
    ).getDate();

    for (let i = 0; i < totalDays; i++) {
      if (i < firstDayOfMonth) {
        days.push({
          type: "prev",
          day: prevMonthDays - (firstDayOfMonth - i) + 1,
          date: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() - 1,
            prevMonthDays - (firstDayOfMonth - i) + 1,
          ),
        });
      } else {
        const dayNum = i - firstDayOfMonth + 1;
        days.push({
          type: "current",
          day: dayNum,
          date: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            dayNum,
          ),
        });
      }
    }

    while (days.length % 7 !== 0) {
      const nextDay: number = days.length - totalDays + 1;
      days.push({
        type: "next",
        day: nextDay,
        date: new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          nextDay,
        ),
      });
    }

    return days;
  }, [firstDayOfMonth, daysInMonth, currentMonth]);

  const monthFilteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return plannerRows.filter((row) => {
      const rowDate = new Date(row.plannerDate);
      const sameMonth =
        rowDate.getFullYear() === currentMonth.getFullYear() &&
        rowDate.getMonth() === currentMonth.getMonth();
      if (!sameMonth) return false;

      const rowVehicleId = getVehicleId(row.vehicleId);
      const vehicleLabel = (
        vehicleMap.get(rowVehicleId)?.label || ""
      ).toLowerCase();

      const matchVehicle =
        selectedVehicleId === "ALL" || rowVehicleId === selectedVehicleId;
      const matchType = filterType === "ALL" || row.plannerType === filterType;
      const matchSearch =
        !q ||
        vehicleLabel.includes(q) ||
        String(row.plannerType).toLowerCase().includes(q) ||
        String(row.requestStatus || "")
          .toLowerCase()
          .includes(q);

      return matchVehicle && matchType && matchSearch;
    });
  }, [
    currentMonth,
    plannerRows,
    searchQuery,
    selectedVehicleId,
    vehicleMap,
    filterType,
  ]);

  const dayRowsMap = useMemo(() => {
    const map = new Map<number, PlannerRow[]>();
    for (const row of monthFilteredRows) {
      const day = new Date(row.plannerDate).getDate();
      const existing = map.get(day);
      if (existing) existing.push(row);
      else map.set(day, [row]);
    }
    return map;
  }, [monthFilteredRows]);

  const selectedDayRows = useMemo(() => {
    if (!selectedDay) return [];
    return dayRowsMap.get(selectedDay) || [];
  }, [dayRowsMap, selectedDay]);

  const stats = useMemo(() => {
    return {
      inspections: monthFilteredRows.filter(
        (r) => r.plannerType === PlannerType.INSPECTIONS,
      ).length,
      services: monthFilteredRows.filter(
        (r) => r.plannerType === PlannerType.SERVICE,
      ).length,
      mots: monthFilteredRows.filter((r) => r.plannerType === PlannerType.MOT)
        .length,
      brakeTests: monthFilteredRows.filter(
        (r) => r.plannerType === PlannerType.BRAKE_TEST,
      ).length,
      all: monthFilteredRows.length,
    };
  }, [monthFilteredRows]);

  const openEventModal = (row: PlannerRow, day: number) => {
    setSelectedDay(day);
    setActiveEvent(row);
    setEditDate(asInputDate(row.plannerDate));
    setReqDate(asInputDate(row.plannerDate));
    setReqReason(row.requestedReason || "");
    setActiveTab("edit");
    setEventOpen(true);
  };

  const handleCreate = async () => {
    const vehicleId = newVehicleId || selectedVehicleId;
    if (!vehicleId || vehicleId === "ALL") {
      toast.error("Select a vehicle first");
      return;
    }

    if (selectedDates.length === 0) {
      toast.error("Add at least one date");
      return;
    }

    try {
      setAddSubmitting(true);
      await PlannerAction.bulkCreatePlanner({
        vehicleId,
        plannerType: newPlannerType,
        dates: selectedDates.map((d) => new Date(d).toISOString()),
        standAloneId,
      });
      toast.success("Planner events created successfully");
      setAddOpen(false);
      setSelectedDates([]);
      setDateInput(asInputDate(new Date()));
      await loadPageData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create planner events",
      );
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!activeEvent) return;
    const parsed = mergeDateWithOriginalTime(editDate, activeEvent.plannerDate);
    if (!parsed) {
      toast.error("Invalid date format");
      return;
    }

    if (Number.isNaN(parsed.getTime())) {
      toast.error("Invalid date format");
      return;
    }

    try {
      setEventSubmitting(true);
      await PlannerAction.updatePlanner(activeEvent._id, standAloneId, {
        plannerDate: parsed.toISOString(),
      });
      toast.success("Planner updated successfully");
      setEventOpen(false);
      await loadPageData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update planner",
      );
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleRequestChange = async () => {
    if (!activeEvent) return;
    if (!reqReason.trim()) {
      toast.error("Reason is required");
      return;
    }

    const parsed = new Date(reqDate);
    if (Number.isNaN(parsed.getTime())) {
      toast.error("Invalid requested date");
      return;
    }

    try {
      setEventSubmitting(true);
      await PlannerAction.requestChangePlannerDate(activeEvent._id, {
        requestedDate: parsed.toISOString(),
        requestedReason: reqReason.trim(),
      });
      toast.success("Change request submitted successfully");
      setEventOpen(false);
      await loadPageData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit request",
      );
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!activeEvent) return;
    const ok = window.confirm(
      "Are you sure you want to delete this planner item?",
    );
    if (!ok) return;

    try {
      setEventSubmitting(true);
      await PlannerAction.deletePlanner(activeEvent._id, standAloneId);
      toast.success("Planner item deleted successfully");
      setEventOpen(false);
      await loadPageData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete planner",
      );
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await PlannerAction.approvePlannerRequest(id);
      toast.success("Request approved successfully");
      await loadPageData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to approve request",
      );
    }
  };

  const handleReject = async (id: string) => {
    try {
      await PlannerAction.rejectPlannerRequest(id);
      toast.success("Request rejected successfully");
      await loadPageData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reject request",
      );
    }
  };

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="text-destructive mt-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const monthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="min-h-screen font-sans">
        <div className="px-3 py-5 sm:px-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Vehicle Maintenance Planner
                </h1>
                {/* <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  Schedule and manage inspections, services, MOTs, and brake
                  tests
                </p> */}
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <div className="relative w-full lg:w-80">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <button
                  onClick={loadPageData}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 transition-all hover:bg-slate-50 sm:w-auto"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              {
                label: "Inspections",
                value: stats.inspections,
                color: "blue",
                text: "#FFFFFF",
                subTitle: "#FFFFFF",
                background: "#5B8BF1",
              },
              {
                label: "Services",
                value: stats.services,
                color: "orange",
                text: "#FF9900",
                subTitle: "#044192",
                background: "#F6E2E1",
              },
              {
                label: "MOTs",
                value: stats.mots,
                color: "green",
                text: "#055117",
                subTitle: "#044192",
                background: "#D8E6E9",
              },
              {
                label: "Brake Tests",
                value: stats.brakeTests,
                color: "purple",
                text: "#B90012",
                subTitle: "#044192",
                background: "#E5D4FE",
              },
              {
                label: "Total Events",
                value: stats.all,
                color: "slate",
                text: "#5D0999",
                subTitle: "#044192",
                background: "#F5D7F3",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`group overflow-hidden bg-white shadow-sm transition-all hover:shadow-md`}
              >
                <div
                  className={`p-6`}
                  style={{ backgroundColor: stat.background }}
                >
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center text-center">
                      <p
                        className="mt-2 text-3xl font-bold text-white sm:text-[42px]"
                        style={{ color: stat.text }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="text-base font-medium sm:text-lg"
                        style={{ color: stat.subTitle }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main 3-Column Layout */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            {/* LEFT SIDEBAR - Vehicle Selection */}
            <div className="overflow-hidden bg-white shadow-xl">
              <div className="bg-primary px-5 py-4">
                <div className="flex items-center gap-2 text-white">
                  <Truck size={18} />
                  <h2 className="font-semibold">Vehicles</h2>
                  <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    {vehicles.length}
                  </span>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto xl:max-h-150">
                {loading && vehicles.length === 0 ? (
                  <div className="px-5 py-4 text-sm text-slate-500">
                    Loading vehicles...
                  </div>
                ) : null}

                <button
                  onClick={() => setSelectedVehicleId("ALL")}
                  className={`w-full border-l-4 px-5 py-3 text-left transition-all ${
                    selectedVehicleId === "ALL"
                      ? "border-primary text-primary bg-[#ECEAFF]"
                      : "border-transparent text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Car size={16} />
                    <span className="font-medium">All Vehicles</span>
                  </div>
                </button>

                {vehicles.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => setSelectedVehicleId(v._id)}
                    className={`w-full border-l-4 px-5 py-3 text-left transition-all ${
                      selectedVehicleId === v._id
                        ? "border-primary text-primary bg-[#ECEAFF]"
                        : "border-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {v.licensePlate || v.vehicleRegId || v._id}
                      </p>
                      {v.make && v.model && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {v.make} {v.model}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* MIDDLE - Calendar */}
            <div className="overflow-hidden bg-white shadow-xl">
              {/* Calendar Header */}
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentMonth(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() - 1,
                            1,
                          ),
                        )
                      }
                      className="rounded-md p-1 hover:bg-slate-200"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-lg font-semibold text-slate-700">
                      {monthLabel}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentMonth(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth() + 1,
                            1,
                          ),
                        )
                      }
                      className="rounded-md p-1 hover:bg-slate-200"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-400" />
                    <select
                      className="border-none bg-transparent text-sm text-slate-600 outline-none"
                      value={filterType}
                      onChange={(e) =>
                        setFilterType(e.target.value as PlannerType | "ALL")
                      }
                    >
                      <option value="ALL">All Types</option>
                      {Object.values(PlannerType).map((type) => (
                        <option key={type} value={type}>
                          {labelForPlannerType(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-170">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 border-b border-slate-200">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <div
                          key={day}
                          className="py-3 text-center text-xs font-semibold text-slate-500 uppercase"
                        >
                          {day}
                        </div>
                      ),
                    )}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                      const events =
                        day.type === "current"
                          ? dayRowsMap.get(day.day) || []
                          : [];
                      const hasEvents = events.length > 0;
                      const isSelected =
                        day.type === "current" && selectedDay === day.day;
                      const isToday =
                        day.type === "current" &&
                        day.day === new Date().getDate() &&
                        currentMonth.getMonth() === new Date().getMonth() &&
                        currentMonth.getFullYear() === new Date().getFullYear();

                      const primaryEventType = hasEvents
                        ? events[0].plannerType
                        : null;
                      const dayColorClass =
                        primaryEventType &&
                        PLANNER_TYPE_COLORS[primaryEventType]
                          ? PLANNER_TYPE_COLORS[primaryEventType].dayBg
                          : "";

                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            day.type === "current" && setSelectedDay(day.day)
                          }
                          className={`relative min-h-25 border-r border-b border-slate-100 p-2 transition-all hover:opacity-75 ${
                            day.type !== "current"
                              ? "bg-slate-50/50 text-slate-400"
                              : dayColorClass
                          } ${isSelected ? "ring-primary ring-2 ring-inset" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                                isToday ? "bg-primary text-white" : ""
                              }`}
                            >
                              {day.day}
                            </span>
                            {hasEvents && (
                              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
                                {events.length}
                              </span>
                            )}
                          </div>

                          {hasEvents && (
                            <div className="mt-1 space-y-1">
                              {events.slice(0, 2).map((event) => {
                                const eventType = plannerEventType(event);
                                const Icon = EVENT_COLORS[eventType].icon;
                                return (
                                  <div
                                    key={event._id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEventModal(event, day.day);
                                    }}
                                    className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${EVENT_COLORS[eventType].light} ${EVENT_COLORS[eventType].text} cursor-pointer transition-all hover:scale-105`}
                                  >
                                    <Icon size={8} />
                                    <span className="truncate text-[10px]">
                                      {labelForPlannerType(
                                        event.plannerType,
                                      ).substring(0, 8)}
                                    </span>
                                  </div>
                                );
                              })}
                              {events.length > 2 && (
                                <div className="text-center text-[10px] text-slate-400">
                                  +{events.length - 2}
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 border-t border-slate-200 bg-slate-50 px-4 py-3">
                {Object.entries(EVENT_COLORS).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`h-2.5 w-2.5 rounded-full ${value.bg}`} />
                    <span className="text-xs text-slate-600 capitalize">
                      {key.replace("-", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDEBAR - Selected Day Events */}
            <div className="overflow-hidden bg-white shadow-xl">
              <div className="bg-primary px-5 py-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <h2 className="font-semibold">
                      {selectedDay
                        ? `${selectedDay} ${monthLabel}`
                        : "Select a Day"}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedDay && (
                      <button
                        onClick={() => {
                          openAddEventModal(
                            new Date(
                              currentMonth.getFullYear(),
                              currentMonth.getMonth(),
                              selectedDay,
                            ),
                          );
                        }}
                        className="rounded p-1 transition-all hover:bg-white/10"
                        title="Add new event for this day"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                    {selectedDay && (
                      <button
                        onClick={() => setSelectedDay(null)}
                        className="rounded p-1 hover:bg-white/10"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto p-4 xl:max-h-150">
                {!selectedDay ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar size={48} className="text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">
                      Click on any day to view events
                    </p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-slate-400">Loading events...</div>
                  </div>
                ) : selectedDayRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar size={48} className="text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">
                      No events scheduled
                    </p>
                    <button
                      onClick={() => {
                        openAddEventModal(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth(),
                            selectedDay,
                          ),
                        );
                      }}
                      className="mt-3 rounded-lg bg-[#044192] px-3 py-1.5 text-xs text-white hover:bg-blue-800"
                    >
                      + Add Event
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayRows.map((row) => {
                      const vId = getVehicleId(row.vehicleId);
                      const vehicleInfo = vehicleMap.get(vId);
                      const eventType = plannerEventType(row);
                      const Icon = EVENT_COLORS[eventType].icon;

                      return (
                        <button
                          key={row._id}
                          onClick={() => openEventModal(row, selectedDay)}
                          className={`w-full rounded-xl border p-3 text-left transition-all hover:shadow-md ${EVENT_COLORS[eventType].light}`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={`rounded-lg p-1.5 ${EVENT_COLORS[eventType].bg}`}
                            >
                              <Icon size={12} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900">
                                {labelForPlannerType(row.plannerType)}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-600">
                                {vehicleInfo?.label}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {asDisplayDate(row.plannerDate)}
                              </p>
                              {row.requestStatus === RequestStatus.PENDING && (
                                <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                                  Pending Request
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Pending Requests Section for Admins */}
                {!isStandaloneUser &&
                  requestedRows.some(
                    (r) => r.requestStatus === RequestStatus.PENDING,
                  ) && (
                    <div className="mt-6 border-t border-slate-200 pt-4">
                      <h3 className="mb-3 text-sm font-semibold text-slate-900">
                        Pending Requests
                      </h3>
                      <div className="space-y-2">
                        {requestedRows
                          .filter(
                            (r) => r.requestStatus === RequestStatus.PENDING,
                          )
                          .slice(0, 3)
                          .map((row) => {
                            const vId = getVehicleId(row.vehicleId);
                            const vehicleInfo = vehicleMap.get(vId);
                            return (
                              <div
                                key={row._id}
                                className="rounded-lg bg-amber-50 p-3"
                              >
                                <p className="text-xs font-semibold text-slate-800">
                                  {labelForPlannerType(row.plannerType)}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-600">
                                  {vehicleInfo?.label}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {asDisplayDate(row.plannerDate)} →{" "}
                                  {asDisplayDate(row.requestedDate)}
                                </p>
                                <div className="mt-2 flex gap-2">
                                  <button
                                    onClick={() => handleApprove(row._id)}
                                    className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(row._id)}
                                    className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
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
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Event</DialogTitle>
            <DialogDescription>
              Add planner events by selecting a vehicle, type, and specific
              dates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Vehicle
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={newVehicleId}
                onChange={(e) => setNewVehicleId(e.target.value)}
              >
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.licensePlate || v.vehicleRegId || v._id}
                    {v.make && v.model && ` - ${v.make} ${v.model}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Event Type
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={newPlannerType}
                onChange={(e) =>
                  setNewPlannerType(e.target.value as PlannerType)
                }
              >
                {Object.values(PlannerType).map((type) => (
                  <option key={type} value={type}>
                    {labelForPlannerType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                  />
                  <button
                    onClick={handleAddDate}
                    type="button"
                    className="rounded-lg bg-[#044192] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                  >
                    Add
                  </button>
                </div>

                {selectedDates.length > 0 && (
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-medium text-slate-600">
                      Selected Dates ({selectedDates.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDates.map((date, idx) => (
                        <div
                          key={`${date}-${idx}`}
                          className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
                        >
                          {asDisplayDate(date)}
                          <button
                            type="button"
                            onClick={() => handleRemoveDate(idx)}
                            className="ml-1 hover:text-blue-900"
                            aria-label="Remove date"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setAddOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={addSubmitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:opacity-60"
            >
              {addSubmitting ? "Creating..." : "Create Event"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Event Dialog */}
      <Dialog open={eventOpen} onOpenChange={setEventOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Manage Event</DialogTitle>
            <DialogDescription>
              Update the planner date, delete the event, or request a date
              change.
            </DialogDescription>
          </DialogHeader>

          {activeEvent && (
            <div>
              {/* Tabs */}
              <div className="mb-4 flex gap-2 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === "edit"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Edit size={14} className="mr-1 inline" />
                  Edit Event
                </button>
                {isStandaloneUser && (
                  <button
                    onClick={() => setActiveTab("request")}
                    className={`px-4 py-2 text-sm font-medium transition-all ${
                      activeTab === "request"
                        ? "border-b-2 border-amber-600 text-amber-600"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Send size={14} className="mr-1 inline" />
                    Request Change
                  </button>
                )}
              </div>

              {/* Event Info Card */}
              <div className="mb-4 rounded-lg bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  {getPlannerTypeIcon(activeEvent.plannerType)}
                  <p className="font-semibold text-slate-900">
                    {labelForPlannerType(activeEvent.plannerType)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Vehicle:{" "}
                  {vehicleMap.get(getVehicleId(activeEvent.vehicleId))?.label ||
                    "Unknown"}
                </p>
                <p className="text-sm text-slate-600">
                  Current Date: {asDisplayDate(activeEvent.plannerDate)}
                </p>
              </div>

              {activeTab === "edit" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      New Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "request" && isStandaloneUser && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Requested Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      value={reqDate}
                      onChange={(e) => setReqDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Reason for Change
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      rows={3}
                      value={reqReason}
                      onChange={(e) => setReqReason(e.target.value)}
                      placeholder="Please provide a reason for this change request..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="justify-between">
            <button
              onClick={handleDelete}
              disabled={eventSubmitting}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-60"
            >
              <Trash2 size={14} />
              Delete
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setEventOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              {activeTab === "edit" && (
                <button
                  onClick={handleUpdate}
                  disabled={eventSubmitting}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:opacity-60"
                >
                  {eventSubmitting ? "Saving..." : "Save Changes"}
                </button>
              )}
              {activeTab === "request" && isStandaloneUser && (
                <button
                  onClick={handleRequestChange}
                  disabled={eventSubmitting}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-amber-700 disabled:opacity-60"
                >
                  {eventSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
