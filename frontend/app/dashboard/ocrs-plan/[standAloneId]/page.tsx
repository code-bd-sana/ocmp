"use client";

import AddOcrsPlanModal from "@/components/dashboard/ocrs-plan/AddOcrsPlanModal";
import DeleteOcrsPlanDialog from "@/components/dashboard/ocrs-plan/DeleteOcrsPlanDialog";
import EditOcrsPlanModal from "@/components/dashboard/ocrs-plan/EditOcrsPlanModal";
import OcrsPlanHeader from "@/components/dashboard/ocrs-plan/OcrsPlanHeader";
import {
  default as OcrsPlanTable,
  OcrsPlanTableRow,
  toOcrsPlanTableRows,
} from "@/components/dashboard/ocrs-plan/OcrsPlanTable";
import ViewOcrsPlanModal from "@/components/dashboard/ocrs-plan/ViewOcrsPlanModal";
import {
  CreateOcrsPlanInput,
  OcrsPlanRow,
  UpdateOcrsPlanInput,
} from "@/lib/ocrs-plan/ocrs-plan.types";
import { OcrsPlanAction } from "@/service/ocrs-plan";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function OcrsPlanListPage({ params }: PageProps) {
  const { standAloneId } = use(params);

  const [rows, setRows] = useState<OcrsPlanTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewOcrsPlan, setViewOcrsPlan] = useState<OcrsPlanRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editOcrsPlan, setEditOcrsPlan] = useState<OcrsPlanRow | null>(null);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OcrsPlanTableRow | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Fetch OCRS plans ----------
  const fetchOcrsPlans = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await OcrsPlanAction.getOcrsPlans(standAloneId, {
          searchKey: search || undefined,
        });
        if (res.status && res.data) {
          const ocrsPlans = Array.isArray(res.data.ocrsPlans)
            ? res.data.ocrsPlans
            : [];
          setRows(toOcrsPlanTableRows(ocrsPlans));
        } else {
          setError(res.message || "Failed to load OCRS plans");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load OCRS plans",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    fetchOcrsPlans();
  }, [fetchOcrsPlans]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOcrsPlans(value);
    }, 400);
  };

  // ---------- Create OCRS plan ----------
  const handleCreateOcrsPlan = async (data: CreateOcrsPlanInput) => {
    try {
      const res = await OcrsPlanAction.createOcrsPlan(data);
      if (res.status) {
        toast.success(res.message || "OCRS plan created successfully");
        setAddOpen(false);
        fetchOcrsPlans(searchQuery);
      } else {
        toast.error(res.message || "Failed to create OCRS plan");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create OCRS plan",
      );
    }
  };

  // ---------- View OCRS plan ----------
  const handleView = async (row: OcrsPlanTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await OcrsPlanAction.getOcrsPlan(row._id, standAloneId);
      if (res.status && res.data) {
        setViewOcrsPlan(res.data);
      } else {
        toast.error(res.message || "Failed to load OCRS plan details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load OCRS plan details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // ---------- Edit OCRS plan ----------
  const handleEditOpen = async (row: OcrsPlanTableRow) => {
    setEditOpen(true);
    try {
      const res = await OcrsPlanAction.getOcrsPlan(row._id, standAloneId);
      if (res.status && res.data) {
        setEditOcrsPlan(res.data);
      } else {
        toast.error(res.message || "Failed to load OCRS plan details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load OCRS plan details",
      );
      setEditOpen(false);
    }
  };

  const handleUpdateOcrsPlan = async (
    id: string,
    data: UpdateOcrsPlanInput,
  ) => {
    try {
      const res = await OcrsPlanAction.updateOcrsPlan(id, standAloneId, data);
      if (res.status) {
        toast.success(res.message || "OCRS plan updated successfully");
        setEditOpen(false);
        setEditOcrsPlan(null);
        fetchOcrsPlans(searchQuery);
      } else {
        toast.error(res.message || "Failed to update OCRS plan");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update OCRS plan",
      );
    }
  };

  // ---------- Delete OCRS plan ----------
  const handleDeleteOpen = (row: OcrsPlanTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await OcrsPlanAction.deleteOcrsPlan(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "OCRS plan deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchOcrsPlans(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete OCRS plan");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete OCRS plan",
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
          <p className="text-muted-foreground">Loading OCRS plans...</p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <OcrsPlanHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <OcrsPlanTable
        data={rows}
        onAddOcrsPlan={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddOcrsPlanModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateOcrsPlan}
        standAloneId={standAloneId}
      />

      <ViewOcrsPlanModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewOcrsPlan(null);
        }}
        ocrsPlan={viewOcrsPlan}
        loading={viewLoading}
      />

      {editOcrsPlan && (
        <EditOcrsPlanModal
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditOcrsPlan(null);
          }}
          onSubmit={handleUpdateOcrsPlan}
          ocrsPlan={editOcrsPlan}
        />
      )}

      <DeleteOcrsPlanDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
