"use client";

import { SignupForm } from "@/components/signup-form";
import { siteInfo } from "@/utils/site-info";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-50 items-center justify-center overflow-hidden">
              <Image
                src={siteInfo.assets.noBGLogo}
                alt={siteInfo.company.shortName}
                width={150}
                height={150}
              />
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          fill
          loading="eager"
          src={siteInfo.assets.watermarkNoBG}
          alt={siteInfo.company.shortName}
          className="absolute inset-0 h-full w-full object-contain p-16 opacity-50"
        />
      </div>
    </div>
  );
}
