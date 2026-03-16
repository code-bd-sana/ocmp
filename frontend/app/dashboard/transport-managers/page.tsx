'use client'

import AddClientModal from "@/components/dashboard/users/AddClientModal";
import TransportManagerTable, { toTableRows, TransportManagerTableRow } from "@/components/dashboard/users/TransportManagerTable";
import UsersHeader from "@/components/dashboard/users/UsersHeader";
import { CreateClientInput } from "@/lib/clients/client.types";
import { TransportManagerAction } from "@/service/transport-manager";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const TransportManagerpage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState<TransportManagerTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTransportManager(value);
    }, 400);
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

  // ---------- Create transport manager ----------
  const handleCreateManager = async (data: CreateClientInput) => {
    setCreating(true);
    try {
      console.log('Create manager clicked', data);

      toast.success("Manager created successfully (demo)");
      setModalOpen(false);
      fetchTransportManager();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create transport manager",
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
          <p className="text-muted-foreground">Loading transport managers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 lg:mr-10">
      <UsersHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}

      />

      <TransportManagerTable 
        data={rows} 
        onAddManager={() => setModalOpen(true)}
        onRequestJoinTeam={handleRequestJoinTeam}
        onLeaveManagerRequest={handleLeaveManagerRequest}
      />

      <AddClientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleCreateManager}
        loading={creating}

      />
    </div>
  );
};

export default TransportManagerpage;