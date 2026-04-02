"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TransportManagerAction } from "@/service/transport-manager";
import { UserAction } from "@/service/user";
import {
  TransportManager,
  JoinRequest,
} from "@/lib/transport-manager/transport-manager-request.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Mail, Phone, Search } from "lucide-react";

interface ManagersListProps {
  userId: string;
}

export default function ManagersList({ userId }: ManagersListProps) {
  const [managers, setManagers] = useState<TransportManager[]>([]);
  const [pendingRequest, setPendingRequest] = useState<JoinRequest | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [sendingRequestId, setSendingRequestId] = useState<string | null>(null);
  const [cancellingRequest, setCancellingRequest] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredManagers, setFilteredManagers] = useState<TransportManager[]>(
    [],
  );

  // Load managers list and check for pending request
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Get all managers
      const managersRes = await TransportManagerAction.getManagersList({
        showPerPage: 100,
      });

      if (managersRes.status && managersRes.data) {
        setManagers(managersRes.data.data || []);
        setFilteredManagers(managersRes.data.data || []);
      } else {
        toast.error("Failed to load transport managers");
      }

      // Check for pending request
      const pendingRes = await TransportManagerAction.getPendingJoinRequests({
        showPerPage: 1,
      });

      if (
        pendingRes.status &&
        pendingRes.data?.data &&
        pendingRes.data.data.length > 0
      ) {
        const userPending = pendingRes.data.data.find(
          (req) => req.client?._id === userId,
        );
        if (userPending) {
          setPendingRequest(userPending);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load managers",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredManagers(managers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = managers.filter(
        (manager) =>
          manager.fullName.toLowerCase().includes(query) ||
          manager.email.toLowerCase().includes(query),
      );
      setFilteredManagers(filtered);
    }
  }, [searchQuery, managers]);

  // Handle sending join request
  const handleSendRequest = async (managerId: string) => {
    try {
      setSendingRequestId(managerId);
      const res = await TransportManagerAction.sendJoinRequest(managerId);

      if (res.status && res.data) {
        toast.success("Request sent successfully!");
        setPendingRequest(res.data);
        setManagers((prev) => prev.filter((m) => m._id !== managerId));
      } else {
        toast.error(res.message || "Failed to send request");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send request",
      );
    } finally {
      setSendingRequestId(null);
    }
  };

  // Handle cancelling pending request
  const handleCancelRequest = async () => {
    try {
      setCancellingRequest(true);
      const profile = await UserAction.getProfile();
      if (!profile.data?._id) {
        toast.error("Unable to identify current user");
        return;
      }

      const res = await TransportManagerAction.cancelJoinRequest(
        profile.data._id,
      );

      if (res.status) {
        toast.success("Request cancelled. Reloading managers...");
        setPendingRequest(null);
        await loadData();
      } else {
        toast.error(res.message || "Failed to cancel request");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel request",
      );
    } finally {
      setCancellingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto py-4 lg:mr-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading transport managers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 lg:mr-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Select a Transport Manager</h1>
        <p className="text-muted-foreground">
          Choose a transport manager to send a join request
        </p>
      </div>

      {/* Pending Request Alert */}
      {pendingRequest && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              Pending Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Manager</p>
              <p className="text-lg font-semibold">
                {pendingRequest.manager?.fullName}
              </p>
              <p className="text-sm text-gray-500">
                {pendingRequest.manager?.email}
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Your request is awaiting approval. You cannot send requests to
              other managers while a request is pending.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelRequest}
              disabled={cancellingRequest}
              className="text-red-600 hover:bg-red-50"
            >
              {cancellingRequest ? "Cancelling..." : "Cancel Request"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Pending Request - Show Managers List */}
      {!pendingRequest && (
        <>
          {/* Search Bar */}
          <div className="border-input bg-background mb-6 flex items-center gap-2 rounded-lg border px-3 py-2">
            <Search className="text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search managers by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="placeholder:text-muted-foreground border-0 bg-transparent outline-none"
            />
          </div>

          {/* Managers Grid */}
          {filteredManagers.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">
                {managers.length === 0
                  ? "No transport managers available"
                  : "No managers match your search"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredManagers.map((manager) => (
                <Card
                  key={manager._id}
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {manager.fullName}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Transport Manager
                        </CardDescription>
                      </div>
                      {manager.isActive && (
                        <div className="inline-flex items-center rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Active
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Email */}
                    <div className="flex items-start gap-2">
                      <Mail className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <a
                        href={`mailto:${manager.email}`}
                        className="text-sm break-all text-blue-600 hover:underline"
                      >
                        {manager.email}
                      </a>
                    </div>

                    {/* Phone */}
                    {manager.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="text-muted-foreground mt-0.5 h-4 w-4" />
                        <a
                          href={`tel:${manager.phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {manager.phone}
                        </a>
                      </div>
                    )}

                    {/* Send Request Button */}
                    <Button
                      onClick={() => handleSendRequest(manager._id)}
                      disabled={sendingRequestId === manager._id}
                      className="mt-4 w-full"
                    >
                      {sendingRequestId === manager._id
                        ? "Sending..."
                        : "Send Request"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
