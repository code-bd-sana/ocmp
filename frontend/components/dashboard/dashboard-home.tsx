import { Search } from "lucide-react";
import { Input } from "../ui/input";
import DashboardSummary from "./summary/DashboardSummary";

export default function DashboardHome() {
  return (
    <div className='mx-auto py-4 lg:mr-10'>
      <div className='mb-8'>
        <div className='flex flex-col md:flex-row gap-y-3 md:gap-x-3 justify-between'>
          <h1 className='text-3xl font-bold mb-2'>Main Dashboard</h1>
          <div className='relative max-w-2xl flex items-center text-(--input-foreground)'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-(--input-foreground)' />
            <Input
              type='text'
              placeholder='Search'
              className='pl-10 bg-muted text-black'
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <DashboardSummary />
    </div>
  );
}
