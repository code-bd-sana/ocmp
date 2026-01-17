"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

interface SmartToggleProps extends React.ComponentProps<typeof Button> {
  className?: string;
}

// Mobile toggle button (for use in Header)
export function MobileSidebarToggle({ className, ...props }: SmartToggleProps) {
  const { setOpenMobile, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <Button
      variant='ghost'
      size='icon'
      className={cn(
        "h-10 w-10 text-white hover:bg-primary/80 text-center",
        className
      )}
      onClick={() => setOpenMobile(true)}
      {...props}>
      <Menu className='h-10 w-10' />
      <span className='sr-only'>Open sidebar</span>
    </Button>
  );
}

// Desktop toggle button (for use in Sidebar)
export function DesktopSidebarToggle({
  className,
  ...props
}: SmartToggleProps) {
  const { state, toggleSidebar, isMobile } = useSidebar();

  if (isMobile) return null;

  return (
    <Button
      variant='outline'
      size='icon'
      className={cn(
        "h-6 w-6 bg-background border shadow-sm",
        "absolute -right-4 top-12 -translate-y-1/2 z-50",
        "hover:bg-background hover:scale-105 transition-transform",
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

// Original SmartToggle (for backward compatibility)
export function SmartToggle({ className, ...props }: SmartToggleProps) {
  return <DesktopSidebarToggle className={className} {...props} />;
}
