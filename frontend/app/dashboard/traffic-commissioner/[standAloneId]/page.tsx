"use client";

import AddCommissionerModal from "@/components/dashboard/traffic-commissioner/AddCommissionerModal";
import DeleteCommissionerDialog from "@/components/dashboard/traffic-commissioner/DeleteCommissionerDialog";
import EditCommissionerModal from "@/components/dashboard/traffic-commissioner/EditCommissionerModal";
import CommissionerHeader from "@/components/dashboard/traffic-commissioner/CommissionerHeader";
import {
  default as CommissionerTable,
  toTrafficCommissionerTableRows,
  TrafficCommissionerTableRow,
} from "@/components/dashboard/traffic-commissioner/CommissionerTable";
import ViewCommissionerModal from "@/components/dashboard/traffic-commissioner/ViewCommissionerModal";
import {
  CreateTrafficCommissionerInput,
  UpdateTrafficCommissionerInput,
  trafficCommissionerRow,
} from "@/lib/traffic-commissioner/traffic-commissioner.type";
import { TrafficCommissionerAction } from "@/service/traffic-commissioner";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function TrafficCommissionerPage({ params }: PageProps) {
  const { standAloneId } = use(params);
  const [rows, setRows] = useState<trafficCommissionerRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewTrafficCommissioner, setViewTrafficCommissioner] =
    useState<TrafficCommissionerTableRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTrafficCommissioner, setEditTrafficCommissioner] =
    useState<trafficCommissionerRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<trafficCommissionerRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Fetch traffic commissioner ----------
  const fetchTrafficCommissioner = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await TrafficCommissionerAction.getTrafficCommissioners(
          standAloneId,
          {
            searchKey: search || undefined,
            showPerPage: 100,
          },
        );
        if (res.status && res.data) {
          setRows(toTrafficCommissionerTableRows(res.data.communications));
        } else {
          setError(
            res.message || "Failed to load traffic commissioner communications",
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load traffic commissioner communications",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    fetchTrafficCommissioner();
  }, [fetchTrafficCommissioner]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTrafficCommissioner(value);
    }, 400);
  };

  // ---------- Create traffic commissioner communication ----------
  const handleCreateTrafficCommissioner = async (
    data: CreateTrafficCommissionerInput,
  ) => {
    try {
      const res =
        await TrafficCommissionerAction.createTrafficCommissioner(data);
      if (res.status) {
        toast.success(
          res.message ||
            "Traffic commissioner communication created successfully",
        );
        setAddOpen(false);
        fetchTrafficCommissioner(searchQuery);
      } else {
        toast.error(
          res.message || "Failed to create traffic commissioner communication",
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create traffic commissioner communication",
      );
    }
  };

  // ---------- View traffic commissioner communication ----------
  const handleView = async (row: trafficCommissionerRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await TrafficCommissionerAction.getTrafficCommissioner(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setViewTrafficCommissioner(
          toTrafficCommissionerTableRows([res.data])[0],
        );
      } else {
        toast.error(
          res.message ||
            "Failed to load traffic commissioner communication details",
        );
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load traffic commissioner communication details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // ---------- Edit traffic commissioner communication ----------
  const handleEditOpen = async (row: trafficCommissionerRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await TrafficCommissionerAction.getTrafficCommissioner(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setEditTrafficCommissioner(
          toTrafficCommissionerTableRows([res.data])[0],
        );
      } else {
        toast.error(
          res.message ||
            "Failed to load traffic commissioner communication details",
        );
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load traffic commissioner communication details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateTrafficCommissioner = async (
    data: UpdateTrafficCommissionerInput,
  ) => {
    if (!editTrafficCommissioner) return;
    try {
      const res = await TrafficCommissionerAction.updateTrafficCommissioner(
        editTrafficCommissioner._id,
        standAloneId,
        data as CreateTrafficCommissionerInput,
      );
      if (res.status) {
        toast.success(
          res.message ||
            "Traffic commissioner communication updated successfully",
        );
        setEditOpen(false);
        setEditTrafficCommissioner(null);
        fetchTrafficCommissioner(searchQuery);
      } else {
        toast.error(
          res.message || "Failed to update traffic commissioner communication",
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update traffic commissioner communication",
      );
    }
  };

  // ---------- Delete traffic commissioner communication ----------
  const handleDeleteOpen = (row: trafficCommissionerRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await TrafficCommissionerAction.deleteTrafficCommissioner(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(
          res.message ||
            "Traffic commissioner communication deleted successfully",
        );
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchTrafficCommissioner(searchQuery);
      } else {
        toast.error(
          res.message || "Failed to delete traffic commissioner communication",
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete traffic commissioner communication",
      );
    } finally {
      setDeleteLoading(false);
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
          <p className="text-muted-foreground">
            Loading traffic commissioner communications...
          </p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <CommissionerHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <CommissionerTable
        data={rows}
        onAddTrafficCommissioner={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddCommissionerModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateTrafficCommissioner}
        standAloneId={standAloneId}
      />

      <ViewCommissionerModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewTrafficCommissioner(null);
        }}
        communication={viewTrafficCommissioner}
        loading={viewLoading}
        standAloneId={standAloneId}
      />

      <EditCommissionerModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditTrafficCommissioner(null);
        }}
        onSubmit={handleUpdateTrafficCommissioner}
        communication={editTrafficCommissioner}
        loading={editLoading}
        standAloneId={standAloneId}
      />

      <DeleteCommissionerDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={
          deleteTarget?.contactedPerson
            ? `communication with ${deleteTarget.contactedPerson}`
            : ""
        }
        loading={deleteLoading}
      />
    </div>
  );
}
