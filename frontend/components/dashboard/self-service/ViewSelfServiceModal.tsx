import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { SelfServiceTableRow } from "./SelfServiceTable";

interface ViewSelfServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selfService: SelfServiceTableRow | null;
  loading: boolean;
  standAloneId: string;
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

export default function ViewSelfServiceModal({
  open,
  onOpenChange,
  selfService,
  loading,
}: ViewSelfServiceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>View Self Service</DialogTitle>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : selfService ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Service Name"
                value={selfService.serviceName}
              />
              <DetailItem label="Description" value={selfService.description} />
              <DetailItem
                label="Service Link"
                value={
                  selfService.serviceLink && selfService.serviceLink !== "—" ? (
                    <a
                      href={selfService.serviceLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      {selfService.serviceLink}
                    </a>
                  ) : (
                    "—"
                  )
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
