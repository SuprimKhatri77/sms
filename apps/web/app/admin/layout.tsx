import { AppSidebar } from "@/components/app-sidebar";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/queries/auth/get-current-user";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <SidebarProvider>
      <AuthProvider user={user} />
      <AppSidebar />
      <SidebarInset className="bg-(--brand-cream)">
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
    </SidebarProvider>
  );
}
