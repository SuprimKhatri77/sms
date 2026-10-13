import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import AdmissionSuccessPage from "@/modules/admission/success/Success";

export const metadata: Metadata = privatePageMetadata("Application received");

export default function Page() {
  return <AdmissionSuccessPage />;
}
