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
import { TrainingRecordsAction } from "@/service/training-records";
import {
  TrainingRecordGroup,
  TrainingRecordStatus,
} from "@/lib/training-records/training-records.types";
import TrainingRecordTable, {
  TrainingRecordTableRow,
} from "@/components/dashboard/training-records/TrainingRecordTable";
import UpdateTrainingRecordStatusModal from "@/components/dashboard/training-records/UpdateTrainingRecordStatusModal";

const ITEMS_PER_PAGE = 10;

interface TrainingRecordSectionProps {
  standAloneId?: string;
}

interface StatusTarget {
  registerId: string;
  status: TrainingRecordStatus;
}

function splitName(name: string): { firstName: string; surName: string } {
  const trimmed = name.trim();
  if (!trimmed) return { firstName: "--", surName: "--" };

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], surName: "--" };
  }

  return {
    firstName: parts[0],
    surName: parts.slice(1).join(" "),
  };
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString();
}

export default function TrainingRecordSection({
  standAloneId: scopedStandAloneId,
}: TrainingRecordSectionProps) {
  const [rows, setRows] = useState<TrainingRecordTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standAloneId, setStandAloneId] = useState<string | undefined>(
    scopedStandAloneId,
  );
  const [search, setSearch] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusTarget, setStatusTarget] = useState<StatusTarget | null>(null);

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

  const mapRows = (groups: TrainingRecordGroup[]): TrainingRecordTableRow[] => {
    const mapped: TrainingRecordTableRow[] = [];

    groups.forEach((group) => {
      const participantName = group.participantName || "";
      const { firstName, surName } = splitName(participantName);

      group.records.forEach((record) => {
        mapped.push({
          registerId: record._id,
          firstName,
          surName,
          fullName: `${firstName} ${surName}`.trim(),
          training: group.trainingName || "--",
          intervalDay: String(group.trainingInterval ?? "--"),
          trainingDate: formatDateTime(record.trainingDate),
          status: record.status,
        });
      });
    });

    return mapped;
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

        const res = await TrainingRecordsAction.getTrainingRecords(scopedId, {
          searchKey: searchKey || undefined,
          showPerPage: ITEMS_PER_PAGE,
          pageNo: page,
        });

        if (!res.status || !res.data) {
          throw new Error(res.message || "Failed to load training records");
        }

        setRows(mapRows(res.data.trainingRecords || []));
        setTotalPages(Math.max(1, res.data.totalPages || 1));
        setTotalData(res.data.totalData || 0);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load training records",
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
  }, [fetchRows, pageNo, search]);

  const tableRows = useMemo(() => rows, [rows]);

  const handleStatusOpen = (row: TrainingRecordTableRow) => {
    setStatusTarget({
      registerId: row.registerId,
      status: row.status as TrainingRecordStatus,
    });
    setStatusOpen(true);
  };

  const handleStatusUpdate = async (status: TrainingRecordStatus) => {
    if (!statusTarget) return;

    try {
      setStatusLoading(true);

      let scopedId = standAloneId;
      if (scopedId === undefined) {
        scopedId = await resolveScope();
        setStandAloneId(scopedId);
      }

      const res = await TrainingRecordsAction.updateTrainingRecordStatus(
        statusTarget.registerId,
        scopedId,
        { status },
      );

      if (!res.status) {
        throw new Error(res.message || "Failed to update status");
      }

      toast.success(
        res.message || "Training record status updated successfully",
      );
      setStatusOpen(false);
      setStatusTarget(null);
      fetchRows({ searchKey: search, page: pageNo });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status",
      );
    } finally {
      setStatusLoading(false);
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

      <TrainingRecordTable data={tableRows} onUpdateStatus={handleStatusOpen} />

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

      {statusTarget ? (
        <UpdateTrainingRecordStatusModal
          open={statusOpen}
          onOpenChange={(open) => {
            setStatusOpen(open);
            if (!open) setStatusTarget(null);
          }}
          currentStatus={statusTarget.status}
          onSubmit={handleStatusUpdate}
        />
      ) : null}

      {statusLoading ? <div className="hidden" /> : null}
    </div>
  );
}
