import { TrainingToolboxRow } from "@/lib/training-toolbox/training-toolbox.type";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText, Loader2 } from "lucide-react";

interface ViewToolboxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolbox: TrainingToolboxRow | null;
  loading: boolean;
}

function formatDate(value?: string | Date): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-foreground text-sm">{value || "—"}</span>
    </div>
  );
}

export default function ViewToolboxModal({
  open,
  onOpenChange,
  toolbox,
  loading,
}: ViewToolboxModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>View Training Toolbox</DialogTitle>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : toolbox ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Toolbox Title" value={toolbox.toolboxTitle} />
              <DetailItem
                label="Type of Toolbox"
                value={toolbox.typeOfToolbox}
              />
              <DetailItem label="Delivered By" value={toolbox.deliveredBy} />
              <DetailItem label="Date" value={formatDate(toolbox.date)} />
              <DetailItem label="Notes" value={toolbox.notes} />
              <DetailItem
                label="Signed"
                value={toolbox.signed ? "Yes" : "No"}
              />
              <DetailItem
                label="Follow-Up Needed"
                value={toolbox.followUpNeeded ? "Yes" : "No"}
              />
              <DetailItem
                label="Follow-Up Date"
                value={formatDate(toolbox.followUpDate)}
              />
              <DetailItem
                label="Sign Off"
                value={toolbox.signOff ? "Yes" : "No"}
              />
            </div>

            <div className="space-y-2">
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Attachments
              </span>

              {toolbox.attachments?.length ? (
                <div className="space-y-2">
                  {toolbox.attachments.map((attachment) => (
                    <a
                      key={attachment._id}
                      href={attachment.downloadUrl || attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:border-primary/40 flex w-full items-center justify-between gap-3 rounded-md border p-3 transition"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {attachment.originalName || attachment.filename}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {attachment.mimeType || "Unknown type"} •{" "}
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>

                      <Download className="text-muted-foreground h-4 w-4 shrink-0" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm">—</p>
              )}
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
