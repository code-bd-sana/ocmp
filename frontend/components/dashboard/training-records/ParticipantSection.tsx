"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ClientAction } from "@/service/client";
import {
  getCurrentUserRole,
  isStandaloneRole,
} from "@/service/shared/role-scope";
import { ParticipantAction } from "@/service/participants";
import {
  CreateParticipantInput,
  ParticipantDetail,
  ParticipantListItem,
  UpdateParticipantInput,
} from "@/lib/participants/participants.types";
import ParticipantTable, {
  ParticipantTableRow,
} from "@/components/dashboard/training-records/ParticipantTable";
import AddParticipantModal from "@/components/dashboard/training-records/AddParticipantModal";
import EditParticipantModal from "@/components/dashboard/training-records/EditParticipantModal";
import ViewParticipantModal from "@/components/dashboard/training-records/ViewParticipantModal";
import DeleteParticipantDialog from "@/components/dashboard/training-records/DeleteParticipantDialog";

const ITEMS_PER_PAGE = 10;

interface ParticipantSectionProps {
  standAloneId?: string;
}

export default function ParticipantSection({
  standAloneId: scopedStandAloneId,
}: ParticipantSectionProps) {
  const [rows, setRows] = useState<ParticipantTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standAloneId, setStandAloneId] = useState<string | undefined>(
    scopedStandAloneId,
  );
  const [search, setSearch] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [addOpen, setAddOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewParticipant, setViewParticipant] =
    useState<ParticipantDetail | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editParticipant, setEditParticipant] =
    useState<ParticipantDetail | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ParticipantTableRow | null>(
    null,
  );

  useEffect(() => {
    setStandAloneId(scopedStandAloneId);
  }, [scopedStandAloneId]);

  const resolveScope = useCallback(async (): Promise<string | undefined> => {
    const role = await getCurrentUserRole();

    if (isStandaloneRole(role)) {
      return undefined;
    }

    const clients = await ClientAction.getClients({
      showPerPage: 1,
      pageNo: 1,
    });

    const firstClientId = clients.data?.data?.[0]?.client?._id;
    if (!firstClientId) {
      throw new Error("No clients found. Please add a client first.");
    }

    return firstClientId;
  }, []);

  const mapRows = (
    participants: ParticipantListItem[],
  ): ParticipantTableRow[] => {
    return participants.map((row) => {
      const firstName = row.firstName || "";
      const surName = row.lastName || "";
      const fullName = `${firstName} ${surName}`.trim();

      return {
        _id: row._id,
        firstName,
        surName,
        fullName,
        role: row.role?.roleName || "--",
        employmentStatus: row.employmentStatus ? "Active" : "Inactive",
      };
    });
  };

  const fetchRows = useCallback(
    async ({ searchKey, page }: { searchKey?: string; page: number }) => {
      try {
        setLoading(true);
        setError(null);

        let scopedId = standAloneId;
        if (scopedId === undefined) {
          scopedId = await resolveScope();
          setStandAloneId(scopedId);
        }

        const res = await ParticipantAction.getParticipants(scopedId, {
          searchKey: searchKey || undefined,
          showPerPage: ITEMS_PER_PAGE,
          pageNo: page,
        });

        if (!res.status || !res.data) {
          throw new Error(res.message || "Failed to load participants");
        }

        setRows(mapRows(res.data.participants || []));
        setTotalPages(Math.max(1, res.data.totalPages || 1));
        setTotalData(res.data.totalData || 0);

        if (
          (res.data.participants?.length || 0) === 0 &&
          page > 1 &&
          (res.data.totalData || 0) > 0
        ) {
          setPageNo((prev) => Math.max(1, prev - 1));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load participants",
        );
      } finally {
        setLoading(false);
      }
    },
    [resolveScope, standAloneId],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchRows({ searchKey: search, page: pageNo });
    }, 400);

    return () => clearTimeout(timeout);
  }, [fetchRows, search, pageNo]);

  const tableRows = useMemo(() => rows, [rows]);

  const handleCreate = async (payload: CreateParticipantInput) => {
    try {
      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await ParticipantAction.createParticipant({
        ...payload,
        standAloneId: scopedId,
      });

      if (!res.status) {
        throw new Error(res.message || "Failed to create participant");
      }

      toast.success(res.message || "Participant created successfully");
      setAddOpen(false);
      setPageNo(1);
      fetchRows({ searchKey: search, page: 1 });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create participant",
      );
    }
  };

  const handleViewOpen = async (row: ParticipantTableRow) => {
    try {
      setViewOpen(true);
      setViewLoading(true);

      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await ParticipantAction.getParticipantById(row._id, scopedId);
      if (!res.status || !res.data) {
        throw new Error(res.message || "Failed to load participant details");
      }

      setViewParticipant(res.data);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load participant details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditOpen = async (row: ParticipantTableRow) => {
    try {
      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await ParticipantAction.getParticipantById(row._id, scopedId);
      if (!res.status || !res.data) {
        throw new Error(res.message || "Failed to load participant details");
      }

      setEditParticipant(res.data);
      setEditOpen(true);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load participant details",
      );
      setEditOpen(false);
    }
  };

  const handleUpdate = async (id: string, payload: UpdateParticipantInput) => {
    try {
      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await ParticipantAction.updateParticipant(
        id,
        scopedId,
        payload,
      );
      if (!res.status) {
        throw new Error(res.message || "Failed to update participant");
      }

      toast.success(res.message || "Participant updated successfully");
      setEditOpen(false);
      setEditParticipant(null);
      fetchRows({ searchKey: search, page: pageNo });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update participant",
      );
    }
  };

  const handleDeleteOpen = (row: ParticipantTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);

      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await ParticipantAction.deleteParticipant(
        deleteTarget._id,
        scopedId,
      );

      if (!res.status) {
        throw new Error(res.message || "Failed to delete participant");
      }

      toast.success(res.message || "Participant deleted successfully");
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchRows({ searchKey: search, page: pageNo });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete participant",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-[#f5f5f5] p-5">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-[#f5f5f5] p-5">
      <Input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPageNo(1);
        }}
        placeholder="Search by first name or sur name"
        className="max-w-md rounded-none bg-white"
      />

      <ParticipantTable
        data={tableRows}
        onAdd={() => setAddOpen(true)}
        onView={handleViewOpen}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <div className="flex items-center justify-between px-1">
        <p className="text-muted-foreground text-sm">
          Showing {rows.length} of {totalData}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPageNo((prev) => Math.max(1, prev - 1))}
            disabled={pageNo <= 1 || loading}
            className="rounded border px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-sm font-medium">
            Page {pageNo} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPageNo((prev) => Math.min(totalPages, prev + 1))}
            disabled={pageNo >= totalPages || loading}
            className="rounded border px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AddParticipantModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreate}
        standAloneId={standAloneId}
      />

      <ViewParticipantModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewParticipant(null);
        }}
        participant={viewParticipant}
        loading={viewLoading}
      />

      {editParticipant ? (
        <EditParticipantModal
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditParticipant(null);
          }}
          participant={editParticipant}
          standAloneId={standAloneId}
          onSubmit={handleUpdate}
        />
      ) : null}

      <DeleteParticipantDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        participantName={deleteTarget?.fullName || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
