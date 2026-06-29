import { StudentStatusPage } from "./StudentStatusPage";

function Bar({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[rgba(47,78,64,0.08)] ${className ?? ""}`} />;
}

export default function RejectedLoading() {
  return (
    <StudentStatusPage variant="rejected">
      <div className="mb-10 text-center">
        <Bar className="mx-auto mb-5 h-8 w-40" />
        <Bar className="mx-auto h-12 w-full max-w-sm" />
        <Bar className="mx-auto mt-4 h-4 w-full max-w-md" />
        <Bar className="mx-auto mt-6 h-10 w-56" />
      </div>
      <Bar className="mb-8 h-20 w-full" />
      <Bar className="mb-5 h-3 w-36" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Bar className="h-36" />
        <Bar className="h-36" />
        <Bar className="h-36" />
      </div>
    </StudentStatusPage>
  );
}
