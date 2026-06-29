import { StudentStatusPage } from "./StudentStatusPage";

function Bar({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[rgba(47,78,64,0.08)] ${className ?? ""}`} />;
}

export default function PendingLoading() {
  return (
    <StudentStatusPage variant="pending">
      <div className="mb-10 text-center">
        <Bar className="mx-auto mb-5 h-8 w-32" />
        <Bar className="mx-auto h-12 w-full max-w-sm" />
        <Bar className="mx-auto mt-4 h-4 w-full max-w-md" />
        <Bar className="mx-auto mt-6 h-10 w-64" />
      </div>
      <div className="mb-10 border border-[rgba(47,78,64,0.08)] bg-white p-8">
        <Bar className="mb-6 h-3 w-28" />
        <Bar className="h-16 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Bar className="h-24" />
        <Bar className="h-24" />
        <Bar className="h-24" />
      </div>
    </StudentStatusPage>
  );
}
