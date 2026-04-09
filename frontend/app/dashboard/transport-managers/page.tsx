"use client";

import TransportManagerTable, {
  toTableRows,
  TransportManagerTableRow,
} from "@/components/dashboard/users/TransportManagerTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { TransportManagerAction } from "@/service/transport-manager";
import { UserAction } from "@/service/user";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  Search,
  Shield,
  Sparkles,
  UserRound,
  Users,
  XCircle
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface MyManagerData {
  manager: {
    _id: string;
    fullName: string;
    email?: string;
  };
  clientStatus: string;
  requestedAt?: string;
  approvedAt?: string;
}

const TransportManagerpage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState<TransportManagerTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myManager, setMyManager] = useState<MyManagerData | null>(null);
  const [managerLoading, setManagerLoading] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState("");
  const [submittingRemoveReason, setSubmittingRemoveReason] = useState(false);
  const [respondingRemoveRequest, setRespondingRemoveRequest] = useState(false);

  const normalizedStatus = (myManager?.clientStatus || "").toLowerCase();

  const syncMyManager = useCallback(async () => {
    try {
      setManagerLoading(true);
      const res = await TransportManagerAction.myManager();

      if (res.status) {
        const manager = res.data;
        if (manager?.manager?._id) {
          const nextState: MyManagerData = {
            manager: {
              _id: manager.manager._id,
              fullName: manager.manager.fullName,
              email: manager.manager.email,
            },
            clientStatus: manager.clientStatus || "PENDING",
            requestedAt: manager.requestedAt,
            approvedAt: manager.approvedAt,
          };
          setMyManager(nextState);
          window.localStorage.setItem(
            "standalone_manager_state",
            JSON.stringify(nextState),
          );
          return;
        }
      }

      setMyManager(null);
      window.localStorage.removeItem("standalone_manager_state");
    } catch {
      // Keep the cached state until the backend can be reached again.
    } finally {
      setManagerLoading(false);
    }
  }, []);

  // ---------- Fetch transport managers ----------
  const fetchTransportManager = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const res = await TransportManagerAction.getManagersList({
        searchKey: search || undefined,
        showPerPage: 100,
      });

      if (res.status && res.data) {
        setRows(toTableRows(res.data.data));
      } else {
        setError(res.message || "Failed to load transport managers");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transport managers",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore locally saved pending/assigned manager state to avoid noisy 404 on first load.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("standalone_manager_state");
      if (raw) {
        const parsed = JSON.parse(raw) as MyManagerData;
        if (parsed?.manager?._id) {
          setMyManager(parsed);
        }
      }
    } catch {
      // ignore localStorage parsing errors
    }
  }, []);

  useEffect(() => {
    void syncMyManager();
  }, [syncMyManager]);

  useEffect(() => {
    if (!myManager) {
      void fetchTransportManager();
    }
  }, [myManager, fetchTransportManager]);

  useEffect(() => {
    const handleFocus = () => {
      void syncMyManager();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [syncMyManager]);

  useEffect(() => {
    if (
      !["pending", "leave_requested", "remove_requested"].includes(
        normalizedStatus,
      )
    ) {
      return;
    }
  }, [normalizedStatus]);

  // Debounced search — calls API with searchKey
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    fetchTransportManager(value);
  };

  // ---------- Handle Request Join Team ----------
  const handleRequestJoinTeam = async (managerId: string) => {
    try {
      const res = await TransportManagerAction.sendJoinRequest(managerId);
      if (res.status) {
        toast.success(res.message || "Request sent successfully");
        const selectedManager = rows.find((row) => row._id === managerId);
        const nextState: MyManagerData = {
          manager: {
            _id: managerId,
            fullName: selectedManager?.fullName || "Transport Manager",
          },
          clientStatus: "PENDING",
          requestedAt: new Date().toISOString(),
        };
        setMyManager(nextState);
        window.localStorage.setItem(
          "standalone_manager_state",
          JSON.stringify(nextState),
        );
      } else {
        toast.error(res.message || "Failed to send request");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send request",
      );
    }
  };

  // ---------- Handle Remove Client ----------
  const handleRemoveClient = async () => {
    if (!myManager) return;

    if (normalizedStatus === "approved") {
      setRemoveReason("");
      setRemoveDialogOpen(true);
      return;
    }

    try {
      const profile = await UserAction.getProfile();
      if (!profile.data?._id) {
        toast.error("Unable to identify current user");
        return;
      }

      const res = await TransportManagerAction.cancelJoinRequest(
        profile.data._id,
      );
      if (res.status) {
        toast.success("Request cancelled successfully");
        setMyManager(null);
        window.localStorage.removeItem("standalone_manager_state");
        fetchTransportManager(); // Now show the list
      } else {
        toast.error(res.message || "Failed to remove");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    }
  };

  const handleSubmitLeaveRequest = async () => {
    const reason = removeReason.trim();
    if (!reason) {
      toast.error("Please provide a reason for removal");
      return;
    }

    try {
      setSubmittingRemoveReason(true);
      const res = await TransportManagerAction.requestLeaveManager(reason);

      if (res.status) {
        toast.success(
          "Remove request sent to your transport manager. Email notification will be handled by backend.",
        );
        setRemoveDialogOpen(false);
        setRemoveReason("");
        setMyManager((prev) =>
          prev
            ? {
                ...prev,
                clientStatus: "leave_requested",
              }
            : prev,
        );
      } else {
        toast.error(res.message || "Failed to send remove request");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send remove request",
      );
    } finally {
      setSubmittingRemoveReason(false);
    }
  };

  const handleRespondRemoveRequest = async (action: "accept" | "reject") => {
    try {
      setRespondingRemoveRequest(true);
      const res = await TransportManagerAction.respondToRemoveRequest(action);

      if (res.status) {
        toast.success(
          action === "accept"
            ? "Removal accepted. Manager has been removed."
            : "Removal request rejected. Assignment remains active.",
        );
        await syncMyManager();
        if (action === "accept") {
          fetchTransportManager(searchQuery);
        }
      } else {
        toast.error(res.message || "Failed to process remove request");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to process remove request",
      );
    } finally {
      setRespondingRemoveRequest(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "approved":
        return { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Approved" };
      case "pending":
        return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Pending" };
      case "leave_requested":
        return { icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", label: "Leave Requested" };
      case "remove_requested":
        return { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", label: "Removal Requested" };
      default:
        return { icon: Clock, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: status };
    }
  };

  // ---------- Loading state ----------
  if (managerLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-slate-500 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Error state ----------
  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="rounded-full bg-rose-100 p-4 mb-4">
              <AlertCircle className="h-12 w-12 text-rose-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Something went wrong</h3>
            <p className="mt-2 text-slate-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white  transition-all hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto max-w-5xl px-4 py-8 lg:py-12">
        {/* Hero Section */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-linear-to-r from-primary via-primary/90 to-primary/80 p-8  lg:p-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-sm mb-4">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Transport Management</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
              Transport Managers
            </h1>
            <p className="mt-2 max-w-2xl text-white/80">
              {myManager
                ? "Manage your connection with your transport manager"
                : "Connect with professional transport managers to optimize your logistics"}
            </p>
          </div>
        </div>

        {myManager ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm">
              <div className="border-b border-slate-100 bg-linear-to-r from-slate-50/50 to-white/50 px-6 py-5 lg:px-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <UserRound className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Your Transport Manager</h2>
                    <p className="text-sm text-slate-500">Active collaboration details</p>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Manager Info Card */}
                  <div className="rounded-2xl bg-linear-to-br from-primary/5 to-primary/2 p-6">
                    <div className="mb-4 flex items-center gap-2 text-primary">
                      <Building2 className="h-5 w-5" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Manager Details</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <UserRound className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Full Name</p>
                          <p className="font-semibold text-slate-800">{myManager.manager?.fullName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Email Address</p>
                          <p className="font-medium text-slate-700">{myManager.manager?.email || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Card */}
                  <div className="rounded-2xl bg-linear-to-br from-slate-50 to-white p-6">
                    <div className="mb-4 flex items-center gap-2 text-slate-600">
                      <Shield className="h-5 w-5" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Collaboration Status</span>
                    </div>
                    <div className="space-y-4">
                      {(() => {
                        const statusConfig = getStatusConfig(myManager.clientStatus);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <div className={`flex items-center gap-3 rounded-xl ${statusConfig.bg} p-3 border ${statusConfig.border}`}>
                            <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                            <div>
                              <p className="text-xs text-slate-500">Current Status</p>
                              <p className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
                            </div>
                          </div>
                        );
                      })()}
                      
                      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                        <CalendarDays className="h-5 w-5 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Requested On</p>
                          <p className="font-medium text-slate-700">
                            {myManager.requestedAt
                              ? new Date(myManager.requestedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      
                      {myManager.approvedAt && (
                        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 border border-emerald-100">
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="text-xs text-emerald-600">Approved On</p>
                            <p className="font-medium text-emerald-700">
                              {new Date(myManager.approvedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-4">
                  {normalizedStatus === "remove_requested" && (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-5">
                      <p className="mb-4 text-sm font-medium text-orange-800">
                        Your manager has requested removal. Please respond to this request.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleRespondRemoveRequest("accept")}
                          disabled={respondingRemoveRequest}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          {respondingRemoveRequest ? "Processing..." : "Accept Removal"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRespondRemoveRequest("reject")}
                          disabled={respondingRemoveRequest}
                          className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                          Reject & Keep
                        </Button>
                      </div>
                    </div>
                  )}

                  {normalizedStatus === "leave_requested" && (
                    <div className="rounded-2xl bg-amber-50/80 p-5 border border-amber-200">
                      <p className="flex items-center gap-2 text-sm text-amber-700">
                        <Clock className="h-4 w-4" />
                        Your removal request is pending manager approval.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleRemoveClient}
                    disabled={normalizedStatus === "leave_requested"}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r bg-[#044192] px-6 py-3 text-sm font-semibold text-white shadow-blue-500/20 transition-all   disabled:cursor-not-allowed disabled:opacity-50 "
                  >
                    {normalizedStatus === "pending" ? (
                      <>
                        <XCircle className="h-4 w-4" />
                        Cancel Request
                      </>
                    ) : normalizedStatus === "leave_requested" ? (
                      <>
                        <Clock className="h-4 w-4" />
                        Removal Requested
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        Request Removal
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm">
              <div className="border-b border-slate-100 bg-linear-to-r from-slate-50/50 to-white/50 px-6 py-5 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Available Managers</h2>
                      <p className="text-sm text-slate-500">Browse and connect with transport managers</p>
                    </div>
                  </div>
                  <div className="relative w-full sm:w-80">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                {loading && rows.length === 0 ? (
                  <div className="flex min-h-100 flex-col items-center justify-center">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                    </div>
                    <p className="mt-4 text-slate-500 font-medium">Loading transport managers...</p>
                  </div>
                ) : rows.length === 0 ? (
                  <div className="flex min-h-100 flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-slate-100 p-6 mb-4">
                      <Users className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">No managers found</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {searchQuery ? "Try adjusting your search terms" : "No transport managers are currently available"}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          fetchTransportManager();
                        }}
                        className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        Showing <span className="font-semibold text-slate-700">{rows.length}</span> available managers
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-slate-500">Active now</span>
                      </div>
                    </div>
                    <TransportManagerTable
                      data={rows}
                      onRequestJoinTeam={handleRequestJoinTeam}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Remove Request Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="rounded-2xl border-slate-200 ">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-rose-100 p-2">
                <AlertCircle className="h-5 w-5 text-rose-500" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-800">Request Manager Removal</DialogTitle>
            </div>
            <DialogDescription className="text-slate-500">
              Please provide a reason for requesting removal. This will be sent to your transport manager for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              placeholder="Enter the reason for removal..."
              className="min-h-32 rounded-xl border-slate-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
              className="rounded-xl border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitLeaveRequest}
              disabled={submittingRemoveReason}
              className="rounded-xl bg-linear-to-r from-rose-500 to-rose-600 text-white  shadow-rose-500/20 hover:from-rose-600 hover:to-rose-700"
            >
              {submittingRemoveReason ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransportManagerpage;