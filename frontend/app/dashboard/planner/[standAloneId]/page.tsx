"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Truck,
  Calendar,
  Settings2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type EventType = "completed" | "in-progress" | "booked" | "overdue";

interface CalendarEvent {
  day: number;
  type: EventType;
}

interface Vehicle {
  id: string;
  plate: string;
  events: CalendarEvent[];
}

// ─── Static data ─────────────────────────────────────────────────────────────
const VEHICLES: Vehicle[] = [
  {
    id: "r14",
    plate: "R14 CNL",
    events: [
      { day: 4, type: "completed" },
      { day: 17, type: "in-progress" },
      { day: 27, type: "completed" },
    ],
  },
  { id: "r15", plate: "R15 CNL", events: [] },
  { id: "r16", plate: "R16 CNL", events: [] },
  { id: "r17", plate: "R17 CNL", events: [] },
  { id: "r18", plate: "R18 CNL", events: [] },
];

const ISO_WEEKS = [
  { week: 49, startDay: 1 },
  { week: 50, startDay: 8 },
  { week: 51, startDay: 15 },
  { week: 52, startDay: 22 },
  { week: 53, startDay: 29 },
  { week: 54, startDay: 36 },
];

const DAY_HEADERS = [
  "ISO WEEK",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];
const DAYS_IN_MONTH = 31;

function GearIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.94-2.06a7.07 7.07 0 0 0 .06-.94 7.07 7.07 0 0 0-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.63l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54A.49.49 0 0 0 14.5 3h-3.84a.49.49 0 0 0-.49.43l-.36 2.54a7 7 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.6.22L3.28 9.49a.48.48 0 0 0 .12.63l2.03 1.58A7.2 7.2 0 0 0 5.37 13c0 .31.02.64.06.94l-2.03 1.58a.5.5 0 0 0-.12.63l1.92 3.32c.12.22.38.3.6.22l2.39-.96c.5.36 1.05.67 1.62.94l.36 2.54c.06.25.28.43.49.43h3.84c.25 0 .46-.18.49-.43l.36-2.54a7 7 0 0 0 1.62-.94l2.39.96c.22.08.48 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.63l-2.03-1.58z" />
    </svg>
  );
}

function eventBg(type: EventType): string {
  switch (type) {
    case "completed":
      return "bg-green-600";
    case "in-progress":
      return "bg-orange-500";
    case "booked":
      return "bg-blue-400";
    case "overdue":
      return "bg-pink-500";
  }
}

// ─── Select helper ────────────────────────────────────────────────────────────
function Select({
  options,
  defaultValue,
}: {
  options: string[];
  defaultValue: string;
}) {
  return (
    <div className="relative">
      <select
        defaultValue={defaultValue}
        className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-4 text-sm text-slate-700 shadow-sm outline-none"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-500"
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PlannerPage() {
  const [selectedVehicle, setSelectedVehicle] = useState("r14");
  const vehicle = VEHICLES.find((v) => v.id === selectedVehicle)!;

  function getEvent(day: number) {
    return vehicle.events.find((e) => e.day === day);
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <div className="px-6 py-7">
        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            ISO Week Planner
          </h1>
          <div className="flex w-64 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search size={14} className="text-slate-400" />
            <input
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="mb-5 grid grid-cols-5 gap-3 overflow-hidden">
          <div className="bg-[#5B8BF1] p-8 text-center">
            <div className="text-4xl font-bold text-white">0</div>
            <div className="mt-1 text-sm text-blue-100">Inspections</div>
          </div>
          <div className="bg-[#F6E2E1] p-8 text-center">
            <div className="text-4xl font-bold text-orange-400">2</div>
            <div className="mt-1 text-sm text-rose-300">Services</div>
          </div>
          <div className="bg-[#D8E6E9] p-8 text-center">
            <div className="text-4xl font-bold text-green-800">0</div>
            <div className="mt-1 text-sm text-teal-500">MOTs</div>
          </div>
          <div className="bg-[#F5D7F3] p-8 text-center">
            <div className="text-4xl font-bold text-red-700">6</div>
            <div className="mt-1 text-sm text-purple-400">Brake Test</div>
          </div>
          <div className="bg-[#E5D4FE] p-8 text-center">
            <div className="text-4xl font-bold text-purple-800">2</div>
            <div className="mt-1 text-sm text-purple-400">All Events</div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Select options={["2024", "2025", "2026"]} defaultValue="2025" />

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            <ChevronLeft size={14} className="text-slate-500" />
            <span>ISO Week 18 - W/C 28 Apr 2025</span>
            <ChevronRight size={14} className="text-slate-500" />
            <ChevronDown size={13} className="ml-1 text-slate-500" />
          </div>

          <Select options={["Month", "Week", "Day"]} defaultValue="Month" />

          <div className="ml-auto flex gap-2">
            <button className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
              Add New Event
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50">
              Send Request
            </button>
            <button className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600">
              Export
            </button>
          </div>
        </div>

        {/* ── 3-column layout ── */}
        <div className="grid grid-cols-[220px_1fr_260px] overflow-hidden rounded-xl bg-white shadow">
          {/* ─ LEFT SIDEBAR ─ */}
          <div className="border-r border-slate-100">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white">
              <span>DECEMBER 2025</span>
              <ChevronDown size={14} />
            </div>
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-xs font-bold tracking-wide text-slate-400 uppercase">
              <Truck size={14} />
              <span>Vehicles (2)</span>
            </div>
            {VEHICLES.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicle(v.id)}
                className={`w-full border-l-[3px] px-4 py-3 text-left text-sm font-medium transition-colors ${
                  selectedVehicle === v.id
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                {v.plate}
              </button>
            ))}
          </div>

          {/* ─ CENTER CALENDAR ─ */}
          <div className="flex flex-col">
            {/* Nav bar */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-3">
                <ChevronLeft
                  size={16}
                  className="cursor-pointer text-slate-400 hover:text-slate-700"
                />
                <span className="text-sm font-bold text-blue-500">
                  DECEMBER 2025
                </span>
                <ChevronRight
                  size={16}
                  className="cursor-pointer text-slate-400 hover:text-slate-700"
                />
              </div>
              <button className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100">
                Today
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-slate-100 bg-slate-50 px-3 py-2">
              {DAY_HEADERS.map((h) => (
                <div
                  key={h}
                  className="text-center text-[11px] font-bold tracking-wide text-slate-400 uppercase"
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Calendar rows */}
            <div className="flex-1 divide-y divide-slate-50 px-3 pb-3">
              {ISO_WEEKS.map(({ week, startDay }) => (
                <div
                  key={week}
                  className="grid grid-cols-[64px_repeat(7,1fr)] gap-1 py-1.5"
                >
                  {/* ISO week pill */}
                  <div className="flex flex-col items-center justify-center rounded-md bg-slate-400 py-2 text-center text-[10px] leading-tight font-bold text-white">
                    <span className="opacity-80">ISO</span>
                    <span className="opacity-80">WEEK</span>
                    <span className="text-xs">{week}</span>
                  </div>

                  {/* Day cells */}
                  {Array.from({ length: 7 }).map((_, col) => {
                    const day = startDay + col;
                    const overflow = day > DAYS_IN_MONTH;
                    const ghost = overflow ? day - DAYS_IN_MONTH : null;
                    const event = !overflow ? getEvent(day) : undefined;

                    if (event) {
                      return (
                        <div
                          key={col}
                          className={`flex min-h-13 cursor-pointer items-center justify-center rounded-md ${eventBg(event.type)}`}
                        >
                          <GearIcon />
                        </div>
                      );
                    }

                    return (
                      <div
                        key={col}
                        className={`flex min-h-13 items-start justify-start rounded-md p-1.5 text-xs font-medium ${overflow ? "text-slate-300" : "cursor-default text-blue-500 hover:bg-slate-50"}`}
                      >
                        {overflow ? ghost : day}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 px-5 py-3">
              {[
                { label: "Completed", cls: "bg-green-600" },
                { label: "Booked/Planned", cls: "bg-blue-400" },
                { label: "In Progress", cls: "bg-orange-500" },
                { label: "Overdue", cls: "bg-pink-500" },
              ].map((l) => (
                <div
                  key={l.label}
                  className="flex items-center gap-1.5 text-xs text-slate-500"
                >
                  <div className={`h-3 w-3 rounded-sm ${l.cls}`} />
                  {l.label}
                </div>
              ))}
              {["Defect", "Repair", "Service", "MOT"].map((l) => (
                <div
                  key={l}
                  className="flex items-center gap-1.5 text-xs text-slate-500"
                >
                  <Settings2 size={12} className="text-slate-400" />
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* ─ RIGHT SIDEBAR ─ */}
          <div className="border-l border-slate-100">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white">
              <span>DECEMBER 2025</span>
              <ChevronDown size={14} />
            </div>

            <div className="p-4">
              {/* Upcoming */}
              <p className="mb-3 text-sm font-bold text-slate-700">Upcoming</p>

              <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-teal-700 px-3 py-2.5">
                <Calendar size={14} className="shrink-0 text-white" />
                <div>
                  <p className="text-xs font-semibold text-white">
                    Inspection Start Date:
                  </p>
                  <p className="text-xs text-teal-100">16/08/2025</p>
                </div>
              </div>

              <div className="mb-2 flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                <Calendar size={14} className="shrink-0 text-slate-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Inspection End Date:
                  </p>
                  <p className="text-xs text-slate-500">16/08/2025</p>
                </div>
              </div>

              <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-blue-100 px-3 py-2.5">
                <Calendar size={14} className="shrink-0 text-blue-700" />
                <div>
                  <p className="text-xs font-semibold text-blue-700">
                    Next Inspection Date:
                  </p>
                  <p className="text-xs text-blue-600">16/08/2025</p>
                </div>
              </div>

              {/* Completed */}
              <p className="mb-3 text-sm font-bold text-slate-700">Completed</p>
              {[
                { name: "John Smith", plate: "R14 CNL", date: "12/08/2025" },
                { name: "John Smith", plate: "R14 CNL", date: "Completed" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="mb-2 flex items-center justify-between rounded-lg bg-green-800 px-3 py-2.5"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-green-200">{item.date}</p>
                  </div>
                  <span className="text-xs font-bold text-green-100">
                    {item.plate}
                  </span>
                </div>
              ))}

              {/* Note box */}
              <div className="mt-4 rounded-lg border border-red-300 p-3 text-xs leading-relaxed text-slate-600">
                Monitor and manage all due inspections, MOTs, make work, and
                service alerts vehicles rushes vetices and insides, more! than a
                quantifying tool, make it a daily guide up to dosn with sagatse
                combele s and a clear weekly overview of all tasks scheduled.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
