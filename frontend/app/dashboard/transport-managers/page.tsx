'use client'

import TransportManagerTable, { toTableRows, TransportManagerTableRow } from "@/components/dashboard/users/TransportManagerTable";
import UsersHeader from "@/components/dashboard/users/UsersHeader";
import { TransportManagerAction } from "@/service/transport-manager";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const TransportManagerpage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState<TransportManagerTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch transport managers ----------
  const fetchTransportManager = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const res = await TransportManagerAction.getTransportManager({
        searchKey: search || undefined,
      });
      console.log(res, 'transport manager response');
      
      
      if (res.status && res.data) {
        setRows(toTableRows(res.data));
      } else {
        setError(res.message || "Failed to load transport managers");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transport managers");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTransportManager();
  }, [fetchTransportManager]);

  // Debounced search — calls API with searchKey
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    fetchTransportManager(value);
  };

  // ---------- Handle Request Join Team ----------
  const handleRequestJoinTeam = (managerId: string) => {
    console.log("Request Join Team - Manager ID:", managerId);
    toast.info(`Request join team for manager: ${managerId}`);

  };

  // ---------- Handle Leave Manager Request ----------
  const handleLeaveManagerRequest = (managerId: string) => {
    console.log("Leave Manager Request - Manager ID:", managerId);
    toast.info(`Leave request for manager: ${managerId}`);

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
          <p className="text-muted-foreground">Loading transport managers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <UsersHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}

      />

      <TransportManagerTable 
        data={rows} 
        onRequestJoinTeam={handleRequestJoinTeam}
        onLeaveManagerRequest={handleLeaveManagerRequest}
      />
    </div>
  );
};

export default TransportManagerpage;