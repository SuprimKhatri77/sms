import { cn } from "@/lib/utils";
import {
  COURSE_PRICE_VAT_NOTE,
  coursePriceVatNoteClass,
} from "./course-styles";

export function CoursePriceVatNote({ className }: { className?: string }) {
  return (
    <span className={cn("block", coursePriceVatNoteClass, className)}>
      {COURSE_PRICE_VAT_NOTE}
    </span>
  );
}
