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
import { TrainingRegisterAction } from "@/service/training-register";
import {
  CreateTrainingRegisterInput,
  TrainingRegisterDetail,
  TrainingRegisterListItem,
  UpdateTrainingRegisterInput,
} from "@/lib/training-register/training-register.types";
import TrainingRegisterTable, {
  TrainingRegisterTableRow,
} from "@/components/dashboard/training-records/TrainingRegisterTable";
import AddTrainingRegisterModal from "@/components/dashboard/training-records/AddTrainingRegisterModal";
import EditTrainingRegisterModal from "@/components/dashboard/training-records/EditTrainingRegisterModal";
import ViewTrainingRegisterModal from "@/components/dashboard/training-records/ViewTrainingRegisterModal";
import DeleteTrainingRegisterDialog from "@/components/dashboard/training-records/DeleteTrainingRegisterDialog";

const ITEMS_PER_PAGE = 10;

interface TrainingRegisterSectionProps {
  standAloneId?: string;
}

export default function TrainingRegisterSection({
  standAloneId: scopedStandAloneId,
}: TrainingRegisterSectionProps) {
  const [rows, setRows] = useState<TrainingRegisterTableRow[]>([]);
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
  const [viewData, setViewData] = useState<TrainingRegisterDetail | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<TrainingRegisterDetail | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<TrainingRegisterTableRow | null>(null);

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
    registers: TrainingRegisterListItem[],
  ): TrainingRegisterTableRow[] => {
    const formatUpdatedAt = (value?: string): string => {
      if (!value) return "--";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "--";

      return date.toLocaleString();
    };

    return registers.map((row) => {
      const firstName = row.participant?.firstName || "--";
      const surName = row.participant?.lastName || "--";
      const fullName = `${firstName} ${surName}`.trim();

      return {
        _id: row._id,
        firstName,
        surName,
        fullName,
        training: row.training?.trainingName || "--",
        completed: formatUpdatedAt(row.updatedAt),
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

        const res = await TrainingRegisterAction.getRegisters(scopedId, {
          searchKey: searchKey || undefined,
          showPerPage: ITEMS_PER_PAGE,
          pageNo: page,
        });

        if (!res.status || !res.data) {
          throw new Error(res.message || "Failed to load training registers");
        }

        setRows(mapRows(res.data.registers || []));
        setTotalPages(Math.max(1, res.data.totalPages || 1));
        setTotalData(res.data.totalData || 0);

        if (
          (res.data.registers?.length || 0) === 0 &&
          page > 1 &&
          (res.data.totalData || 0) > 0
        ) {
          setPageNo((prev) => Math.max(1, prev - 1));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load training registers",
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

  const handleCreate = async (payload: CreateTrainingRegisterInput) => {
    try {
      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await TrainingRegisterAction.createRegister({
        ...payload,
        standAloneId: scopedId,
      });

      if (!res.status) {
        throw new Error(res.message || "Failed to create register");
      }

      toast.success(res.message || "Training register created successfully");
      setAddOpen(false);
      setPageNo(1);
      fetchRows({ searchKey: search, page: 1 });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create register",
      );
    }
  };

  const handleViewOpen = async (row: TrainingRegisterTableRow) => {
    try {
      setViewOpen(true);
      setViewLoading(true);

      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await TrainingRegisterAction.getRegisterById(
        row._id,
        scopedId,
      );
      if (!res.status || !res.data) {
        throw new Error(
          res.message || "Failed to load training register details",
        );
      }

      setViewData(res.data);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load training register details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditOpen = async (row: TrainingRegisterTableRow) => {
    try {
      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await TrainingRegisterAction.getRegisterById(
        row._id,
        scopedId,
      );
      if (!res.status || !res.data) {
        throw new Error(
          res.message || "Failed to load training register details",
        );
      }

      setEditData(res.data);
      setEditOpen(true);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load training register details",
      );
      setEditOpen(false);
    }
  };

  const handleUpdate = async (
    registerId: string,
    payload: UpdateTrainingRegisterInput,
  ) => {
    try {
      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await TrainingRegisterAction.updateRegister(
        registerId,
        scopedId,
        payload,
      );

      if (!res.status) {
        throw new Error(res.message || "Failed to update register");
      }

      toast.success(res.message || "Training register updated successfully");
      setEditOpen(false);
      setEditData(null);
      fetchRows({ searchKey: search, page: pageNo });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update register",
      );
    }
  };

  const handleDeleteOpen = (row: TrainingRegisterTableRow) => {
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

      const res = await TrainingRegisterAction.deleteRegister(
        deleteTarget._id,
        scopedId,
      );

      if (!res.status) {
        throw new Error(res.message || "Failed to delete register");
      }

      toast.success(res.message || "Training register deleted successfully");
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchRows({ searchKey: search, page: pageNo });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete register",
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
        placeholder="Search by participant or training"
        className="max-w-md rounded-none bg-white"
      />

      <TrainingRegisterTable
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

      <AddTrainingRegisterModal
        open={addOpen}
        onOpenChange={setAddOpen}
        standAloneId={standAloneId}
        onSubmit={handleCreate}
      />

      <ViewTrainingRegisterModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewData(null);
        }}
        registerData={viewData}
        loading={viewLoading}
      />

      {editData ? (
        <EditTrainingRegisterModal
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditData(null);
          }}
          standAloneId={standAloneId}
          registerData={editData}
          onSubmit={handleUpdate}
        />
      ) : null}

      <DeleteTrainingRegisterDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        registerName={deleteTarget?.fullName || "this register"}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
