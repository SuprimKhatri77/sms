import Link from "next/link";
import { Certificate } from "@/components/certificate/Certificate";
import { getStudentDetails } from "@/lib/queries/admin/students/get-student-detail";
import { getStudentEnrolledCourses } from "@/lib/queries/admin/students/get-student-enrolled-courses";

export default async function Page({
  params,
}: {
  params: Promise<{ studentID: string }>;
}) {
  const { studentID } = await params;
  const [studentRes, coursesRes] = await Promise.all([
    getStudentDetails(studentID),
    getStudentEnrolledCourses(studentID),
  ]);

  if (!studentRes.success) {
    return (
      <div style={{ padding: 24 }}>
        <p>Failed to load student.</p>
        <Link href={`/admin/students/${studentID}`}>Back</Link>
      </div>
    );
  }

  const student = studentRes.data;
  const courses = coursesRes.success ? coursesRes.data.map((c) => c.name) : [];

  const issueDate = new Date().toLocaleDateString("en-NP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#f4f1ec",
        color: "#2f4e40",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto 16px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href={`/admin/students/${studentID}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(47,78,64,0.18)",
              background: "#fff",
              color: "#2f4e40",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Back
          </Link>
          <button
            onClick={() => window.print()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(194,138,79,0.22)",
              background: "#c28a4f",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(194,138,79,0.25)",
            }}
          >
            Print Certificate
          </button>
        </div>

        <div
          style={{
            fontSize: 12,
            opacity: 0.75,
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          Tip: Use A4 paper size in print dialog.
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 794 }}>
          <Certificate
            studentName={student.fullName}
            referenceNo={student.referenceNo}
            courses={courses}
            issueDate={issueDate}
            schoolName="Bake & Brew Barista Coffee School"
            logoUrl="/assets/watermark.png"
            directorSignatureUrl="/assets/logo.png"
            headSignatureUrl="/assets/logo.png"
            accreditationLogoUrl="/assets/watermark.png"
            footerAddress="Brew & Bake Academy, New Baneshwor, Kathmandu"
            footerContact="+977 98XXXXXXXX | brewandbake@example.com"
          />
        </div>
      </div>
    </div>
  );
}

