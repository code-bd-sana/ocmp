"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { OcrsPlanRow } from "@/lib/ocrs-plan/ocrs-plan.types";
import { Eye, Pencil, Trash2, FileText } from "lucide-react";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";

/** Flat row type used by the OCRS plan table */
export interface OcrsPlanTableRow {
  _id: string;
  roadWorthinessScore: string;
  overallTrafficScore: string;
  actionRequired: string;
  documentsCount: string;
  createdAt: string;
}

/** Map API response → flat table rows */
export function toOcrsPlanTableRows(
  ocrsPlans: OcrsPlanRow[],
): OcrsPlanTableRow[] {
  return ocrsPlans.map((plan) => ({
    _id: plan._id,
    roadWorthinessScore: plan.roadWorthinessScore || "—",
    overallTrafficScore: plan.overallTrafficScore || "—",
    actionRequired: plan.actionRequired || "—",
    documentsCount: plan.documents?.length
      ? `${plan.documents.length} document(s)`
      : "No documents",
    createdAt: plan.createdAt
      ? new Date(plan.createdAt).toLocaleDateString()
      : "—",
  }));
}

const columns: Column<OcrsPlanTableRow>[] = [
  { key: "roadWorthinessScore", title: "Road Worthiness Score" },
  { key: "overallTrafficScore", title: "Overall Traffic Score" },
  { key: "actionRequired", title: "Action Required" },
  { key: "documentsCount", title: "Documents" },
  { key: "createdAt", title: "Created At" },
];

interface OcrsPlanTableProps {
  data: OcrsPlanTableRow[];
  onAddOcrsPlan: () => void;
  onView: (row: OcrsPlanTableRow) => void;
  onEdit: (row: OcrsPlanTableRow) => void;
  onDelete: (row: OcrsPlanTableRow) => void;
}

export default function OcrsPlanTable({
  data,
  onAddOcrsPlan,
  onView,
  onEdit,
  onDelete,
}: OcrsPlanTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Export",
          className: "btn btn-sm rounded-xs bg-green-600 text-white hover:bg-green-700",
          onClick: () => {},
          exportCsv: true,
          csvFileName: "ocrs-plan-list",
          visibility: true,
          positionIndex: 0,
        },
        {
          label: "Add OCRS Plan",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddOcrsPlan,
          icon: <FileText className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<OcrsPlanTableRow>[] = [
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
    <UniversalTable<OcrsPlanTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
