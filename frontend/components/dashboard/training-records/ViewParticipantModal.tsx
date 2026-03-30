"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ParticipantDetail } from "@/lib/participants/participants.types";

interface ViewParticipantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: ParticipantDetail | null;
  loading: boolean;
}

export default function ViewParticipantModal({
  open,
  onOpenChange,
  participant,
  loading,
}: ViewParticipantModalProps) {
  const fullName = participant
    ? `${participant.firstName} ${participant.lastName}`.trim()
    : "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>View Participant</DialogTitle>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : participant ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <p className="mt-1 text-sm text-gray-900">{participant.firstName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Sur Name
              </label>
              <p className="mt-1 text-sm text-gray-900">{participant.lastName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <p className="mt-1 text-sm text-gray-900">{fullName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-sm text-gray-900">
                {participant.role?.roleName || "-"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Employment Status
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {participant.employmentStatus ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            No data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
