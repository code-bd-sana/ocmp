"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TransportManagerAction } from "@/service/transport-manager";
import { JoinRequest } from "@/lib/transport-manager/transport-manager-request.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  XCircle,
  Search,
} from "lucide-react";
import { ClientAction } from "@/service/client";
import { ClientRow } from "@/lib/clients/client.types";

export default function PendingRequestsTab() {
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [searchPendingQuery, setSearchPendingQuery] = useState("");
  const [searchClientsQuery, setSearchClientsQuery] = useState("");
  const [filteredRequests, setFilteredRequests] = useState<JoinRequest[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientRow[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "clients">("pending");

  // Load pending requests
  const loadPendingRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const res = await TransportManagerAction.getPendingJoinRequests({
        showPerPage: 100,
      });

      if (res.status && res.data) {
        const pending = res.data.data || [];
        setPendingRequests(pending);
        setFilteredRequests(pending);
      } else {
        toast.error("Failed to load pending requests");
      }
    } catch (error) {
      console.error("Error loading pending requests:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load pending requests",
      );
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  // Load current clients
  const loadClients = useCallback(async () => {
    try {
      setLoadingClients(true);
      const res = await ClientAction.getClients({
        showPerPage: 100,
      });

      if (res.status && res.data) {
        const clientList = res.data.data || [];
        setClients(clientList);
        setFilteredClients(clientList);
      } else {
        toast.error("Failed to load clients");
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load clients",
      );
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    loadPendingRequests();
    loadClients();
  }, [loadPendingRequests, loadClients]);

  // Filter pending requests by search
  useEffect(() => {
    if (searchPendingQuery.trim() === "") {
      setFilteredRequests(pendingRequests);
    } else {
      const query = searchPendingQuery.toLowerCase();
      const filtered = pendingRequests.filter(
        (req) =>
          req.client?.fullName.toLowerCase().includes(query) ||
          req.client?.email.toLowerCase().includes(query),
      );
      setFilteredRequests(filtered);
    }
  }, [searchPendingQuery, pendingRequests]);

  // Filter clients by search
  useEffect(() => {
    if (searchClientsQuery.trim() === "") {
      setFilteredClients(clients);
    } else {
      const query = searchClientsQuery.toLowerCase();
      const filtered = clients.filter(
        (client) =>
          client.client?.fullName.toLowerCase().includes(query) ||
          client.client?.email.toLowerCase().includes(query),
      );
      setFilteredClients(filtered);
    }
  }, [searchClientsQuery, clients]);

  // Handle approve request
  const handleApproveRequest = async (request: JoinRequest) => {
    try {
      setRespondingTo(request._id);
      const res = await TransportManagerAction.respondToJoinRequest(
        request.clientId,
        "APPROVED",
      );

      if (res.status) {
        toast.success(`${request.client?.fullName} approved successfully!`);
        // Remove from pending list
        setPendingRequests((prev) => prev.filter((r) => r._id !== request._id));
        // Refresh clients list
        await loadClients();
      } else {
        toast.error(res.message || "Failed to approve request");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve request",
      );
    } finally {
      setRespondingTo(null);
    }
  };

  // Handle reject request
  const handleRejectRequest = async (request: JoinRequest) => {
    try {
      setRespondingTo(request._id);
      const res = await TransportManagerAction.respondToJoinRequest(
        request.clientId,
        "REJECTED",
      );

      if (res.status) {
        toast.success(`${request.client?.fullName} request rejected`);
        // Remove from pending list
        setPendingRequests((prev) => prev.filter((r) => r._id !== request._id));
      } else {
        toast.error(res.message || "Failed to reject request");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject request",
      );
    } finally {
      setRespondingTo(null);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Tab Buttons */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === "pending" ? "default" : "ghost"}
          onClick={() => setActiveTab("pending")}
          className="relative"
        >
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full border border-current bg-current/10 px-2.5 py-0.5 text-xs font-semibold">
              {pendingRequests.length}
            </span>
          )}
        </Button>
        <Button
          variant={activeTab === "clients" ? "default" : "ghost"}
          onClick={() => setActiveTab("clients")}
        >
          Current Clients
          {clients.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full border border-current bg-current/10 px-2.5 py-0.5 text-xs font-semibold">
              {clients.length}
            </span>
          )}
        </Button>
      </div>

      {/* Pending Requests Tab */}
      {activeTab === "pending" && (
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Pending Join Requests
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Review and approve or reject requests from users who want to join
              your team
            </p>
          </div>

          {/* Search Bar */}
          <div className="border-input bg-background flex items-center gap-2 rounded-lg border px-3 py-2">
            <Search className="text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search pending requests..."
              value={searchPendingQuery}
              onChange={(e) => setSearchPendingQuery(e.target.value)}
              className="placeholder:text-muted-foreground border-0 bg-transparent outline-none"
            />
          </div>

          {/* Pending Requests List */}
          {loadingRequests ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">
                Loading pending requests...
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">
                {pendingRequests.length === 0
                  ? "No pending requests"
                  : "No pending requests match your search"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map((request) => (
                <Card
                  key={request._id}
                  className="border-yellow-200 bg-yellow-50"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          {request.client?.fullName}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Requested{" "}
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="inline-flex items-center rounded-full border border-yellow-300 bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                        Pending
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Email */}
                    <div className="flex items-start gap-2">
                      <Mail className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <a
                        href={`mailto:${request.client?.email}`}
                        className="text-sm break-all text-blue-600 hover:underline"
                      >
                        {request.client?.email}
                      </a>
                    </div>

                    {/* Phone */}
                    {request.client?.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="text-muted-foreground mt-0.5 h-4 w-4" />
                        <a
                          href={`tel:${request.client.phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {request.client.phone}
                        </a>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleApproveRequest(request)}
                        disabled={respondingTo === request._id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {respondingTo === request._id ? (
                          "Processing..."
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request)}
                        disabled={respondingTo === request._id}
                        variant="outline"
                        className="flex-1 text-red-600 hover:bg-red-50"
                      >
                        {respondingTo === request._id ? (
                          "Processing..."
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Clients Tab */}
      {activeTab === "clients" && (
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Your Clients</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Users who are currently assigned to your team
            </p>
          </div>

          {/* Search Bar */}
          <div className="border-input bg-background flex items-center gap-2 rounded-lg border px-3 py-2">
            <Search className="text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search clients..."
              value={searchClientsQuery}
              onChange={(e) => setSearchClientsQuery(e.target.value)}
              className="placeholder:text-muted-foreground border-0 bg-transparent outline-none"
            />
          </div>

          {/* Clients List */}
          {loadingClients ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">
                {clients.length === 0
                  ? "No clients yet"
                  : "No clients match your search"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredClients.map((client) => (
                <Card
                  key={client.client._id}
                  className="border-green-200 bg-green-50"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          {client.client?.fullName}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Approved{" "}
                          {client.approvedAt
                            ? new Date(client.approvedAt).toLocaleDateString()
                            : new Date(
                                client.client?.createdAt || "",
                              ).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="inline-flex items-center rounded-full border border-green-300 bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                        Active
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Email */}
                    <div className="flex items-start gap-2">
                      <Mail className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <a
                        href={`mailto:${client.client?.email}`}
                        className="text-sm break-all text-blue-600 hover:underline"
                      >
                        {client.client?.email}
                      </a>
                    </div>

                    {/* Phone */}
                    {client.client?.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="text-muted-foreground mt-0.5 h-4 w-4" />
                        <a
                          href={`tel:${client.client.phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {client.client.phone}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
