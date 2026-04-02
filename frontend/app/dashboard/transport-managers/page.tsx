"use client";

import TransportManagerTable, {
  toTableRows,
  TransportManagerTableRow,
} from "@/components/dashboard/users/TransportManagerTable";
import UsersHeader from "@/components/dashboard/users/UsersHeader";
import { TransportManagerAction } from "@/service/transport-manager";
import { UserAction } from "@/service/user";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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

    const intervalId = window.setInterval(() => {
      void syncMyManager();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [normalizedStatus, syncMyManager]);

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

  // ---------- Loading state ----------
  if (managerLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // ---------- Error state ----------
  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      {myManager ? (
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">
            Requested Transport Manager
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {myManager.manager?.fullName}
            </p>
            <p>
              <strong>Email:</strong> {myManager.manager?.email || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {myManager.clientStatus}
            </p>
            <p>
              <strong>Requested At:</strong>{" "}
              {myManager.requestedAt
                ? new Date(myManager.requestedAt).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong>Approved At:</strong>{" "}
              {myManager.approvedAt
                ? new Date(myManager.approvedAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          {normalizedStatus === "remove_requested" && (
            <div className="mt-4 space-y-3 rounded border border-orange-200 bg-orange-50 p-3">
              <p className="text-sm font-medium text-orange-800">
                Your manager requested removal. Accept to remove this
                assignment, or reject to keep it.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleRespondRemoveRequest("accept")}
                  disabled={respondingRemoveRequest}
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRespondRemoveRequest("reject")}
                  disabled={respondingRemoveRequest}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}

          {normalizedStatus === "leave_requested" && (
            <p className="mt-4 text-sm text-amber-700">
              Your remove request is pending manager approval.
            </p>
          )}

          <button
            onClick={handleRemoveClient}
            disabled={normalizedStatus === "leave_requested"}
            className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {normalizedStatus === "pending"
              ? "Cancel Request"
              : normalizedStatus === "leave_requested"
                ? "Removal Requested"
                : "Remove Manager"}
          </button>
        </div>
      ) : (
        <>
          <UsersHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />

          {loading && rows.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">
                Loading transport managers...
              </p>
            </div>
          ) : (
            <TransportManagerTable
              data={rows}
              onRequestJoinTeam={handleRequestJoinTeam}
            />
          )}
        </>
      )}

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Manager Removal</DialogTitle>
            <DialogDescription>
              Provide a reason. This request will be sent to your transport
              manager for approval.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={removeReason}
            onChange={(e) => setRemoveReason(e.target.value)}
            placeholder="Enter reason for removal"
            className="min-h-28"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitLeaveRequest}>
              {submittingRemoveReason ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransportManagerpage;
