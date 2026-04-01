"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import TrainingRecordSection from "@/components/dashboard/training-records/TrainingRecordSection";
import TrainingRegisterSection from "@/components/dashboard/training-records/TrainingRegisterSection";
import ParticipantSection from "@/components/dashboard/training-records/ParticipantSection";
import HelperSheetSection from "@/components/dashboard/training-records/HelperSheetSection";

const sectionConfig = [
  {
    label: "Training Record",
    icon: "/Training/records.svg",
  },
  {
    label: "Training Register",
    icon: "/Training/register.svg",
  },
  {
    label: "Participant",
    icon: "/Training/participant.svg",
  },
  {
    label: "Helper Sheet",
    icon: "/Training/helperSheet.svg",
  },
] as const;

type SectionLabel = (typeof sectionConfig)[number]["label"];

interface TrainingRecordsContentProps {
  standAloneId?: string;
}

export default function TrainingRecordsContent({
  standAloneId,
}: TrainingRecordsContentProps) {
  const [openSection, setOpenSection] = useState<SectionLabel | null>(
    "Training Record",
  );

  const toggleSection = (section: SectionLabel) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const renderSectionContent = (label: SectionLabel) => {
    if (label === "Training Record") {
      return <TrainingRecordSection standAloneId={standAloneId} />;
    }
    if (label === "Training Register") {
      return <TrainingRegisterSection standAloneId={standAloneId} />;
    }
    if (label === "Participant") {
      return <ParticipantSection standAloneId={standAloneId} />;
    }
    return <HelperSheetSection standAloneId={standAloneId} />;
  };

  return (
    <div className="space-y-7 p-6 md:p-8">
      {sectionConfig.map((section) => {
        const isOpen = openSection === section.label;

        return (
          <div key={section.label} className="space-y-3">
            <button
              type="button"
              onClick={() => toggleSection(section.label)}
              className={cn(
                "flex w-full items-center justify-between border px-3 py-2 text-left transition-colors",
                isOpen
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-primary/40 text-primary bg-[#f5f5f5] hover:bg-[#ececec]",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Image
                  src={section.icon}
                  alt={section.label}
                  width={16}
                  height={16}
                  priority
                  className={cn(
                    "transition-all duration-200",
                    isOpen && "brightness-0 invert",
                  )}
                />
                {section.label}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {isOpen ? renderSectionContent(section.label) : null}
          </div>
        );
      })}
    </div>
  );
}
