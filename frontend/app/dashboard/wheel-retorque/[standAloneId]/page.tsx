"use client";

import AddWheelTorqueModal from "@/components/dashboard/wheel-retorque/AddWheelRetorqueModal";
import DeleteWheelRetorqueDialog from "@/components/dashboard/wheel-retorque/DeleteWheelRetorqueModal";
import EditWheelTorqueModal from "@/components/dashboard/wheel-retorque/EditWheelRetorqueModal";
import ViewWheelRetorqueModal from "@/components/dashboard/wheel-retorque/ViewWheelRetorqueModal";
import WheelRetorqueHeader from "@/components/dashboard/wheel-retorque/WheelRetorqueHeader";
import WheelRetorqueTable, {
  toWheelRetorqueRow,
} from "@/components/dashboard/wheel-retorque/WheelRetorqueTable";
import {
  CreateWheelReTorqueInput,
  UpdateWheelReTorqueInput,
  WheelReTorqueRow,
} from "@/lib/wheel-retorque/wheel-retorque.types";
import { WheelRetorquePolicyAction } from "@/service/wheel-retorque";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserAction } from "@/service/user";
import { resolveRoleScopedRoute } from "@/lib/utils/role-route";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function WheelRetorquePage({ params }: PageProps) {
  const { standAloneId } = use(params);
  const router = useRouter();
  const [roleReady, setRoleReady] = useState(false);

  const [rows, setRows] = useState<WheelReTorqueRow[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewPlan, setViewPlan] = useState<WheelReTorqueRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<WheelReTorqueRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WheelReTorqueRow | null>(
    null,
  );
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
          basePath: "/dashboard/wheel-retorque",
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

  const fetchWheelRetorques = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await WheelRetorquePolicyAction.getWheelRetorques(
          standAloneId,
          {
            searchKey: search || undefined,
            showPerPage: 100,
          },
        );
        if (res.status && res.data) {
          const transformed = toWheelRetorqueRow(res.data.wheelRetorque);
          setRows(transformed || []);
          setError(null);
        } else {
          setError(res.message || "Failed to fetch data");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch wheel re-torque records.",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    if (!roleReady) return;
    fetchWheelRetorques();
  }, [fetchWheelRetorques, roleReady]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchWheelRetorques(value);
    }, 400);
  };

  // Create Wheel Re-torque
  const handleCreate = async (data: CreateWheelReTorqueInput) => {
    try {
      const res = await WheelRetorquePolicyAction.createWheelRetorque({
        ...data,
        standAloneId,
      });

      if (res.status) {
        toast.success("Wheel re-torque record created successfully");
        setAddOpen(false);
        fetchWheelRetorques(searchQuery);
      } else {
        toast.error(res.message || "Failed to create wheel re-torque record");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create wheel re-torque record",
      );
    }
  };

  // View Wheel Re-torque details
  const handleView = async (wheelRetorque: WheelReTorqueRow) => {
    setViewPlan(wheelRetorque);
    setViewOpen(true);

    try {
      const res = await WheelRetorquePolicyAction.getWheelRetorque(
        wheelRetorque._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setViewPlan(res.data);
      } else {
        toast.error(res.message || "Failed to load wheel re-torque details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load wheel re-torque details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // Edit Wheel Re-torque record modal open - load details
  const handleEditOpen = async (wheelRetorque: WheelReTorqueRow) => {
    setEditPlan(wheelRetorque);
    setEditOpen(true);

    try {
      const res = await WheelRetorquePolicyAction.getWheelRetorque(
        wheelRetorque._id,
        standAloneId,
      );

      if (res.status && res.data) {
        setEditPlan(res.data);
      } else {
        toast.error(res.message || "Failed to load wheel re-torque details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load wheel re-torque policy details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  // Update Wheel Re-torque record
  const handleUpdate = async (data: UpdateWheelReTorqueInput) => {
    if (!editPlan) return;

    try {
      const res = await WheelRetorquePolicyAction.updateWheelRetorque(
        editPlan._id,
        standAloneId,
        data,
      );

      if (res.status) {
        toast.success("Wheel re-torque record updated successfully");
        setEditOpen(false);
        setEditPlan(null);
        fetchWheelRetorques(searchQuery);
      } else {
        toast.error(res.message || "Failed to update wheel re-torque record");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update wheel re-torque record",
      );
    }
  };

  // Delete Wheel Re-torque record modal open - load details
  const handleDeleteOpen = async (wheelRetorque: WheelReTorqueRow) => {
    setDeleteTarget(wheelRetorque);
    setDeleteOpen(true);
  };

  // Delete Wheel Re-torque record
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await WheelRetorquePolicyAction.deleteWheelRetorque(
        deleteTarget._id,
        standAloneId,
      );

      if (res.status) {
        toast.success("Wheel re-torque record deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchWheelRetorques(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete wheel re-torque record");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete wheel re-torque record",
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
          <p className="text-muted-foreground">Loading training toolbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 lg:mr-10">
      {/* Header */}
      <WheelRetorqueHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Table */}
      <WheelRetorqueTable
        data={rows}
        onWheelClick={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      {/* Create */}
      <AddWheelTorqueModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreate}
        standAloneId={standAloneId}
      />

      {/* View */}
      <ViewWheelRetorqueModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) {
            setTimeout(() => setViewPlan(null), 200);
          }
        }}
        wheelRetorque={viewPlan}
        loading={viewLoading}
        standAloneId={standAloneId}
      />

      {/* Edit */}
      <EditWheelTorqueModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            // Delay clearing plan to allow modal close animation
            setTimeout(() => setEditPlan(null), 200);
          }
        }}
        onSubmit={handleUpdate}
        wheelRetorque={editPlan}
        standAloneId={standAloneId}
        loading={editLoading}
      />

      {/* Delete */}
      <DeleteWheelRetorqueDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeleteTarget(null);
            setDeleteLoading(false);
          }
        }}
        onConfirm={handleDelete}
        itemName={
          deleteTarget
            ? `${deleteTarget.dateChanged ? new Date(deleteTarget.dateChanged).toLocaleDateString() : ""}${deleteTarget.vehicleId ? ` — ${deleteTarget.vehicleId}` : ""}${deleteTarget.reTorqueDue ? ` (${new Date(deleteTarget.reTorqueDue).toLocaleDateString()})` : ""}`
            : ""
        }
        loading={deleteLoading}
      />
    </div>
  );
}
