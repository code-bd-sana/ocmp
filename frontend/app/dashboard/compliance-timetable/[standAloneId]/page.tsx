"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import ComplianceTimetableHeader from "@/components/dashboard/compliance-timetable/ComplianceTimetableHeader";
import ComplianceTimetableTable, {
  ComplianceTimetableTableRow,
  toComplianceTimetableTableRows,
} from "@/components/dashboard/compliance-timetable/ComplianceTimetableTable";
import AddComplianceTimetableModal from "@/components/dashboard/compliance-timetable/AddComplianceTimetableModal";
import ViewComplianceTimetableModal from "@/components/dashboard/compliance-timetable/ViewComplianceTimetableModal";
import EditComplianceTimetableModal from "@/components/dashboard/compliance-timetable/EditComplianceTimetableModal";
import DeleteComplianceTimetableDialog from "@/components/dashboard/compliance-timetable/DeleteComplianceTimetableDialog";

import { ComplianceTimetableAction } from "@/service/compliance-timetable";
import {
  ComplianceTimetableRow,
  CreateComplianceTimetableInput,
  UpdateComplianceTimetableInput,
} from "@/lib/compliance-timetable/compliance-timetable.types";
import { useRouter } from "next/navigation";
import { UserAction } from "@/service/user";
import { resolveRoleScopedRoute } from "@/lib/utils/role-route";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function ComplianceTimetablePage({ params }: PageProps) {
  const { standAloneId } = use(params);
  const router = useRouter();

  const [roleReady, setRoleReady] = useState(false);

  const [rows, setRows] = useState<ComplianceTimetableTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewComplianceTimetable, setViewComplianceTimetable] =
    useState<ComplianceTimetableRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editComplianceTimetable, setEditComplianceTimetable] =
    useState<ComplianceTimetableRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<ComplianceTimetableTableRow | null>(null);
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
          basePath: "/dashboard/compliance-timetable",
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

  const fetchComplianceTimetables = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await ComplianceTimetableAction.getComplianceTimetables(
          standAloneId,
          {
            searchKey: search || undefined,
            showPerPage: 100,
          },
        );

        if (res.status && res.data) {
          setRows(
            toComplianceTimetableTableRows(res.data.complianceTimetables),
          );
        } else {
          setError(res.message || "Failed to load compliance timetable");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load compliance timetable",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    if (!roleReady) return;
    fetchComplianceTimetables();
  }, [fetchComplianceTimetables, roleReady]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchComplianceTimetables(value);
    }, 400);
  };

  const handleCreateComplianceTimetable = async (
    data: CreateComplianceTimetableInput,
  ) => {
    try {
      const res =
        await ComplianceTimetableAction.createComplianceTimetable(data);
      if (res.status) {
        toast.success(res.message || "Compliance task created successfully");
        setAddOpen(false);
        fetchComplianceTimetables(searchQuery);
      } else {
        toast.error(res.message || "Failed to create compliance task");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create compliance task",
      );
    }
  };

  const handleView = async (row: ComplianceTimetableTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await ComplianceTimetableAction.getComplianceTimetable(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setViewComplianceTimetable(res.data);
      } else {
        toast.error(res.message || "Failed to load compliance task details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load compliance task details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditOpen = async (row: ComplianceTimetableTableRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await ComplianceTimetableAction.getComplianceTimetable(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setEditComplianceTimetable(res.data);
      } else {
        toast.error(res.message || "Failed to load compliance task details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load compliance task details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateComplianceTimetable = async (
    data: UpdateComplianceTimetableInput,
  ) => {
    if (!editComplianceTimetable) return;

    try {
      const res = await ComplianceTimetableAction.updateComplianceTimetable(
        editComplianceTimetable._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Compliance task updated successfully");
        setEditOpen(false);
        setEditComplianceTimetable(null);
        fetchComplianceTimetables(searchQuery);
      } else {
        toast.error(res.message || "Failed to update compliance task");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update compliance task",
      );
    }
  };

  const handleDeleteOpen = (row: ComplianceTimetableTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      const res = await ComplianceTimetableAction.deleteComplianceTimetable(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Compliance task deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchComplianceTimetables(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete compliance task");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete compliance task",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (loading && rows.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">
            Loading compliance timetable...
          </p>
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
      <ComplianceTimetableHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <ComplianceTimetableTable
        data={rows}
        onAddComplianceTimetable={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddComplianceTimetableModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateComplianceTimetable}
        standAloneId={standAloneId}
      />

      <ViewComplianceTimetableModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewComplianceTimetable(null);
        }}
        complianceTimetable={viewComplianceTimetable}
        loading={viewLoading}
      />

      <EditComplianceTimetableModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditComplianceTimetable(null);
        }}
        onSubmit={handleUpdateComplianceTimetable}
        complianceTimetable={editComplianceTimetable}
        loading={editLoading}
      />

      <DeleteComplianceTimetableDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        task={deleteTarget?.task || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
