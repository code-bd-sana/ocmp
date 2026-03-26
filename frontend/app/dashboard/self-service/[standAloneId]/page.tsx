"use client";

import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { resolveRoleScopedRoute } from "@/lib/utils/role-route";
import { UserAction } from "@/service/user";

import SelfServiceHeader from "@/components/dashboard/self-service/SelfServiceHeader";
import SelfServiceTable, {
  SelfServiceTableRow,
  toSelfServiceTableRows,
} from "@/components/dashboard/self-service/SelfServiceTable";
import AddSelfServiceModal from "@/components/dashboard/self-service/AddSelfServiceModal";
import ViewSelfServiceModal from "@/components/dashboard/self-service/ViewSelfServiceModal";
import EditSelfServiceModal from "@/components/dashboard/self-service/EditSelfServiceModal";
import DeleteSelfServiceDialog from "@/components/dashboard/self-service/DeleteSelfServiceDialog";

import { SelfServiceAction } from "@/service/self-service";
import {
  CreateSelfServiceInput,
  UpdateSelfServiceInput,
  SelfServiceRow,
} from "@/lib/self-service/self-service.types";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function SelfServiceDetailsPage({ params }: PageProps) {
  const { standAloneId } = use(params);
  const router = useRouter();

  const [roleReady, setRoleReady] = useState(false);

  const [rows, setRows] = useState<SelfServiceTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewSelfService, setViewSelfService] = useState<SelfServiceRow | null>(
    null,
  );
  const [viewLoading, setViewLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editSelfService, setEditSelfService] = useState<SelfServiceRow | null>(
    null,
  );
  const [editLoading, setEditLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SelfServiceTableRow | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSelfServices = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await SelfServiceAction.getSelfServices(standAloneId, {
          searchKey: search || undefined,
          showPerPage: 100,
        });

        if (res.status && res.data) {
          setRows(toSelfServiceTableRows(res.data.selfServices));
          setError(null);
        } else {
          setError(res.message || "Failed to load self services");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load self services",
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
        const profileRes = await UserAction.getProfile();
        if (!isActive) return;

        const routeResult = resolveRoleScopedRoute({
          role: profileRes.data?.role,
          userId: profileRes.data?._id,
          standAloneId,
          basePath: "/dashboard/self-service",
        });

        if (routeResult.error) {
          setError(routeResult.error);
          setRoleReady(false);
          return;
        }

        if (routeResult.redirectTo) {
          router.replace(routeResult.redirectTo);
          return;
        }

        setRoleReady(true);
      } catch {
        if (!isActive) return;
        setError("Failed to validate access. Please try again.");
        setRoleReady(false);
      }
    };

    setRoleReady(false);
    ensureRoleScopedRoute();

    return () => {
      isActive = false;
    };
  }, [standAloneId, router]);

  useEffect(() => {
    if (roleReady) {
      fetchSelfServices();
    }
  }, [fetchSelfServices, roleReady]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSelfServices(value);
    }, 400);
  };

  const handleCreateSelfService = async (data: CreateSelfServiceInput) => {
    try {
      const res = await SelfServiceAction.createSelfService(data);
      if (res.status) {
        toast.success(res.message || "Self service created successfully");
        setAddOpen(false);
        fetchSelfServices(searchQuery);
      } else {
        toast.error(res.message || "Failed to create self service");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create self service",
      );
    }
  };

  const handleView = async (row: SelfServiceTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await SelfServiceAction.getSelfService(row._id, standAloneId);
      if (res.status && res.data) {
        setViewSelfService(res.data);
      } else {
        toast.error(res.message || "Failed to load self service details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load self service details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditOpen = async (row: SelfServiceTableRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await SelfServiceAction.getSelfService(row._id, standAloneId);
      if (res.status && res.data) {
        setEditSelfService(res.data);
      } else {
        toast.error(res.message || "Failed to load self service details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load self service details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateSelfService = async (data: UpdateSelfServiceInput) => {
    if (!editSelfService) return;

    try {
      const res = await SelfServiceAction.updateSelfService(
        editSelfService._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Self service updated successfully");
        setEditOpen(false);
        setEditSelfService(null);
        fetchSelfServices(searchQuery);
      } else {
        toast.error(res.message || "Failed to update self service");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update self service",
      );
    }
  };

  const handleDeleteOpen = (row: SelfServiceTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      const res = await SelfServiceAction.deleteSelfService(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Self service deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchSelfServices(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete self service");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete self service",
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

  if (!roleReady) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Validating access...</p>
        </div>
      </div>
    );
  }

  if (loading && rows.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading self services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 lg:mr-10">
      <SelfServiceHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <SelfServiceTable
        data={rows}
        onAddSelfService={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddSelfServiceModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateSelfService}
        standAloneId={standAloneId}
      />

      <ViewSelfServiceModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewSelfService(null);
        }}
        selfService={
          viewSelfService
            ? {
                _id: viewSelfService._id,
                serviceName: viewSelfService.serviceName,
                description: viewSelfService.description || "—",
                serviceLink: viewSelfService.serviceLink || "—",
                standAloneId: viewSelfService.standAloneId,
                createdBy: viewSelfService.createdBy,
              }
            : null
        }
        loading={viewLoading}
        standAloneId={standAloneId}
      />

      <EditSelfServiceModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditSelfService(null);
        }}
        onSubmit={handleUpdateSelfService}
        selfService={editSelfService}
        loading={editLoading}
        standAloneId={standAloneId}
      />

      <DeleteSelfServiceDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={deleteTarget?.serviceName || ""}
        loading={deleteLoading}
      />
    </div>
  );
}
