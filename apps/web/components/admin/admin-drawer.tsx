"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminDrawerContentClass,
  adminModalContentClass,
} from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";

export const ADMIN_DRAWER_CLOSE_MS = 320;

function useDeferredOpen(open: boolean) {
  const [deferredOpen, setDeferredOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setDeferredOpen(false);
      return;
    }

    setDeferredOpen(false);
    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => setDeferredOpen(true));
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [open]);

  return deferredOpen;
}

type AdminDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  variant?: "drawer" | "modal";
};

export function AdminDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  variant = "drawer",
}: AdminDrawerProps) {
  const isOpen = useDeferredOpen(open);

  const header = (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[rgba(47,78,64,0.12)] bg-white px-5 py-4">
      <h2 className="font-(family-name:--font-lora) text-base font-bold text-(--brand-green)">
        {title}
      </h2>
      <button
        type="button"
        className="grid h-8 w-8 cursor-pointer place-items-center border border-[rgba(47,78,64,0.18)] text-[rgba(47,78,64,0.55)] transition-colors hover:bg-[rgba(47,78,64,0.04)]"
        onClick={() => onOpenChange(false)}
      >
        <X size={16} />
      </button>
    </div>
  );

  const scrollableBody = (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {children}
    </div>
  );

  const footerChrome = footer ? (
    <div className="shrink-0 border-t border-[rgba(47,78,64,0.12)] bg-white px-5 py-4">
      {footer}
    </div>
  ) : null;

  if (variant === "modal") {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className={cn(adminModalContentClass, className)}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="sr-only">
              {description}
            </DialogDescription>
          ) : null}
          {header}
          {scrollableBody}
          {footerChrome}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(adminDrawerContentClass, className)}
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {description ? (
          <SheetDescription className="sr-only">{description}</SheetDescription>
        ) : null}
        <div className="flex h-full flex-col">
          {header}
          {scrollableBody}
          {footerChrome}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const adminFieldLabelClass =
  "flex flex-col gap-1.5 font-(family-name:--font-dm-sans) text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(47,78,64,0.55)]";

export const adminFieldErrorClass =
  "text-xs normal-case tracking-normal text-[#9a3412]";
