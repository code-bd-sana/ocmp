"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import ParticipantRoleDropdown from "@/components/dashboard/training-records/ParticipantRoleDropdown";
import { CreateParticipantInput } from "@/lib/participants/participants.types";

const addParticipantSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surName: z.string().min(1, "Sur name is required"),
  role: z.string().min(1, "Role is required"),
  employmentStatus: z.boolean(),
});

type AddParticipantForm = z.infer<typeof addParticipantSchema>;

interface AddParticipantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateParticipantInput) => Promise<void> | void;
  standAloneId?: string;
}

export default function AddParticipantModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddParticipantModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddParticipantForm>({
    resolver: zodResolver(addParticipantSchema),
    defaultValues: {
      firstName: "",
      surName: "",
      role: "",
      employmentStatus: true,
    },
  });

  const selectedRoleId = watch("role");
  const employmentStatus = watch("employmentStatus");

  const submit = async (values: AddParticipantForm) => {
    await onSubmit({
      firstName: values.firstName.trim(),
      lastName: values.surName.trim(),
      role: values.role,
      employmentStatus: values.employmentStatus,
      standAloneId,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Add Participant</DialogTitle>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <Input className="rounded-none" {...register("firstName")} />
            {errors.firstName ? (
              <p className="text-destructive text-xs">{errors.firstName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sur Name</label>
            <Input className="rounded-none" {...register("surName")} />
            {errors.surName ? (
              <p className="text-destructive text-xs">{errors.surName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <ParticipantRoleDropdown
              value={selectedRoleId}
              standAloneId={standAloneId}
              onChange={(roleId) => setValue("role", roleId, { shouldValidate: true })}
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
            <Button type="submit" className="rounded-none" disabled={isSubmitting}>
              Add Participant
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
