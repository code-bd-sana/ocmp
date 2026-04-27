"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlannerType } from "@/lib/planner/planner.types";
import { PlannerAction } from "@/service/planner";
import { VehicleOption } from "./types";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: VehicleOption[];
  selectedVehicleId: string;
  onVehicleChange: (vehicleId: string) => void;
  standAloneId: string;
  onSuccess: () => void;
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

export function AddEventDialog({
  open,
  onOpenChange,
  vehicles,
  selectedVehicleId,
  standAloneId,
  onSuccess,
}: AddEventDialogProps) {
  const [newVehicleId, setNewVehicleId] = useState("");
  const [newPlannerType, setNewPlannerType] = useState<PlannerType>(
    PlannerType.INSPECTIONS,
  );
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState(asInputDate(new Date()));
  const [submitting, setSubmitting] = useState(false);

  const displayDates = useMemo(() => {
    return selectedDates.map((d) => {
      const date = new Date(d);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    });
  }, [selectedDates]);

  const handleAddDate = () => {
    if (!dateInput) {
      toast.error("Please select a date");
      return;
    }

    if (selectedDates.includes(dateInput)) {
      toast.error("This date is already added");
      return;
    }

    setSelectedDates([...selectedDates, dateInput]);
    setDateInput("");
  };

  const handleRemoveDate = (index: number) => {
    setSelectedDates(selectedDates.filter((_, i) => i !== index));
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
      setSubmitting(true);
      await PlannerAction.bulkCreatePlanner({
        vehicleId,
        plannerType: newPlannerType,
        dates: selectedDates.map((d) => new Date(d).toISOString()),
        standAloneId,
      });
      toast.success("Planner events created successfully");
      onOpenChange(false);
      setSelectedDates([]);
      setDateInput(asInputDate(new Date()));
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create planner events",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Events</DialogTitle>
          <DialogDescription>
            Add planner events for multiple specific dates.
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
              onChange={(e) => setNewPlannerType(e.target.value as PlannerType)}
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
              Select Dates
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                />
                <button
                  onClick={handleAddDate}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
                    {displayDates.map((date, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
                      >
                        {date}
                        <button
                          onClick={() => handleRemoveDate(idx)}
                          className="ml-1 hover:text-blue-900"
                        >
                          <X size={14} />
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
            onClick={() => {
              onOpenChange(false);
              setSelectedDates([]);
              setDateInput(asInputDate(new Date()));
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Events"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
