"use client";

import AddPg9AndPg13PlanModal from "@/components/dashboard/pg9AndPg13Plan/AddPg9AndPg13PlanModal";
import DeletePg9AndPg13PlanDialog from "@/components/dashboard/pg9AndPg13Plan/DeletePg9AndPg13PlanModal";
import EditPg9AndPg13PlanModal from "@/components/dashboard/pg9AndPg13Plan/EditPg9AndPg13PlanModal";
import Pg9AndPg13PlanHeader from "@/components/dashboard/pg9AndPg13Plan/Pg9AndPg13PlanHeader";
import Pg9AndPg13PlanTable, {
  toPg9AndPg13PlanRow,
} from "@/components/dashboard/pg9AndPg13Plan/Pg9AndPg13PlanTable";
import ViewPg9AndPg13PlanModal from "@/components/dashboard/pg9AndPg13Plan/ViewPg9AndPg13PlanModal";
import {
  CreatePg9AndPg13PlanInput,
  Pg9AndPg13PlanRow,
  UpdatePg9AndPg13PlanInput,
} from "@/lib/pg9AndPg13Plan/pg9AndPg13Plan.types";
import { Pg9AndPg13PlanAction } from "@/service/pg9AndPg13Plan";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserAction } from "@/service/user";
import { resolveRoleScopedRoute } from "@/lib/utils/role-route";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function Pg9AndPg13PlanPage({ params }: PageProps) {
  const { standAloneId } = use(params);
  const router = useRouter();

  const [roleReady, setRoleReady] = useState(false);

  const [rows, setRows] = useState<Pg9AndPg13PlanRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewPlan, setViewPlan] = useState<Pg9AndPg13PlanRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Pg9AndPg13PlanRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pg9AndPg13PlanRow | null>(
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
          basePath: "/dashboard/pg9AndPg13Plan",
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

  const fetchPg9AndPg13Plans = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await Pg9AndPg13PlanAction.getPg9AndPg13Plans(
          standAloneId,
          {
            searchKey: search || undefined,
            showPerPage: 100,
          },
        );

        if (res.status && res.data) {
          const transformed = toPg9AndPg13PlanRow(res.data.pg9AndPg13Plans);
          setRows(transformed || []);
          setError(null);
        } else {
          setError(res.message || "Failed to load PG9/PG13 plan records");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load PG9/PG13 plan records",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    if (!roleReady) return;
    fetchPg9AndPg13Plans();
  }, [fetchPg9AndPg13Plans, roleReady]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPg9AndPg13Plans(value);
    }, 400);
  };

  // Create PG9/PG13 plan
  const handleCreate = async (data: CreatePg9AndPg13PlanInput) => {
    try {
      const res = await Pg9AndPg13PlanAction.createPg9AndPg13Plan(data);

      if (res.status) {
        toast.success("PG9/PG13 plan created successfully");
        setAddOpen(false);
        fetchPg9AndPg13Plans(searchQuery);
      } else {
        toast.error(res.message || "Failed to create PG9/PG13 plan");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create PG9/PG13 plan",
      );
    }
  };

  // View PG9/PG13 plan details
  const handleView = async (plan: Pg9AndPg13PlanRow) => {
    setViewPlan(plan);
    setViewOpen(true);
    setViewLoading(true);

    try {
      const res = await Pg9AndPg13PlanAction.getPg9AndPg13Plan(
        plan._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setViewPlan(res.data);
      } else {
        toast.error(res.message || "Failed to load PG9/PG13 plan details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load PG9/PG13 plan details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // Edit PG9/PG13 plan
  const handleEditOpen = async (plan: Pg9AndPg13PlanRow) => {
    setEditPlan(plan);
    setEditOpen(true);
    setEditLoading(true);

    try {
      const res = await Pg9AndPg13PlanAction.getPg9AndPg13Plan(
        plan._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setEditPlan(res.data);
      } else {
        toast.error(res.message || "Failed to load PG9/PG13 plan details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load PG9/PG13 plan details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  // Update PG9/PG13 plan
  const handleUpdate = async (data: UpdatePg9AndPg13PlanInput) => {
    if (!editPlan) return;

    try {
      const res = await Pg9AndPg13PlanAction.updatePg9AndPg13Plan(
        editPlan._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success("PG9/PG13 plan updated successfully");
        setEditOpen(false);
        setEditPlan(null);
        fetchPg9AndPg13Plans(searchQuery);
      } else {
        toast.error(res.message || "Failed to update PG9/PG13 plan");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update PG9/PG13 plan",
      );
    }
  };

  // Delete PG9/PG13 plan modal open
  const handleDeleteOpen = (plan: Pg9AndPg13PlanRow) => {
    setDeleteTarget(plan);
    setDeleteOpen(true);
  };

  // Delete PG9/PG13 plan
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      const res = await Pg9AndPg13PlanAction.deletePg9AndPg13Plan(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success("PG9/PG13 plan deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchPg9AndPg13Plans(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete PG9/PG13 plan");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete PG9/PG13 plan",
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
  if (loading && rows.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading PG9/PG13 plans...</p>
        </div>
      </div>
    );
  }

  if (!roleReady) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Validating access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 lg:mr-10">
      <Pg9AndPg13PlanHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <Pg9AndPg13PlanTable
        data={rows}
        onPlanClick={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddPg9AndPg13PlanModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreate}
        standAloneId={standAloneId}
      />

      <ViewPg9AndPg13PlanModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) {
            // Delay clearing plan to allow modal close animation
            setTimeout(() => setViewPlan(null), 200);
          }
        }}
        plan={viewPlan}
        loading={viewLoading}
        standAloneId={standAloneId}
      />

      <EditPg9AndPg13PlanModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            // Delay clearing plan to allow modal close animation
            setTimeout(() => setEditPlan(null), 200);
          }
        }}
        onSubmit={handleUpdate}
        plan={editPlan}
        standAloneId={standAloneId}
        loading={editLoading}
      />

      <DeletePg9AndPg13PlanDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        itemName={
          deleteTarget
            ? `${deleteTarget.issueType}${deleteTarget.vehicleId ? ` — ${deleteTarget.vehicleId}` : ""}${deleteTarget.meetingDate ? ` (${new Date(deleteTarget.meetingDate).toLocaleDateString()})` : ""}`
            : ""
        }
        loading={deleteLoading}
      />
    </div>
  );
}
