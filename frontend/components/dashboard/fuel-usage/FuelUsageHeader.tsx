"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FuelUsageHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function FuelUsageHeader({
  searchQuery,
  onSearchChange,
}: FuelUsageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold tracking-tight">Fuel Usage</h1>
      <div className="relative w-full max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search fuel usage…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
