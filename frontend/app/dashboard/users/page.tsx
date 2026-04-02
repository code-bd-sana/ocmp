"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import UsersHeader from "@/components/dashboard/users/UsersHeader";
import ClientsTable, {
  ClientTableRow,
  toTableRows,
} from "@/components/dashboard/users/ClientsTable";
import AddClientModal from "@/components/dashboard/users/AddClientModal";

import { ClientAction } from "@/service/client";
import { CreateClientInput } from "@/lib/clients/client.types";
import { TransportManagerAction } from "@/service/transport-manager";
import { JoinRequest } from "@/lib/transport-manager/transport-manager-request.types";
import { Button } from "@/components/ui/button";
import { LeaveRequestItem } from "@/service/transport-manager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function UsersPage() {
  const [rows, setRows] = useState<ClientTableRow[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingLeave, setLoadingLeave] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null,
  );
  const [processingLeaveClientId, setProcessingLeaveClientId] = useState<
    string | null
  >(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientTableRow | null>(
    null,
  );
  const [removingClientId, setRemovingClientId] = useState<string | null>(null);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Fetch clients ----------
  const fetchClients = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const res = await ClientAction.getClients({
        searchKey: search || undefined,
      });
      if (res.status && res.data) {
        const approvedOnly = (res.data.data || []).filter(
          (row) => (row.status || "").toUpperCase() === "APPROVED",
        );
        setRows(toTableRows(approvedOnly));
      } else {
        setError(res.message || "Failed to load clients");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- Fetch pending join requests ----------
  const fetchPendingRequests = useCallback(async (search?: string) => {
    try {
      setLoadingPending(true);
      const res = await TransportManagerAction.getPendingJoinRequests({
        searchKey: search || undefined,
        showPerPage: 100,
      });

      if (res.status && res.data) {
        setPendingRequests(res.data.data || []);
      } else {
        toast.error(res.message || "Failed to load pending requests");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load pending requests",
      );
    } finally {
      setLoadingPending(false);
    }
  }, []);

  // ---------- Fetch leave requests ----------
  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoadingLeave(true);
      const res = await TransportManagerAction.getLeaveRequests();

      if (res.status && res.data) {
        setLeaveRequests(res.data || []);
      } else {
        toast.error(res.message || "Failed to load leave requests");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load leave requests",
      );
    } finally {
      setLoadingLeave(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchClients();
    fetchPendingRequests();
    fetchLeaveRequests();
  }, [fetchClients, fetchPendingRequests, fetchLeaveRequests]);

  // Debounced search — calls API with searchKey
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchClients(value);
      fetchPendingRequests(value);
    }, 400);
  };

  const handleLeaveRequestDecision = async (
    request: LeaveRequestItem,
    action: "accept" | "reject",
  ) => {
    try {
      setProcessingLeaveClientId(request.clientId);
      const res = await TransportManagerAction.respondToLeaveRequest(
        request.clientId,
        action,
      );

      if (res.status) {
        toast.success(
          action === "accept"
            ? `${request.client.fullName} has been removed from your team`
            : `${request.client.fullName} stays in your team`,
        );
        setLeaveRequests((prev) =>
          prev.filter((item) => item.clientId !== request.clientId),
        );
        fetchClients(searchQuery);
      } else {
        toast.error(res.message || "Failed to process leave request");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to process leave request",
      );
    } finally {
      setProcessingLeaveClientId(null);
    }
  };

  const openRemoveDialog = (client: ClientTableRow) => {
    setSelectedClient(client);
    setRemoveReason("");
    setRemoveDialogOpen(true);
  };

  const handleSubmitRemoveRequest = async () => {
    const reason = removeReason.trim();
    if (!selectedClient) return;

    if (!reason) {
      toast.error("Please provide a reason for removal");
      return;
    }

    try {
      setRemovingClientId(selectedClient._id);
      const res = await TransportManagerAction.requestRemoveClient(
        selectedClient._id,
        reason,
      );

      if (res.status) {
        toast.success(
          `Removal request sent to ${selectedClient.fullName}. Email notification will be handled by backend.`,
        );
        setRemoveDialogOpen(false);
        setSelectedClient(null);
        setRemoveReason("");
        fetchClients(searchQuery);
      } else {
        toast.error(res.message || "Failed to submit remove request");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit remove request",
      );
    } finally {
      setRemovingClientId(null);
    }
  };

  const handleRespondRequest = async (
    request: JoinRequest,
    action: "APPROVED" | "REJECTED",
  ) => {
    try {
      setProcessingRequestId(request._id);
      const res = await TransportManagerAction.respondToJoinRequest(
        request.clientId,
        action,
      );

      if (res.status) {
        toast.success(
          action === "APPROVED"
            ? `${request.client.fullName} approved successfully`
            : `${request.client.fullName} request rejected`,
        );
        setPendingRequests((prev) => prev.filter((r) => r._id !== request._id));
        if (action === "APPROVED") {
          fetchClients(searchQuery);
        }
      } else {
        toast.error(res.message || "Failed to process request");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to process request",
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  // ---------- Create client ----------
  const handleCreateClient = async (data: CreateClientInput) => {
    setCreating(true);
    try {
      const res = await ClientAction.createClient(data);
      if (res.status) {
        toast.success(res.message || "Client created successfully");
        setModalOpen(false);
        fetchClients(searchQuery); // Refresh list
      } else {
        toast.error(res.message || "Failed to create client");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create client",
      );
    } finally {
      setCreating(false);
    }
  };

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

  // ---------- Loading state ----------
  if (loading && rows.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <UsersHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <ClientsTable
        data={rows}
        onAddClient={() => setModalOpen(true)}
        onRequestRemove={openRemoveDialog}
        removingClientId={removingClientId}
      />

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Client Removal</DialogTitle>
            <DialogDescription>
              Provide a reason. This request will be sent to the standalone user
              for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Client: {selectedClient?.fullName || "N/A"}
            </p>
            <Textarea
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              placeholder="Enter reason for removal"
              className="min-h-28"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitRemoveRequest}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pending Join Requests */}
      <div className="mt-6 mb-8 rounded-md border p-4">
        <h2 className="text-lg font-semibold">Pending Join Requests</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Accept or reject users requesting to join your team.
        </p>

        {loadingPending ? (
          <p className="text-muted-foreground">Loading pending requests...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-muted-foreground">No pending requests.</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={`${request._id || request.clientId}-${request.requestedAt}`}
                className="bg-muted/30 flex flex-col gap-3 rounded border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{request.client.fullName}</p>
                  <p className="text-muted-foreground text-sm">
                    {request.client.email}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Requested on{" "}
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRespondRequest(request, "APPROVED")}
                    disabled={processingRequestId === request._id}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespondRequest(request, "REJECTED")}
                    disabled={processingRequestId === request._id}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Leave Requests */}
      <div className="mt-6 mb-8 rounded-md border p-4">
        <h2 className="text-lg font-semibold">Standalone Remove Requests</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          These standalone users requested to remove you as their manager.
          Accept to remove them, reject to keep them assigned.
        </p>

        {loadingLeave ? (
          <p className="text-muted-foreground">Loading leave requests...</p>
        ) : leaveRequests.length === 0 ? (
          <p className="text-muted-foreground">No remove requests.</p>
        ) : (
          <div className="space-y-3">
            {leaveRequests.map((request) => (
              <div
                key={`${request.clientId}-${request.requestedAt || "pending"}`}
                className="bg-muted/30 flex flex-col gap-3 rounded border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{request.client.fullName}</p>
                  <p className="text-muted-foreground text-sm">
                    {request.client.email}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Requested on{" "}
                    {request.requestedAt
                      ? new Date(request.requestedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleLeaveRequestDecision(request, "accept")
                    }
                    disabled={processingLeaveClientId === request.clientId}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleLeaveRequestDecision(request, "reject")
                    }
                    disabled={processingLeaveClientId === request.clientId}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddClientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleCreateClient}
        loading={creating}
      />
    </div>
  );
}
