"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { TrainingRegisterDetail } from "@/lib/training-register/training-register.types";

interface ViewTrainingRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registerData: TrainingRegisterDetail | null;
  loading: boolean;
}

function getName(refValue: TrainingRegisterDetail["participantId"]): {
  firstName: string;
  surName: string;
  fullName: string;
} {
  if (!refValue || typeof refValue === "string") {
    return { firstName: "-", surName: "-", fullName: "-" };
  }

  const firstName = refValue.firstName || "-";
  const surName = refValue.lastName || "-";
  const fullName = `${firstName} ${surName}`.trim();
  return { firstName, surName, fullName };
}

function getTrainingName(
  refValue: TrainingRegisterDetail["trainingId"],
): string {
  if (!refValue || typeof refValue === "string") return "-";
  return refValue.trainingName || "-";
}

export default function ViewTrainingRegisterModal({
  open,
  onOpenChange,
  registerData,
  loading,
}: ViewTrainingRegisterModalProps) {
  const names = getName(registerData?.participantId || null);
  const trainingName = getTrainingName(registerData?.trainingId || null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>View Training Register</DialogTitle>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : registerData ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <p className="mt-1 text-sm text-gray-900">{names.firstName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Sur Name
              </label>
              <p className="mt-1 text-sm text-gray-900">{names.surName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <p className="mt-1 text-sm text-gray-900">{names.fullName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Training
              </label>
              <p className="mt-1 text-sm text-gray-900">{trainingName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Completed
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {registerData.status === "Completed" ? "Yes" : "No"}
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
