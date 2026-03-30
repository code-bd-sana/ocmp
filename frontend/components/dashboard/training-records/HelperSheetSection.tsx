"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { TrainingAction } from "@/service/training";
import {
  getCurrentUserRole,
  isStandaloneRole,
} from "@/service/shared/role-scope";
import { ClientAction } from "@/service/client";
import {
  TrainingDetail,
  TrainingListItem,
  UpdateTrainingInput,
} from "@/lib/training/training.types";
import AddHelperTrainingModal from "@/components/dashboard/training-records/AddHelperTrainingModal";
import EditHelperTrainingModal from "@/components/dashboard/training-records/EditHelperTrainingModal";
import ViewHelperTrainingModal from "@/components/dashboard/training-records/ViewHelperTrainingModal";
import HelperSheetTable, {
  HelperSheetTableRow,
} from "@/components/dashboard/training-records/HelperSheetTable";
import DeleteHelperTrainingDialog from "@/components/dashboard/training-records/DeleteHelperTrainingDialog";

interface HelperRow extends HelperSheetTableRow {
  training: string;
  intervalText: string;
  intervalDays: string;
}

const ITEMS_PER_PAGE = 10;

interface HelperSheetSectionProps {
  standAloneId?: string;
}

export default function HelperSheetSection({
  standAloneId: scopedStandAloneId,
}: HelperSheetSectionProps) {
  const [rows, setRows] = useState<HelperRow[]>([]);
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
  const [viewTraining, setViewTraining] = useState<TrainingDetail | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editTraining, setEditTraining] = useState<TrainingDetail | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HelperRow | null>(null);

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

  const toIntervalText = (days: number | null): string => {
    if (!days || Number.isNaN(days)) return "--";
    const months = Number((days / 30).toFixed(1));
    return `${months} months`;
  };

  const mapRows = (trainings: TrainingListItem[]): HelperRow[] => {
    return trainings.map((row) => ({
      _id: row._id,
      training: row.trainingName,
      intervalText: toIntervalText(row.firstIntervalDay),
      intervalDays:
        row.firstIntervalDay === null || Number.isNaN(row.firstIntervalDay)
          ? "--"
          : String(row.firstIntervalDay),
    }));
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

        const res = await TrainingAction.getTrainings(scopedId, {
          searchKey: searchKey || undefined,
          showPerPage: ITEMS_PER_PAGE,
          pageNo: page,
        });

        if (!res.status || !res.data) {
          throw new Error(res.message || "Failed to load training rows");
        }

        setRows(mapRows(res.data.trainings || []));
        setTotalPages(Math.max(1, res.data.totalPages || 1));
        setTotalData(res.data.totalData || 0);

        if (
          (res.data.trainings?.length || 0) === 0 &&
          page > 1 &&
          (res.data.totalData || 0) > 0
        ) {
          setPageNo((prev) => Math.max(1, prev - 1));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load training rows",
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

  const filteredRows = useMemo(() => rows, [rows]);

  const handleCreate = async (payload: {
    trainingName: string;
    intervalDays: string;
    standAloneId?: string;
  }) => {
    try {
      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await TrainingAction.createTraining({
        trainingName: payload.trainingName.trim(),
        intervalDays: payload.intervalDays.trim(),
        standAloneId: scopedId,
      });

      if (!res.status) {
        throw new Error(res.message || "Failed to create training");
      }

      toast.success(res.message || "Training created successfully");
      setAddOpen(false);
      setPageNo(1);
      fetchRows({ searchKey: search, page: 1 });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create training",
      );
    }
  };

  const handleViewOpen = async (row: HelperRow) => {
    try {
      setViewOpen(true);
      setViewLoading(true);

      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await TrainingAction.getTrainingById(row._id, scopedId);
      if (!res.status || !res.data) {
        throw new Error(res.message || "Failed to load training details");
      }

      setViewTraining(res.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load training details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditOpen = async (row: HelperRow) => {
    try {
      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await TrainingAction.getTrainingById(row._id, scopedId);
      if (!res.status || !res.data) {
        throw new Error(res.message || "Failed to load training details");
      }

      setEditTraining(res.data);
      setEditOpen(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load training details",
      );
      setEditOpen(false);
    }
  };

  const handleUpdate = async (id: string, payload: UpdateTrainingInput) => {
    try {
      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await TrainingAction.updateTraining(id, scopedId, payload);
      if (!res.status) {
        throw new Error(res.message || "Failed to update training");
      }

      toast.success(res.message || "Training updated successfully");
      setEditOpen(false);
      setEditTraining(null);
      fetchRows({ searchKey: search, page: pageNo });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update training",
      );
    }
  };

  const handleDeleteOpen = (row: HelperRow) => {
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

      const res = await TrainingAction.deleteTraining(
        deleteTarget._id,
        scopedId,
      );
      if (!res.status) {
        throw new Error(res.message || "Failed to delete training");
      }

      toast.success(res.message || "Training deleted successfully");
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchRows({ searchKey: search, page: pageNo });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete training",
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
        placeholder="Search by training name"
        className="max-w-md rounded-none bg-white"
      />

      <HelperSheetTable
        data={filteredRows}
        onAddTraining={() => setAddOpen(true)}
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

      <AddHelperTrainingModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreate}
        standAloneId={standAloneId}
      />

      <ViewHelperTrainingModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewTraining(null);
        }}
        training={viewTraining}
        loading={viewLoading}
      />

      {editTraining ? (
        <EditHelperTrainingModal
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditTraining(null);
          }}
          training={editTraining}
          onSubmit={handleUpdate}
        />
      ) : null}

      <DeleteHelperTrainingDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        trainingName={deleteTarget?.training || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
