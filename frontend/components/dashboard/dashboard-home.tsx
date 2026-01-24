import { Search } from "lucide-react";
import { Input } from "../ui/input";
import DashboardSummary from "./summary/DashboardSummary";

export default function DashboardHome() {
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-y-3 md:flex-row md:gap-x-3">
          <h1 className="text-primary mb-2 text-3xl font-bold">
            Main Dashboard
          </h1>
          <div className="relative flex max-w-2xl items-center text-(--input-foreground)">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-(--input-foreground)" />
            <Input
              type="text"
              placeholder="Search"
              className="bg-muted rounded-none pl-10 text-black"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <DashboardSummary />
    </div>
  );
}
