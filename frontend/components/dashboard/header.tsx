"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthAction } from "@/service/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MobileSidebarToggle } from "../smart-toggle";

interface HeaderProps {
  showSidebarToggle?: boolean;
}

export default function Header({ showSidebarToggle = true }: HeaderProps) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await AuthAction.myProfile();
        const payload = profile?.data ?? profile;
        const name =
          payload?.fullName ||
          payload?.full_name ||
          payload?.name ||
          payload?.firstName ||
          payload?.first_name;
        const roleVal = payload?.role ?? profile?.role ?? null;
        if (!mounted) return;
        if (name) setDisplayName(name);
        if (roleVal) setRole(roleVal);
      } catch (err) {
        // ignore: user may be unauthenticated
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
  const handleLogout = async () => {
    try {
      await AuthAction.LogOut();
      toast.success("Logged out successfully");
    } catch {
      AuthAction.RemoveAuthToken();
      toast.success("Logged out successfully");
    } finally {
      router.replace("/signin");
    }
  };

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 flex h-14 items-center justify-between border-b px-4 shadow-sm sm:px-6 md:h-16 lg:px-10">
      {/* Logo */}
      <div className="flex items-center gap-3">
        {showSidebarToggle ? <MobileSidebarToggle /> : null}
        <div className="relative h-10 w-37.5">
          <Image
            src="/logo.png"
            alt="OCMP"
            fill
            sizes="(max-width: 768px) 140px, 150px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="hidden text-sm font-medium sm:block">
          {(() => {
            const label = displayName
              ? displayName
              : role
                ? role
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .split(" ")
                    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                    .join(" ")
                : "User";
            return `Hello, ${label}`;
          })()}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer md:h-10 md:w-10">
              <AvatarImage
                src="/dashboard/Driver.png"
                alt={displayName ?? (role ? role.replace(/_/g, " ") : "User")}
                suppressHydrationWarning
              />
              <AvatarFallback className="bg-primary-foreground text-primary font-bold">
                {(() => {
                  const label = displayName
                    ? displayName
                    : role
                      ? role.replace(/_/g, " ")
                      : "User";
                  return label
                    .split(" ")
                    .map((s) => s.charAt(0))
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                })()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
