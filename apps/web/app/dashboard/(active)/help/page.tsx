import { NeedHelpCard } from "@/components/student/dashboard/NeedHelpCard";
import { DashboardPageShell } from "@/components/student/dashboard/DashboardPageShell";

export default function HelpPage() {
  return (
    <DashboardPageShell
      title="Help"
      description="Contact the academy and find office details"
    >
      <NeedHelpCard showTitle={false} />
    </DashboardPageShell>
  );
}
