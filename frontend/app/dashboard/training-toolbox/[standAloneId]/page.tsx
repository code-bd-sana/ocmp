"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import AddToolboxModal from "@/components/dashboard/training-toolbox/AddToolboxModal";
import DeleteToolboxDialog from "@/components/dashboard/training-toolbox/DeleteToolboxModal";
import EditToolboxModal from "@/components/dashboard/training-toolbox/EditToolboxModal";
import ToolboxHeader from "@/components/dashboard/training-toolbox/ToolboxHeader";
import ToolboxTable, {
  ToolboxTableRow,
  toToolboxTableRow,
} from "@/components/dashboard/training-toolbox/ToolboxTable";
import ViewToolboxModal from "@/components/dashboard/training-toolbox/ViewToolboxModal";
import {
  CreateTrainingToolboxInput,
  TrainingToolboxRow,
  UpdateTrainingToolboxInput,
} from "@/lib/training-toolbox/training-toolbox.type";
import { TrainingToolboxAction } from "@/service/training-toolbox";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function TrainingToolboxPage({ params }: PageProps) {
  const { standAloneId } = use(params);

  const [rows, setRows] = useState<ToolboxTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewToolbox, setViewToolbox] = useState<TrainingToolboxRow | null>(
    null,
  );
  const [viewLoading, setViewLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editToolbox, setEditToolbox] = useState<TrainingToolboxRow | null>(
    null,
  );
  const [editLoading, setEditLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ToolboxTableRow | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchToolboxes = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await TrainingToolboxAction.getTrainingToolboxes(
          standAloneId,
          {
            searchKey: search || undefined,
            showPerPage: 100,
          },
        );

        if (res.status && res.data) {
          setRows(toToolboxTableRow(res.data.toolboxes || []));
          setError(null);
        } else {
          setError(res.message || "Failed to load training toolbox records");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load training toolbox records",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    fetchToolboxes();
  }, [fetchToolboxes]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchToolboxes(value);
    }, 400);
  };

  const handleCreate = async (data: CreateTrainingToolboxInput) => {
    try {
      const res = await TrainingToolboxAction.createTrainingToolbox({
        ...data,
        standAloneId,
      });
      if (res.status) {
        toast.success(res.message || "Training toolbox created successfully");
        setAddOpen(false);
        fetchToolboxes(searchQuery);
      } else {
        toast.error(res.message || "Failed to create training toolbox");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create training toolbox",
      );
    }
  };

  const handleView = async (row: ToolboxTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await TrainingToolboxAction.getTrainingToolbox(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setViewToolbox(res.data);
      } else {
        toast.error(res.message || "Failed to load toolbox details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load toolbox details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditOpen = async (row: ToolboxTableRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await TrainingToolboxAction.getTrainingToolbox(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setEditToolbox(res.data);
      } else {
        toast.error(res.message || "Failed to load toolbox details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load toolbox details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdate = async (data: UpdateTrainingToolboxInput) => {
    if (!editToolbox) return;
    try {
      const res = await TrainingToolboxAction.updateTrainingToolbox(
        editToolbox._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Training toolbox updated successfully");
        setEditOpen(false);
        setEditToolbox(null);
        fetchToolboxes(searchQuery);
      } else {
        toast.error(res.message || "Failed to update training toolbox");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update training toolbox",
      );
    }
  };

  const handleDeleteOpen = (row: ToolboxTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await TrainingToolboxAction.deleteTrainingToolbox(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Training toolbox deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchToolboxes(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete training toolbox");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete training toolbox",
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
          <p className="text-muted-foreground">Loading training toolbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 lg:mr-10">
      <ToolboxHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <ToolboxTable
        data={rows}
        onAddToolbox={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddToolboxModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreate}
        standAloneId={standAloneId}
      />

      <ViewToolboxModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewToolbox(null);
        }}
        toolbox={viewToolbox}
        loading={viewLoading}
      />

      <EditToolboxModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditToolbox(null);
        }}
        onSubmit={handleUpdate}
        toolbox={editToolbox}
        loading={editLoading}
        standAloneId={standAloneId}
      />

      <DeleteToolboxDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={deleteTarget?.toolboxTitle || ""}
        loading={deleteLoading}
      />
    </div>
  );
}
