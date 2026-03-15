"use client";

import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { Eye, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { MeetingNoteRow } from "@/lib/maintenance-meeting/maintenance-meeting.types";

const columns: Column<MeetingNoteRow>[] = [
  {
    key: "meetingDate",
    title: "Meeting Date",
    render: (row) =>
      row.meetingDate ? new Date(row.meetingDate).toLocaleDateString() : "—",
  },
  { key: "attendance", title: "Attendance" },
  { key: "keyDiscussionPoints", title: "Key Discussion Points" },
  { key: "discussion", title: "Discussion" },
];

interface MeetingNoteTableProps {
  data: MeetingNoteRow[];
  onAddClick: () => void;
  onView: (row: MeetingNoteRow) => void;
  onEdit: (row: MeetingNoteRow) => void;
  onDelete: (row: MeetingNoteRow) => void;
}

export default function MeetingNoteTable({
  data,
  onAddClick,
  onView,
  onEdit,
  onDelete,
}: MeetingNoteTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Meeting Note",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddClick,
          icon: <MessageSquare className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<MeetingNoteRow>[] = [
    {
      label: "",
      variant: "view",
      icon: <Eye className="h-4 w-4" />,
      onClick: onView,
    },
    {
      label: "",
      variant: "edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: onEdit,
    },
    {
      label: "",
      variant: "delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
    },
  ];

  return (
    <UniversalTable<MeetingNoteRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
