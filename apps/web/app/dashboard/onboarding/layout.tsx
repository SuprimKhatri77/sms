import { StudentAppSidebar } from "@/components/student/student-app-sidebar";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { requireStudentStatus } from "../helper";

export default async function Dashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStudentStatus(["noStatus"]);

  return (
    <SidebarProvider>
      <StudentAppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>
        <div className="min-h-screen bg-(--brand-cream) px-4 py-2 sm:px-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
