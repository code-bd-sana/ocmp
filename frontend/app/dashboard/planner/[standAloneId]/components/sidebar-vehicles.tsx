"use client";

import { Truck } from "lucide-react";
import { VehicleOption } from "./types";

interface VehiclesSidebarProps {
  vehicles: VehicleOption[];
  selectedVehicleId: string;
  onSelectVehicle: (vehicleId: string) => void;
  loading: boolean;
}

export function VehiclesSidebar({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  loading,
}: VehiclesSidebarProps) {
  return (
    <div className="overflow-hidden bg-white shadow-xl">
      <div className="bg-primary px-5 py-4">
        <div className="flex items-center gap-2 text-white">
          <Truck size={18} />
          <h2 className="font-semibold">Vehicles</h2>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto xl:max-h-150">
        {loading && vehicles.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-500">
            Loading vehicles...
          </div>
        ) : null}

        <button
          onClick={() => onSelectVehicle("ALL")}
          className={`w-full border-l-4 px-5 py-3 text-left transition-all ${
            selectedVehicleId === "ALL"
              ? "border-primary text-primary bg-[#ECEAFF]"
              : "border-transparent text-slate-600 hover:bg-slate-50"
          }`}
        >
          <p className="font-medium">All Vehicles</p>
        </button>

        {vehicles.map((v) => (
          <button
            key={v._id}
            onClick={() => onSelectVehicle(v._id)}
            className={`w-full border-l-4 px-5 py-3 text-left transition-all ${
              selectedVehicleId === v._id
                ? "border-primary text-primary bg-[#ECEAFF]"
                : "border-transparent text-slate-600 hover:bg-slate-50"
            }`}
          >
            <p className="font-medium">
              {v.licensePlate || v.vehicleRegId || v._id}
            </p>
            {v.make && v.model && (
              <p className="text-xs text-slate-500">
                {v.make} {v.model}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
