// app/dashboard/layout.tsx
"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/dashboard/header";
import DashboardContent from "@/components/dashboard/dashboard-content";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className='flex min-h-screen w-full flex-col'>
        {/* Header */}
        <div className='sticky top-0 z-50 '>
          <Header />
        </div>

        {/* Main area */}
        <div className='flex flex-1 relative'>
          <AppSidebar />
          <DashboardContent>{children}</DashboardContent>
        </div>
      </div>
    </SidebarProvider>
  );
}

// working one

// "use client";

// import { SidebarProvider } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/app-sidebar";
// import Header from "@/components/dashboard/header";
// import DashboardContent from "@/components/dashboard/dashboard-content";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className='flex min-h-screen flex-col'>
//       <Header />
//       <div className='flex flex-1 relative'>
//         <SidebarProvider>
//           <AppSidebar />
//           <DashboardContent>{children}</DashboardContent>
//         </SidebarProvider>
//       </div>
//     </div>
//   );
// }

// import { cookies } from "next/headers";
// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/app-sidebar";
// import Header from "@/components/dashboard/header";
// import { DashboardNav } from "@/components/dashboard/dashboard-nav";

// export default async function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const cookieStore = await cookies();
//   const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

//   return (
//     <div className='flex min-h-screen flex-col'>
//       {/* Header */}
//       <Header />
//       {/* Main area */}
//       <div className='flex flex-1 relative'>
//         <SidebarProvider defaultOpen={defaultOpen}>
//           {/* Sidebar */}
//           <AppSidebar />
//           <SidebarInset>
//             {/* Dashboard Nav */}
//             <div className='fixed top-14 md:top-16 left-0 right-0 z-1 bg-background border-b shadow-sm'>
//               <DashboardNav />
//             </div>

//             {/* Main Content */}
//             <div className='flex-1 pt-16 overflow-y-auto bg-muted/30'>
//               <div className='p-4 md:p-6 lg:px-8 lg:py-10'>{children}</div>
//             </div>
//           </SidebarInset>
//         </SidebarProvider>
//       </div>
//     </div>
//   );
// }
