"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import WorkingTimeDirectiveHeader from "@/components/dashboard/working-time-directives/WorkingTimeDirectiveHeader";
import WorkingTimeDirectivesTable, {
  WTDTableRow,
  toWTDTableRows,
} from "@/components/dashboard/working-time-directives/WorkingTimeDirectivesTable";
import AddWorkingTimeDirectiveModal from "@/components/dashboard/working-time-directives/AddWorkingTimeDirectiveModal";
import ViewWorkingTimeDirectiveModal from "@/components/dashboard/working-time-directives/ViewWorkingTimeDirectiveModal";
import EditWorkingTimeDirectiveModal from "@/components/dashboard/working-time-directives/EditWorkingTimeDirectiveModal";
import DeleteWorkingTimeDirectiveDialog from "@/components/dashboard/working-time-directives/DeleteWorkingTimeDirectiveDialog";

import { WorkingTimeDirectiveAction } from "@/service/working-time-directive";
import {
  CreateWorkingTimeDirectiveInput,
  UpdateWorkingTimeDirectiveInput,
} from "@/lib/working-time-directives/working-time-directive.types";
import { UserAction } from "@/service/user";
import { resolveRoleScopedRoute } from "@/lib/utils/role-route";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function WorkingTimeDirectivePage({ params }: PageProps) {
  const { standAloneId } = use(params);
  const router = useRouter();
  const [roleReady, setRoleReady] = useState(false);

  const [rows, setRows] = useState<WTDTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewDirective, setViewDirective] = useState<WTDTableRow | null>(null);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editDirective, setEditDirective] = useState<WTDTableRow | null>(null);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WTDTableRow | null>(null);
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
          basePath: "/dashboard/working-time-directive",
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

  // ---------- Fetch working time directives ----------
  const fetchDirectives = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await WorkingTimeDirectiveAction.getWorkingTimeDirectives(
          standAloneId,
          {
            searchKey: search || undefined,
            showPerPage: 100,
          },
        );
        if (res.status && res.data) {
          setRows(toWTDTableRows(res.data.workingTimeDirectives));
        } else {
          setError(res.message || "Failed to load working time directives");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load working time directives",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    if (!roleReady) return;
    fetchDirectives();
  }, [fetchDirectives, roleReady]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchDirectives(value);
    }, 400);
  };

  // ---------- Create working time directive ----------
  const handleCreateDirective = async (
    data: CreateWorkingTimeDirectiveInput,
  ) => {
    try {
      const res =
        await WorkingTimeDirectiveAction.createWorkingTimeDirective(data);
      if (res.status) {
        toast.success(
          res.message || "Working time directive created successfully",
        );
        setAddOpen(false);
        fetchDirectives(searchQuery);
      } else {
        toast.error(
          res.message || "Failed to create working time directive",
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create working time directive",
      );
    }
  };

  // ---------- View working time directive ----------
  const handleView = (row: WTDTableRow) => {
    setViewDirective(row);
    setViewOpen(true);
  };

  // ---------- Edit working time directive ----------
  const handleEditOpen = (row: WTDTableRow) => {
    setEditDirective(row);
    setEditOpen(true);
  };

  const handleUpdateDirective = async (
    data: UpdateWorkingTimeDirectiveInput,
  ) => {
    if (!editDirective) return;
    try {
      const res =
        await WorkingTimeDirectiveAction.updateWorkingTimeDirective(
          editDirective._id,
          standAloneId,
          data,
        );
      if (res.status) {
        toast.success(
          res.message || "Working time directive updated successfully",
        );
        setEditOpen(false);
        setEditDirective(null);
        fetchDirectives(searchQuery);
      } else {
        toast.error(
          res.message || "Failed to update working time directive",
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update working time directive",
      );
    }
  };

  // ---------- Delete working time directive ----------
  const handleDeleteOpen = (row: WTDTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res =
        await WorkingTimeDirectiveAction.deleteWorkingTimeDirective(
          deleteTarget._id,
          standAloneId,
        );
      if (res.status) {
        toast.success(
          res.message || "Working time directive deleted successfully",
        );
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchDirectives(searchQuery);
      } else {
        toast.error(
          res.message || "Failed to delete working time directive",
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete working time directive",
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
          <p className="text-muted-foreground">
            Loading working time directives...
          </p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <WorkingTimeDirectiveHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <WorkingTimeDirectivesTable
        data={rows}
        onAddDirective={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddWorkingTimeDirectiveModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateDirective}
        standAloneId={standAloneId}
      />

      <ViewWorkingTimeDirectiveModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewDirective(null);
        }}
        directive={viewDirective}
        loading={false}
      />

      <EditWorkingTimeDirectiveModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditDirective(null);
        }}
        onSubmit={handleUpdateDirective}
        directive={editDirective}
        loading={false}
        standAloneId={standAloneId}
      />

      <DeleteWorkingTimeDirectiveDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        driverName={deleteTarget?.driverName || ""}
        vehicleRegId={deleteTarget?.vehicleRegId || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
