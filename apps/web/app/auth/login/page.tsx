import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("Log in");

export default function LoginPage() {
  return <LoginForm />;
}
