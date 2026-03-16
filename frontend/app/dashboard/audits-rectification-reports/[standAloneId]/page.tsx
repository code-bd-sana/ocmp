"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import AuditRectificationHeader from "@/components/dashboard/audits-rectification-reports/AuditRectificationHeader";
import AuditRectificationTable, {
  AuditRectificationTableRow,
  toAuditRectificationTableRows,
} from "@/components/dashboard/audits-rectification-reports/AuditRectificationTable";
import AddAuditRectificationModal from "@/components/dashboard/audits-rectification-reports/AddAuditRectificationModal";
import ViewAuditRectificationModal from "@/components/dashboard/audits-rectification-reports/ViewAuditRectificationModal";
import EditAuditRectificationModal from "@/components/dashboard/audits-rectification-reports/EditAuditRectificationModal";
import DeleteAuditRectificationDialog from "@/components/dashboard/audits-rectification-reports/DeleteAuditRectificationDialog";

import { AuditRectificationReportsAction } from "@/service/audits-rectification-reports";
import {
  AuditRectificationReportRow,
  CreateAuditRectificationReportInput,
  UpdateAuditRectificationReportInput,
} from "@/lib/audits-rectification-reports/audits-rectification-reports.types";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function AuditRectificationPage({ params }: PageProps) {
  const { standAloneId } = use(params);

  const [rows, setRows] = useState<AuditRectificationTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewReport, setViewReport] =
    useState<AuditRectificationReportRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editReport, setEditReport] =
    useState<AuditRectificationReportRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<AuditRectificationTableRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchReports = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await AuditRectificationReportsAction.getReports(
          standAloneId,
          {
            searchKey: search || undefined,
            showPerPage: 100,
          },
        );

        if (res.status && res.data) {
          setRows(
            toAuditRectificationTableRows(res.data.AuditAndRecificationReports),
          );
        } else {
          setError(res.message || "Failed to load audit reports");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load audit reports",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchReports(value);
    }, 400);
  };

  const handleCreateReport = async (
    data: CreateAuditRectificationReportInput,
  ) => {
    try {
      const res = await AuditRectificationReportsAction.createReport(data);
      if (res.status) {
        toast.success(res.message || "Report created successfully");
        setAddOpen(false);
        fetchReports(searchQuery);
      } else {
        toast.error(res.message || "Failed to create report");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create report",
      );
    }
  };

  const handleView = async (row: AuditRectificationTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await AuditRectificationReportsAction.getReport(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setViewReport(res.data);
      } else {
        toast.error(res.message || "Failed to load report details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load report details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditOpen = async (row: AuditRectificationTableRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await AuditRectificationReportsAction.getReport(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setEditReport(res.data);
      } else {
        toast.error(res.message || "Failed to load report details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load report details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateReport = async (
    data: UpdateAuditRectificationReportInput,
  ) => {
    if (!editReport) return;

    try {
      const res = await AuditRectificationReportsAction.updateReport(
        editReport._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Report updated successfully");
        setEditOpen(false);
        setEditReport(null);
        fetchReports(searchQuery);
      } else {
        toast.error(res.message || "Failed to update report");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update report",
      );
    }
  };

  const handleDeleteOpen = (row: AuditRectificationTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      const res = await AuditRectificationReportsAction.deleteReport(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Report deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchReports(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete report");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete report",
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
          <p className="text-muted-foreground">Loading audit reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 lg:mr-10">
      <AuditRectificationHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <AuditRectificationTable
        data={rows}
        onAddReport={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddAuditRectificationModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateReport}
        standAloneId={standAloneId}
      />

      <ViewAuditRectificationModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewReport(null);
        }}
        report={viewReport}
        loading={viewLoading}
      />

      <EditAuditRectificationModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditReport(null);
        }}
        onSubmit={handleUpdateReport}
        report={editReport}
        loading={editLoading}
      />

      <DeleteAuditRectificationDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        title={deleteTarget?.title || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
