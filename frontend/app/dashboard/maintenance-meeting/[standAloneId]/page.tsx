"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserAction } from "@/service/user";
import { resolveRoleScopedRoute } from "@/lib/utils/role-route";

import MeetingNoteHeader from "@/components/dashboard/meeting-note/MeetingNoteHeader";
import MeetingNoteTable from "@/components/dashboard/meeting-note/MeetingNoteTable";
import AddMeetingNoteModal from "@/components/dashboard/meeting-note/AddMeetingNoteModal";
import ViewMeetingNoteModal from "@/components/dashboard/meeting-note/ViewMeetingNoteModal";
import EditMeetingNoteModal from "@/components/dashboard/meeting-note/EditMeetingNoteModal";
import DeleteMeetingNoteDialog from "@/components/dashboard/meeting-note/DeleteMeetingNoteModal";

import MaintenanceProviderHeader from "@/components/dashboard/maintenance-provider/MaintenanceProviderHeader";
import MaintenanceProviderTable from "@/components/dashboard/maintenance-provider/MaintenanceProviderTable";
import AddMaintenanceProviderModal from "@/components/dashboard/maintenance-provider/AddMaintenanceProviderModal";
import ViewMaintenanceProviderModal from "@/components/dashboard/maintenance-provider/ViewMaintenanceProviderModal";
import EditMaintenanceProviderModal from "@/components/dashboard/maintenance-provider/EditMaintenanceProviderModal";
import DeleteMaintenanceProviderDialog from "@/components/dashboard/maintenance-provider/DeleteMaintenanceProviderModal";

import {
  CreateMaintenanceProviderCommunicationInput,
  CreateMeetingNoteInput,
  MaintenanceProviderCommunicationRow,
  MeetingNoteRow,
  UpdateMaintenanceProviderCommunicationInput,
  UpdateMeetingNoteInput,
} from "@/lib/maintenance-meeting/maintenance-meeting.types";
import {
  MaintenanceProviderCommunicationAction,
  MeetingNoteAction,
} from "@/service/maintenance-meeting";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function MaintenanceMeetingStandAlonePage({
  params,
}: PageProps) {
  const { standAloneId } = use(params);
  const router = useRouter();
  const [roleReady, setRoleReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [meetingRows, setMeetingRows] = useState<MeetingNoteRow[]>([]);
  const [meetingSearchQuery, setMeetingSearchQuery] = useState("");
  const [meetingLoading, setMeetingLoading] = useState(true);

  const [meetingAddOpen, setMeetingAddOpen] = useState(false);
  const [meetingViewOpen, setMeetingViewOpen] = useState(false);
  const [meetingEditOpen, setMeetingEditOpen] = useState(false);
  const [meetingDeleteOpen, setMeetingDeleteOpen] = useState(false);
  const [meetingTarget, setMeetingTarget] = useState<MeetingNoteRow | null>(
    null,
  );
  const [meetingViewLoading, setMeetingViewLoading] = useState(false);
  const [meetingEditLoading, setMeetingEditLoading] = useState(false);
  const [meetingDeleteLoading, setMeetingDeleteLoading] = useState(false);

  const [maintenanceRows, setMaintenanceRows] = useState<
    MaintenanceProviderCommunicationRow[]
  >([]);
  const [maintenanceSearchQuery, setMaintenanceSearchQuery] = useState("");
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);

  const [maintenanceAddOpen, setMaintenanceAddOpen] = useState(false);
  const [maintenanceViewOpen, setMaintenanceViewOpen] = useState(false);
  const [maintenanceEditOpen, setMaintenanceEditOpen] = useState(false);
  const [maintenanceDeleteOpen, setMaintenanceDeleteOpen] = useState(false);
  const [maintenanceTarget, setMaintenanceTarget] =
    useState<MaintenanceProviderCommunicationRow | null>(null);
  const [maintenanceViewLoading, setMaintenanceViewLoading] = useState(false);
  const [maintenanceEditLoading, setMaintenanceEditLoading] = useState(false);
  const [maintenanceDeleteLoading, setMaintenanceDeleteLoading] =
    useState(false);

  const meetingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maintenanceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const activeStandAloneIdRef = useRef(standAloneId);

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
          basePath: "/dashboard/maintenance-meeting",
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

  useEffect(() => {
    activeStandAloneIdRef.current = standAloneId;
  }, [standAloneId]);

  useEffect(() => {
    // Reset visible rows immediately when switching clients.
    setMeetingRows([]);
    setMaintenanceRows([]);
  }, [standAloneId]);

  const fetchMeetingNotes = useCallback(
    async (search?: string) => {
      const requestedStandAloneId = standAloneId;

      if (!standAloneId) {
        setMeetingRows([]);
        setMeetingLoading(false);
        return;
      }

      try {
        setMeetingLoading(true);
        const res = await MeetingNoteAction.getMany(requestedStandAloneId, {
          searchKey: search || undefined,
          showPerPage: 100,
          pageNo: 1,
        });

        // Ignore stale responses when user quickly switches clients.
        if (activeStandAloneIdRef.current !== requestedStandAloneId) return;

        if (res.status && res.data) {
          setMeetingRows(res.data.meetingNotes || []);
        } else {
          setMeetingRows([]);
          toast.error(res.message || "Failed to fetch meeting notes");
        }
      } catch (error) {
        setMeetingRows([]);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to fetch meeting notes",
        );
      } finally {
        setMeetingLoading(false);
      }
    },
    [standAloneId],
  );

  const fetchMaintenanceProviders = useCallback(
    async (search?: string) => {
      const requestedStandAloneId = standAloneId;

      if (!standAloneId) {
        setMaintenanceRows([]);
        setMaintenanceLoading(false);
        return;
      }

      try {
        setMaintenanceLoading(true);
        const res = await MaintenanceProviderCommunicationAction.getMany(
          requestedStandAloneId,
          {
            searchKey: search || undefined,
            showPerPage: 100,
            pageNo: 1,
          },
        );

        // Ignore stale responses when user quickly switches clients.
        if (activeStandAloneIdRef.current !== requestedStandAloneId) return;

        if (res.status && res.data) {
          setMaintenanceRows(res.data.maintenanceProviderCommunications || []);
        } else {
          setMaintenanceRows([]);
          toast.error(
            res.message ||
              "Failed to fetch maintenance provider communications",
          );
        }
      } catch (error) {
        setMaintenanceRows([]);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to fetch maintenance provider communications",
        );
      } finally {
        setMaintenanceLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    if (!roleReady) return;
    fetchMeetingNotes();
    fetchMaintenanceProviders();
  }, [fetchMeetingNotes, fetchMaintenanceProviders, roleReady]);

  const handleMeetingSearchChange = (value: string) => {
    setMeetingSearchQuery(value);
    if (meetingDebounceRef.current) clearTimeout(meetingDebounceRef.current);
    meetingDebounceRef.current = setTimeout(() => {
      fetchMeetingNotes(value);
    }, 400);
  };

  const handleMaintenanceSearchChange = (value: string) => {
    setMaintenanceSearchQuery(value);
    if (maintenanceDebounceRef.current)
      clearTimeout(maintenanceDebounceRef.current);
    maintenanceDebounceRef.current = setTimeout(() => {
      fetchMaintenanceProviders(value);
    }, 400);
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

  return (
    <div className="mx-auto space-y-8 py-4 lg:mr-10">
      <div>
        <MeetingNoteHeader
          searchQuery={meetingSearchQuery}
          onSearchChange={handleMeetingSearchChange}
        />
        <MeetingNoteTable
          data={meetingRows}
          onAddClick={() => setMeetingAddOpen(true)}
          onView={async (row) => {
            setMeetingTarget(row);
            setMeetingViewOpen(true);
            setMeetingViewLoading(true);
            try {
              const res = await MeetingNoteAction.getById(
                row._id,
                standAloneId,
              );
              if (res.status && res.data) setMeetingTarget(res.data);
            } finally {
              setMeetingViewLoading(false);
            }
          }}
          onEdit={async (row) => {
            setMeetingTarget(row);
            setMeetingEditOpen(true);
            setMeetingEditLoading(true);
            try {
              const res = await MeetingNoteAction.getById(
                row._id,
                standAloneId,
              );
              if (res.status && res.data) setMeetingTarget(res.data);
            } finally {
              setMeetingEditLoading(false);
            }
          }}
          onDelete={(row) => {
            setMeetingTarget(row);
            setMeetingDeleteOpen(true);
          }}
        />
        {meetingLoading ? (
          <p className="text-muted-foreground mt-2 text-sm">
            Loading meeting notes...
          </p>
        ) : null}
      </div>

      <div>
        <MaintenanceProviderHeader
          searchQuery={maintenanceSearchQuery}
          onSearchChange={handleMaintenanceSearchChange}
        />
        <MaintenanceProviderTable
          data={maintenanceRows}
          onAddClick={() => setMaintenanceAddOpen(true)}
          onView={async (row) => {
            setMaintenanceTarget(row);
            setMaintenanceViewOpen(true);
            setMaintenanceViewLoading(true);
            try {
              const res = await MaintenanceProviderCommunicationAction.getById(
                row._id,
                standAloneId,
              );
              if (res.status && res.data) setMaintenanceTarget(res.data);
            } finally {
              setMaintenanceViewLoading(false);
            }
          }}
          onEdit={async (row) => {
            setMaintenanceTarget(row);
            setMaintenanceEditOpen(true);
            setMaintenanceEditLoading(true);
            try {
              const res = await MaintenanceProviderCommunicationAction.getById(
                row._id,
                standAloneId,
              );
              if (res.status && res.data) setMaintenanceTarget(res.data);
            } finally {
              setMaintenanceEditLoading(false);
            }
          }}
          onDelete={(row) => {
            setMaintenanceTarget(row);
            setMaintenanceDeleteOpen(true);
          }}
        />
        {maintenanceLoading ? (
          <p className="text-muted-foreground mt-2 text-sm">
            Loading maintenance provider communications...
          </p>
        ) : null}
      </div>

      <AddMeetingNoteModal
        key={`meeting-add-${meetingAddOpen ? "open" : "closed"}`}
        open={meetingAddOpen}
        onOpenChange={setMeetingAddOpen}
        loading={meetingEditLoading}
        onSubmit={async (data: CreateMeetingNoteInput) => {
          const res = await MeetingNoteAction.createAsManager({
            ...data,
            standAloneId,
          });
          if (res.status) {
            toast.success(res.message || "Meeting note created successfully");
            setMeetingAddOpen(false);
            fetchMeetingNotes(meetingSearchQuery);
          } else {
            toast.error(res.message || "Failed to create meeting note");
          }
        }}
      />

      <ViewMeetingNoteModal
        open={meetingViewOpen}
        onOpenChange={(open) => {
          setMeetingViewOpen(open);
          if (!open) setMeetingTarget(null);
        }}
        item={meetingTarget}
        loading={meetingViewLoading}
      />

      <EditMeetingNoteModal
        key={`meeting-edit-${meetingTarget?._id ?? "none"}-${meetingEditOpen ? "open" : "closed"}`}
        open={meetingEditOpen}
        onOpenChange={(open) => {
          setMeetingEditOpen(open);
          if (!open) setMeetingTarget(null);
        }}
        onSubmit={async (data: UpdateMeetingNoteInput) => {
          if (!meetingTarget) return;
          const res = await MeetingNoteAction.updateAsManager(
            meetingTarget._id,
            standAloneId,
            data,
          );
          if (res.status) {
            toast.success(res.message || "Meeting note updated successfully");
            setMeetingEditOpen(false);
            setMeetingTarget(null);
            fetchMeetingNotes(meetingSearchQuery);
          } else {
            toast.error(res.message || "Failed to update meeting note");
          }
        }}
        item={meetingTarget}
        loading={meetingEditLoading}
      />

      <DeleteMeetingNoteDialog
        open={meetingDeleteOpen}
        onOpenChange={(open) => {
          setMeetingDeleteOpen(open);
          if (!open) setMeetingTarget(null);
        }}
        onConfirm={async () => {
          if (!meetingTarget) return;
          setMeetingDeleteLoading(true);
          const res = await MeetingNoteAction.deleteAsManager(
            meetingTarget._id,
            standAloneId,
          );
          if (res.status) {
            toast.success(res.message || "Meeting note deleted successfully");
            setMeetingDeleteOpen(false);
            setMeetingTarget(null);
            fetchMeetingNotes(meetingSearchQuery);
          } else {
            toast.error(res.message || "Failed to delete meeting note");
          }
          setMeetingDeleteLoading(false);
        }}
        itemName={
          meetingTarget?.meetingDate
            ? new Date(meetingTarget.meetingDate).toLocaleDateString()
            : "this meeting note"
        }
        loading={meetingDeleteLoading}
      />

      <AddMaintenanceProviderModal
        key={`maintenance-add-${maintenanceAddOpen ? "open" : "closed"}`}
        open={maintenanceAddOpen}
        onOpenChange={setMaintenanceAddOpen}
        loading={maintenanceEditLoading}
        onSubmit={async (data: CreateMaintenanceProviderCommunicationInput) => {
          const res =
            await MaintenanceProviderCommunicationAction.createAsManager({
              ...data,
              standAloneId,
            });
          if (res.status) {
            toast.success(
              res.message ||
                "Maintenance provider communication created successfully",
            );
            setMaintenanceAddOpen(false);
            fetchMaintenanceProviders(maintenanceSearchQuery);
          } else {
            toast.error(
              res.message ||
                "Failed to create maintenance provider communication",
            );
          }
        }}
      />

      <ViewMaintenanceProviderModal
        open={maintenanceViewOpen}
        onOpenChange={(open) => {
          setMaintenanceViewOpen(open);
          if (!open) setMaintenanceTarget(null);
        }}
        item={maintenanceTarget}
        loading={maintenanceViewLoading}
      />

      <EditMaintenanceProviderModal
        key={`maintenance-edit-${maintenanceTarget?._id ?? "none"}-${maintenanceEditOpen ? "open" : "closed"}`}
        open={maintenanceEditOpen}
        onOpenChange={(open) => {
          setMaintenanceEditOpen(open);
          if (!open) setMaintenanceTarget(null);
        }}
        onSubmit={async (data: UpdateMaintenanceProviderCommunicationInput) => {
          if (!maintenanceTarget) return;
          const res =
            await MaintenanceProviderCommunicationAction.updateAsManager(
              maintenanceTarget._id,
              standAloneId,
              data,
            );
          if (res.status) {
            toast.success(
              res.message ||
                "Maintenance provider communication updated successfully",
            );
            setMaintenanceEditOpen(false);
            setMaintenanceTarget(null);
            fetchMaintenanceProviders(maintenanceSearchQuery);
          } else {
            toast.error(
              res.message ||
                "Failed to update maintenance provider communication",
            );
          }
        }}
        item={maintenanceTarget}
        loading={maintenanceEditLoading}
      />

      <DeleteMaintenanceProviderDialog
        open={maintenanceDeleteOpen}
        onOpenChange={(open) => {
          setMaintenanceDeleteOpen(open);
          if (!open) setMaintenanceTarget(null);
        }}
        onConfirm={async () => {
          if (!maintenanceTarget) return;
          setMaintenanceDeleteLoading(true);
          const res =
            await MaintenanceProviderCommunicationAction.deleteAsManager(
              maintenanceTarget._id,
              standAloneId,
            );
          if (res.status) {
            toast.success(
              res.message ||
                "Maintenance provider communication deleted successfully",
            );
            setMaintenanceDeleteOpen(false);
            setMaintenanceTarget(null);
            fetchMaintenanceProviders(maintenanceSearchQuery);
          } else {
            toast.error(
              res.message ||
                "Failed to delete maintenance provider communication",
            );
          }
          setMaintenanceDeleteLoading(false);
        }}
        itemName={maintenanceTarget?.providerName || "this communication"}
        loading={maintenanceDeleteLoading}
      />
    </div>
  );
}
