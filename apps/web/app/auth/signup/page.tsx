import type { Metadata } from "next";
import { SignupForm } from "@/components/signup-form";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("Create an account");

export default function SignupPage() {
  return <SignupForm />;
}
