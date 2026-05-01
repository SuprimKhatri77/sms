"use client";

import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import { siteInfo } from "@/utils/site-info";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center overflow-hidden rounded-md border border-[rgba(47,78,64,0.18)] bg-white">
              <Image
                src={siteInfo.assets.emblem}
                alt={siteInfo.company.shortName}
                width={24}
                height={24}
                unoptimized
              />
            </div>
            {siteInfo.company.shortName}
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-[rgba(47,78,64,0.06)] lg:block">
        <Image
          fill
          loading="eager"
          src={siteInfo.assets.logo}
          alt={siteInfo.company.shortName}
          className="absolute inset-0 h-full w-full object-contain p-16"
          unoptimized
        />
      </div>
    </div>
  );
}
