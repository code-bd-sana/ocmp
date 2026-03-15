"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MeetingNoteRow } from "@/lib/maintenance-meeting/maintenance-meeting.types";
import { Loader2 } from "lucide-react";

interface ViewMeetingNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MeetingNoteRow | null;
  loading: boolean;
}

export default function ViewMeetingNoteModal({
  open,
  onOpenChange,
  item,
  loading,
}: ViewMeetingNoteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogTitle>Meeting Note Details</DialogTitle>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : item ? (
          <div className="grid grid-cols-1 gap-3 text-sm">
            <p>
              <span className="font-medium">Meeting Date:</span>{" "}
              {item.meetingDate
                ? new Date(item.meetingDate).toLocaleDateString()
                : "—"}
            </p>
            <p>
              <span className="font-medium">Attendance:</span>{" "}
              {item.attendance || "—"}
            </p>
            <p>
              <span className="font-medium">Key Discussion Points:</span>{" "}
              {item.keyDiscussionPoints || "—"}
            </p>
            <p>
              <span className="font-medium">Discussion:</span>{" "}
              {item.discussion || "—"}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No data available
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
