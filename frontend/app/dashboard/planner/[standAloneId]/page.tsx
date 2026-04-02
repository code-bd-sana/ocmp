// "use client";

// import { use, useCallback, useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   Settings2,
//   Truck,
// } from "lucide-react";
// import { toast } from "sonner";
// import { resolveRoleScopedRoute } from "@/lib/utils/role-route";
// import {
//   PlannerRow,
//   PlannerType,
//   RequestStatus,
// } from "@/lib/planner/planner.types";
// import { PlannerAction } from "@/service/planner";
// import { UserAction } from "@/service/user";
// import { VehicleAction } from "@/service/vehicle";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// type VehicleOption = {
//   _id: string;
//   vehicleRegId?: string;
//   licensePlate?: string;
// };

// interface PageProps {
//   params: Promise<{ standAloneId: string }>;
// }

// type EventType = "completed" | "in-progress" | "booked" | "overdue";

// function eventBg(type: EventType): string {
//   switch (type) {
//     case "completed":
//       return "bg-green-600";
//     case "in-progress":
//       return "bg-orange-500";
//     case "booked":
//       return "bg-blue-400";
//     case "overdue":
//       return "bg-pink-500";
//   }
// }

// function getVehicleId(vehicleId: PlannerRow["vehicleId"]): string {
//   if (typeof vehicleId === "string") return vehicleId;
//   return vehicleId?._id || "";
// }

// function asInputDate(dateLike: string | Date): string {
//   const date = new Date(dateLike);
//   if (Number.isNaN(date.getTime())) return "";

//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// }

// function asDisplayDate(dateLike?: string): string {
//   if (!dateLike) return "-";
//   const date = new Date(dateLike);
//   if (Number.isNaN(date.getTime())) return "-";
//   return date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });
// }

// function labelForPlannerType(type: PlannerType | string): string {
//   return String(type)
//     .toLowerCase()
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (ch) => ch.toUpperCase());
// }

// function plannerEventType(row: PlannerRow): EventType {
//   if (row.PlannerStatus === "DUE") return "overdue";
//   if (row.requestStatus === RequestStatus.PENDING) return "in-progress";
//   if (row.requestStatus === RequestStatus.APPROVED) return "completed";
//   return "booked";
// }

// function GearIcon() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
//       <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.94-2.06a7.07 7.07 0 0 0 .06-.94 7.07 7.07 0 0 0-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.63l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54A.49.49 0 0 0 14.5 3h-3.84a.49.49 0 0 0-.49.43l-.36 2.54a7 7 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.6.22L3.28 9.49a.48.48 0 0 0 .12.63l2.03 1.58A7.2 7.2 0 0 0 5.37 13c0 .31.02.64.06.94l-2.03 1.58a.5.5 0 0 0-.12.63l1.92 3.32c.12.22.38.3.6.22l2.39-.96c.5.36 1.05.67 1.62.94l.36 2.54c.06.25.28.43.49.43h3.84c.25 0 .46-.18.49-.43l.36-2.54a7 7 0 0 0 1.62-.94l2.39.96c.22.08.48 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.63l-2.03-1.58z" />
//     </svg>
//   );
// }

// export default function PlannerDetailPage({ params }: PageProps) {
//   const { standAloneId } = use(params);
//   const router = useRouter();

//   const [roleReady, setRoleReady] = useState(false);
//   const [isStandaloneUser, setIsStandaloneUser] = useState(false);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [plannerRows, setPlannerRows] = useState<PlannerRow[]>([]);
//   const [requestedRows, setRequestedRows] = useState<PlannerRow[]>([]);
//   const [vehicles, setVehicles] = useState<VehicleOption[]>([]);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedVehicleId, setSelectedVehicleId] = useState("ALL");
//   const [currentMonth, setCurrentMonth] = useState<Date>(() => {
//     const now = new Date();
//     return new Date(now.getFullYear(), now.getMonth(), 1);
//   });
//   const [selectedDay, setSelectedDay] = useState<number | null>(null);

//   const [newVehicleId, setNewVehicleId] = useState("");

//   const [addOpen, setAddOpen] = useState(false);
//   const [addPlannerType, setAddPlannerType] = useState<PlannerType>(
//     PlannerType.INSPECTIONS,
//   );
//   const [addPlannerDate, setAddPlannerDate] = useState(asInputDate(new Date()));
//   const [addSubmitting, setAddSubmitting] = useState(false);

//   const [eventOpen, setEventOpen] = useState(false);
//   const [activeEvent, setActiveEvent] = useState<PlannerRow | null>(null);
//   const [editDate, setEditDate] = useState("");
//   const [reqDate, setReqDate] = useState("");
//   const [reqReason, setReqReason] = useState("");
//   const [eventSubmitting, setEventSubmitting] = useState(false);

//   const loadPageData = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const [plannerResp, vehicleResp] = await Promise.all([
//         PlannerAction.getPlanners(standAloneId, {
//           showPerPage: 500,
//           pageNo: 1,
//         }),
//         VehicleAction.getVehicles(standAloneId, {
//           showPerPage: 500,
//           pageNo: 1,
//         }),
//       ]);

//       const planners = plannerResp.data?.planners || [];
//       const loadedVehicles = vehicleResp.data?.vehicles || [];

//       setPlannerRows(planners);
//       setVehicles(loadedVehicles);

//       if (!newVehicleId && loadedVehicles.length) {
//         setNewVehicleId(loadedVehicles[0]._id);
//       }

//       if (selectedVehicleId === "ALL" && loadedVehicles.length) {
//         setSelectedVehicleId(loadedVehicles[0]._id);
//       }

//       if (!isStandaloneUser) {
//         try {
//           const reqResp =
//             await PlannerAction.getRequestedPlanners(standAloneId);
//           setRequestedRows(reqResp.data || []);
//         } catch {
//           setRequestedRows([]);
//         }
//       } else {
//         setRequestedRows([]);
//       }
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Failed to load planner data",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [isStandaloneUser, newVehicleId, selectedVehicleId, standAloneId]);

//   useEffect(() => {
//     let isActive = true;

//     const ensureRoleScopedRoute = async () => {
//       try {
//         const profileResp = await UserAction.getProfile();
//         const userRole = profileResp.data?.role;
//         const userId = profileResp.data?._id;

//         if (!isActive) return;

//         const routeResult = resolveRoleScopedRoute({
//           role: userRole,
//           userId,
//           standAloneId,
//           basePath: "/dashboard/planner",
//         });

//         if (routeResult.error) {
//           setError(routeResult.error);
//           return;
//         }

//         if (routeResult.redirectTo) {
//           router.replace(routeResult.redirectTo);
//           return;
//         }

//         setIsStandaloneUser(userRole === "STANDALONE_USER");
//         setRoleReady(true);
//       } catch {
//         if (!isActive) return;
//         setError("Failed to load your profile. Please sign in again.");
//       }
//     };

//     ensureRoleScopedRoute();

//     return () => {
//       isActive = false;
//     };
//   }, [router, standAloneId]);

//   useEffect(() => {
//     if (!roleReady) return;
//     loadPageData();
//   }, [roleReady, loadPageData]);

//   const vehicleMap = useMemo(() => {
//     return new Map(
//       vehicles.map((vehicle) => [
//         vehicle._id,
//         vehicle.licensePlate || vehicle.vehicleRegId || vehicle._id,
//       ]),
//     );
//   }, [vehicles]);

//   const daysInMonth = useMemo(() => {
//     return new Date(
//       currentMonth.getFullYear(),
//       currentMonth.getMonth() + 1,
//       0,
//     ).getDate();
//   }, [currentMonth]);

//   const isoWeeks = useMemo(() => {
//     const rows: Array<{ week: number; startDay: number }> = [];
//     let start = 1;
//     let week = 1;
//     while (start <= daysInMonth) {
//       rows.push({ week, startDay: start });
//       start += 7;
//       week += 1;
//     }
//     return rows;
//   }, [daysInMonth]);

//   const monthFilteredRows = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase();

//     return plannerRows.filter((row) => {
//       const rowDate = new Date(row.plannerDate);
//       const sameMonth =
//         rowDate.getFullYear() === currentMonth.getFullYear() &&
//         rowDate.getMonth() === currentMonth.getMonth();
//       if (!sameMonth) return false;

//       const rowVehicleId = getVehicleId(row.vehicleId);
//       const vehicleLabel = (vehicleMap.get(rowVehicleId) || "").toLowerCase();

//       const matchVehicle =
//         selectedVehicleId === "ALL" || rowVehicleId === selectedVehicleId;
//       const matchSearch =
//         !q ||
//         vehicleLabel.includes(q) ||
//         String(row.plannerType).toLowerCase().includes(q) ||
//         String(row.requestStatus || "")
//           .toLowerCase()
//           .includes(q);

//       return matchVehicle && matchSearch;
//     });
//   }, [currentMonth, plannerRows, searchQuery, selectedVehicleId, vehicleMap]);

//   const selectedVehicleRows = useMemo(() => {
//     if (selectedVehicleId === "ALL") return monthFilteredRows;
//     return monthFilteredRows.filter(
//       (row) => getVehicleId(row.vehicleId) === selectedVehicleId,
//     );
//   }, [monthFilteredRows, selectedVehicleId]);

//   const dayRowsMap = useMemo(() => {
//     const map = new Map<number, PlannerRow[]>();
//     for (const row of selectedVehicleRows) {
//       const day = new Date(row.plannerDate).getDate();
//       const existing = map.get(day);
//       if (existing) existing.push(row);
//       else map.set(day, [row]);
//     }
//     return map;
//   }, [selectedVehicleRows]);

//   const selectedDayRows = useMemo(() => {
//     if (!selectedDay) return [];
//     return dayRowsMap.get(selectedDay) || [];
//   }, [dayRowsMap, selectedDay]);

//   const stats = useMemo(() => {
//     return {
//       inspections: monthFilteredRows.filter(
//         (r) => r.plannerType === PlannerType.INSPECTIONS,
//       ).length,
//       services: monthFilteredRows.filter(
//         (r) => r.plannerType === PlannerType.SERVICE,
//       ).length,
//       mots: monthFilteredRows.filter((r) => r.plannerType === PlannerType.MOT)
//         .length,
//       brakeTests: monthFilteredRows.filter(
//         (r) => r.plannerType === PlannerType.BRAKE_TEST,
//       ).length,
//       all: monthFilteredRows.length,
//     };
//   }, [monthFilteredRows]);

//   const openEventModal = (row: PlannerRow, day: number) => {
//     setSelectedDay(day);
//     setActiveEvent(row);
//     setEditDate(asInputDate(row.plannerDate));
//     setReqDate(asInputDate(row.plannerDate));
//     setReqReason(row.requestedReason || "");
//     setEventOpen(true);
//   };

//   const handleCreate = async () => {
//     const vehicleId = newVehicleId || selectedVehicleId;
//     if (!vehicleId || vehicleId === "ALL") {
//       toast.error("Select a vehicle first");
//       return;
//     }

//     if (!addPlannerDate) {
//       toast.error("Planner date is required");
//       return;
//     }

//     const parsed = new Date(addPlannerDate);
//     if (Number.isNaN(parsed.getTime())) {
//       toast.error("Invalid date format");
//       return;
//     }

//     try {
//       setAddSubmitting(true);
//       await PlannerAction.createPlanner({
//         vehicleId,
//         plannerType: addPlannerType,
//         plannerDate: parsed.toISOString(),
//         standAloneId,
//       });
//       toast.success("Planner event created");
//       setAddOpen(false);
//       await loadPageData();
//     } catch (err) {
//       toast.error(
//         err instanceof Error ? err.message : "Failed to create planner event",
//       );
//     } finally {
//       setAddSubmitting(false);
//     }
//   };

//   const handleUpdate = async () => {
//     if (!activeEvent) return;
//     const parsed = new Date(editDate);
//     if (Number.isNaN(parsed.getTime())) {
//       toast.error("Invalid date format");
//       return;
//     }

//     try {
//       setEventSubmitting(true);
//       await PlannerAction.updatePlanner(activeEvent._id, standAloneId, {
//         plannerDate: parsed.toISOString(),
//       });
//       toast.success("Planner updated");
//       setEventOpen(false);
//       await loadPageData();
//     } catch (err) {
//       toast.error(
//         err instanceof Error ? err.message : "Failed to update planner",
//       );
//     } finally {
//       setEventSubmitting(false);
//     }
//   };

//   const handleRequestChange = async () => {
//     if (!activeEvent) return;
//     if (!reqReason.trim()) {
//       toast.error("Reason is required");
//       return;
//     }

//     const parsed = new Date(reqDate);
//     if (Number.isNaN(parsed.getTime())) {
//       toast.error("Invalid requested date");
//       return;
//     }

//     try {
//       setEventSubmitting(true);
//       await PlannerAction.requestChangePlannerDate(activeEvent._id, {
//         requestedDate: parsed.toISOString(),
//         requestedReason: reqReason.trim(),
//       });
//       toast.success("Change request submitted");
//       setEventOpen(false);
//       await loadPageData();
//     } catch (err) {
//       toast.error(
//         err instanceof Error ? err.message : "Failed to submit request",
//       );
//     } finally {
//       setEventSubmitting(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!activeEvent) return;
//     const ok = window.confirm("Delete this planner item?");
//     if (!ok) return;

//     try {
//       setEventSubmitting(true);
//       await PlannerAction.deletePlanner(activeEvent._id, standAloneId);
//       toast.success("Planner item deleted");
//       setEventOpen(false);
//       await loadPageData();
//     } catch (err) {
//       toast.error(
//         err instanceof Error ? err.message : "Failed to delete planner",
//       );
//     } finally {
//       setEventSubmitting(false);
//     }
//   };

//   const handleApprove = async (id: string) => {
//     try {
//       await PlannerAction.approvePlannerRequest(id);
//       toast.success("Request approved");
//       await loadPageData();
//     } catch (err) {
//       toast.error(
//         err instanceof Error ? err.message : "Failed to approve request",
//       );
//     }
//   };

//   const handleReject = async (id: string) => {
//     try {
//       await PlannerAction.rejectPlannerRequest(id);
//       toast.success("Request rejected");
//       await loadPageData();
//     } catch (err) {
//       toast.error(
//         err instanceof Error ? err.message : "Failed to reject request",
//       );
//     }
//   };

//   if (error) {
//     return (
//       <div className="container mx-auto max-w-6xl py-10">
//         <div className="flex h-64 items-center justify-center">
//           <p className="text-destructive">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   const monthLabel = currentMonth.toLocaleDateString("en-GB", {
//     month: "long",
//     year: "numeric",
//   });

//   return (
//     <>
//       <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
//         <div className="px-6 py-7">
//           <div className="mb-6 flex items-center justify-between">
//             <h1 className="text-3xl font-bold tracking-tight">
//               ISO Week Planner
//             </h1>
//             <div className="flex w-72 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
//               <Search size={14} className="text-slate-400" />
//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Search planner events..."
//                 className="w-full bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
//               />
//             </div>
//           </div>

//           <div className="mb-5 grid grid-cols-5 gap-3 overflow-hidden">
//             <div className="bg-[#5B8BF1] p-8 text-center">
//               <div className="text-4xl font-bold text-white">
//                 {stats.inspections}
//               </div>
//               <div className="mt-1 text-sm text-blue-100">Inspections</div>
//             </div>
//             <div className="bg-[#F6E2E1] p-8 text-center">
//               <div className="text-4xl font-bold text-orange-400">
//                 {stats.services}
//               </div>
//               <div className="mt-1 text-sm text-rose-300">Services</div>
//             </div>
//             <div className="bg-[#D8E6E9] p-8 text-center">
//               <div className="text-4xl font-bold text-green-800">
//                 {stats.mots}
//               </div>
//               <div className="mt-1 text-sm text-teal-500">MOTs</div>
//             </div>
//             <div className="bg-[#F5D7F3] p-8 text-center">
//               <div className="text-4xl font-bold text-red-700">
//                 {stats.brakeTests}
//               </div>
//               <div className="mt-1 text-sm text-purple-400">Brake Test</div>
//             </div>
//             <div className="bg-[#E5D4FE] p-8 text-center">
//               <div className="text-4xl font-bold text-purple-800">
//                 {stats.all}
//               </div>
//               <div className="mt-1 text-sm text-purple-400">All Events</div>
//             </div>
//           </div>

//           <div className="mb-5 flex flex-wrap items-center gap-3">
//             <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
//               <ChevronLeft
//                 size={14}
//                 className="cursor-pointer text-slate-500"
//                 onClick={() =>
//                   setCurrentMonth(
//                     (prev) =>
//                       new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
//                   )
//                 }
//               />
//               <span>{monthLabel}</span>
//               <ChevronRight
//                 size={14}
//                 className="cursor-pointer text-slate-500"
//                 onClick={() =>
//                   setCurrentMonth(
//                     (prev) =>
//                       new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
//                   )
//                 }
//               />
//               <ChevronDown size={13} className="ml-1 text-slate-500" />
//             </div>

//             <select
//               className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-4 text-sm text-slate-700 shadow-sm outline-none"
//               value={selectedVehicleId}
//               onChange={(e) => setSelectedVehicleId(e.target.value)}
//             >
//               <option value="ALL">All Vehicles</option>
//               {vehicles.map((v) => (
//                 <option key={v._id} value={v._id}>
//                   {v.licensePlate || v.vehicleRegId || v._id}
//                 </option>
//               ))}
//             </select>

//             <div className="ml-auto flex gap-2">
//               <button
//                 onClick={() => setAddOpen(true)}
//                 className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
//               >
//                 Add New Event
//               </button>
//               <button
//                 onClick={loadPageData}
//                 className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
//               >
//                 Refresh
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-[220px_1fr_300px] overflow-hidden rounded-xl bg-white shadow">
//             <div className="border-r border-slate-100">
//               <div className="flex items-center justify-between bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white">
//                 <span>{monthLabel.toUpperCase()}</span>
//                 <ChevronDown size={14} />
//               </div>
//               <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-xs font-bold tracking-wide text-slate-400 uppercase">
//                 <Truck size={14} />
//                 <span>Vehicles ({vehicles.length})</span>
//               </div>
//               {vehicles.map((v) => (
//                 <button
//                   key={v._id}
//                   onClick={() => setSelectedVehicleId(v._id)}
//                   className={`w-full border-l-[3px] px-4 py-3 text-left text-sm font-medium transition-colors ${
//                     selectedVehicleId === v._id
//                       ? "border-blue-500 bg-blue-50 text-blue-700"
//                       : "border-transparent text-slate-500 hover:bg-slate-50"
//                   }`}
//                 >
//                   {v.licensePlate || v.vehicleRegId || v._id}
//                 </button>
//               ))}
//             </div>

//             <div className="flex flex-col">
//               <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-slate-100 bg-slate-50 px-3 py-2">
//                 {[
//                   "ISO WEEK",
//                   "Mon",
//                   "Tue",
//                   "Wed",
//                   "Thu",
//                   "Fri",
//                   "Sat",
//                   "Sun",
//                 ].map((h) => (
//                   <div
//                     key={h}
//                     className="text-center text-[11px] font-bold tracking-wide text-slate-400 uppercase"
//                   >
//                     {h}
//                   </div>
//                 ))}
//               </div>

//               <div className="flex-1 divide-y divide-slate-50 px-3 pb-3">
//                 {isoWeeks.map(({ week, startDay }) => (
//                   <div
//                     key={week}
//                     className="grid grid-cols-[64px_repeat(7,1fr)] gap-1 py-1.5"
//                   >
//                     <div className="flex flex-col items-center justify-center rounded-md bg-slate-400 py-2 text-center text-[10px] leading-tight font-bold text-white">
//                       <span className="opacity-80">ISO</span>
//                       <span className="opacity-80">WEEK</span>
//                       <span className="text-xs">{week}</span>
//                     </div>

//                     {Array.from({ length: 7 }).map((_, col) => {
//                       const day = startDay + col;
//                       const overflow = day > daysInMonth;
//                       const eventRows = overflow
//                         ? []
//                         : dayRowsMap.get(day) || [];
//                       const topEvent = eventRows[0];

//                       if (!overflow && topEvent) {
//                         return (
//                           <button
//                             key={`${week}-${col}`}
//                             onClick={() => openEventModal(topEvent, day)}
//                             className={`flex min-h-13 cursor-pointer items-center justify-center rounded-md ${eventBg(
//                               plannerEventType(topEvent),
//                             )}`}
//                             title={`${eventRows.length} event(s) - click to manage`}
//                           >
//                             <GearIcon />
//                           </button>
//                         );
//                       }

//                       return (
//                         <button
//                           key={`${week}-${col}`}
//                           onClick={() => !overflow && setSelectedDay(day)}
//                           className={`flex min-h-13 items-start justify-start rounded-md p-1.5 text-xs font-medium ${
//                             overflow
//                               ? "cursor-default text-slate-300"
//                               : "text-blue-500 hover:bg-slate-50"
//                           }`}
//                         >
//                           {overflow ? day - daysInMonth : day}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 ))}
//               </div>

//               <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 px-5 py-3">
//                 {[
//                   { label: "Completed", cls: "bg-green-600" },
//                   { label: "Booked/Planned", cls: "bg-blue-400" },
//                   { label: "In Progress", cls: "bg-orange-500" },
//                   { label: "Overdue", cls: "bg-pink-500" },
//                 ].map((l) => (
//                   <div
//                     key={l.label}
//                     className="flex items-center gap-1.5 text-xs text-slate-500"
//                   >
//                     <div className={`h-3 w-3 rounded-sm ${l.cls}`} />
//                     {l.label}
//                   </div>
//                 ))}
//                 {["Defect", "Repair", "Service", "MOT"].map((l) => (
//                   <div
//                     key={l}
//                     className="flex items-center gap-1.5 text-xs text-slate-500"
//                   >
//                     <Settings2 size={12} className="text-slate-400" />
//                     {l}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="border-l border-slate-100">
//               <div className="flex items-center justify-between bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white">
//                 <span>{monthLabel.toUpperCase()}</span>
//                 <ChevronDown size={14} />
//               </div>

//               <div className="p-4">
//                 <p className="mb-3 text-sm font-bold text-slate-700">
//                   {selectedDay
//                     ? `Events on ${selectedDay}/${currentMonth.getMonth() + 1}`
//                     : "Upcoming"}
//                 </p>

//                 {loading ? (
//                   <p className="text-xs text-slate-500">
//                     Loading planner events...
//                   </p>
//                 ) : selectedDayRows.length === 0 ? (
//                   <p className="text-xs text-slate-500">
//                     No planner events for selected day.
//                   </p>
//                 ) : (
//                   selectedDayRows.map((row) => {
//                     const vId = getVehicleId(row.vehicleId);
//                     const vehicleName =
//                       vehicleMap.get(vId) || "Unknown vehicle";

//                     return (
//                       <button
//                         key={row._id}
//                         onClick={() =>
//                           openEventModal(
//                             row,
//                             selectedDay || new Date(row.plannerDate).getDate(),
//                           )
//                         }
//                         className="mb-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left hover:bg-slate-50"
//                       >
//                         <p className="text-xs font-semibold text-slate-800">
//                           {labelForPlannerType(row.plannerType)} - {vehicleName}
//                         </p>
//                         <p className="text-[11px] text-slate-500">
//                           {asDisplayDate(row.plannerDate)}
//                         </p>
//                       </button>
//                     );
//                   })
//                 )}

//                 {!isStandaloneUser &&
//                   requestedRows.some(
//                     (r) => r.requestStatus === RequestStatus.PENDING,
//                   ) && (
//                     <>
//                       <p className="mt-5 mb-2 text-sm font-bold text-slate-700">
//                         Pending Requests
//                       </p>
//                       {requestedRows
//                         .filter(
//                           (r) => r.requestStatus === RequestStatus.PENDING,
//                         )
//                         .slice(0, 4)
//                         .map((row) => (
//                           <div
//                             key={row._id}
//                             className="mb-2 rounded-lg bg-amber-50 px-3 py-2.5"
//                           >
//                             <p className="text-xs font-semibold text-slate-800">
//                               {labelForPlannerType(row.plannerType)}
//                             </p>
//                             <p className="text-[11px] text-slate-600">
//                               {asDisplayDate(row.plannerDate)} to{" "}
//                               {asDisplayDate(row.requestedDate)}
//                             </p>
//                             <div className="mt-2 flex gap-2">
//                               <button
//                                 onClick={() => handleApprove(row._id)}
//                                 className="rounded-md bg-green-600 px-2 py-1 text-[11px] text-white hover:bg-green-700"
//                               >
//                                 Approve
//                               </button>
//                               <button
//                                 onClick={() => handleReject(row._id)}
//                                 className="rounded-md bg-rose-600 px-2 py-1 text-[11px] text-white hover:bg-rose-700"
//                               >
//                                 Reject
//                               </button>
//                             </div>
//                           </div>
//                         ))}
//                     </>
//                   )}

//                 <div className="mt-4 rounded-lg border border-red-300 p-3 text-xs leading-relaxed text-slate-600">
//                   Monitor and manage all due inspections, MOTs, repairs, and
//                   service alerts. Use this planner daily to keep every vehicle
//                   compliant and on schedule.
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Dialog open={addOpen} onOpenChange={setAddOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Add Planner Event</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-3">
//             <div>
//               <label className="mb-1 block text-xs font-semibold text-slate-600">
//                 Vehicle
//               </label>
//               <select
//                 className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
//                 value={newVehicleId}
//                 onChange={(e) => setNewVehicleId(e.target.value)}
//               >
//                 {vehicles.map((v) => (
//                   <option key={v._id} value={v._id}>
//                     {v.licensePlate || v.vehicleRegId || v._id}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="mb-1 block text-xs font-semibold text-slate-600">
//                 Planner Type
//               </label>
//               <select
//                 className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
//                 value={addPlannerType}
//                 onChange={(e) =>
//                   setAddPlannerType(e.target.value as PlannerType)
//                 }
//               >
//                 {Object.values(PlannerType).map((type) => (
//                   <option key={type} value={type}>
//                     {labelForPlannerType(type)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="mb-1 block text-xs font-semibold text-slate-600">
//                 Planner Date
//               </label>
//               <input
//                 type="date"
//                 className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
//                 value={addPlannerDate}
//                 onChange={(e) => setAddPlannerDate(e.target.value)}
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <button
//               onClick={() => setAddOpen(false)}
//               className="rounded-md border border-slate-300 px-3 py-2 text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleCreate}
//               disabled={addSubmitting}
//               className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
//             >
//               {addSubmitting ? "Saving..." : "Create"}
//             </button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={eventOpen} onOpenChange={setEventOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Manage Planner Event</DialogTitle>
//           </DialogHeader>

//           {activeEvent && (
//             <div className="space-y-3">
//               <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
//                 <p className="font-semibold">
//                   {labelForPlannerType(activeEvent.plannerType)}
//                 </p>
//                 <p>
//                   Vehicle:{" "}
//                   {vehicleMap.get(getVehicleId(activeEvent.vehicleId)) ||
//                     "Unknown"}
//                 </p>
//                 <p>Current Date: {asDisplayDate(activeEvent.plannerDate)}</p>
//               </div>

//               <div>
//                 <label className="mb-1 block text-xs font-semibold text-slate-600">
//                   Edit Date
//                 </label>
//                 <input
//                   type="date"
//                   className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
//                   value={editDate}
//                   onChange={(e) => setEditDate(e.target.value)}
//                 />
//               </div>

//               {isStandaloneUser && (
//                 <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3">
//                   <p className="text-xs font-semibold text-amber-800">
//                     Request Date Change
//                   </p>
//                   <input
//                     type="date"
//                     className="w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm outline-none"
//                     value={reqDate}
//                     onChange={(e) => setReqDate(e.target.value)}
//                   />
//                   <textarea
//                     className="w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm outline-none"
//                     placeholder="Reason"
//                     value={reqReason}
//                     onChange={(e) => setReqReason(e.target.value)}
//                   />
//                 </div>
//               )}
//             </div>
//           )}

//           <DialogFooter className="justify-between!">
//             <button
//               onClick={handleDelete}
//               disabled={eventSubmitting}
//               className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
//             >
//               Delete
//             </button>

//             <div className="flex gap-2">
//               {isStandaloneUser && (
//                 <button
//                   onClick={handleRequestChange}
//                   disabled={eventSubmitting}
//                   className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
//                 >
//                   Request
//                 </button>
//               )}
//               <button
//                 onClick={handleUpdate}
//                 disabled={eventSubmitting}
//                 className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
//               >
//                 Save
//               </button>
//             </div>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

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
  const [newPlannerDate, setNewPlannerDate] = useState(asInputDate(new Date()));

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
        setSelectedVehicleId((prev) =>
          prev === "ALL" ? loadedVehicles[0]._id : prev,
        );
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
      setNewPlannerDate(asInputDate(date));
    }

    setAddOpen(true);
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

    if (!newPlannerDate) {
      toast.error("Planner date is required");
      return;
    }

    const parsed = new Date(newPlannerDate);
    if (Number.isNaN(parsed.getTime())) {
      toast.error("Invalid date format");
      return;
    }

    try {
      setAddSubmitting(true);
      await PlannerAction.createPlanner({
        vehicleId,
        plannerType: newPlannerType,
        plannerDate: parsed.toISOString(),
        standAloneId,
      });
      toast.success("Planner event created successfully");
      setAddOpen(false);
      await loadPageData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create planner event",
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
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 font-sans">
        <div className="px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                  Vehicle Maintenance Planner
                </h1>
                <p className="mt-2 text-slate-600">
                  Schedule and manage inspections, services, MOTs, and brake
                  tests
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events..."
                    className="w-80 rounded-lg border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <button
                  onClick={loadPageData}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 transition-all hover:bg-slate-50"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-5 gap-4">
            {[
              {
                label: "Inspections",
                value: stats.inspections,
                color: "blue",
                icon: Search,
              },
              {
                label: "Services",
                value: stats.services,
                color: "orange",
                icon: Wrench,
              },
              {
                label: "MOTs",
                value: stats.mots,
                color: "green",
                icon: Shield,
              },
              {
                label: "Brake Tests",
                value: stats.brakeTests,
                color: "purple",
                icon: Activity,
              },
              {
                label: "Total Events",
                value: stats.all,
                color: "slate",
                icon: Calendar,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`group overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`rounded-lg bg-${stat.color}-50 p-3`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </div>
                <div
                  className={`h-1 bg-${stat.color}-500 transition-all group-hover:h-1.5`}
                />
              </div>
            ))}
          </div>

          {/* Main 3-Column Layout */}
          <div className="grid grid-cols-[280px_1fr_320px] gap-6">
            {/* LEFT SIDEBAR - Vehicle Selection */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="bg-linear-to-r from-slate-800 to-slate-900 px-5 py-4">
                <div className="flex items-center gap-2 text-white">
                  <Truck size={18} />
                  <h2 className="font-semibold">Vehicles</h2>
                  <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    {vehicles.length}
                  </span>
                </div>
              </div>

              <div className="max-h-150 overflow-y-auto">
                {loading && vehicles.length === 0 ? (
                  <div className="px-5 py-4 text-sm text-slate-500">
                    Loading vehicles...
                  </div>
                ) : null}

                <button
                  onClick={() => setSelectedVehicleId("ALL")}
                  className={`w-full border-l-4 px-5 py-3 text-left transition-all ${
                    selectedVehicleId === "ALL"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
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
                        ? "border-blue-500 bg-blue-50 text-blue-700"
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
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              {/* Calendar Header */}
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex items-center justify-between">
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
                    day.type === "current" ? dayRowsMap.get(day.day) || [] : [];
                  const hasEvents = events.length > 0;
                  const isSelected =
                    day.type === "current" && selectedDay === day.day;
                  const isToday =
                    day.type === "current" &&
                    day.day === new Date().getDate() &&
                    currentMonth.getMonth() === new Date().getMonth() &&
                    currentMonth.getFullYear() === new Date().getFullYear();

                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        day.type === "current" && setSelectedDay(day.day)
                      }
                      className={`relative min-h-25 border-r border-b border-slate-100 p-2 transition-all hover:bg-slate-50 ${
                        day.type !== "current"
                          ? "bg-slate-50/50 text-slate-400"
                          : ""
                      } ${isSelected ? "ring-2 ring-blue-500 ring-inset" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                            isToday ? "bg-blue-600 text-white" : ""
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
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="bg-linear-to-r from-slate-800 to-slate-900 px-5 py-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <h2 className="font-semibold">
                      {selectedDay
                        ? `${selectedDay} ${monthLabel}`
                        : "Select a Day"}
                    </h2>
                  </div>
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

              <div className="max-h-150 overflow-y-auto p-4">
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
                      className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
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
              Add a planner event by selecting a vehicle, type, and date.
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
              <input
                type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={newPlannerDate}
                onChange={(e) => setNewPlannerDate(e.target.value)}
              />
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
