"use client";

import { useState, useMemo } from "react";
import { Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlannerRow } from "@/lib/planner/planner.types";
import { PlannerAction } from "@/service/planner";
import { VehicleMapValue } from "./types";

interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeEvent: PlannerRow | null;
  standAloneId: string;
  isStandaloneUser: boolean;
  vehicleMap: Map<string, VehicleMapValue>;
  onSuccess: () => void;
}

// function asInputDate(dateLike: string | Date): string {
//   const date = new Date(dateLike);
//   if (Number.isNaN(date.getTime())) return "";

//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// }

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

function getVehicleId(vehicleId: PlannerRow["vehicleId"]): string {
  if (typeof vehicleId === "string") return vehicleId;
  return vehicleId?._id || "";
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

export function EventDetailsDialog({
  open,
  onOpenChange,
  activeEvent,
  standAloneId,
  isStandaloneUser,
  vehicleMap,
  onSuccess,
}: EventDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "request">("edit");
  const [editDate, setEditDate] = useState("");
  const [reqDate, setReqDate] = useState("");
  const [reqReason, setReqReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const vehicleInfo = useMemo(() => {
    if (!activeEvent) return null;
    const vId = getVehicleId(activeEvent.vehicleId);
    return vehicleMap.get(vId);
  }, [activeEvent, vehicleMap]);

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
      setSubmitting(true);
      await PlannerAction.updatePlanner(activeEvent._id, standAloneId, {
        plannerDate: parsed.toISOString(),
      });
      toast.success("Planner updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update planner",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!activeEvent) return;
    const ok = window.confirm(
      "Are you sure you want to delete this planner item?",
    );
    if (!ok) return;

    try {
      setSubmitting(true);
      await PlannerAction.deletePlanner(activeEvent._id, standAloneId);
      toast.success("Planner item deleted successfully");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete planner",
      );
    } finally {
      setSubmitting(false);
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
      setSubmitting(true);
      await PlannerAction.requestChangePlannerDate(activeEvent._id, {
        requestedDate: parsed.toISOString(),
        requestedReason: reqReason.trim(),
      });
      toast.success("Change request submitted successfully");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeEvent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Manage Event</DialogTitle>
          <DialogDescription>
            Update the planner date, delete the event, or request a date change.
          </DialogDescription>
        </DialogHeader>

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
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Request Change
              </button>
            )}
          </div>

          {/* Event Info Card */}
          <div className="mb-4 rounded-lg bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">
                {String(activeEvent.plannerType)
                  .toLowerCase()
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (ch) => ch.toUpperCase())}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Vehicle: {vehicleInfo?.label}
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reason for Change
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  rows={3}
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="Explain why you need to change the date..."
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="justify-between">
          <button
            onClick={handleDelete}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-60"
          >
            <Trash2 size={14} />
            Delete
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            {activeTab === "edit" && (
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? "Updating..." : "Update"}
              </button>
            )}
            {activeTab === "request" && isStandaloneUser && (
              <button
                onClick={handleRequestChange}
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
