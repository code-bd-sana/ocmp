"use client";

import AddFuelUsageModal from "@/components/dashboard/fuel-usage/AddFuelUsageModal";
import DeleteFuelUsageDialog from "@/components/dashboard/fuel-usage/DeleteFuelUsage";
import EditFuelUsageModal from "@/components/dashboard/fuel-usage/EditFuelUsageModal";
import FuelUsageHeader from "@/components/dashboard/fuel-usage/FuelUsageHeader";
import FuelUsageTable, {
  FuelUsageTableRow,
  toFuelUsageTableRows,
} from "@/components/dashboard/fuel-usage/FuelUsageTable";
import ViewFuelUsageModal from "@/components/dashboard/fuel-usage/ViewFuelUsageModal";
import {
  CreateFuelUsageBody,
  UpdateFuelUsageBody,
} from "@/lib/fuel-usage/fuel-usage.types";
import { resolveRoleScopedRoute } from "@/lib/utils/role-route";
import { FuelUsageAction } from "@/service/fuel-usage";
import { UserAction } from "@/service/user";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function FuelUsagePage({ params }: PageProps) {
  const { standAloneId } = use(params);
  const router = useRouter();
  const [roleReady, setRoleReady] = useState(false);

  const [rows, setRows] = useState<FuelUsageTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Modal
  const [addOpen, setAddOpen] = useState(false);

  // View Modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewFuelUsage, setViewFuelUsage] = useState<FuelUsageTableRow | null>(
    null,
  );

  // Edit Modal
  const [editOpen, setEditOpen] = useState(false);
  const [editFuelUsage, setEditFuelUsage] = useState<FuelUsageTableRow | null>(
    null,
  );

  // Delete Modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteFuelUsage, setDeleteFuelUsage] =
    useState<FuelUsageTableRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch Fuel Usage
  const fetchFuelUsage = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await FuelUsageAction.getFuelUsages(standAloneId, {
          searchKey: search || undefined,
          showPerPage: 10,
        });
        if (res.status && res.data) {
          setRows(toFuelUsageTableRows(res.data.fuelUsages));
          setError(null);
        } else {
          setError(res.message || "Failed to load fuel usage");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load fuel usage",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    let isActive = true;

    const ensureRoleScopedRoute = async () => {
      try {
        const profileResp = await UserAction.getProfile();
        const userRole = profileResp.data?.role;
        const userId = profileResp.data?._id;

        if (!isActive) return;

        const routeResult = resolveRoleScopedRoute({
          role: userRole,
          userId,
          standAloneId,
          basePath: "/dashboard/fuel-usage",
        });

        if (routeResult.error) {
          setError(routeResult.error);
          return;
        }

        if (routeResult.redirectTo) {
          router.replace(routeResult.redirectTo);
          return;
        }

        setRoleReady(true);
      } catch {
        if (!isActive) return;
        setError("Failed to load your profile. Please sign in again.");
      }
    };

    setRoleReady(false);
    ensureRoleScopedRoute();

    return () => {
      isActive = false;
    };
  }, [standAloneId, router]);

  useEffect(() => {
    if (!roleReady) return;
    fetchFuelUsage();
  }, [fetchFuelUsage, roleReady]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchFuelUsage(value);
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Create Fuel Usage

  const handleCreateFuelUsage = async (data: CreateFuelUsageBody) => {
    try {
      const res = await FuelUsageAction.createFuelUsageAsManager({
        ...data,
        standAloneId,
      });
      if (res.status) {
        toast.success(res.message || "Fuel usage created successfully");
        setAddOpen(false);
        fetchFuelUsage(searchQuery);
      } else {
        toast.error(res.message || "Failed to create fuel usage");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create fuel usage",
      );
    }
  };

  // View Fuel Usage
  const handleViewFuelUsage = (row: FuelUsageTableRow) => {
    setViewFuelUsage(row);
    setViewOpen(true);
  };

  // Update Fuel Usage
  const handleUpdateFuelUsage = async (data: UpdateFuelUsageBody) => {
    if (!editFuelUsage) return;
    try {
      const res = await FuelUsageAction.updateFuelUsage(
        editFuelUsage._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Fuel usage updated successfully");
        setEditOpen(false);
        setEditFuelUsage(null);
        fetchFuelUsage(searchQuery);
      } else {
        toast.error(res.message || "Failed to update fuel usage");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update fuel usage",
      );
    }
  };

  // Delete Fuel Usage
  const handleDeleteFuelUsage = (row: FuelUsageTableRow) => {
    setDeleteFuelUsage(row);
    setDeleteOpen(true);
  };

  const confirmDeleteFuelUsage = async () => {
    if (!deleteFuelUsage) return;
    setDeleteLoading(true);

    try {
      const res = await FuelUsageAction.deleteFuelUsage(
        deleteFuelUsage._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Fuel usage deleted successfully");
        setDeleteOpen(false);
        setDeleteFuelUsage(null);
        fetchFuelUsage(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete fuel usage");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete fuel usage",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!roleReady) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Validating access...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && rows.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading fuel usage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 lg:mr-10">
      {/* Header */}
      <FuelUsageHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Table */}
      <FuelUsageTable
        data={rows}
        onAddFuelUsage={() => setAddOpen(true)}
        onView={handleViewFuelUsage}
        onEdit={(row) => {
          setEditFuelUsage(row);
          setEditOpen(true);
        }}
        onDelete={handleDeleteFuelUsage}
      />

      {/* Add Modal  */}
      <AddFuelUsageModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateFuelUsage}
        standAloneId={standAloneId}
      />

      {/* View Modal */}
      <ViewFuelUsageModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewFuelUsage(null);
        }}
        fuelUsage={viewFuelUsage}
        loading={false}
      />

      {/* Edit Modal */}
      <EditFuelUsageModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditFuelUsage(null);
        }}
        fuelUsage={editFuelUsage}
        onSubmit={handleUpdateFuelUsage}
        loading={false}
        standAloneId={standAloneId}
      />

      {/* Delete Modal */}
      <DeleteFuelUsageDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteFuelUsage(null);
        }}
        driverName={deleteFuelUsage?.driverName || ""}
        vehicleRegId={deleteFuelUsage?.vehicleRegId || ""}
        date={deleteFuelUsage?.date || ""}
        onConfirm={confirmDeleteFuelUsage}
        loading={deleteLoading}
      />
    </div>
  );
}
