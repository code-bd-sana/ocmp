import { TrainingToolboxRow } from "@/lib/training-toolbox/training-toolbox.type";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

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
              <DetailItem
                label="Attachments"
                value={
                  toolbox.attachments && toolbox.attachments.length > 0
                    ? toolbox.attachments.join(", ")
                    : "—"
                }
              />
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
