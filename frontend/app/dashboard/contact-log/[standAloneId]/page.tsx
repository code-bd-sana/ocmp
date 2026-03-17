"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import ContactLogHeader from "@/components/dashboard/contact-log/ContactLogHeader";
import ContactLogsTable, {
  ContactLogTableRow,
  toContactLogTableRows,
} from "@/components/dashboard/contact-log/ContactLogsTable";
import AddContactLogModal from "@/components/dashboard/contact-log/AddContactLogModal";
import ViewContactLogModal from "@/components/dashboard/contact-log/ViewContactLogModal";
import EditContactLogModal from "@/components/dashboard/contact-log/EditContactLogModal";
import DeleteContactLogDialog from "@/components/dashboard/contact-log/DeleteContactLogDialog";

import { ContactLogAction } from "@/service/contact-log";
import {
  ContactLogRow,
  CreateContactLogInput,
  UpdateContactLogInput,
} from "@/lib/contact-log/contact-log.types";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function ContactLogPage({ params }: PageProps) {
  const { standAloneId } = use(params);

  const [rows, setRows] = useState<ContactLogTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewContactLog, setViewContactLog] = useState<ContactLogRow | null>(
    null,
  );
  const [viewLoading, setViewLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editContactLog, setEditContactLog] = useState<ContactLogRow | null>(
    null,
  );
  const [editLoading, setEditLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactLogTableRow | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchContactLogs = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await ContactLogAction.getContactLogs(standAloneId, {
          searchKey: search || undefined,
          showPerPage: 100,
        });

        if (res.status && res.data) {
          setRows(toContactLogTableRows(res.data.contactLogs));
        } else {
          setError(res.message || "Failed to load contact logs");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load contact logs",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    fetchContactLogs();
  }, [fetchContactLogs]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchContactLogs(value);
    }, 400);
  };

  const handleCreateContactLog = async (data: CreateContactLogInput) => {
    try {
      const res = await ContactLogAction.createContactLog(data);
      if (res.status) {
        toast.success(res.message || "Contact log created successfully");
        setAddOpen(false);
        fetchContactLogs(searchQuery);
      } else {
        toast.error(res.message || "Failed to create contact log");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create contact log",
      );
    }
  };

  const handleView = async (row: ContactLogTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await ContactLogAction.getContactLog(row._id, standAloneId);
      if (res.status && res.data) {
        setViewContactLog(res.data);
      } else {
        toast.error(res.message || "Failed to load contact-log details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load contact-log details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditOpen = async (row: ContactLogTableRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await ContactLogAction.getContactLog(row._id, standAloneId);
      if (res.status && res.data) {
        setEditContactLog(res.data);
      } else {
        toast.error(res.message || "Failed to load contact-log details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load contact-log details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateContactLog = async (data: UpdateContactLogInput) => {
    if (!editContactLog) return;
    try {
      const res = await ContactLogAction.updateContactLog(
        editContactLog._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Contact log updated successfully");
        setEditOpen(false);
        setEditContactLog(null);
        fetchContactLogs(searchQuery);
      } else {
        toast.error(res.message || "Failed to update contact log");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update contact log",
      );
    }
  };

  const handleDeleteOpen = (row: ContactLogTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await ContactLogAction.deleteContactLog(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Contact log deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchContactLogs(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete contact log");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete contact log",
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
          <p className="text-muted-foreground">Loading contact logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 lg:mr-10">
      <ContactLogHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <ContactLogsTable
        data={rows}
        onAddContactLog={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddContactLogModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateContactLog}
        standAloneId={standAloneId}
      />

      <ViewContactLogModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewContactLog(null);
        }}
        contactLog={viewContactLog}
        loading={viewLoading}
      />

      <EditContactLogModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditContactLog(null);
        }}
        onSubmit={handleUpdateContactLog}
        contactLog={editContactLog}
        loading={editLoading}
      />

      <DeleteContactLogDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        subject={deleteTarget?.subject || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
