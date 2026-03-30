"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import ParticipantRoleDropdown from "@/components/dashboard/training-records/ParticipantRoleDropdown";
import {
  ParticipantDetail,
  UpdateParticipantInput,
} from "@/lib/participants/participants.types";

const editParticipantSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surName: z.string().min(1, "Sur name is required"),
  role: z.string().min(1, "Role is required"),
  employmentStatus: z.boolean(),
});

type EditParticipantForm = z.infer<typeof editParticipantSchema>;

interface EditParticipantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: ParticipantDetail;
  standAloneId?: string;
  onSubmit: (id: string, data: UpdateParticipantInput) => Promise<void> | void;
}

export default function EditParticipantModal({
  open,
  onOpenChange,
  participant,
  standAloneId,
  onSubmit,
}: EditParticipantModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditParticipantForm>({
    resolver: zodResolver(editParticipantSchema),
    defaultValues: {
      firstName: participant.firstName || "",
      surName: participant.lastName || "",
      role: participant.role?._id || "",
      employmentStatus: Boolean(participant.employmentStatus),
    },
  });

  useEffect(() => {
    reset({
      firstName: participant.firstName || "",
      surName: participant.lastName || "",
      role: participant.role?._id || "",
      employmentStatus: Boolean(participant.employmentStatus),
    });
  }, [participant, reset]);

  const selectedRoleId = watch("role");
  const employmentStatus = watch("employmentStatus");

  const submit = async (values: EditParticipantForm) => {
    await onSubmit(participant._id, {
      firstName: values.firstName.trim(),
      lastName: values.surName.trim(),
      role: values.role,
      employmentStatus: values.employmentStatus,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Edit Participant</DialogTitle>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <Input className="rounded-none" {...register("firstName")} />
            {errors.firstName ? (
              <p className="text-destructive text-xs">
                {errors.firstName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sur Name</label>
            <Input className="rounded-none" {...register("surName")} />
            {errors.surName ? (
              <p className="text-destructive text-xs">
                {errors.surName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <ParticipantRoleDropdown
              value={selectedRoleId}
              selectedRoleName={participant.role?.roleName}
              standAloneId={standAloneId}
              onChange={(roleId) =>
                setValue("role", roleId, { shouldValidate: true })
              }
            />
            {errors.role ? (
              <p className="text-destructive text-xs">{errors.role.message}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={employmentStatus}
              onCheckedChange={(checked) =>
                setValue("employmentStatus", Boolean(checked))
              }
            />
            <label className="text-sm font-medium">Employment Status</label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-none"
              disabled={isSubmitting}
            >
              Update Participant
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
