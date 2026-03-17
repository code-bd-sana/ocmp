"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MaintenanceProviderHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function MaintenanceProviderHeader({
  searchQuery,
  onSearchChange,
}: MaintenanceProviderHeaderProps) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-y-3 md:flex-row md:gap-x-3">
      <h2 className="text-primary text-3xl font-bold">
        Maintenance Provider Communication
      </h2>
      <div className="relative flex max-w-xl items-center text-(--input-foreground)">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-(--input-foreground)" />
        <Input
          type="text"
          placeholder="Search maintenance provider communications"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-muted text-foreground rounded-none pl-10"
        />
      </div>
    </div>
  );
}
