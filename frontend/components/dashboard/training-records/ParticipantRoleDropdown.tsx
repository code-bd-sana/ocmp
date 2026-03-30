"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ParticipantAction } from "@/service/participants";
import { ParticipantRoleItem } from "@/lib/participants/participants.types";

const ROLE_PAGE_SIZE = 5;

interface ParticipantRoleDropdownProps {
  value: string;
  selectedRoleName?: string;
  standAloneId?: string;
  onChange: (roleId: string, roleName: string) => void;
  disabled?: boolean;
}

export default function ParticipantRoleDropdown({
  value,
  selectedRoleName,
  standAloneId,
  onChange,
  disabled,
}: ParticipantRoleDropdownProps) {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<ParticipantRoleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [addRoleName, setAddRoleName] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoadingRoleId, setDeleteLoadingRoleId] = useState<string | null>(
    null,
  );

  const [selectedLabel, setSelectedLabel] = useState(selectedRoleName || "");

  useEffect(() => {
    setSelectedLabel(selectedRoleName || "");
  }, [selectedRoleName]);

  const fetchRoles = useCallback(
    async (query: string, page: number) => {
      try {
        setLoading(true);

        const res = await ParticipantAction.getRoles(standAloneId, {
          searchKey: query || undefined,
          showPerPage: ROLE_PAGE_SIZE,
          pageNo: page,
        });

        if (!res.status || !res.data) {
          throw new Error(res.message || "Failed to load roles");
        }

        let nextRoles = res.data.roles || [];

        if (query.trim()) {
          const term = query.trim().toLowerCase();
          nextRoles = nextRoles.filter((role) =>
            role.roleName.toLowerCase().includes(term),
          );
        }

        setRoles(nextRoles);
        setTotalPages(Math.max(1, res.data.totalPages || 1));
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load roles",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      fetchRoles(search, pageNo);
    }, 250);

    return () => clearTimeout(timeout);
  }, [open, fetchRoles, search, pageNo]);

  const selectedRole = useMemo(
    () => roles.find((r) => r._id === value),
    [roles, value],
  );

  const selectedText = selectedRole?.roleName || selectedLabel || "Select role";

  const handleCreateRole = async () => {
    const roleName = addRoleName.trim();
    if (!roleName) {
      toast.error("Role name is required");
      return;
    }

    try {
      setAddLoading(true);
      const res = await ParticipantAction.createRole({
        roleName,
        standAloneId,
      });

      if (!res.status) {
        throw new Error(res.message || "Failed to create role");
      }

      toast.success(res.message || "Role created successfully");
      setAddRoleName("");
      setPageNo(1);
      await fetchRoles("", 1);

      if (res.data?._id && res.data?.roleName) {
        onChange(res.data._id, res.data.roleName);
        setSelectedLabel(res.data.roleName);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setAddLoading(false);
    }
  };

  const handleStartEdit = (role: ParticipantRoleItem) => {
    setEditingRoleId(role._id);
    setEditRoleName(role.roleName);
  };

  const handleCancelEdit = () => {
    setEditingRoleId(null);
    setEditRoleName("");
  };

  const handleUpdateRole = async (roleId: string) => {
    const roleName = editRoleName.trim();
    if (!roleName) {
      toast.error("Role name is required");
      return;
    }

    try {
      setUpdateLoading(true);
      const res = await ParticipantAction.updateRole(roleId, standAloneId, {
        roleName,
      });

      if (!res.status) {
        throw new Error(res.message || "Failed to update role");
      }

      toast.success(res.message || "Role updated successfully");
      setEditingRoleId(null);
      setEditRoleName("");

      await fetchRoles(search, pageNo);

      if (value === roleId) {
        setSelectedLabel(roleName);
        onChange(roleId, roleName);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdateLoading(false);
    }
  };

  const selectRole = (role: ParticipantRoleItem) => {
    onChange(role._id, role.roleName);
    setSelectedLabel(role.roleName);
    setOpen(false);
  };

  const handleDeleteRole = async (role: ParticipantRoleItem) => {
    try {
      setDeleteLoadingRoleId(role._id);

      const res = await ParticipantAction.deleteRole(role._id, standAloneId);
      if (!res.status) {
        throw new Error(res.message || "Failed to delete role");
      }

      toast.success(res.message || "Role deleted successfully");

      if (value === role._id) {
        onChange("", "");
        setSelectedLabel("");
      }

      await fetchRoles(search, pageNo);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete role");
    } finally {
      setDeleteLoadingRoleId(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between rounded-none"
          disabled={disabled}
        >
          <span className="truncate">{selectedText}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-90 space-y-3 p-3" align="start">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPageNo(1);
          }}
          placeholder="Search role"
          className="rounded-none"
        />

        <div className="max-h-56 space-y-2 overflow-y-auto rounded border p-2">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading roles...</p>
          ) : roles.length === 0 ? (
            <p className="text-muted-foreground text-sm">No roles found</p>
          ) : (
            roles.map((role) => {
              const isSelected = value === role._id;
              const isEditing = editingRoleId === role._id;

              return (
                <div
                  key={role._id}
                  className="flex items-center gap-2 rounded border p-2"
                >
                  {isEditing ? (
                    <>
                      <Input
                        value={editRoleName}
                        onChange={(e) => setEditRoleName(e.target.value)}
                        className="h-8 rounded-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateRole(role._id)}
                        disabled={updateLoading}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={updateLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => selectRole(role)}
                        className="flex flex-1 items-center justify-between text-left"
                      >
                        <span className="text-sm">{role.roleName}</span>
                        {isSelected ? (
                          <Check className="text-primary h-4 w-4" />
                        ) : null}
                      </button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(role)}
                        disabled={deleteLoadingRoleId === role._id}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRole(role)}
                        disabled={deleteLoadingRoleId === role._id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={addRoleName}
            onChange={(e) => setAddRoleName(e.target.value)}
            placeholder="Add new role"
            className="rounded-none"
          />
          <Button
            type="button"
            onClick={handleCreateRole}
            disabled={addLoading}
            className="rounded-none"
          >
            Add
          </Button>
        </div>

        <div className="flex items-center justify-between border-t pt-2">
          <button
            type="button"
            onClick={() => setPageNo((prev) => Math.max(1, prev - 1))}
            disabled={pageNo <= 1 || loading}
            className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous role page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm">
            Page {pageNo} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPageNo((prev) => Math.min(totalPages, prev + 1))}
            disabled={pageNo >= totalPages || loading}
            className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next role page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
