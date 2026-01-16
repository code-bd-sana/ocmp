"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SmartToggleProps extends React.ComponentProps<typeof Button> {
  className?: string;
}

export function SmartToggle({ className, ...props }: SmartToggleProps) {
  const { state, toggleSidebar } = useSidebar();

  return (
    <Button
      variant='outline'
      size='icon'
      className={cn(
        "h-8 w-8 bg-background border absolute -right-4 top-6 z-50",
        className
      )}
      onClick={toggleSidebar}
      {...props}>
      {state === "expanded" ? (
        <ChevronLeft className='h-4 w-4' />
      ) : (
        <ChevronRight className='h-4 w-4' />
      )}
      <span className='sr-only'>Toggle sidebar</span>
    </Button>
  );
}
