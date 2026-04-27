"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import DriverHeader from "@/components/dashboard/drivers/DriverHeader";
import DriversTable, {
  DriverTableRow,
  toDriverTableRows,
} from "@/components/dashboard/drivers/DriversTable";
import AddDriverModal from "@/components/dashboard/drivers/AddDriverModal";
import ViewDriverModal from "@/components/dashboard/drivers/ViewDriverModal";
import EditDriverModal from "@/components/dashboard/drivers/EditDriverModal";
import DeleteDriverDialog from "@/components/dashboard/drivers/DeleteDriverDialog";

import { DriverAction } from "@/service/driver";
import {
  CreateDriverInput,
  DriverRow,
  UpdateDriverInput,
} from "@/lib/drivers/driver.types";
import { UserAction } from "@/service/user";
import { resolveRoleScopedRoute } from "@/lib/utils/role-route";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function DriverDetailsPage({ params }: PageProps) {
  const { standAloneId } = use(params);
  const router = useRouter();

  const [roleReady, setRoleReady] = useState(false);

  const [rows, setRows] = useState<DriverTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewDriver, setViewDriver] = useState<DriverRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<DriverRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DriverTableRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          basePath: "/dashboard/driver-details",
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

  // ---------- Fetch drivers ----------
  const fetchDrivers = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await DriverAction.getDrivers(standAloneId, {
          searchKey: search || undefined,
        });
        if (res.status && res.data) {
          console.log("driver", res.data.drivers);
          setRows(toDriverTableRows(res.data.drivers));
        } else {
          setError(res.message || "Failed to load drivers");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load drivers");
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    if (!roleReady) return;
    fetchDrivers();
  }, [fetchDrivers, roleReady]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchDrivers(value);
    }, 400);
  };

  // ---------- Create driver ----------
  const handleCreateDriver = async (data: CreateDriverInput) => {
    try {
      const res = await DriverAction.createDriver(data);
      if (res.status) {
        toast.success(res.message || "Driver created successfully");
        setAddOpen(false);
        fetchDrivers(searchQuery);
      } else {
        toast.error(res.message || "Failed to create driver");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create driver",
      );
    }
  };

  // ---------- View driver ----------
  const handleView = async (row: DriverTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await DriverAction.getDriver(row._id, standAloneId);
      if (res.status && res.data) {
        setViewDriver(res.data);
      } else {
        toast.error(res.message || "Failed to load driver details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load driver details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // ---------- Edit driver ----------
  const handleEditOpen = async (row: DriverTableRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await DriverAction.getDriver(row._id, standAloneId);
      if (res.status && res.data) {
        setEditDriver(res.data);
      } else {
        toast.error(res.message || "Failed to load driver details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load driver details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateDriver = async (data: UpdateDriverInput) => {
    if (!editDriver) return;
    try {
      const res = await DriverAction.updateDriver(
        editDriver._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Driver updated successfully");
        setEditOpen(false);
        setEditDriver(null);
        fetchDrivers(searchQuery);
      } else {
        toast.error(res.message || "Failed to update driver");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update driver",
      );
    }
  };

  // ---------- Delete driver ----------
  const handleDeleteOpen = (row: DriverTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await DriverAction.deleteDriver(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Driver deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchDrivers(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete driver");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete driver",
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
          <p className="text-muted-foreground">Loading drivers...</p>
        </div>
      </div>
    );
  }

  if (!roleReady) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading drivers...</p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <DriverHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <DriversTable
        data={rows}
        onAddDriver={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddDriverModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateDriver}
        standAloneId={standAloneId}
      />

      <ViewDriverModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewDriver(null);
        }}
        driver={viewDriver}
        loading={viewLoading}
      />

      <EditDriverModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditDriver(null);
        }}
        onSubmit={handleUpdateDriver}
        driver={editDriver}
        loading={editLoading}
      />

      <DeleteDriverDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        driverName={deleteTarget?.fullName || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
