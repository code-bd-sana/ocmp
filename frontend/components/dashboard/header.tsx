import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebarToggle } from "../smart-toggle";

export default function Header() {
  return (
    <header
      className='
    sticky top-0 z-50
    h-14 md:h-16          
    flex items-center justify-between
    px-4 sm:px-6 lg:px-10
    border-b bg-primary text-primary-foreground shadow-sm
  '>
      {/* Logo */}
      <div className='flex items-center gap-3'>
        <MobileSidebarToggle />
        <Image
          src='/logo.png'
          alt='OCMP'
          width={150}
          height={40}
          className='h-8 md:h-10 w-auto'
          priority
        />
      </div>

      {/* User info */}
      <div className='flex items-center gap-3 sm:gap-4'>
        <span className='hidden sm:block text-sm font-medium'>
          Hello, Admin
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className='h-9 w-9 md:h-10 md:w-10 cursor-pointer'>
              <AvatarImage
                src='/images/user-avatar.png'
                alt='Admin'
                suppressHydrationWarning
              />
              <AvatarFallback className='bg-primary-foreground text-primary font-bold'>
                AD
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem className='text-destructive'>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
