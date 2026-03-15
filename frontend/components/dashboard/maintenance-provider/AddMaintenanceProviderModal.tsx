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
import { CreateMaintenanceProviderCommunicationInput } from "@/lib/maintenance-meeting/maintenance-meeting.types";

const COMMUNICATION_OPTIONS = [
  "Email",
  "Phone Call",
  "Physical Visit",
  "Other",
] as const;

interface AddMaintenanceProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: CreateMaintenanceProviderCommunicationInput,
  ) => Promise<void> | void;
  loading: boolean;
}

export default function AddMaintenanceProviderModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: AddMaintenanceProviderModalProps) {
  const [providerName, setProviderName] = useState("");
  const [dateOfCommunication, setDateOfCommunication] = useState("");
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = async () => {
    await onSubmit({
      providerName,
      dateOfCommunication,
      type: (type || "Email") as
        | "Email"
        | "Phone Call"
        | "Physical Visit"
        | "Other",
      details: details || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl">
        <DialogTitle className="text-primary mb-4 text-xl font-bold">
          Add Maintenance Provider Communication
        </DialogTitle>

        <div className="space-y-4">
          <div>
            <Label className="mb-2">Provider Name</Label>
            <Input
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2">Date of Communication</Label>
            <Input
              type="date"
              value={dateOfCommunication}
              onChange={(e) => setDateOfCommunication(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select communication type" />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2">Details</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
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
            <Button
              onClick={handleSubmit}
              disabled={
                loading || !providerName || !dateOfCommunication || !type
              }
            >
              {loading ? "Creating..." : "Create Communication"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
