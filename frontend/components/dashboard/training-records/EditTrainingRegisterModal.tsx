"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ParticipantAction } from "@/service/participants";
import { TrainingAction } from "@/service/training";
import {
  TrainingRegisterDetail,
  TrainingRegisterStatus,
  UpdateTrainingRegisterInput,
} from "@/lib/training-register/training-register.types";
import { ParticipantListItem } from "@/lib/participants/participants.types";
import { TrainingListItem } from "@/lib/training/training.types";

const statusOptions: TrainingRegisterStatus[] = [
  "Pending",
  "Overdue",
  "Upcoming",
  "Completed",
];

const editRegisterSchema = z.object({
  participantId: z.string().min(1, "Participant is required"),
  trainingId: z.string().min(1, "Training is required"),
  trainingInterval: z.string().min(1, "Training interval is required"),
  trainingDate: z.string().min(1, "Training date is required"),
  status: z.enum(statusOptions),
});

type EditRegisterForm = z.infer<typeof editRegisterSchema>;

interface EditTrainingRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  standAloneId?: string;
  registerData: TrainingRegisterDetail;
  onSubmit: (
    registerId: string,
    payload: UpdateTrainingRegisterInput,
  ) => Promise<void> | void;
}

function toIsoDateTime(localDateTime: string): string {
  return new Date(localDateTime).toISOString();
}

function toLocalDateTime(isoDate?: string): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getIdFromRef(
  value:
    | TrainingRegisterDetail["participantId"]
    | TrainingRegisterDetail["trainingId"],
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const rawId = value._id;
  if (rawId === undefined || rawId === null) return "";
  return String(rawId);
}

export default function EditTrainingRegisterModal({
  open,
  onOpenChange,
  standAloneId,
  registerData,
  onSubmit,
}: EditTrainingRegisterModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditRegisterForm>({
    resolver: zodResolver(editRegisterSchema),
    defaultValues: {
      participantId: getIdFromRef(registerData.participantId),
      trainingId: getIdFromRef(registerData.trainingId),
      trainingInterval: String(registerData.trainingInterval || ""),
      trainingDate: toLocalDateTime(registerData.trainingDate),
      status: registerData.status || "Pending",
    },
  });

  const [participants, setParticipants] = useState<ParticipantListItem[]>([]);
  const [trainings, setTrainings] = useState<TrainingListItem[]>([]);
  const [intervals, setIntervals] = useState<number[]>([]);

  const selectedTrainingId = watch("trainingId");
  const selectedParticipantId = watch("participantId");
  const selectedTrainingInterval = watch("trainingInterval");
  const selectedStatus = watch("status");

  useEffect(() => {
    reset({
      participantId: getIdFromRef(registerData.participantId),
      trainingId: getIdFromRef(registerData.trainingId),
      trainingInterval: String(registerData.trainingInterval || ""),
      trainingDate: toLocalDateTime(registerData.trainingDate),
      status: registerData.status || "Pending",
    });
  }, [registerData, reset]);

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      try {
        const [participantRes, trainingRes] = await Promise.all([
          ParticipantAction.getParticipants(standAloneId, {
            showPerPage: 200,
            pageNo: 1,
          }),
          TrainingAction.getTrainings(standAloneId, {
            showPerPage: 200,
            pageNo: 1,
          }),
        ]);

        setParticipants(participantRes.data?.participants || []);
        setTrainings(trainingRes.data?.trainings || []);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load form options",
        );
      }
    };

    loadOptions();
  }, [open, standAloneId]);

  useEffect(() => {
    if (!selectedTrainingId) {
      setIntervals([]);
      setValue("trainingInterval", "");
      return;
    }

    const loadIntervals = async () => {
      try {
        const res = await TrainingAction.getTrainingById(
          selectedTrainingId,
          standAloneId,
        );

        const nextIntervals = res.data?.intervalDays || [];
        setIntervals(nextIntervals);

        const currentInterval = watch("trainingInterval");
        if (
          !currentInterval ||
          !nextIntervals.includes(Number(currentInterval))
        ) {
          setValue(
            "trainingInterval",
            nextIntervals.length ? String(nextIntervals[0]) : "",
          );
        }
      } catch (err) {
        setIntervals([]);
        setValue("trainingInterval", "");
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to load training intervals",
        );
      }
    };

    loadIntervals();
  }, [selectedTrainingId, setValue, standAloneId, watch]);

  const participantOptions = useMemo(
    () =>
      participants.map((p) => ({
        value: p._id,
        label: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      })),
    [participants],
  );

  const trainingOptions = useMemo(
    () =>
      trainings.map((t) => ({
        value: t._id,
        label: t.trainingName,
      })),
    [trainings],
  );

  const submit = async (values: EditRegisterForm) => {
    await onSubmit(registerData._id, {
      participantId: values.participantId,
      trainingId: values.trainingId,
      trainingInterval: Number(values.trainingInterval),
      trainingDate: toIsoDateTime(values.trainingDate),
      status: values.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Edit Training Register</DialogTitle>

        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-6 bg-white px-6 pb-4"
        >
          <div className="space-y-2">
            <label className="text-foreground text-xl font-medium">
              Participant
            </label>
            <select
              value={selectedParticipantId}
              onChange={(e) =>
                setValue("participantId", e.target.value, { shouldValidate: true })
              }
              className="border-input-border w-full rounded-none border px-3 py-4"
            >
              <option value="">Select participant</option>
              {participantOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.participantId ? (
              <p className="text-destructive text-xs">
                {errors.participantId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-foreground text-xl font-medium">Training</label>
            <select
              value={selectedTrainingId}
              onChange={(e) =>
                setValue("trainingId", e.target.value, { shouldValidate: true })
              }
              className="border-input-border w-full rounded-none border px-3 py-4"
            >
              <option value="">Select training</option>
              {trainingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.trainingId ? (
              <p className="text-destructive text-xs">
                {errors.trainingId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-foreground text-xl font-medium">
              Training Interval
            </label>
            <select
              value={selectedTrainingInterval}
              onChange={(e) =>
                setValue("trainingInterval", e.target.value, {
                  shouldValidate: true,
                })
              }
              className="border-input-border w-full rounded-none border px-3 py-4"
            >
              <option value="">Select interval</option>
              {intervals.map((interval) => (
                <option key={interval} value={interval}>
                  {interval}
                </option>
              ))}
            </select>
            {errors.trainingInterval ? (
              <p className="text-destructive text-xs">
                {errors.trainingInterval.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-foreground text-xl font-medium">
              Training Date
            </label>
            <Input
              type="datetime-local"
              className="border-input-border rounded-none border px-3 py-6"
              {...register("trainingDate")}
            />
            {errors.trainingDate ? (
              <p className="text-destructive text-xs">
                {errors.trainingDate.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-foreground text-xl font-medium">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setValue("status", e.target.value as TrainingRegisterStatus, {
                  shouldValidate: true,
                })
              }
              className="border-input-border w-full rounded-none border px-3 py-4"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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
              Update Register
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
