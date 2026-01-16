"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function SmartToggle({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { state, toggleSidebar } = useSidebar(); // "expanded" | "collapsed"

  return (
    <Button
      variant='outline'
      size='icon'
      className={cn(
        "h-8 w-8 bg-white! border-[#F9F9FA] absolute -right-4 top-7.5",
        className
      )}
      onClick={toggleSidebar}
      {...props}>
      {state === "expanded" ? (
        <ChevronLeft className='h-5 w-5 text-primary hover:text-primary/80 hover:bg-white/5' />
      ) : (
        <ChevronRight className='h-5 w-5 text-primary hover:text-primary/80 hover:bg-white/5' />
      )}
      <span className='sr-only'>Toggle sidebar</span>
    </Button>
  );
}
