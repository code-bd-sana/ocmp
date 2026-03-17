"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  MeetingNoteRow,
  UpdateMeetingNoteInput,
} from "@/lib/maintenance-meeting/maintenance-meeting.types";

const ATTENDANCE_OPTIONS = [
  "Email",
  "Phone Call",
  "Physical Visit",
  "Other",
] as const;
type AttendanceValue = (typeof ATTENDANCE_OPTIONS)[number];

interface EditMeetingNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateMeetingNoteInput) => Promise<void> | void;
  item: MeetingNoteRow | null;
  loading: boolean;
}

function toDateInput(value?: string): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export default function EditMeetingNoteModal({
  open,
  onOpenChange,
  onSubmit,
  item,
  loading,
}: EditMeetingNoteModalProps) {
  const [meetingDate, setMeetingDate] = useState(
    toDateInput(item?.meetingDate),
  );
  const [attendance, setAttendance] = useState<AttendanceValue | "">(
    (item?.attendance as AttendanceValue | undefined) || "",
  );
  const [keyDiscussionPoints, setKeyDiscussionPoints] = useState(
    item?.keyDiscussionPoints || "",
  );
  const [discussion, setDiscussion] = useState(item?.discussion || "");

  const handleSubmit = async () => {
    await onSubmit({
      meetingDate: meetingDate || undefined,
      attendance: attendance || undefined,
      keyDiscussionPoints: keyDiscussionPoints || undefined,
      discussion: discussion || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl">
        <DialogTitle className="text-primary mb-4 text-xl font-bold">
          Edit Meeting Note
        </DialogTitle>

        <div className="space-y-4">
          <div>
            <Label className="mb-2">Meeting Date</Label>
            <Input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2">Attendance</Label>
            <Select
              value={attendance}
              onValueChange={(value) => setAttendance(value as AttendanceValue)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select attendance" />
              </SelectTrigger>
              <SelectContent>
                {ATTENDANCE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2">Key Discussion Points</Label>
            <Input
              value={keyDiscussionPoints}
              onChange={(e) => setKeyDiscussionPoints(e.target.value)}
              maxLength={250}
            />
          </div>

          <div>
            <Label className="mb-2">Discussion</Label>
            <Textarea
              value={discussion}
              onChange={(e) => setDiscussion(e.target.value)}
              maxLength={2000}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !meetingDate}>
              {loading ? "Updating..." : "Update Meeting Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
