import { Certificate } from "@/components/certificate/Certificate";

export default function Page() {
  return (
    <div style={{ padding: 24 }}>
      <Certificate
        studentName="SUJAL SHRESTHA"
        referenceNo="BKC/082/083/001"
        courses={["Barista", "Bakery", "Bartending"]}
        issueDate="May 1, 2026"
        schoolName="Bake & Brew Barista Coffee School"
        logoUrl="/assets/watermark.png"
        directorSignatureUrl="/assets/logo.png"
        headSignatureUrl="/assets/logo.png"
        accreditationLogoUrl="/assets/watermark.png"
        footerAddress="Brew & Bake Academy, New Baneshwor, Kathmandu"
        footerContact="+977 98XXXXXXXX | brewandbake@example.com"
      />
    </div>
  );
}

