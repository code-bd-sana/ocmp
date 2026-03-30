"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sections = [
  { label: "Training Record", icon: "/Training/records.svg" },
  { label: "Training Register", icon: "/Training/register.svg" },
  { label: "Participant", icon: "/Training/participant.svg" },
  { label: "Helper Sheet", icon: "/Training/helperSheet.svg" },
] as const;

export default function TrainingRecordsPage() {
  const [openSection, setOpenSection] = useState<
    (typeof sections)[number]["label"] | null
  >(null);

  const toggleSection = (section: (typeof sections)[number]["label"]) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="space-y-7 p-6 md:p-8">
      {sections.map((section) => {
        const isOpen = openSection === section.label;

        return (
          <div key={section.label} className="space-y-3">
            <button
              type="button"
              onClick={() => toggleSection(section.label)}
              className={cn(
                "flex w-full items-center justify-between border px-3 py-2 text-left transition-colors",
                isOpen
                  ? "bg-primary text-primary-foreground border-primary"
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

            {isOpen ? (
              <div className="border-primary/30 border p-4">
                <h1 className="text-primary text-xl font-semibold">
                  {section.label}
                </h1>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
