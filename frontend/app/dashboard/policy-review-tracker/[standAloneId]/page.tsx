"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import PolicyProcedureHeader from "@/components/dashboard/policy-procedures/PolicyProcedureHeader";
import PolicyProceduresTable, {
  PolicyProcedureTableRow,
  toPolicyProcedureTableRows,
} from "@/components/dashboard/policy-procedures/PolicyProceduresTable";
import AddPolicyProcedureModal from "@/components/dashboard/policy-procedures/AddPolicyProcedureModal";
import ViewPolicyProcedureModal from "@/components/dashboard/policy-procedures/ViewPolicyProcedureModal";
import EditPolicyProcedureModal from "@/components/dashboard/policy-procedures/EditPolicyProcedureModal";
import DeletePolicyProcedureDialog from "@/components/dashboard/policy-procedures/DeletePolicyProcedureDialog";

import { PolicyProcedureAction } from "@/service/policy-procedure";
import {
  CreatePolicyProcedureInput,
  UpdatePolicyProcedureInput,
  PolicyProcedureRow,
} from "@/lib/policy-procedures/policy-procedure.types";
import { UserAction } from "@/service/user";
import { resolveRoleScopedRoute } from "@/lib/utils/role-route";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function PolicyReviewTrackerPage({ params }: PageProps) {
  const { standAloneId } = use(params);
  const router = useRouter();
  const [roleReady, setRoleReady] = useState(false);

  const [rows, setRows] = useState<PolicyProcedureTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewPolicyProcedure, setViewPolicyProcedure] =
    useState<PolicyProcedureRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editPolicyProcedure, setEditPolicyProcedure] =
    useState<PolicyProcedureRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<PolicyProcedureTableRow | null>(null);
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
          basePath: "/dashboard/policy-review-tracker",
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

  // ---------- Fetch policy procedures ----------
  const fetchPolicyProcedures = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await PolicyProcedureAction.getPolicyProcedures(
          standAloneId,
          {
            searchKey: search || undefined,
            showPerPage: 100,
          },
        );
        if (res.status && res.data) {
          setRows(toPolicyProcedureTableRows(res.data.policyProcedures));
        } else {
          setError(res.message || "Failed to load policy procedures");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load policy procedures",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    if (!roleReady) return;
    fetchPolicyProcedures();
  }, [fetchPolicyProcedures, roleReady]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPolicyProcedures(value);
    }, 400);
  };

  // ---------- Create policy procedure ----------
  const handleCreatePolicyProcedure = async (
    data: CreatePolicyProcedureInput,
  ) => {
    try {
      const res = await PolicyProcedureAction.createPolicyProcedure(data);
      if (res.status) {
        toast.success(res.message || "Policy procedure created successfully");
        setAddOpen(false);
        fetchPolicyProcedures(searchQuery);
      } else {
        toast.error(res.message || "Failed to create policy procedure");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create policy procedure",
      );
    }
  };

  // ---------- View policy procedure ----------
  const handleView = async (row: PolicyProcedureTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await PolicyProcedureAction.getPolicyProcedure(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setViewPolicyProcedure(res.data);
      } else {
        toast.error(
          res.message || "Failed to load policy procedure details",
        );
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load policy procedure details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // ---------- Edit policy procedure ----------
  const handleEditOpen = async (row: PolicyProcedureTableRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await PolicyProcedureAction.getPolicyProcedure(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setEditPolicyProcedure(res.data);
      } else {
        toast.error(
          res.message || "Failed to load policy procedure details",
        );
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load policy procedure details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdatePolicyProcedure = async (
    data: UpdatePolicyProcedureInput,
  ) => {
    if (!editPolicyProcedure) return;
    try {
      const res = await PolicyProcedureAction.updatePolicyProcedure(
        editPolicyProcedure._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Policy procedure updated successfully");
        setEditOpen(false);
        setEditPolicyProcedure(null);
        fetchPolicyProcedures(searchQuery);
      } else {
        toast.error(res.message || "Failed to update policy procedure");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update policy procedure",
      );
    }
  };

  // ---------- Delete policy procedure ----------
  const handleDeleteOpen = (row: PolicyProcedureTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await PolicyProcedureAction.deletePolicyProcedure(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Policy procedure deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchPolicyProcedures(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete policy procedure");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete policy procedure",
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
  if (!roleReady) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Validating access...</p>
        </div>
      </div>
    );
  }

  // ---------- Loading state ----------
  if (loading && rows.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading policy procedures...</p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <PolicyProcedureHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <PolicyProceduresTable
        data={rows}
        onAddPolicy={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddPolicyProcedureModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreatePolicyProcedure}
        standAloneId={standAloneId}
      />

      <ViewPolicyProcedureModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewPolicyProcedure(null);
        }}
        policyProcedure={viewPolicyProcedure}
        loading={viewLoading}
      />

      <EditPolicyProcedureModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditPolicyProcedure(null);
        }}
        onSubmit={handleUpdatePolicyProcedure}
        policyProcedure={editPolicyProcedure}
        loading={editLoading}
      />

      <DeletePolicyProcedureDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        policyName={deleteTarget?.policyName || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
