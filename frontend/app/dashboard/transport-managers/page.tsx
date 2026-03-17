'use client'

import TransportManagerTable, { toTableRows, TransportManagerTableRow } from "@/components/dashboard/users/TransportManagerTable";
import UsersHeader from "@/components/dashboard/users/UsersHeader";
import { TransportManagerAction } from "@/service/transport-manager";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface MyManagerData {
  manager: {
    _id: string;
    fullName: string;
    email: string;
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
  const [managerLoading, setManagerLoading] = useState(true);

  // ---------- Fetch transport managers ----------
  const fetchTransportManager = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const res = await TransportManagerAction.getTransportManager({
        searchKey: search || undefined,
      });
      console.log(res, 'transport manager response');
      
      
      if (res.status && res.data) {
        setRows(toTableRows(res.data as any));
      } else {
        setError(res.message || "Failed to load transport managers");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transport managers");
    } finally {
      setLoading(false);
    }
  }, []);


  // Fetch my manager
  useEffect(() => {
    const fetchMyManager = async () => {
      try {
        const res = await TransportManagerAction.myManager();
        if (res.status && res.data) {
          setMyManager(res.data);
        }
      } catch (err) {
        console.log('No manager assigned');
      } finally {
        setManagerLoading(false);
      }
    };
    fetchMyManager();
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!myManager) {
      fetchTransportManager();
    }
  }, [fetchTransportManager, myManager]);

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

  // ---------- Handle Remove Client ----------
  const handleRemoveClient = async () => {
    try {
      const res = await TransportManagerAction.removeClient();
      if (res.status) {
        toast.success("Successfully removed from manager");
        setMyManager(null);
        fetchTransportManager(); // Now show the list
      } else {
        toast.error(res.message || "Failed to remove");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
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
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Your Transport Manager</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {myManager.manager?.fullName}</p>
            <p><strong>Email:</strong> {myManager.manager?.email}</p>
            <p><strong>Status:</strong> {myManager.clientStatus}</p>
            <p><strong>Requested At:</strong> {myManager.requestedAt ? new Date(myManager.requestedAt).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Approved At:</strong> {myManager.approvedAt ? new Date(myManager.approvedAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          <button
            onClick={handleRemoveClient}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Remove Manager
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
              <p className="text-muted-foreground">Loading transport managers...</p>
            </div>
          ) : (
            <TransportManagerTable 
              data={rows} 
              onRequestJoinTeam={handleRequestJoinTeam}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TransportManagerpage;