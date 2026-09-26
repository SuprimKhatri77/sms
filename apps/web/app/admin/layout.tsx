import { AppSidebar } from "@/components/app-sidebar";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { AdminShortcutProvider } from "@/components/admin/admin-shortcut-provider";
import { AdminSidebarShortcut } from "@/components/admin/admin-sidebar-shortcut";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <AdminShortcutProvider>
        <AdminSidebarShortcut />
        {/* min-w-0 lets the content column shrink to the space beside the
            sidebar, so wide tables scroll inside their overflow-x-auto box
            instead of stretching the whole page */}
        <SidebarInset className="min-w-0 bg-(--brand-cream)">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-[rgba(47,78,64,0.12)] bg-[rgba(251,250,247,0.92)] backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-(--brand-green) hover:bg-[rgba(47,78,64,0.08)]" />
            <Separator
              orientation="vertical"
              className="mr-2 bg-[rgba(47,78,64,0.15)] data-vertical:h-4 data-vertical:self-auto"
            />
            <div className="text-[rgba(47,78,64,0.7)]">
              <AdminBreadcrumb />
            </div>
          </div>
        </header>
        <main>{children}</main>
        </SidebarInset>
      </AdminShortcutProvider>
    </SidebarProvider>
  );
}
